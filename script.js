const MY_API_KEY = '0wcTdKgTcKwKNXBUaY7EXJ79MwFNyn1i'; 

const map = L.map('map').setView([52.06, 19.25], 6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const markersGroup = L.layerGroup().addTo(map);

async function fetchCameras() {
    const center = map.getCenter();
    
    const lat = center.lat;
    const lng = center.lng;
    const radius = 150;

    const url = `https://api.windy.com/webcams/api/v3/webcams?nearby=${lat},${lng},${radius}&include=images,location,player&limit=40`;

    console.log("Pobieram kamery z:", url);

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-windy-key': MY_API_KEY
            }
        });

        if (!response.ok) {
            throw new Error(`Błąd API: ${response.status} (Sprawdź czy masz włączony dodatek CORS!)`);
        }

        const data = await response.json();
        console.log("Pobrane dane:", data);

        markersGroup.clearLayers();

        if (data.webcams) {
            data.webcams.forEach(cam => {
                addCameraMarker(cam);
            });
        } else {
            console.log("Brak kamer w tym rejonie.");
        }

    } catch (error) {
        console.error("Błąd:", error);
        alert("Błąd połączenia! Upewnij się, że masz zainstalowany i WŁĄCZONY dodatek 'Allow CORS' w przeglądarce.");
    }
}

function addCameraMarker(cam) {
    const lat = cam.location.latitude;
    const lng = cam.location.longitude;
    const title = cam.title;
    
    let imgUrl = 'https://via.placeholder.com/300x200?text=Brak+zdjecia';
    
    if (cam.images) {
        if (cam.images.current) imgUrl = cam.images.current.preview;
        else if (cam.images.daylight) imgUrl = cam.images.daylight.preview;
    }

    const windyLink = cam.player ? cam.player.day.link : 'https://windy.com';

    const center = map.getCenter();
    const from = turf.point([center.lng, center.lat]);
    const to = turf.point([lng, lat]);
    const dist = turf.distance(from, to, {units: 'kilometers'});

    const marker = L.marker([lat, lng]);

    const popupContent = `
        <div style="width: 260px; text-align: center;">
            <strong style="font-size:14px;">${title}</strong><br>
            <img src="${imgUrl}" style="width: 100%; border-radius: 5px; margin: 5px 0; border: 1px solid #ccc;"><br>
            <strong style="color: blue;">Odległość: ${Math.round(dist)} km</strong><br>
            <a href="${windyLink}" target="_blank" style="font-size: 11px; color: grey;">Zobacz na Windy.com</a>
        </div>
    `;

    marker.bindPopup(popupContent);
    markersGroup.addLayer(marker);
}

fetchCameras();

let timer;
map.on('moveend', () => {
    clearTimeout(timer);
    timer = setTimeout(fetchCameras, 1000);
});