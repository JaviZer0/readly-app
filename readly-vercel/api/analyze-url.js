export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = req.headers['x-api-key'];
  if (!apiKey) return res.status(401).json({ error: 'API key requerida' });

  const { url, mode, context } = req.body;
  if (!url) return res.status(400).json({ error: 'URL requerida' });

  const isYouTube = /youtube\.com|youtu\.be/.test(url);
  const isAdMode = mode === 'ad';

  // ── SYSTEM PROMPTS
  const SYSTEM_HEALTH = `Eres Readly, sistema experto en verificación de contenido. Devuelve ÚNICAMENTE este JSON (sin markdown):
{
  "ai_detection": { "probability": <0-100>, "verdict": "<AI_GENERATED|HUMAN|UNCERTAIN>", "model_detected": "<modelo o —>", "signals": ["s1","s2","s3"], "confidence": "<Alta|Media|Baja>", "legal_risk": "<Alto|Moderado|Bajo>" },
  "health_verification": { "is_health_content": <true|false>, "overall_score": <0-100>, "claims": [{"claim":"...","verdict":"<true|false|partial>","explanation":"...","source":"..."}], "advice": "..." },
  "summary": "resumen 2-3 frases"
}`;

  const SYSTEM_AD = `Eres Readly Ad Analyzer, experto en análisis creativo publicitario con conocimiento profundo de métricas como las de System1 Group. Analiza el anuncio y devuelve ÚNICAMENTE este JSON (sin markdown):
{
  "ad_analysis": {
    "brand": "<nombre de la marca detectada o Desconocida>",
    "product": "<producto o servicio anunciado>",
    "format": "<formato: Social Video|TV Commercial|YouTube Pre-roll|Short Form|Brand Film>",
    "duration_estimate": "<duración estimada en segundos>",
    "target_audience": "<audiencia objetivo detectada>",
    "readly_scores": {
      "impact": <0-100>,
      "emotion": <0-100>,
      "brand": <0-100>,
      "action": <0-100>,
      "recall": <0-100>,
      "overall": <0-100>
    },
    "system1_equivalent": {
      "star_rating": <1.0-5.0>,
      "star_label": "<Exceptional|Strong|Moderate|Weak|Poor>",
      "spike_rating": <1.0-5.0>,
      "spike_label": "<Exceptional|Strong|Moderate|Weak|Poor>",
      "fluency_rating": <1.0-5.0>,
      "fluency_label": "<Exceptional|Strong|Moderate|Weak|Poor>"
    },
    "what_works": ["<fortaleza 1>", "<fortaleza 2>", "<fortaleza 3>"],
    "what_doesnt": ["<debilidad 1>", "<debilidad 2>", "<debilidad 3>"],
    "emotions_detected": ["<emoción 1>", "<emoción 2>", "<emoción 3>"],
    "hook_strength": "<fuerte|moderado|débil>",
    "hook_analysis": "<análisis del gancho en los primeros segundos>",
    "brand_integration": "<análisis de cómo aparece la marca>",
    "cta_effectiveness": "<análisis de la llamada a la acción>",
    "recommendation": "<recomendación principal para mejorar el anuncio>",
    "competitive_insight": "<insight sobre el contexto competitivo>",
    "ai_generated": <true|false>,
    "ai_signals": ["<señal IA 1>", "<señal IA 2>"]
  },
  "summary": "resumen ejecutivo de 2-3 frases para presentar a un cliente"
}

Para Star Rating: evalúa conexión emocional, personajes, narrativa y potencial de crecimiento de marca a largo plazo.
Para Spike Rating: evalúa claridad del mensaje, urgencia, oferta y capacidad de generar acción inmediata.
Para Fluency Rating: evalúa visibilidad de marca, asociación correcta y reconocimiento sin ambigüedad.
Sé preciso, directo y usa lenguaje de agencia de publicidad profesional.`;

  let contentText = '';
  let contentLabel = '';

  if (isYouTube) {
    let videoId = null;
    const patterns = [/youtube\.com\/watch\?v=([^&]+)/, /youtu\.be\/([^?]+)/, /youtube\.com\/embed\/([^?]+)/, /youtube\.com\/shorts\/([^?]+)/];
    for (const p of patterns) { const m = url.match(p); if (m) { videoId = m[1]; break; } }
    if (!videoId) return res.status(400).json({ error: 'No se pudo extraer el ID del vídeo' });

    const ytKey = process.env.YOUTUBE_API_KEY;
    if (!ytKey) return res.status(500).json({ error: 'YOUTUBE_API_KEY no configurada' });

    try {
      const metaRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,statistics&key=${ytKey}`);
      const metaData = await metaRes.json();
      const video = metaData.items?.[0];
      if (!video) return res.status(404).json({ error: 'Vídeo no encontrado o privado' });

      const title = video.snippet.title;
      const description = video.snippet.description?.substring(0, 1500) || '';
      const channel = video.snippet.channelTitle;
      const views = video.statistics?.viewCount || '0';
      const likes = video.statistics?.likeCount || '0';
      const comments = video.statistics?.commentCount || '0';
      const publishedAt = video.snippet.publishedAt?.substring(0, 10);
      const tags = video.snippet.tags?.slice(0, 10).join(', ') || '';

      contentLabel = `YouTube: ${title}`;
      contentText = `
VÍDEO DE YOUTUBE ${isAdMode ? '(ANUNCIO PUBLICITARIO)' : ''}
================
Título: ${title}
Canal: ${channel}
Fecha: ${publishedAt}
Visualizaciones: ${parseInt(views).toLocaleString('es-ES')}
Likes: ${parseInt(likes).toLocaleString('es-ES')}
Comentarios: ${parseInt(comments).toLocaleString('es-ES')}
Tags: ${tags}
URL: ${url}

DESCRIPCIÓN:
${description}

${context ? `CONTEXTO DEL USUARIO:\n${context}\n` : ''}

${isAdMode ? `INSTRUCCIONES ESPECIALES:
- Analiza esto como una pieza publicitaria profesional
- Evalúa hook, narrativa, integración de marca, CTA y potencial emocional
- Compara con estándares de System1 Group para Star/Spike/Fluency Rating
- Detecta si el anuncio fue generado o tiene asistencia de IA
- Da recomendaciones concretas y accionables para la agencia` : `INSTRUCCIONES:
- Analiza si el título usa clickbait o sensacionalismo
- Evalúa credibilidad del canal
- Detecta señales de desinformación
- Verifica afirmaciones de salud si las hay`}`.trim();

    } catch (err) {
      return res.status(500).json({ error: 'Error YouTube API: ' + err.message });
    }
  } else {
    try {
      const pageRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Readly/1.0)' }, signal: AbortSignal.timeout(8000) });
      const html = await pageRes.text();
      contentText = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 8000);
      if (context) contentText += `\n\nCONTEXTO DEL USUARIO:\n${context}`;
      contentLabel = url;
    } catch (fetchErr) {
      contentText = `No se pudo acceder a: ${url}. Analiza basándote en la URL.${context ? '\n\nCONTEXTO: ' + context : ''}`;
      contentLabel = url;
    }
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 2500,
        system: isAdMode ? SYSTEM_AD : SYSTEM_HEALTH,
        messages: [{ role: 'user', content: [{ type: 'text', text: `Analiza este contenido:\n\nFuente: ${contentLabel}\n\n${contentText}` }] }]
      })
    });

    if (!response.ok) { const err = await response.json(); return res.status(response.status).json({ error: err.error?.message }); }
    const data = await response.json();
    const text = data.content.map(b => b.text || '').join('');
    const clean = text.replace(/```json|```/g, '').trim();
    return res.status(200).json(JSON.parse(clean));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
