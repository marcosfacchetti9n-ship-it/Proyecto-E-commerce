const storageKeys = {
    token: "portfolio_shop_token",
    user: "portfolio_shop_user"
};

function getApiBaseUrl() {
    return window.APP_CONFIG.API_BASE_URL.replace(/\/$/, "");
}

function getToken() {
    return localStorage.getItem(storageKeys.token);
}

function setSession(authResponse) {
    localStorage.setItem(storageKeys.token, authResponse.token);
    localStorage.setItem(storageKeys.user, JSON.stringify({
        firstName: authResponse.firstName,
        lastName: authResponse.lastName,
        email: authResponse.email,
        roles: authResponse.roles
    }));
}

function clearSession() {
    localStorage.removeItem(storageKeys.token);
    localStorage.removeItem(storageKeys.user);
    localStorage.removeItem("portfolio_shop_cart_count");
}

function getCurrentUser() {
    const raw = localStorage.getItem(storageKeys.user);
    return raw ? JSON.parse(raw) : null;
}

function isAdmin() {
    return Boolean(getCurrentUser()?.roles?.includes("ADMIN"));
}

function getCartItemCount() {
    return Number(localStorage.getItem("portfolio_shop_cart_count") || 0);
}

function setCartItemCount(count) {
    localStorage.setItem("portfolio_shop_cart_count", String(count));
    updateCartBadge();
}

function requireAuth(redirect = "login.html") {
    if (!getToken()) {
        window.location.href = redirect;
    }
}

function requireAdmin() {
    requireAuth();
    if (!isAdmin()) {
        window.location.href = "index.html";
    }
}

async function api(path, options = {}) {
    // Todas las requests pasan por aca para mantener auth y errores en un solo lugar.
    const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${getApiBaseUrl()}${path}`, { ...options, headers });
    if (response.status === 204) return null;

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        const details = data.details?.length ? ` ${data.details.join(" | ")}` : "";
        throw new Error(data.message ? `${data.message}${details}` : "Ocurrio un error en la API.");
    }
    return data;
}

function currency(value) {
    return new Intl.NumberFormat("es-AR", { style: "currency", currency: "USD" }).format(value);
}

function showMessage(elementId, message, type = "error") {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.className = `message ${type}`;
    el.textContent = message;
}

function resetMessage(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.className = "message";
    el.textContent = "";
}

function bindLayout() {
    const authArea = document.querySelector("[data-auth-links]");
    if (!authArea) return;

    const user = getCurrentUser();
    const currentPage = location.pathname.split("/").pop() || "index.html";
    const links = [
        { href: "index.html", label: "Catalogo" },
        ...(user ? [{ href: "cart.html", label: "Carrito", badge: true }, { href: "orders.html", label: "Ordenes" }] : []),
        ...(isAdmin() ? [{ href: "admin.html", label: "Admin" }] : [])
    ];

    authArea.innerHTML = links
        .map(link => `
            <a href="${link.href}" class="${currentPage === link.href ? "active" : ""}">
                ${link.label}${link.badge ? `<span class="cart-badge" data-cart-badge>${getCartItemCount()}</span>` : ""}
            </a>
        `)
        .join("");

    if (user) {
        authArea.innerHTML += `<button type="button" id="logoutBtn">Salir</button>`;
        const userName = document.querySelector("[data-user-name]");
        if (userName) userName.textContent = `${user.firstName} ${user.lastName}`;
        document.getElementById("logoutBtn").addEventListener("click", () => {
            clearSession();
            window.location.href = "login.html";
        });
    } else {
        authArea.innerHTML += `<a href="login.html" class="${currentPage === "login.html" ? "active" : ""}">Ingresar</a>`;
    }
    updateCartBadge();
}

function updateCartBadge() {
    document.querySelectorAll("[data-cart-badge]").forEach(badge => {
        const count = getCartItemCount();
        badge.textContent = count;
        badge.hidden = count === 0;
    });
}

document.addEventListener("DOMContentLoaded", bindLayout);
