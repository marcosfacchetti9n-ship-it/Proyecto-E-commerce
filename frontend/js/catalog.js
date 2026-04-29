let allProducts = [];
let selectedCategoryId = "";

async function loadCatalog() {
    // Mostramos skeletons para que el cold start de Render se sienta como carga normal.
    renderProductSkeletons();
    try {
        const [categories, products] = await Promise.all([api("/categories"), api("/products")]);
        allProducts = products;
        renderCategoryFilters(categories);
        renderProducts(getFilteredProducts());
        bindCatalogControls();
    } catch (error) {
        showMessage("catalogMessage", error.message);
    }
}

function renderCategoryFilters(categories) {
    const container = document.getElementById("categoryFilters");
    container.innerHTML = `<button class="pill active" data-category="">Todo</button>` +
        categories.map(category => `<button class="pill" data-category="${category.id}">${category.name}</button>`).join("");

    container.querySelectorAll("[data-category]").forEach(button => {
        button.addEventListener("click", () => {
            container.querySelectorAll(".pill").forEach(pill => pill.classList.remove("active"));
            button.classList.add("active");
            selectedCategoryId = button.dataset.category;
            renderProducts(getFilteredProducts());
        });
    });
}

function bindCatalogControls() {
    document.getElementById("catalogSearch")?.addEventListener("input", () => renderProducts(getFilteredProducts()));
    document.getElementById("catalogSort")?.addEventListener("change", () => renderProducts(getFilteredProducts()));
}

function getFilteredProducts() {
    const searchTerm = document.getElementById("catalogSearch")?.value.trim().toLowerCase() || "";
    const sort = document.getElementById("catalogSort")?.value || "featured";

    // En esta version portfolio filtramos en cliente para mantener simple la API publica.
    const filtered = allProducts.filter(product => {
        const matchesCategory = !selectedCategoryId || product.category.id === Number(selectedCategoryId);
        const matchesSearch = [product.name, product.description, product.category.name]
            .join(" ")
            .toLowerCase()
            .includes(searchTerm);
        return matchesCategory && matchesSearch;
    });

    return filtered.sort((a, b) => {
        if (sort === "priceAsc") return a.price - b.price;
        if (sort === "priceDesc") return b.price - a.price;
        if (sort === "stockDesc") return b.stock - a.stock;
        return a.id - b.id;
    });
}

function renderProducts(products) {
    const grid = document.getElementById("productGrid");
    document.getElementById("catalogCount").textContent = `${products.length} producto${products.length === 1 ? "" : "s"}`;

    if (!products.length) {
        grid.innerHTML = `<div class="empty-state">No encontramos productos con esos filtros.</div>`;
        return;
    }

    grid.innerHTML = products.map(product => `
        <article class="product-card">
            <a class="product-image" href="product.html?id=${product.id}">
                <img src="${product.imageUrl}" alt="${product.name}" loading="lazy">
            </a>
            <div class="product-copy">
                <div class="product-meta-row">
                    <span class="label">${product.category.name}</span>
                    <span class="stock-chip">${product.stock > 0 ? `${product.stock} en stock` : "Sin stock"}</span>
                </div>
                <h4><a href="product.html?id=${product.id}">${product.name}</a></h4>
                <p class="meta">${product.description.slice(0, 118)}${product.description.length > 118 ? "..." : ""}</p>
                <div class="price">${currency(product.price)}</div>
                <div class="cta-row">
                    <a class="btn-outline" href="product.html?id=${product.id}">Ver detalle</a>
                    <button class="btn" data-add-cart="${product.id}" ${product.stock === 0 ? "disabled" : ""}>Agregar</button>
                </div>
            </div>
        </article>
    `).join("");

    grid.querySelectorAll("[data-add-cart]").forEach(button => {
        button.addEventListener("click", async () => {
            if (!getToken()) {
                window.location.href = "login.html";
                return;
            }
            try {
                button.disabled = true;
                await api("/cart/items", {
                    method: "POST",
                    body: JSON.stringify({ productId: Number(button.dataset.addCart), quantity: 1 })
                });
                setCartItemCount(getCartItemCount() + 1);
                showMessage("catalogMessage", "Producto agregado al carrito.", "success");
            } catch (error) {
                showMessage("catalogMessage", error.message);
            } finally {
                button.disabled = false;
            }
        });
    });
}

function renderProductSkeletons() {
    const grid = document.getElementById("productGrid");
    grid.innerHTML = Array.from({ length: 6 }, () => `
        <article class="product-card skeleton-card">
            <div class="skeleton skeleton-image"></div>
            <div class="product-copy">
                <div class="skeleton skeleton-line short"></div>
                <div class="skeleton skeleton-line"></div>
                <div class="skeleton skeleton-line"></div>
                <div class="skeleton skeleton-line tiny"></div>
            </div>
        </article>
    `).join("");
}

document.addEventListener("DOMContentLoaded", loadCatalog);
