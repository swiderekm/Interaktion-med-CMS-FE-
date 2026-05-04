const API_URL = "http://localhost:1337/api";

function saveAuth(data) {
    localStorage.setItem("jwt", data.jwt);
    localStorage.setItem("user", JSON.stringify(data.user));
}

function getToken() {
    return localStorage.getItem("jwt");
}

function getCurrentUser() {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
}

function isLoggedIn() {
    return !!getToken();
}

function logout() {
    localStorage.removeItem("jwt");
    localStorage.removeItem("user");
    window.location.href = "index.html";
}

function showLoginOverlay() {
    const overlay = document.getElementById("login-overlay");
    const overlayText = document.getElementById("overlay-text");
    
    if (!overlay || !overlayText) return;

    const user = getCurrentUser();
    const displayName = user ? (user.username || user.email || "Användare") : "Användare";

    overlayText.textContent = `Inloggad som ${displayName}`;
    overlay.classList.add("show");

    setTimeout(() => {
        overlay.classList.remove("show");
    }, 4000);
}

function updateNavbar() {
    const guestNav = document.getElementById("guest-nav");
    const userNav = document.getElementById("user-nav");
    const welcomeUser = document.getElementById("welcome-user");

    if (!guestNav && !userNav) return;

    if (isLoggedIn()) {
        const user = getCurrentUser();
        
        if (guestNav) guestNav.classList.add("hidden");
        if (userNav) userNav.classList.remove("hidden");
        
        if (welcomeUser && user) {
            welcomeUser.textContent = `Hej, ${user.username || user.email}!`;
        }

        showLoginOverlay();
    } else {
        if (guestNav) guestNav.classList.remove("hidden");
        if (userNav) userNav.classList.add("hidden");
    }
}

async function login(identifier, password) {
    try {
        const res = await fetch(`${API_URL}/auth/local`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ identifier, password })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || "Inloggning misslyckades");

        saveAuth(data);
        showMessage("login-message", "Inloggning lyckades! 🎉", "success");
        setTimeout(() => window.location.href = "index.html", 1200);
    } catch (err) {
        showMessage("login-message", err.message, "error");
    }
}

async function register(username, email, password) {
    try {
        const res = await fetch(`${API_URL}/auth/local/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || "Registrering misslyckades");

        showMessage("register-message", "Konto skapat! Logga in nu.", "success");
        setTimeout(() => window.location.href = "login.html", 1800);
    } catch (err) {
        showMessage("register-message", err.message, "error");
    }
}

function showMessage(elementId, text, type) {
    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = text;
        el.className = `message ${type}`;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    updateNavbar();

    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }

    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const identifier = document.getElementById("identifier").value.trim();
            const password = document.getElementById("password").value;
            login(identifier, password);
        });
    }

    const registerForm = document.getElementById("register-form");
    if (registerForm) {
        registerForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const username = document.getElementById("username").value.trim();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;
            register(username, email, password);
        });
    }
});