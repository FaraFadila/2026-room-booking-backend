const API_BOOKING = "http://localhost:5083/api/Booking";
const API_ROOMS = "http://localhost:5083/api/Rooms";

const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

// hide admin-only buttons when not admin
if (role !== "Admin") {
    document.addEventListener("DOMContentLoaded", () => {
        const roomBtn = document.getElementById("addRoomBtn");
        const custBtn = document.getElementById("addCustomerBtn");
        const settingBtn = document.getElementById("settingBtn");
        const roomsPageBtn = document.getElementById("roomsPageBtn");
        const customersPageBtn = document.getElementById("customersPageBtn");
        if (roomBtn) roomBtn.style.display = "none";
        if (custBtn) custBtn.style.display = "none";
        if (settingBtn) settingBtn.style.display = "none";
        if (roomsPageBtn) roomsPageBtn.style.display = "none";
        if (customersPageBtn) customersPageBtn.style.display = "none";
    });
}

if (!token) {
    window.location.href = "index.html";
}

// ================= AUTH HEADER =================
function authHeader() {
    return {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
    };
}

function handleUnauthorized(res) {
    if (res.status === 401) {
        alert("Session expired. Please login again.");
        logout();
        return true;
    }
    return false;
}

// ================= LOAD SUMMARY =================
async function loadSummary() {
    try {
        // summary endpoint returns counts instead of full list
        const res = await fetch(`${API_BOOKING}/summary`, {
            headers: authHeader()
        });

        if (handleUnauthorized(res)) return;
        if (!res.ok) {
            const text = await res.text();
            console.log("SERVER ERROR:", text);
            alert("SERVER ERROR:\n" + text);
            return;
        }

        let data = await res.json();

        // If server for some reason returns all bookings for a regular user,
        // apply a client-side filter using the current user's id stored on server.
        if (role === "User") {
            try {
                const meRes = await fetch("http://localhost:5083/api/Auth/user", { headers: authHeader() });
                if (meRes.ok) {
                    const me = await meRes.json();
                    const myId = me.id;
                    data = Array.isArray(data) ? data.filter(b => (b.user?.id ?? b.userId) === myId) : data;
                }
            } catch (err) {
                console.warn("Could not fetch current user for client-side filtering", err);
            }
        }

        document.getElementById("total").innerText = data.total ?? 0;
        document.getElementById("pending").innerText = data.pending ?? 0;
        document.getElementById("approved").innerText = data.approved ?? 0;
        document.getElementById("rejected").innerText = data.rejected ?? 0;

    } catch (err) {
        console.error("Summary error:", err);
    }
}

// ================= FORMAT DATE =================
function formatDate(dateStr) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleString();
}

// ================= LOAD BOOKINGS =================
async function loadBookings() {
    try {
        const res = await fetch(API_BOOKING, {
            headers: authHeader()
        });

        if (handleUnauthorized(res)) return;
        if (!res.ok) return;

        const data = await res.json();
        const table = document.getElementById("bookingTable");
        table.innerHTML = "";

        data.forEach(b => {

            let statusText = "";
            let statusClass = "";

            switch (b.status) {
                case 0:
                    statusText = "Pending";
                    statusClass = "status-pending";
                    break;
                case 1:
                    statusText = "Approved";
                    statusClass = "status-approved";
                    break;
                case 2:
                    statusText = "Rejected";
                    statusClass = "status-rejected";
                    break;
            }

            // always show icon buttons but disable them if user can't act
            const canAct = role === "Admin" && b.status === 0;
            const canDelete = role === "Admin" || (role === "User" && b.status === 0);

            // SVG icons (inline) — small and self-contained
            const svgApprove = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
            const svgReject = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
            const svgDelete = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M8 6v14a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 11v6M14 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

            let actionButtons = '';
            actionButtons += `<button onclick="approve(${b.id})" class="icon-btn icon-approve" title="Approve" ${canAct ? "" : "disabled"}>${svgApprove}</button>`;
            actionButtons += `<button onclick="reject(${b.id})" class="icon-btn icon-reject" title="Reject" ${canAct ? "" : "disabled"}>${svgReject}</button>`;
            actionButtons += `<button onclick="deleteBooking(${b.id})" class="icon-btn icon-delete" title="Delete" ${canDelete ? "" : "disabled"}>${svgDelete}</button>`;

            const row = `
                <tr>
                    <td>${b.id}</td>
                    <td>${b.customer?.name ?? b.user?.fullName ?? "-"}</td>
                    <td>${b.room?.name ?? "-"}</td>
                    <td>${formatDate(b.startTime)}</td>
                    <td>${formatDate(b.endTime)}</td>
                    <td><span class="status ${statusClass}">${statusText}</span></td>
                    <td class="action-cell">${actionButtons}</td>
                </tr>
            `;

            table.insertAdjacentHTML("beforeend", row);
        });

    } catch (err) {
        console.error("Booking load error:", err);
    }
}

