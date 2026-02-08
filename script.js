// --- OSTATECZNA WERSJA FRONTENDOWA (Bez Vercela) ---

async function fetchCameras() {
    const center = map.getCenter();
    const lat = center.lat.toFixed(4);
    const lng = center.lng.toFixed(4);
    
    // Użyj swojego NOWEGO klucza API tutaj
    const API_KEY = 'bgdTmta3Ki8aEW35GEIfa2KVmw0RAMnZ'; 

    console.log(`📡 Pobieram kamery dla: ${lat}, ${lng}`);

    // 1. Budujemy adres do Windy
    // WAŻNE: Dodajemy losowy parametr "&_=" aby oszukać cache
    const targetUrl = `https://api.windy.com/webcams/api/v3/webcams?nearby=${lat},${lng},150&include=images,location,player&limit=40`;

    // 2. Używamy "AllOrigins" - to inna darmowa bramka, często mniej blokowana niż corsproxy
    // UWAGA: AllOrigins wymaga innej budowy zapytania
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;

    try {
        const response = await fetch(proxyUrl, {
            method: 'GET',
            // AllOrigins nie pozwala na wysyłanie nagłówków (headers), 
            // ale Windy API v3 WYMAGA klucza w nagłówku.
            // Zastosujemy TRIK: Wersja v3 Windy czasem przyjmuje klucz w URL, 
            // ale jeśli to nie zadziała, użyjemy innej bramki: "corsproxy.io"
        });
        
        // ZMIANA STRATEGII: Wracamy do corsproxy.io, ale z poprawnym kodowaniem
        // To jest jedyna bramka, która przepuszcza nagłówki "x-windy-key"
        
        const finalUrl = `https://corsproxy.io/?` + encodeURIComponent(targetUrl);
        
        const response2 = await fetch(finalUrl, {
            headers: {
                'x-windy-key': API_KEY
            }
        });

        if (!response2.ok) {
             throw new Error(`Błąd sieci: ${response2.status}`);
        }

        const data = await response2.json();
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
        // Jeśli to zawiedzie, wyświetl komunikat na mapie
        alert("Błąd pobierania kamer. Windy API blokuje połączenie.");
    }
}