const recordExists = JSON.parse(localStorage.getItem("records"))[0]
    ?.coordinates ?? [-6.2, 106.816666];

console.log(recordExists);

const map = L.map("map").setView(recordExists, 15);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 15,
    attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

let records = [];
let markers = [];
let currentCoordinates = null;

const icons = {
    Kuliner: L.icon({
        iconUrl: `https://png.pngtree.com/png-vector/20220705/ourmid/pngtree-food-logo-png-image_5687686.png`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    }),
    Pendidikan: L.icon({
        iconUrl: `https://www.unukaltim.ac.id/wp-content/uploads/2019/12/graduate-icon-png-28-2.png`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    }),
    Pariwisata: L.icon({
        iconUrl: `https://seeklogo.com/images/K/kementerian-pariwisata-dan-ekonomi-kreatif-logo-8E9E8B95CB-seeklogo.com.png`,
        iconAnchor: [16, 32],
        iconSize: [32, 32],
        popupAnchor: [0, -32],
    }),
    Lainnya: L.icon({
        iconUrl: `https://cdn.icon-icons.com/icons2/2596/PNG/512/other_icon_155053.png`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    }),
};

function loadRecords() {
    const savedRecords = localStorage.getItem("records");
    if (savedRecords) {
        records = JSON.parse(savedRecords);
        records.forEach(addMarker);
    }
}

function saveRecords() {
    localStorage.setItem("records", JSON.stringify(records));
}

function addMarker(record) {
    const { coordinates, title, details, category } = record;

    const popupContent = `
    <h4>${title}</h4>
    <p>${details}</p>
    <p><strong>Category:</strong> ${category}</p>
    <button id="delete-btn">Delete</button>
  `;

    const marker = L.marker(coordinates, { icon: icons[category] })
        .addTo(map)
        .bindPopup(popupContent);
    markers.push({ marker, category });

    marker.on("popupopen", (e) => {
        const popup = e.popup;
        const popupContent = popup.getContent();
        const deleteButton = document.getElementById("delete-btn");

        if (popupContent.includes("Enter Location Details")) {
            deleteButton.style.display = "none";
        } else {
            deleteButton.style.display = "block";
        }

        deleteButton.addEventListener("click", () => {
            map.removeLayer(marker);

            records.splice(records.indexOf(record), 1);

            saveRecords();
        });
    });
}

function refreshMarkers(category) {
    markers.forEach(({ marker, category: markerCategory }) => {
        if (category === "All" || category === markerCategory) {
            marker.addTo(map);
        } else {
            map.removeLayer(marker);
        }
    });
}

function addRecord(coordinates, title, details, category) {
    const record = { coordinates, title, details, category };
    records.push(record);
    saveRecords();
    addMarker(record);
}

map.on("click", (e) => {
    const { lat, lng } = e.latlng;
    currentCoordinates = [lat, lng];

    showAddDetailsForm(currentCoordinates);
});

map.on("popupopen", (e) => {
    const popup = e.popup;
    const popupContent = popup.getContent();
    const formSaveButton = document.getElementById("form-save-btn");

    if (popupContent.includes("Enter Location Details")) {
        formSaveButton.style.display = "block";
    }
});

function showAddDetailsForm(coordinates) {
    const popupContent = `
    <div id="form-container">
      <h3>Enter Location Details</h3>
      <label>Title:</label>
      <input type="text" id="form-title" placeholder="Enter title" /><br />
      <label>Details:</label>
      <textarea id="form-details" placeholder="Enter details"></textarea><br />
      <label>Category:</label>
      <select id="form-category">
        <option value="Kuliner">Kuliner</option>
        <option value="Pendidikan">Pendidikan</option>
        <option value="Pariwisata">Pariwisata</option>
        <option value="Lainnya">Lainnya</option>
      </select><br />
      <button id="form-save-btn">Save</button>
    </div>
  `;

    const popup = L.popup()
        .setLatLng(coordinates)
        .setContent(popupContent)
        .openOn(map);

    document.getElementById("form-save-btn").addEventListener("click", () => {
        const title = document.getElementById("form-title").value;
        const details = document.getElementById("form-details").value;
        const category = document.getElementById("form-category").value;

        if (!title || !details) {
            alert("Please fill in all fields.");
            return;
        }

        addRecord(coordinates, title, details, category);

        map.closePopup();
    });
}

document
    .getElementById("filterCategory")
    .addEventListener("change", (event) => {
        const category = event.target.value;
        refreshMarkers(category);
    });

loadRecords();
