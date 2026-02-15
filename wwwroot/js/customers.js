const API_CUSTOMER = "http://localhost:5083/api/Customer";
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

async function loadCustomers() {
    try {
        const res = await fetch(API_CUSTOMER, { headers: authHeader() });
        if (!res.ok) return;
        const data = await res.json();
        // API may return array or paged object { customers }
        const customers = Array.isArray(data) ? data : data.customers ?? [];
        const table = document.getElementById('customersTable');
        table.innerHTML = '';
        const svgEdit = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 20h9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        const svgTrash = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6h18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 11v6M14 11v6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

        customers.forEach(c => {
            table.insertAdjacentHTML('beforeend', `
                <tr>
                    <td>${c.id}</td>
                    <td>${c.name}</td>
                    <td>${c.email ?? '-'}</td>
                    <td>${c.phone ?? '-'}</td>
                    <td>${c.address ?? '-'}</td>
                    <td>
                        <button onclick="openCustomerModal(${c.id})" class="icon-btn btn-edit" title="Edit">${svgEdit}</button>
                        <button onclick="deleteCustomer(${c.id})" class="icon-btn icon-delete" title="Delete">${svgTrash}</button>
                    </td>
                </tr>
            `);
        });
    } catch (err) {
        console.error('Load customers error', err);
    }
}

loadCustomers();

// ===== CUSTOMER MODAL HELPERS (moved from dashboard.js) =====
async function openCustomerModal(id) {
    const modal = document.getElementById("customerModal");
    if (!id) {
        modal.dataset.editId = '';
        document.getElementById('custName').value = '';
        document.getElementById('custEmail').value = '';
        document.getElementById('custPhone').value = '';
        document.getElementById('custAddress').value = '';
        modal.style.display = "flex";
        return;
    }
    try {
        const res = await fetch(`${API_CUSTOMER}/${id}`, { headers: authHeader() });
        if (!res.ok) { alert('Failed to load customer'); return; }
        const c = await res.json();
        modal.dataset.editId = c.id;
        document.getElementById('custName').value = c.name ?? '';
        document.getElementById('custEmail').value = c.email ?? '';
        document.getElementById('custPhone').value = c.phone ?? '';
        document.getElementById('custAddress').value = c.address ?? '';
        modal.style.display = 'flex';
    } catch (err) {
        console.error('openCustomerModal error', err);
    }
}

function closeCustomerModal() {
    document.getElementById("customerModal").style.display = "none";
}
async function submitCustomer() {
    const editId = document.getElementById("customerModal").dataset.editId;
    const name = document.getElementById("custName").value;
    const email = document.getElementById("custEmail").value;
    const phone = document.getElementById("custPhone").value;
    const address = document.getElementById("custAddress").value;

    if (editId) {
        // update
        const res = await fetch(`${API_CUSTOMER}/${editId}`, {
            method: 'PUT',
            headers: authHeader(),
            body: JSON.stringify({ name, email, phone, address, isActive: true })
        });
        if (res.ok) {
            alert('Customer updated');
            closeCustomerModal();
            loadCustomers();
        } else {
            const err = await res.text();
            alert('Error updating customer: ' + err);
        }
    } else {
        const res = await fetch(API_CUSTOMER, {
            method: "POST",
            headers: authHeader(),
            body: JSON.stringify({ name, email, phone, address })
        });

        if (res.ok) {
            alert("Customer added");
            closeCustomerModal();
            loadCustomers();
        } else {
            const err = await res.text();
            alert("Error adding customer: " + err);
        }
    }
}
