const MY_API_KEY = '0wcTdKgTcKwKNXBUaY7EXJ79MwFNyn1i'; 

const map = L.map('map').setView([52.06, 19.25], 6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const markersGroup = L.layerGroup().addTo(map);

async function fetchCameras() {
    const center = map.getCenter();
    const lat = center.lat.toFixed(4);
    const lng = center.lng.toFixed(4);
    const radius = 150; 

    const targetUrl = `https://api.windy.com/webcams/api/v3/webcams?nearby=${lat},${lng},${radius}&include=images,location,player&limit=40`;
    
    const proxyUrl = `https://thingproxy.freeboard.io/fetch/${targetUrl}`;
    
    console.log(`📡 Pobieram (ThingProxy): ${lat}, ${lng}`);

    try {
        const response = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
                'x-windy-key': MY_API_KEY
            }
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Błąd Proxy/API: ${response.status} - ${text}`);
        }

        const data = await response.json();
        console.log("✅ Dane pobrane:", data);

        markersGroup.clearLayers();

        if (data && data.webcams && data.webcams.length > 0) {
            data.webcams.forEach(cam => {
                addCameraMarker(cam);
            });
            console.log(`Dodano ${data.webcams.length} kamer do mapy.`);
        } else {
            console.warn("⚠️ API zwróciło pustą listę kamer.");
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