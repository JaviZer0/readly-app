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
 
  const isYouTube = /youtube\.com|youtu\.be/.test(url);
  let contentText = '';
  let contentLabel = '';
 
  if (isYouTube) {
    let videoId = null;
    const patterns = [
      /youtube\.com\/watch\?v=([^&]+)/,
      /youtu\.be\/([^?]+)/,
      /youtube\.com\/embed\/([^?]+)/,
      /youtube\.com\/shorts\/([^?]+)/,
    ];
    for (const p of patterns) {
      const m = url.match(p);
      if (m) { videoId = m[1]; break; }
    }
 
    if (!videoId) return res.status(400).json({ error: 'No se pudo extraer el ID del vídeo' });
 
    const ytKey = process.env.YOUTUBE_API_KEY;
    if (!ytKey) return res.status(500).json({ error: 'YOUTUBE_API_KEY no configurada' });
 
    try {
      const metaRes = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,statistics&key=${ytKey}`
      );
      const metaData = await metaRes.json();
      const video = metaData.items?.[0];
      if (!video) return res.status(404).json({ error: 'Vídeo no encontrado o privado' });
 
      const title = video.snippet.title;
      const description = video.snippet.description?.substring(0, 1000) || '';
      const channel = video.snippet.channelTitle;
      const views = video.statistics?.viewCount || '0';
      const likes = video.statistics?.likeCount || '0';
      const publishedAt = video.snippet.publishedAt?.substring(0, 10);
 
      contentLabel = `YouTube: ${title}`;
      contentText = `
VÍDEO DE YOUTUBE
================
Título: ${title}
Canal: ${channel}
Fecha publicación: ${publishedAt}
Visualizaciones: ${parseInt(views).toLocaleString('es-ES')}
Likes: ${parseInt(likes).toLocaleString('es-ES')}
URL: ${url}
 
DESCRIPCIÓN:
${description}
 
INSTRUCCIONES:
- Analiza si el título usa clickbait o sensacionalismo
- Evalúa la credibilidad del canal
- Detecta señales de desinformación en título y descripción
- Si hay contenido de salud, verifica las afirmaciones visibles
- Indica si el contenido parece generado o asistido por IA
      `.trim();
 
    } catch (err) {
      return res.status(500).json({ error: 'Error YouTube API: ' + err.message });
    }
 
  } else {
    try {
      const pageRes = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Readly/1.0)' },
        signal: AbortSignal.timeout(8000)
      });
      const html = await pageRes.text();
      contentText = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 8000);
      contentLabel = url;
    } catch (fetchErr) {
      contentText = `No se pudo acceder a: ${url}. Analiza basándote en la URL y dominio.`;
      contentLabel = url;
    }
  }
 
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
          content: [{ type: 'text', text: `Analiza este contenido:\n\nFuente: ${contentLabel}\n\n${contentText}` }]
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
