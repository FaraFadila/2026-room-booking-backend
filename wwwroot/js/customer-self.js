// Utility to get current user's customer info
async function getMyCustomer() {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:5083/api/Customer/me", {
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) return null;
    return await res.json();
}

// Utility to set up customer field in dashboard modal
async function setupCustomerField() {
    const role = localStorage.getItem("role");
    const select = document.getElementById("customerSelect");
    const label = document.getElementById("customerLabel");
    if (role !== "Admin") {
        // User: fetch their own customer and set value, hide dropdown and label
        const res = await fetch("http://localhost:5083/api/Customer/me", {
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });
        if (res.ok) {
            const customer = await res.json();
            select.innerHTML = `<option value="${customer.id}" selected>${customer.name}</option>`;
            select.disabled = true;
            select.style.display = "none";
            if (label) label.style.display = "none";
        }
    } else {
        // Admin: show all customers
        const res = await fetch("http://localhost:5083/api/Customer", {
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        const customers = Array.isArray(data) ? data : data.customers ?? [];
        select.innerHTML = "";
        customers.forEach(c => {
            select.insertAdjacentHTML("beforeend", `<option value="${c.id}">${c.name}</option>`);
        });
        select.disabled = false;
        select.style.display = "";
        if (label) label.style.display = "";
    }
}
