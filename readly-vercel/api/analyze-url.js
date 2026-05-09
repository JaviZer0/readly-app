export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = req.headers['x-api-key'];
  if (!apiKey) return res.status(401).json({ error: 'API key requerida' });

  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL requerida' });

  const SYSTEM = `Eres Readly, sistema experto en verificación de contenido. Devuelve ÚNICAMENTE este JSON (sin markdown):

{
  "ai_detection": {
    "probability": <0-100>,
    "verdict": "<AI_GENERATED|HUMAN|UNCERTAIN>",
    "model_detected": "<modelo o —>",
    "signals": ["señal1","señal2","señal3"],
    "confidence": "<Alta|Media|Baja>",
    "legal_risk": "<Alto|Moderado|Bajo>"
  },
  "health_verification": {
    "is_health_content": <true|false>,
    "overall_score": <0-100>,
    "claims": [{"claim":"...","verdict":"<true|false|partial>","explanation":"...","source":"..."}],
    "advice": "..."
  },
  "summary": "resumen en 2-3 frases"
}`;

  let pageText = '';

  // 1. Fetch the URL content
  try {
    const pageRes = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Readly/1.0)' },
      signal: AbortSignal.timeout(8000)
    });
    const html = await pageRes.text();
    // Strip HTML tags, keep text
    pageText = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 8000); // limit tokens
  } catch (fetchErr) {
    pageText = `No se pudo acceder al contenido de la URL: ${url}. Error: ${fetchErr.message}. Analiza basándote en la URL y el dominio.`;
  }

  // 2. Send to Claude
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 2000,
        system: SYSTEM,
        messages: [{
          role: 'user',
          content: [{
            type: 'text',
            text: `URL analizada: ${url}\n\nContenido extraído:\n${pageText}`
          }]
        }]
      })
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json({ error: err.error?.message });
    }

    const data = await response.json();
    const text = data.content.map(b => b.text || '').join('');
    const clean = text.replace(/```json|```/g, '').trim();
    return res.status(200).json(JSON.parse(clean));

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
