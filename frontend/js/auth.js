document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-toggle-password]").forEach(button => {
        button.addEventListener("click", () => {
            const input = document.getElementById(button.dataset.togglePassword);
            const isHidden = input.type === "password";
            input.type = isHidden ? "text" : "password";
            button.textContent = isHidden ? "Ocultar" : "Ver";
            button.setAttribute("aria-label", isHidden ? "Ocultar contrasena" : "Mostrar contrasena");
            button.setAttribute("title", isHidden ? "Ocultar contrasena" : "Mostrar contrasena");
        });
    });

    document.getElementById("fillAdminDemo")?.addEventListener("click", () => {
        document.getElementById("loginEmail").value = "admin@demo.com";
        document.getElementById("loginPassword").value = "Admin123";
    });

    document.getElementById("registerForm")?.addEventListener("submit", async event => {
        event.preventDefault();
        resetMessage("authMessage");

        try {
            const response = await api("/auth/register", {
                method: "POST",
                body: JSON.stringify({
                    firstName: document.getElementById("firstName").value,
                    lastName: document.getElementById("lastName").value,
                    email: document.getElementById("registerEmail").value,
                    password: document.getElementById("registerPassword").value
                })
            });
            setSession(response);
            showMessage("authMessage", "Cuenta creada. Redirigiendo al catalogo...", "success");
            setTimeout(() => window.location.href = "index.html", 700);
        } catch (error) {
            showMessage("authMessage", error.message);
        }
    });

    document.getElementById("loginForm")?.addEventListener("submit", async event => {
        event.preventDefault();
        resetMessage("authMessage");

        try {
            const response = await api("/auth/login", {
                method: "POST",
                body: JSON.stringify({
                    email: document.getElementById("loginEmail").value,
                    password: document.getElementById("loginPassword").value
                })
            });
            setSession(response);
            showMessage("authMessage", "Sesion iniciada. Redirigiendo...", "success");
            setTimeout(() => window.location.href = "index.html", 700);
        } catch (error) {
            showMessage("authMessage", error.message);
        }
    });
});
