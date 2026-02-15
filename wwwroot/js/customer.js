const API_CUSTOMER = "http://localhost:5083/api/Customer";
const token = localStorage.getItem("token");
if (!token) window.location.href = 'index.html';
function authHeader() { return { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }; }
function logout() { localStorage.clear(); window.location.href = 'index.html'; }
function qs(param) { const url = new URL(window.location.href); return url.searchParams.get(param); }

async function loadCustomer() {
    const id = qs('customerId'); if (!id) return alert('Missing customerId');
    const res = await fetch(`${API_CUSTOMER}/${id}`, { headers: authHeader() });
    if (!res.ok) return alert('Failed to load customer');
    const c = await res.json();
    document.getElementById('name').value = c.name ?? '';
    document.getElementById('email').value = c.email ?? '';
    document.getElementById('phone').value = c.phone ?? '';
    document.getElementById('address').value = c.address ?? '';

    document.getElementById('saveBtn').onclick = async () => {
        const body = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            isActive: true
        };
        const put = await fetch(`${API_CUSTOMER}/${id}`, { method: 'PUT', headers: authHeader(), body: JSON.stringify(body) });
        if (put.status === 401) { alert('Session expired'); logout(); return; }
        if (!put.ok) { const t = await put.text(); alert('Error: ' + t); return; }
        alert('Saved'); window.location.href = 'customers.html';
    };

    document.getElementById('deleteBtn').onclick = async () => {
        if (!confirm('Delete customer ' + id + '?')) return;
        const del = await fetch(`${API_CUSTOMER}/${id}`, { method: 'DELETE', headers: authHeader() });
        if (del.status === 401) { alert('Session expired'); logout(); return; }
        if (!del.ok) { const t = await del.text(); alert('Error: ' + t); return; }
        alert('Deleted'); window.location.href = 'customers.html';
    };
}

loadCustomer();
