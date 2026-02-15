const API_USERS = "http://localhost:5083/api/Auth/users";
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

async function loadUsers() {
    const res = await fetch(API_USERS, { headers: authHeader() });
    if (!res.ok) return;
    const users = await res.json();
    const table = document.getElementById("userTable");
    table.innerHTML = "";
    const svgEdit = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 20h9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const svgTrash = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6h18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 11v6M14 11v6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

    users.forEach(u => {
        table.insertAdjacentHTML("beforeend",
            `<tr>
                <td>${u.id}</td>
                <td>${u.fullName}</td>
                <td>${u.email}</td>
                <td>${u.role}</td>
                <td>
                    <button onclick="window.location.href='user.html?userId=${u.id}'" class="icon-btn btn-edit" title="Edit">${svgEdit}</button>
                    <button onclick="deleteUserRow(${u.id})" class="icon-btn icon-delete" title="Delete">${svgTrash}</button>
                </td>
            </tr>`
        );
    });
}

async function deleteUserRow(id) {
    if (!confirm('Delete user ' + id + '?')) return;
    const res = await fetch(`${API_USERS}/${id}`, {
        method: 'DELETE',
        headers: authHeader()
    });
    if (res.status === 401) {
        alert('Session expired. Please login again.');
        logout();
        return;
    }
    if (res.ok) {
        alert('User deleted');
        loadUsers();
    } else {
        const text = await res.text();
        alert('Error: ' + text);
    }
}

loadUsers();
