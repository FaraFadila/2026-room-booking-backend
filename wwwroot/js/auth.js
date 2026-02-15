const API = "http://localhost:5083/api/Auth";

/* ================= LOGIN ================= */
async function login() {
    const email = document.getElementById("email")?.value;
    const password = document.getElementById("password")?.value;
    const errorMsg = document.getElementById("errorMsg");

    if (!email || !password) {
        if (errorMsg) errorMsg.innerText = "Email and password are required.";
        return;
    }

    try {
        const response = await fetch(`${API}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.role);
            localStorage.setItem("name", data.fullName);

            window.location.href = "dashboard.html";
        } else {
            if (errorMsg) errorMsg.innerText = data;
        }

    } catch (error) {
        if (errorMsg) errorMsg.innerText = "Server error. Please try again.";
    }
}

/* ================= REGISTER ================= */
async function register() {
    const fullName = document.getElementById("fullname")?.value;
    const email = document.getElementById("email")?.value;
    const password = document.getElementById("password")?.value;
    const role = parseInt(document.getElementById("role")?.value);
    const errorMsg = document.getElementById("errorMsg");

    if (!fullName || !email || !password) {
        if (errorMsg) errorMsg.innerText = "All fields are required.";
        return;
    }

    try {
        const response = await fetch(`${API}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fullName, email, password, role })
        });

        const data = await response.text();

        if (response.ok) {
            alert("Register success! Please login.");
            window.location.href = "index.html";
        } else {
            if (errorMsg) errorMsg.innerText = data;
        }

    } catch (error) {
        if (errorMsg) errorMsg.innerText = "Server error. Please try again.";
    }
}

/* ================= LOGOUT ================= */
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");

    window.location.href = "index.html";
}

/* ================= AUTO REDIRECT ================= */
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");

    // Kalau sudah login dan masih di login page, redirect
    if (token && window.location.pathname.includes("index.html")) {
        window.location.href = "dashboard.html";
    }
});
