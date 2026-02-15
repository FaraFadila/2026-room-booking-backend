const API_ROOMS = "http://localhost:5083/api/Rooms";
const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "index.html";
}

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

async function loadRooms() {
    try {
        const res = await fetch(API_ROOMS, { headers: authHeader() });
        if (!res.ok) return;
        const rooms = await res.json();
        const table = document.getElementById('roomsTable');
        table.innerHTML = '';
        rooms.forEach(r => {
            const svgEdit = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 20h9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
            const svgTrash = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6h18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 11v6M14 11v6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

            table.insertAdjacentHTML('beforeend', `
                <tr>
                    <td>${r.id}</td>
                    <td>${r.name}</td>
                    <td>${r.capacity ?? '-'}</td>
                    <td>${r.location ?? '-'}</td>
                    <td>${r.isAvailable ? 'Yes' : 'No'}</td>
                    <td>
                                        <button onclick="openRoomModal(${r.id})" class="icon-btn btn-edit" title="Edit">${svgEdit}</button>
                                        <button onclick="deleteRoom(${r.id})" class="icon-btn icon-delete" title="Delete">${svgTrash}</button>
                    </td>
                </tr>
            `);
        });
    } catch (err) {
        console.error('Load rooms error', err);
    }
}

loadRooms();

// ===== ROOM MODAL HELPERS (moved from dashboard.js) =====
async function openRoomModal(id) {
    const modal = document.getElementById("roomModal");
    if (!id) {
        modal.dataset.editId = '';
        document.getElementById("roomName").value = '';
        document.getElementById("roomCapacity").value = '';
        document.getElementById("roomLocation").value = '';
        document.getElementById("roomAvailable").value = 'true';
        modal.style.display = "flex";
        return;
    }
    // fetch room
    try {
        const res = await fetch(`${API_ROOMS}/${id}`, { headers: authHeader() });
        if (!res.ok) { alert('Failed to load room'); return; }
        const r = await res.json();
        modal.dataset.editId = r.id;
        document.getElementById("roomName").value = r.name ?? '';
        document.getElementById("roomCapacity").value = r.capacity ?? '';
        document.getElementById("roomLocation").value = r.location ?? '';
        document.getElementById("roomAvailable").value = r.isAvailable ? 'true' : 'false';
        modal.style.display = 'flex';
    } catch (err) {
        console.error('openRoomModal error', err);
    }
}

function closeRoomModal() {
    document.getElementById("roomModal").style.display = "none";
}
async function submitRoom() {
    const editId = document.getElementById("roomModal").dataset.editId;
    const name = document.getElementById("roomName").value;
    const capacity = parseInt(document.getElementById("roomCapacity").value || '0');
    const location = document.getElementById("roomLocation").value;
    const isAvailable = document.getElementById("roomAvailable").value === "true";

    if (editId) {
        // update
        const res = await fetch(`${API_ROOMS}/${editId}`, {
            method: 'PUT',
            headers: authHeader(),
            body: JSON.stringify({ name, capacity, location, isAvailable })
        });
        if (res.ok) {
            alert('Room updated');
            closeRoomModal();
            loadRooms();
        } else {
            const err = await res.text();
            alert('Error updating room: ' + err);
        }
    } else {
        // create
        const res = await fetch(API_ROOMS, {
            method: "POST",
            headers: authHeader(),
            body: JSON.stringify({ name, capacity, location, isAvailable })
        });

        if (res.ok) {
            alert("Room added");
            closeRoomModal();
            loadRooms();
        } else {
            const err = await res.text();
            alert("Error adding room: " + err);
        }
    }
}

async function deleteRoom(id) {
    if (!confirm('Delete room ' + id + '?')) return;
    try {
        const res = await fetch(`${API_ROOMS}/${id}`, {
            method: 'DELETE',
            headers: authHeader()
        });
        if (res.status === 401) { alert('Session expired'); logout(); return; }
        if (!res.ok) { const t = await res.text(); alert('Error: ' + t); return; }
        alert('Room deleted');
        loadRooms();
    } catch (err) {
        console.error('Delete room error', err);
        alert('Error deleting room');
    }
}