// ================= APPROVE =================
async function approve(id) {
    console.log("approve button clicked", id);
    if (!confirm("Approve this booking?")) return;

    const res = await fetch(`${API_BOOKING}/${id}/approve`, {
        method: "PUT",
        headers: authHeader()
    });

    if (handleUnauthorized(res)) return;

    if (res.ok) {
        loadBookings();
        loadSummary();
    } else {
        const err = await res.text();
        alert("Error: " + err);
    }
}

// ================= REJECT =================
async function reject(id) {
    console.log("reject button clicked", id);
    if (!confirm("Reject this booking?")) return;

    const res = await fetch(`${API_BOOKING}/${id}/reject`, {
        method: "PUT",
        headers: authHeader()
    });

    if (handleUnauthorized(res)) return;

    if (res.ok) {
        loadBookings();
        loadSummary();
    } else {
        const err = await res.text();
        alert("Error: " + err);
    }
}

// ================= OPEN BOOKING MODAL =================
async function openBookingForm() {
    document.getElementById("bookingModal").style.display = "flex";
    await loadCustomers();

    // set default start/end inputs to current local date/time
    const startInput = document.getElementById("startTime");
    const endInput = document.getElementById("endTime");
    if (startInput && endInput) {
        const now = new Date();
        const pad = (n) => n.toString().padStart(2, '0');
        const local = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
        startInput.value = local;
        endInput.value = local;
    }

    const res = await fetch(API_ROOMS, {
        headers: authHeader()
    });

    if (!res.ok) return;

    const rooms = await res.json();
    const select = document.getElementById("roomSelect");
    select.innerHTML = "";

    const uniqueRooms = [];
    const map = new Set();

    rooms.forEach(r => {
        if (r.isAvailable && !map.has(r.id)) {
            map.add(r.id);
            uniqueRooms.push(r);
        }
    });

    uniqueRooms.forEach(r => {
        select.insertAdjacentHTML("beforeend",
            `<option value="${r.id}">${r.name}</option>`
        );
    });
}

function closeBookingForm() {
    document.getElementById("bookingModal").style.display = "none";
}

// ===== ROOM MODAL HELPERS =====
function openRoomModal() {
    document.getElementById("roomModal").style.display = "flex";
}
function closeRoomModal() {
    document.getElementById("roomModal").style.display = "none";
}
async function submitRoom() {
    const name = document.getElementById("roomName").value;
    const capacity = parseInt(document.getElementById("roomCapacity").value);
    const location = document.getElementById("roomLocation").value;
    const isAvailable = document.getElementById("roomAvailable").value === "true";

    const res = await fetch(API_ROOMS, {
        method: "POST",
        headers: authHeader(),
        body: JSON.stringify({ name, capacity, location, isAvailable })
    });

    if (res.ok) {
        alert("Room added");
        closeRoomModal();
        // optionally refresh rooms if needed
    } else {
        const err = await res.text();
        alert("Error adding room: " + err);
    }
}

