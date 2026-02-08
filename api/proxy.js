// api/proxy.js
export default async function handler(request, response) {
  // Pobieramy parametry z adresu URL
  const { lat, lng } = request.query;

  // Twój klucz API (bezpieczny po stronie serwera)
  const API_KEY = '0wcTdKgTcKwKNXBUaY7EXJ79MwFNyn1i';

  if (!lat || !lng) {
    return response.status(400).json({ error: 'Brak współrzędnych' });
  }

  // Budujemy adres do Windy
  const windyUrl = `https://api.windy.com/webcams/api/v3/webcams?nearby=${lat},${lng},150&include=images,location,player&limit=40`;

  try {
    // Serwer (Vercel) pyta serwer (Windy) - to jest dozwolone!
    const apiResponse = await fetch(windyUrl, {
      headers: {
        'x-windy-key': API_KEY
      }
    });

    if (!apiResponse.ok) {
      throw new Error(`Windy error: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    
    // Odsyłamy dane do Twojej strony
    response.status(200).json(data);
    
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
}
