// api/proxy.js
module.exports = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Brak współrzędnych lat/lng' });
    }

    const API_KEY = '0wcTdKgTcKwKNXBUaY7EXJ79MwFNyn1i';
    const windyUrl = `https://api.windy.com/webcams/api/v3/webcams?nearby=${lat},${lng},150&include=images,location,player&limit=40`;

    // Logowanie dla panelu Vercel
    console.log(`Pobieranie dla: ${lat}, ${lng}`);

    // Dynamiczny import node-fetch dla pewności (jeśli środowisko tego wymaga)
    // Ale w Node 18+ fetch jest wbudowany. Spróbujmy standardowego fetcha w bloku try.
    
    const response = await fetch(windyUrl, {
      headers: {
        'x-windy-key': API_KEY
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Windy Error:', errorText);
      return res.status(response.status).json({ error: `Windy API error: ${errorText}` });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('CRASH:', error);
    // To wyśle treść błędu do Twojej konsoli w przeglądarce
    return res.status(500).json({ 
      error: 'Serwer Vercel napotkał błąd', 
      details: error.message 
    });
  }
};
