const apiLogin = "http://localhost:1337/api";

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

    sessionStorage.removeItem("loginOverlayShown");

    window.location.href = "index.html";
}

function showLoginOverlay() {
    if (sessionStorage.getItem("loginOverlayShown")) return;

    const overlay = document.getElementById("login-overlay");
    const overlayText = document.getElementById("overlay-text");

    if (!overlay || !overlayText) return;

    const user = getCurrentUser();
    const displayName = user?.username || user?.email || "Användare";

    overlayText.textContent = `Inloggad som ${displayName}`;
    overlay.classList.add("show");

    sessionStorage.setItem("loginOverlayShown", "true");

    setTimeout(() => {
        overlay.classList.remove("show");
    }, 1500);
}

function updateNavbar() {
    const guestNav = document.getElementById("guest-nav");
    const userNav = document.getElementById("user-nav");
    const welcomeUser = document.getElementById("welcome-user");

    if (!guestNav && !userNav) return;

    if (isLoggedIn()) {
        const user = getCurrentUser();

        guestNav?.classList.add("hidden");
        userNav?.classList.remove("hidden");

        if (welcomeUser && user) {
            welcomeUser.textContent = `Hej, ${user.username || user.email}!`;
        }

        showLoginOverlay();
    } else {
        guestNav?.classList.remove("hidden");
        userNav?.classList.add("hidden");
    }
}

async function login(identifier, password) {
    try {
        const { data } = await axios.post(`${apiLogin}/auth/local`, {
            identifier,
            password
        });

        saveAuth(data);

        setTimeout(() => {
            window.location.href = "index.html";
        }, 1200);

    } catch (err) {
        showMessage(
            "login-message",
            err.response?.data?.error?.message || "Inloggning misslyckades",
            "error"
        );
    }
}

async function register(username, email, password) {
    try {
        await axios.post(`${apiLogin}/auth/local/register`, {
            username,
            email,
            password
        });

        showMessage(
            "register-message",
            "Konto skapat! Logga in nu.",
            "success"
        );

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1800);

    } catch (err) {
        showMessage(
            "register-message",
            err.response?.data?.error?.message || "Registrering misslyckades",
            "error"
        );
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

    document
        .getElementById("logout-btn")
        ?.addEventListener("click", logout);

    document
        .getElementById("login-form")
        ?.addEventListener("submit", (e) => {
            e.preventDefault();

            login(
                document.getElementById("identifier").value.trim(),
                document.getElementById("password").value
            );
        });

    document
        .getElementById("register-form")
        ?.addEventListener("submit", (e) => {
            e.preventDefault();

            register(
                document.getElementById("username").value.trim(),
                document.getElementById("email").value.trim(),
                document.getElementById("password").value
            );
        });
});