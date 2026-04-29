document.addEventListener("DOMContentLoaded", async () => {
    requireAdmin();
    await loadAdminData();
    document.getElementById("categoryForm")?.addEventListener("submit", handleCategorySubmit);
    document.getElementById("productForm")?.addEventListener("submit", handleProductSubmit);
    document.getElementById("productImageUrl")?.addEventListener("input", event => {
        updateProductImagePreview(event.target.value);
    });
});

async function loadAdminData() {
    try {
        const [categories, products] = await Promise.all([api("/admin/categories"), api("/admin/products")]);
        populateCategorySelect(categories);
        renderAdminStats(categories, products);
        document.getElementById("adminCategories").innerHTML = categories.map(category => `
            <tr>
                <td>${category.name}</td>
                <td>${category.description}</td>
                <td>
                    <button class="btn-muted" data-edit-category="${encodeURIComponent(JSON.stringify(category))}">Editar</button>
                    <button class="danger-btn" data-delete-category="${category.id}">Eliminar</button>
                </td>
            </tr>
        `).join("");
        document.getElementById("adminProducts").innerHTML = products.map(product => `
            <tr>
                <td>
                    <div class="table-product">
                        <img src="${product.imageUrl}" alt="${product.name}" loading="lazy">
                        <span>${product.name}</span>
                    </div>
                </td>
                <td>${product.category.name}</td>
                <td>${currency(product.price)}</td>
                <td>${product.stock}</td>
                <td>
                    <button class="btn-muted" data-edit-product="${encodeURIComponent(JSON.stringify(product))}">Editar</button>
                    <button class="danger-btn" data-delete-product="${product.id}">Eliminar</button>
                </td>
            </tr>
        `).join("");

        document.querySelectorAll("[data-edit-category]").forEach(button => {
            button.addEventListener("click", () => {
                const category = JSON.parse(decodeURIComponent(button.dataset.editCategory));
                document.getElementById("categoryId").value = category.id;
                document.getElementById("categoryName").value = category.name;
                document.getElementById("categoryDescription").value = category.description;
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        });

        document.querySelectorAll("[data-edit-product]").forEach(button => {
            button.addEventListener("click", () => {
                const product = JSON.parse(decodeURIComponent(button.dataset.editProduct));
                document.getElementById("productId").value = product.id;
                document.getElementById("productName").value = product.name;
                document.getElementById("productDescription").value = product.description;
                document.getElementById("productPrice").value = product.price;
                document.getElementById("productStock").value = product.stock;
                document.getElementById("productImageUrl").value = product.imageUrl;
                document.getElementById("productCategoryId").value = product.category.id;
                updateProductImagePreview(product.imageUrl);
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        });

        document.querySelectorAll("[data-delete-category]").forEach(button => {
            button.addEventListener("click", async () => {
                try { await api(`/admin/categories/${button.dataset.deleteCategory}`, { method: "DELETE" }); await loadAdminData(); }
                catch (error) { showMessage("adminMessage", error.message); }
            });
        });

        document.querySelectorAll("[data-delete-product]").forEach(button => {
            button.addEventListener("click", async () => {
                try { await api(`/admin/products/${button.dataset.deleteProduct}`, { method: "DELETE" }); await loadAdminData(); }
                catch (error) { showMessage("adminMessage", error.message); }
            });
        });
    } catch (error) {
        showMessage("adminMessage", error.message);
    }
}

function populateCategorySelect(categories) {
    document.getElementById("productCategoryId").innerHTML =
        `<option value="">Selecciona una categoria</option>` +
        categories.map(category => `<option value="${category.id}">${category.name}</option>`).join("");
}

function renderAdminStats(categories, products) {
    const totalStock = products.reduce((total, product) => total + product.stock, 0);
    const activeProducts = products.filter(product => product.stock > 0).length;
    const inventoryValue = products.reduce((total, product) => total + product.price * product.stock, 0);

    document.getElementById("adminStats").innerHTML = [
        { label: "Productos", value: products.length },
        { label: "Con stock", value: activeProducts },
        { label: "Unidades", value: totalStock },
        { label: "Categorias", value: categories.length },
        { label: "Valor inventario", value: currency(inventoryValue) }
    ].map(stat => `
        <article class="stat-card">
            <span>${stat.label}</span>
            <strong>${stat.value}</strong>
        </article>
    `).join("");
}

function updateProductImagePreview(url) {
    const preview = document.getElementById("productImagePreview");
    if (!preview) return;

    if (!url) {
        preview.innerHTML = "Vista previa de la imagen";
        preview.style.backgroundImage = "";
        return;
    }

    preview.innerHTML = "";
    preview.style.backgroundImage = `url("${url}")`;
}

async function handleCategorySubmit(event) {
    event.preventDefault();
    try {
        const categoryId = document.getElementById("categoryId").value;
        await api(categoryId ? `/admin/categories/${categoryId}` : "/admin/categories", {
            method: categoryId ? "PUT" : "POST",
            body: JSON.stringify({
                name: document.getElementById("categoryName").value,
                description: document.getElementById("categoryDescription").value
            })
        });
        event.target.reset();
        document.getElementById("categoryId").value = "";
        showMessage("adminMessage", categoryId ? "Categoria actualizada correctamente." : "Categoria creada correctamente.", "success");
        await loadAdminData();
    } catch (error) {
        showMessage("adminMessage", error.message);
    }
}

async function handleProductSubmit(event) {
    event.preventDefault();
    try {
        const productId = document.getElementById("productId").value;
        await api(productId ? `/admin/products/${productId}` : "/admin/products", {
            method: productId ? "PUT" : "POST",
            body: JSON.stringify({
                name: document.getElementById("productName").value,
                description: document.getElementById("productDescription").value,
                price: Number(document.getElementById("productPrice").value),
                stock: Number(document.getElementById("productStock").value),
                imageUrl: document.getElementById("productImageUrl").value,
                categoryId: Number(document.getElementById("productCategoryId").value)
            })
        });
        event.target.reset();
        document.getElementById("productId").value = "";
        updateProductImagePreview("");
        showMessage("adminMessage", productId ? "Producto actualizado correctamente." : "Producto creado correctamente.", "success");
        await loadAdminData();
    } catch (error) {
        showMessage("adminMessage", error.message);
    }
}
