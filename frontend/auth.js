/* =====================================
   API BASE URL - keep in sync with your
   backend's HTTPS port (launchSettings.json)
===================================== */

const API_BASE_URL = window.location.hostname === "localhost"
    ? window.location.origin
    : "https://localhost:5226";


/* =====================================
   SESSION STORAGE / REMEMBER ME
===================================== */

function activeStorage() {
    return localStorage.getItem("rememberMe") === "true" ? localStorage : sessionStorage;
}

function getSessionValue(key) {
    return activeStorage().getItem(key);
}

// Migrate old builds that stored every token in localStorage without a
// Remember Me choice. Those tokens should not become persistent sessions.
if (localStorage.getItem("token") && localStorage.getItem("rememberMe") !== "true") {
    ["token", "rememberMe", "userId", "username", "email", "role", "farmId"].forEach(key => {
        localStorage.removeItem(key);
    });
}

function setSessionValue(key, value) {
    activeStorage().setItem(key, value);
}

function clearSessionStorage() {
    localStorage.clear();
    sessionStorage.clear();
}

function saveLoginSession(data, email, rememberMe) {
    ["token", "rememberMe", "userId", "username", "email", "role", "farmId"].forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
    });

    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem("token", data.token);
    storage.setItem("rememberMe", String(rememberMe));
    if (data.userId !== undefined) storage.setItem("userId", data.userId);
    if (data.username) storage.setItem("username", data.username);
    storage.setItem("email", data.email || email);
    if (data.role) storage.setItem("role", data.role);
    if (data.farmId !== undefined && data.farmId !== null) {
        storage.setItem("farmId", data.farmId);
    }
}

/* =====================================
   TABS
===================================== */

const tabLogin = document.getElementById("tabLogin");
const tabRegister = document.getElementById("tabRegister");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

function activateTab(which) {
    const isLogin = which === "login";

    tabLogin.classList.toggle("active", isLogin);
    tabRegister.classList.toggle("active", !isLogin);
    tabLogin.setAttribute("aria-selected", String(isLogin));
    tabRegister.setAttribute("aria-selected", String(!isLogin));

    loginForm.classList.toggle("active", isLogin);
    registerForm.classList.toggle("active", !isLogin);

    clearBanner();
}

tabLogin.addEventListener("click", () => activateTab("login"));
tabRegister.addEventListener("click", () => activateTab("register"));


/* =====================================
   SHOW / HIDE PASSWORD
===================================== */

document.querySelectorAll(".auth-peek").forEach((button) => {
    button.addEventListener("click", () => {
        const input = document.getElementById(button.dataset.target);
        if (!input) return;
        input.type = input.type === "password" ? "text" : "password";
    });
});


/* =====================================
   BANNER
===================================== */

const banner = document.getElementById("banner");

function showBanner(message, kind) {
    banner.textContent = message;
    banner.className = `auth-banner is-visible is-${kind}`;
}

function clearBanner() {
    banner.className = "auth-banner";
    banner.textContent = "";
}

function setLoading(button, isLoading) {
    button.disabled = isLoading;
    button.classList.toggle("is-loading", isLoading);
}


async function apiJson(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    });

    let data = {};
    try { data = await response.json(); } catch { /* empty response */ }
    return { response, data };
}

function connectionMessage(error) {
    console.error("API connection failed:", error);
    if (window.location.protocol === "file:") {
        return "Open the login page from https://localhost:5226/auth.html while the backend is running. This keeps the frontend and API on the same HTTPS origin.";
    }
    return `Secure API connection failed. Confirm the backend is running at ${API_BASE_URL}, then run TRUST-HTTPS-CERTIFICATE.ps1 if the browser does not trust the development certificate.`;
}

/* =====================================
   LOGIN
   One endpoint, no "log in as" choice - the
   backend looks up the account's actual role
   and returns permission claims accordingly.
===================================== */

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearBanner();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const rememberMe = document.getElementById("rememberMe").checked;

    const submitButton = document.getElementById("loginSubmit");
    setLoading(submitButton, true);

    try {
        const { response, data } = await apiJson("/api/Auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const validationText = data.errors ? Object.values(data.errors).flat().join(" ") : null;
            showBanner(data.message || validationText || `Sign in failed (status ${response.status}).`, "error");
            return;
        }

        if (!data.token) {
            showBanner("Signed in, but no token was returned by the server.", "error");
            return;
        }

        saveLoginSession(data, email, rememberMe);

        window.location.assign("./index.html");

    } catch (error) {
        console.error("Login request failed:", error);
        showBanner(
            connectionMessage(error),
            "error"
        );
    } finally {
        setLoading(submitButton, false);
    }
});


/* =====================================
   REGISTER
===================================== */

registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearBanner();

    const fullName = document.getElementById("regFullName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const mobile = document.getElementById("regMobile").value.trim();
    const password = document.getElementById("regPassword").value;
    const confirmPassword = document.getElementById("regConfirmPassword").value;
    const farmName = document.getElementById("regFarmName").value.trim();
    const farmLocation = document.getElementById("regFarmLocation").value.trim();
    const farmType = document.getElementById("regFarmType").value;
    const farmArea = document.getElementById("regFarmArea").value;
    const areaUnit = document.getElementById("regAreaUnit").value;
    const primaryCrop = document.getElementById("regPrimaryCrop").value.trim();

    if (password !== confirmPassword) {
        showBanner("Passwords do not match.", "error");
        return;
    }

    if (password.length < 8) {
        showBanner("Password must be at least 8 characters.", "error");
        return;
    }

    if (!Number(farmArea) || Number(farmArea) <= 0) {
        showBanner("Farm area must be greater than 0.", "error");
        return;
    }

    // RegisterDto fields exactly. `role` is sent as "Owner" for compatibility
    // with either backend version - the fixed backend ignores it and always
    // creates an Owner regardless.
    const payload = {
        fullName, email, mobile, password, confirmPassword,
        role: "Owner",
        farmName, farmLocation, farmType,
        farmArea: Number(farmArea), areaUnit, primaryCrop
    };

    const submitButton = document.getElementById("registerSubmit");
    setLoading(submitButton, true);

    try {
        const { response, data } = await apiJson("/api/Auth/register", {
            method: "POST",
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const validationText = data.errors ? Object.values(data.errors).flat().join(" ") : null;
            showBanner(data.message || validationText || `Registration failed (status ${response.status}).`, "error");
            return;
        }

        registerForm.reset();
        activateTab("login");
        document.getElementById("loginEmail").value = email;
        showBanner(`Account created for ${data.farmName || "your farm"}. Sign in below to continue.`, "success");

    } catch (error) {
        console.error("Registration request failed:", error);
        showBanner(
            connectionMessage(error),
            "error"
        );
    } finally {
        setLoading(submitButton, false);
    }
});


/* =====================================
   FORGOT / RESET PASSWORD
===================================== */

const forgotPanel = document.getElementById("forgotPanel");
const resetPanel = document.getElementById("resetPanel");
const forgotForm = document.getElementById("forgotForm");
const resetForm = document.getElementById("resetForm");

function showOnlyAuthPanel(panel) {
    [loginForm, registerForm, forgotPanel, resetPanel].forEach(form => {
        if (form) form.classList.remove("active");
    });
    [forgotPanel, resetPanel].forEach(p => {
        if (p) p.hidden = p !== panel;
    });

    if (panel === loginForm) {
        loginForm.classList.add("active");
        forgotPanel.hidden = true;
        resetPanel.hidden = true;
    } else if (panel === forgotPanel || panel === resetPanel) {
        panel.hidden = false;
        panel.classList.add("active");
    }

    clearBanner();
}

document.getElementById("forgotPassword").addEventListener("click", (event) => {
    event.preventDefault();
    document.getElementById("forgotEmail").value = document.getElementById("loginEmail").value.trim();
    showOnlyAuthPanel(forgotPanel);
});

document.getElementById("backToLoginFromForgot").addEventListener("click", () => {
    forgotPanel.hidden = true;
    showOnlyAuthPanel(loginForm);
});

forgotForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearBanner();

    const email = document.getElementById("forgotEmail").value.trim();
    const button = document.getElementById("forgotSubmit");
    setLoading(button, true);

    try {
        const { response, data } = await apiJson("/api/Auth/forgot-password", {
            method: "POST",
            body: JSON.stringify({ email })
        });

        if (!response.ok) {
            showBanner(data.message || "Could not start password reset.", "error");
            return;
        }

        const devLink = document.getElementById("developmentResetLink");
        if (data.developmentResetLink) {
            devLink.hidden = false;
            devLink.innerHTML = `Development reset link: <a href="${data.developmentResetLink}">Open reset page</a>`;
        } else {
            devLink.hidden = true;
        }

        showBanner(data.message || "If the account exists, a reset link has been sent.", "success");
    } catch (error) {
        showBanner(connectionMessage(error), "error");
    } finally {
        setLoading(button, false);
    }
});

function getResetTokenFromHash() {
    const match = window.location.hash.match(/^#reset=(.+)$/);
    return match ? decodeURIComponent(match[1]) : null;
}

const resetToken = getResetTokenFromHash();
if (resetToken) {
    showOnlyAuthPanel(resetPanel);
}

resetForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearBanner();

    const token = getResetTokenFromHash();
    const newPassword = document.getElementById("resetPassword").value;
    const confirmPassword = document.getElementById("resetConfirmPassword").value;

    if (!token) {
        showBanner("This reset link is missing or invalid.", "error");
        return;
    }

    if (newPassword.length < 8) {
        showBanner("Password must be at least 8 characters.", "error");
        return;
    }

    if (newPassword !== confirmPassword) {
        showBanner("Passwords do not match.", "error");
        return;
    }

    const button = document.getElementById("resetSubmit");
    setLoading(button, true);

    try {
        const { response, data } = await apiJson("/api/Auth/reset-password", {
            method: "POST",
            body: JSON.stringify({
                token,
                newPassword,
                confirmPassword
            })
        });

        if (!response.ok) {
            showBanner(data.message || "Password reset failed.", "error");
            return;
        }

        window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
        resetForm.reset();
        showOnlyAuthPanel(loginForm);
        showBanner(data.message || "Password reset successfully. You can now sign in.", "success");
    } catch (error) {
        showBanner(connectionMessage(error), "error");
    } finally {
        setLoading(button, false);
    }
});


/* =====================================
   ALREADY SIGNED IN? SKIP STRAIGHT TO
   THE DASHBOARD
===================================== */

if (getSessionValue("token")) {
    window.location.assign("./index.html");
}
