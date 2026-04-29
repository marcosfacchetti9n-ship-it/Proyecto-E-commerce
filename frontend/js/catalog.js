let allProducts = [];
let selectedCategoryId = "";
let searchDebounceId;

async function loadCatalog() {
    // Mostramos skeletons para que el cold start de Render se sienta como carga normal.
    renderProductSkeletons();
    try {
        const categories = await api("/categories");
        renderCategoryFilters(categories);
        bindCatalogControls();
        await loadProducts();
    } catch (error) {
        showMessage("catalogMessage", error.message);
    }
}

async function loadProducts() {
    renderProductSkeletons();
    try {
        allProducts = await api(`/products${buildProductQuery()}`);
        renderProducts(allProducts);
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
            loadProducts();
        });
    });
}

function bindCatalogControls() {
    document.getElementById("catalogSearch")?.addEventListener("input", () => {
        clearTimeout(searchDebounceId);
        searchDebounceId = setTimeout(loadProducts, 280);
    });
    document.getElementById("catalogMinPrice")?.addEventListener("input", () => {
        clearTimeout(searchDebounceId);
        searchDebounceId = setTimeout(loadProducts, 280);
    });
    document.getElementById("catalogMaxPrice")?.addEventListener("input", () => {
        clearTimeout(searchDebounceId);
        searchDebounceId = setTimeout(loadProducts, 280);
    });
    document.getElementById("catalogSort")?.addEventListener("change", loadProducts);
    document.getElementById("catalogInStock")?.addEventListener("change", loadProducts);
}

function buildProductQuery() {
    const params = new URLSearchParams();
    const searchTerm = document.getElementById("catalogSearch")?.value.trim();
    const minPrice = document.getElementById("catalogMinPrice")?.value;
    const maxPrice = document.getElementById("catalogMaxPrice")?.value;
    const sort = document.getElementById("catalogSort")?.value || "featured";
    const inStock = document.getElementById("catalogInStock")?.checked;

    // Los filtros viajan a la API para mostrar busqueda server-side en el portfolio.
    if (selectedCategoryId) params.set("categoryId", selectedCategoryId);
    if (searchTerm) params.set("search", searchTerm);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (inStock) params.set("inStock", "true");
    if (sort !== "featured") params.set("sort", sort);

    const query = params.toString();
    return query ? `?${query}` : "";
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