// ===== CUSTOMER MODAL HELPERS =====
function openCustomerModal() {
    document.getElementById("customerModal").style.display = "flex";
}
function closeCustomerModal() {
    document.getElementById("customerModal").style.display = "none";
}
async function submitCustomer() {
    const name = document.getElementById("custName").value;
    const email = document.getElementById("custEmail").value;
    const phone = document.getElementById("custPhone").value;
    const address = document.getElementById("custAddress").value;

    const res = await fetch("http://localhost:5083/api/Customer", {
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

// ================= SUBMIT BOOKING =================
async function submitBooking() {

    const customerId = parseInt(document.getElementById("customerSelect").value);
    const roomId = parseInt(document.getElementById("roomSelect").value);
    const startTime = document.getElementById("startTime").value;
    const endTime = document.getElementById("endTime").value;
    const purpose = document.getElementById("purpose").value;

    const res = await fetch(API_BOOKING, {
        method: "POST",
        headers: authHeader(),
        body: JSON.stringify({
            customerId,
            roomId,
            startTime,
            endTime,
            purpose
        })
    });

    const text = await res.text();

    if (!res.ok) {
        console.log("FULL ERROR:", text);
        alert("Error: " + text);
        return;
    }

    alert("Booking submitted!");
    closeBookingForm();
    loadBookings();
    loadSummary();
}

// ================= LOAD CUSTOMERS =================
async function loadCustomers() {
    const res = await fetch("http://localhost:5083/api/Customer", {
        headers: authHeader()
    });
    if (!res.ok) return [];
    const data = await res.json();
    // API returns { totalCount, page, pageSize, customers }
    const customers = Array.isArray(data)
        ? data
        : data.customers ?? [];

    const select = document.getElementById("customerSelect");
    select.innerHTML = "";
    customers.forEach(c => {
        select.insertAdjacentHTML("beforeend",
            `<option value="${c.id}">${c.name}</option>`
        );
    });
    return customers;
}

// ================= LOAD USERS (ADMIN ONLY) =================
async function loadUsers() {
    if (role !== "Admin") return;
    const res = await fetch("http://localhost:5083/api/Auth/users", {
        headers: authHeader()
    });
    if (!res.ok) return;
    const users = await res.json();
    const table = document.getElementById("userTable");
    table.innerHTML = "";
    users.forEach(u => {
        const gearSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06A2 2 0 0 1 2.28 16.9l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09c.7 0 1.3-.38 1.51-1a1.65 1.65 0 0 0-.33-1.82L4.3 4.7A2 2 0 0 1 7.12 1.87l.06.06c.5.5 1.23.65 1.82.33.7-.36 1.51-.36 2.21 0 .59.32 1.32.17 1.82-.33l.06-.06A2 2 0 0 1 18.9 4.3l-.06.06c-.36.7-.36 1.51 0 2.21.32.59.17 1.32.33 1.82.32.7 1.23 1.05 1.82.33l.06-.06A2 2 0 0 1 22.13 12l-.06.06a1.65 1.65 0 0 0-.33 1.82c.18.52.18 1.13 0 1.65z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

        table.insertAdjacentHTML("beforeend",
            `<tr>
                <td>${u.id}</td>
                <td>${u.fullName}</td>
                <td>${u.email}</td>
                <td>${u.role}</td>
                <td>
                    <button onclick="openUserSettingModal(${u.id}, '${u.fullName}', '${u.email}', '${u.role}')" class="btn-setting icon-btn" title="Setting">${gearSvg}</button>
                </td>
            </tr>`
        );
    });
}

function openUserSettingModal(id, name, email, role) {
    // navigate to users management page and pass user id for direct edit
    window.location.href = `users.html?userId=${id}`;
}
function closeUserSettingModal() {
    document.getElementById("userSettingModal").style.display = "none";
}

// ================= EDIT USER =================
function editUser(id) {
    alert("Edit user " + id);
    // Implement modal or redirect to edit page
}

// ================= DELETE USER =================
async function deleteUser(id) {
    if (!confirm("Delete user " + id + "?")) return;
    const res = await fetch(`http://localhost:5083/api/Auth/users/${id}`, {
        method: "DELETE",
        headers: authHeader()
    });
    if (res.ok) {
        alert("User deleted");
        loadUsers();
    } else {
        const err = await res.text();
        alert("Error: " + err);
    }
}

// ================= DELETE BOOKING =================
async function deleteBooking(id) {
    if (!confirm("Delete booking " + id + "?")) return;
    const res = await fetch(`${API_BOOKING}/${id}`, {
        method: "DELETE",
        headers: authHeader()
    });
    if (handleUnauthorized(res)) return;
    if (res.ok) {
        alert("Booking deleted");
        loadBookings();
        loadSummary();
    } else {
        const err = await res.text();
        alert("Error: " + err);
    }
}

// ================= LOGOUT =================
function logout() {
    localStorage.clear();
    window.location.href = "index.html";
}

// ================= INIT =================
loadSummary();
loadBookings();
loadCustomers();
// loadUsers(); // tidak dipanggil di dashboard utama

// ================= OPEN/CLOSE SETTING MODAL =================
function openSettingModal() {
    // open dedicated users page instead of modal
    window.location.href = "users.html";
}
function closeSettingModal() {
    document.getElementById("settingModal").style.display = "none";
}
