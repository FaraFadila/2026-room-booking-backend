const API_ROOMS = "http://localhost:5083/api/Rooms";
const token = localStorage.getItem("token");
if (!token) window.location.href = 'index.html';
function authHeader() { return { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }; }
function logout() { localStorage.clear(); window.location.href = 'index.html'; }
function qs(param) { const url = new URL(window.location.href); return url.searchParams.get(param); }

async function loadRoom() {
    const id = qs('roomId'); if (!id) return alert('Missing roomId');
    const res = await fetch(`${API_ROOMS}/${id}`, { headers: authHeader() });
    if (!res.ok) return alert('Failed to load room');
    const r = await res.json();
    document.getElementById('name').value = r.name ?? '';
    document.getElementById('capacity').value = r.capacity ?? 0;
    document.getElementById('location').value = r.location ?? '';
    document.getElementById('isAvailable').value = r.isAvailable ? 'true' : 'false';

    document.getElementById('saveBtn').onclick = async () => {
        const body = {
            id: parseInt(id),
            name: document.getElementById('name').value,
            capacity: parseInt(document.getElementById('capacity').value || '0'),
            location: document.getElementById('location').value,
            isAvailable: document.getElementById('isAvailable').value === 'true'
        };
        const put = await fetch(`${API_ROOMS}/${id}`, { method: 'PUT', headers: authHeader(), body: JSON.stringify(body) });
        if (put.status === 401) { alert('Session expired'); logout(); return; }
        if (!put.ok) { const t = await put.text(); alert('Error: ' + t); return; }
        alert('Saved'); window.location.href = 'rooms.html';
    };

    document.getElementById('deleteBtn').onclick = async () => {
        if (!confirm('Delete room ' + id + '?')) return;
        const del = await fetch(`${API_ROOMS}/${id}`, { method: 'DELETE', headers: authHeader() });
        if (del.status === 401) { alert('Session expired'); logout(); return; }
        if (!del.ok) { const t = await del.text(); alert('Error: ' + t); return; }
        alert('Deleted'); window.location.href = 'rooms.html';
    };
}

loadRoom();
