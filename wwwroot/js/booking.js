const API_BOOKING = "http://localhost:5083/api/Booking";
const API_ROOMS = "http://localhost:5083/api/Rooms";

const token = localStorage.getItem("token");

if (!token) window.location.href = "index.html";

function goBack() {
    window.location.href = "dashboard.html";
}

async function loadRooms() {
    console.log("Loading rooms...");
    const res = await fetch(API_ROOMS);
    const rooms = await res.json();

    const select = document.getElementById("roomSelect");
    select.innerHTML = "";

    rooms
        .filter(r => r.isAvailable)
        .forEach(room => {
            const option = document.createElement("option");
            option.value = room.id;
            option.textContent = `${room.name} (${room.location})`;
            select.appendChild(option);
        });
}

document.getElementById("bookingForm")
.addEventListener("submit", async function (e) {
    e.preventDefault();

    let customerId = parseInt(document.getElementById("customerSelect").value);
    if (isNaN(customerId)) {
        customerId = null; // send null when nothing selected
    }
    const roomId = parseInt(document.getElementById("roomSelect").value);
    const startTime = document.getElementById("startTime").value;
    const endTime = document.getElementById("endTime").value;
    const purpose = document.getElementById("purpose").value;

    const response = await fetch(API_BOOKING, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            customerId,
            roomId,
            startTime,
            endTime,
            purpose
        })
    });

    if (response.ok) {
        alert("Booking created!");
        window.location.href = "dashboard.html";
    } else {
    const err = await res.text();
    console.log("ERROR:", err);
    alert("Error: " + err);
}
});

document.addEventListener("DOMContentLoaded", () => {
    loadRooms();
});
