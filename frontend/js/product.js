document.addEventListener("DOMContentLoaded", async () => {
    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) {
        window.location.href = "index.html";
        return;
    }

    try {
        const product = await api(`/products/${id}`);
        document.getElementById("productDetail").innerHTML = `
            <div class="detail-image"><img src="${product.imageUrl}" alt="${product.name}"></div>
            <div class="detail-copy">
                <span class="label">${product.category.name}</span>
                <h2>${product.name}</h2>
                <p class="meta">${product.description}</p>
                <div class="price">${currency(product.price)}</div>
                <p class="meta">Stock disponible: ${product.stock}</p>
                <div class="quantity-row">
                    <input id="productQty" type="number" min="1" max="${product.stock}" value="1">
                    <button class="btn" id="addToCartBtn">Agregar al carrito</button>
                </div>
            </div>
        `;

        document.getElementById("addToCartBtn").addEventListener("click", async () => {
            if (!getToken()) {
                window.location.href = "login.html";
                return;
            }
            try {
                await api("/cart/items", {
                    method: "POST",
                    body: JSON.stringify({ productId: product.id, quantity: Number(document.getElementById("productQty").value) })
                });
                setCartItemCount(getCartItemCount() + Number(document.getElementById("productQty").value));
                showMessage("productMessage", "Producto agregado al carrito.", "success");
            } catch (error) {
                showMessage("productMessage", error.message);
            }
        });
    } catch (error) {
        showMessage("productMessage", error.message);
    }
});
