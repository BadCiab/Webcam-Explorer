// api/proxy.js
module.exports = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Brak współrzędnych lat/lng' });
    }

    const API_KEY = 'bgdTmta3Ki8aEW35GEIfa2KVmw0RAMnZ';
    const windyUrl = `https://api.windy.com/webcams/api/v3/webcams?nearby=${lat},${lng},150&include=images,location,player&limit=40`;

    console.log(`Pobieranie dla: ${lat}, ${lng}`);

    const response = await fetch(windyUrl, {
      headers: {
        'x-windy-key': API_KEY,
        // UDAJEMY PRAWDZIWĄ PRZEGLĄDARKĘ (To często naprawia błąd 403)
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Windy Error:', response.status, errorText);
      return res.status(response.status).json({ error: `Windy API error: ${response.status} ${errorText}` });
    }

    const data = await response.json();
    
    // Ustawiamy CORS, żeby Twoja mapa mogła odebrać dane
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    
    return res.status(200).json(data);

  } catch (error) {
    console.error('CRASH:', error);
    return res.status(500).json({ 
      error: 'Serwer Vercel napotkał błąd', 
      details: error.message 
    });
  }
};
