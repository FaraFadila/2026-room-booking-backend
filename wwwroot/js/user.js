const API_USERS = "http://localhost:5083/api/Auth/users";
const token = localStorage.getItem("token");

if (!token) window.location.href = "index.html";

function authHeader() {
    return {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
    };
}

function logout() {
    localStorage.clear();
    window.location.href = "index.html";
}

function qs(param) {
    const url = new URL(window.location.href);
    return url.searchParams.get(param);
}

async function loadUser() {
    const id = qs('userId');
    if (!id) return alert('Missing userId');

    const res = await fetch(`${API_USERS}/${id}`, { headers: authHeader() });
    if (!res.ok) return alert('Failed to load user');
    const u = await res.json();
    document.getElementById('fullName').value = u.fullName ?? '';
    document.getElementById('email').value = u.email ?? '';
    document.getElementById('roleSelect').value = (u.role === 'Admin' ? '0' : '1');

    document.getElementById('saveBtn').onclick = async () => {
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const role = parseInt(document.getElementById('roleSelect').value);

        const body = { fullName, email };
        if (password) body.password = password;
        body.role = role;

        const put = await fetch(`${API_USERS}/${id}`, {
            method: 'PUT',
            headers: authHeader(),
            body: JSON.stringify(body)
        });
        if (put.status === 401) { alert('Session expired'); logout(); return; }
        if (!put.ok) { const t = await put.text(); alert('Error: ' + t); return; }
        alert('Saved');
        window.location.href = 'users.html';
    };

    document.getElementById('deleteBtn').onclick = async () => {
        if (!confirm('Delete user ' + id + '?')) return;
        const del = await fetch(`${API_USERS}/${id}`, { method: 'DELETE', headers: authHeader() });
        if (del.status === 401) { alert('Session expired'); logout(); return; }
        if (!del.ok) { const t = await del.text(); alert('Error: ' + t); return; }
        alert('User deleted');
        window.location.href = 'users.html';
    };
}

loadUser();
