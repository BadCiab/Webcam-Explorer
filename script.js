const MY_API_KEY = '0wcTdKgTcKwKNXBUaY7EXJ79MwFNyn1i'; 

const map = L.map('map').setView([52.06, 19.25], 6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const markersGroup = L.layerGroup().addTo(map);

// --- OSTATECZNA WERSJA (Vercel) ---

async function fetchCameras() {
    const center = map.getCenter();
    const lat = center.lat.toFixed(4);
    const lng = center.lng.toFixed(4);
    
    // MAGIA VERCEL:
    // Odwołujemy się do naszego pliku api/proxy.js po prostu przez ścieżkę.
    // Przeglądarka traktuje to jak plik lokalny, więc ZERO problemów z CORS.
    const url = `/api/proxy?lat=${lat}&lng=${lng}`;

    console.log(`📡 Pobieram z Vercel API: ${lat}, ${lng}`);

    try {
        const response = await fetch(url);

        if (!response.ok) throw new Error(`Błąd serwera: ${response.status}`);

        const data = await response.json();
        console.log("✅ Dane pobrane:", data);

        markersGroup.clearLayers();

        if (data && data.webcams && data.webcams.length > 0) {
            data.webcams.forEach(addCameraMarker);
            console.log(`Dodano ${data.webcams.length} kamer.`);
        } else {
            console.warn("⚠️ Brak kamer w tym rejonie.");
        }

    } catch (error) {
        console.error("❌ BŁĄD:", error);
    }
}

function addCameraMarker(cam) {
    const lat = cam.location?.latitude;
    const lng = cam.location?.longitude;
    const title = cam.title || "Kamera bez nazwy";
    
    let imgUrl = 'https://via.placeholder.com/300x200?text=Brak+podgladu';
    
    if (cam.images?.current?.preview) {
        imgUrl = cam.images.current.preview;
    } else if (cam.images?.daylight?.preview) {
        imgUrl = cam.images.daylight.preview;
    }

    const windyLink = cam.player?.day?.link || 'https://windy.com';

    let distInfo = "";
    if (typeof turf !== 'undefined') {
        const center = map.getCenter();
        const from = turf.point([center.lng, center.lat]);
        const to = turf.point([lng, lat]);
        const dist = turf.distance(from, to, {units: 'kilometers'});
        distInfo = `<strong style="color: blue;">Odległość: ${Math.round(dist)} km</strong><br>`;
    }

    if (lat && lng) {
        const marker = L.marker([lat, lng]);

        const popupContent = `
            <div style="width: 260px; text-align: center; font-family: sans-serif;">
                <strong style="font-size:14px; display:block; margin-bottom:5px;">${title}</strong>
                <div style="min-height: 150px; background: #f0f0f0; display: flex; align-items: center; justify-content: center;">
                    <img src="${imgUrl}" style="width: 100%; border-radius: 5px; display: block;" onerror="this.src='https://via.placeholder.com/300x200?text=Błąd+ładowania'">
                </div>
                <div style="margin-top: 8px;">
                    ${distInfo}
                    <a href="${windyLink}" target="_blank" style="font-size: 12px; color: #666; text-decoration: none; border: 1px solid #ccc; padding: 2px 6px; border-radius: 4px;">Zobacz na Windy.com</a>
                </div>
            </div>
        `;

        marker.bindPopup(popupContent);
        markersGroup.addLayer(marker);
    }
}

fetchCameras();

let timer;
map.on('moveend', () => {
    clearTimeout(timer);
    timer = setTimeout(fetchCameras, 1000); 
});