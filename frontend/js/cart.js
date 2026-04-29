document.addEventListener("DOMContentLoaded", async () => {
    requireAuth();
    await loadCart();
});

async function loadCart() {
    try {
        const cart = await api("/cart");
        setCartItemCount(cart.items.reduce((total, item) => total + item.quantity, 0));
        renderCart(cart);
    } catch (error) {
        showMessage("cartMessage", error.message);
    }
}

function renderCart(cart) {
    const itemsEl = document.getElementById("cartItems");
    const summaryEl = document.getElementById("cartSummary");

    if (!cart.items.length) {
        itemsEl.innerHTML = `<div class="empty-state">Tu carrito esta vacio. Explora el catalogo para empezar.</div>`;
        summaryEl.innerHTML = `<h3>Resumen</h3><p class="notice">Todavia no agregaste productos.</p>`;
        return;
    }

    itemsEl.innerHTML = cart.items.map(item => `
        <article class="cart-item">
            <img src="${item.imageUrl}" alt="${item.name}">
            <div>
                <h4>${item.name}</h4>
                <p class="meta">${currency(item.unitPrice)} por unidad</p>
                <div class="quantity-row">
                    <input type="number" min="1" value="${item.quantity}" data-qty="${item.id}">
                    <button class="btn-muted" data-update="${item.id}">Actualizar</button>
                    <button class="danger-btn" data-remove="${item.id}">Eliminar</button>
                </div>
            </div>
            <strong>${currency(item.subtotal)}</strong>
        </article>
    `).join("");

    summaryEl.innerHTML = `
        <h3>Resumen</h3>
        <p class="meta">Items: ${cart.items.length}</p>
        <div class="price">${currency(cart.total)}</div>
        <div class="stack">
            <button class="btn" id="checkoutBtn">Confirmar compra</button>
            <button class="btn-outline" id="clearCartBtn">Vaciar carrito</button>
        </div>
    `;

    itemsEl.querySelectorAll("[data-update]").forEach(button => {
        button.addEventListener("click", async () => {
            try {
                await api(`/cart/items/${button.dataset.update}`, {
                    method: "PUT",
                    body: JSON.stringify({ quantity: Number(itemsEl.querySelector(`[data-qty="${button.dataset.update}"]`).value) })
                });
                await loadCart();
            } catch (error) {
                showMessage("cartMessage", error.message);
            }
        });
    });

    itemsEl.querySelectorAll("[data-remove]").forEach(button => {
        button.addEventListener("click", async () => {
            await api(`/cart/items/${button.dataset.remove}`, { method: "DELETE" });
            await loadCart();
        });
    });

    document.getElementById("checkoutBtn").addEventListener("click", async () => {
        try {
            const order = await api("/orders/checkout", { method: "POST" });
            showMessage("cartMessage", `Compra confirmada. Orden #${order.id} generada correctamente.`, "success");
            await loadCart();
        } catch (error) {
            showMessage("cartMessage", error.message);
        }
    });

    document.getElementById("clearCartBtn").addEventListener("click", async () => {
        await api("/cart/clear", { method: "DELETE" });
        await loadCart();
    });
}
