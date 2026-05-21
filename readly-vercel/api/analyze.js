export const config = { api: { bodyParser: { sizeLimit: '20mb' } } };

const SYSTEM_VERIFY = `Eres Readly, sistema experto en verificación de contenido. Analiza el contenido y devuelve ÚNICAMENTE este JSON (sin markdown):
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

const SYSTEM_AD = `Eres Readly Ad Analyzer, experto en análisis creativo publicitario y guiones. Analiza la pieza o guión publicitario y devuelve ÚNICAMENTE este JSON (sin markdown):
{
  "ad_analysis": {
    "brand": "<marca detectada o Desconocida>",
    "product": "<producto o servicio>",
    "format": "<formato: TV Commercial|Social Video|Radio|Print|OOH|Digital|Guión>",
    "duration_estimate": "<duración estimada>",
    "target_audience": "<audiencia objetivo>",
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
    "script_analysis": {
      "narrative_clarity": <0-100>,
      "narrative_clarity_label": "<Excelente|Buena|Mejorable|Débil>",
      "narrative_clarity_detail": "<explicación de 1-2 frases>",
      "dramatic_structure": <0-100>,
      "dramatic_structure_label": "<Excelente|Buena|Mejorable|Débil>",
      "dramatic_structure_detail": "<explicación: gancho, desarrollo, cierre>",
      "tone_voice": <0-100>,
      "tone_voice_label": "<Excelente|Buena|Mejorable|Débil>",
      "tone_voice_detail": "<coherencia tono con marca y audiencia>",
      "cta_clarity": <0-100>,
      "cta_clarity_label": "<Excelente|Buena|Mejorable|Débil>",
      "cta_clarity_detail": "<análisis de la llamada a la acción>",
      "originality": <0-100>,
      "originality_label": "<Excelente|Buena|Mejorable|Débil>",
      "originality_detail": "<diferenciación respecto a competencia>"
    },
    "what_works": ["<fortaleza 1>","<fortaleza 2>","<fortaleza 3>"],
    "what_doesnt": ["<debilidad 1>","<debilidad 2>","<debilidad 3>"],
    "emotions_detected": ["<emoción 1>","<emoción 2>","<emoción 3>"],
    "hook_strength": "<fuerte|moderado|débil>",
    "hook_analysis": "<análisis del gancho en los primeros segundos>",
    "brand_integration": "<análisis de integración de marca>",
    "cta_effectiveness": "<análisis del CTA>",
    "recommendation": "<recomendación principal accionable>",
    "competitive_insight": "<insight sobre contexto competitivo>",
    "ai_generated": <true|false>,
    "ai_signals": ["<señal 1>","<señal 2>"]
  },
  "summary": "resumen ejecutivo de 2-3 frases para presentar a un cliente"
}

Para Star Rating: evalúa conexión emocional, narrativa y potencial de marca a largo plazo.
Para Spike Rating: evalúa claridad del mensaje, urgencia y capacidad de generar acción inmediata.
Para Fluency Rating: evalúa visibilidad de marca y reconocimiento sin ambigüedad.
Para script_analysis: analiza el guión en profundidad — claridad narrativa, estructura dramática (gancho/desarrollo/cierre), coherencia de tono con la marca, efectividad del CTA y originalidad frente a la competencia.
DEVUELVE SOLO EL JSON.`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = req.headers['x-api-key'];
  if (!apiKey) return res.status(401).json({ error: 'API key requerida' });

  const { type, content, mediaType, filename, mode } = req.body;
  const isAd = mode === 'ad';
  const system = isAd ? SYSTEM_AD : SYSTEM_VERIFY;

  let messages;
  const adContext = isAd ? '\n\nAnaliza esto como guión/pieza publicitaria profesional.' : '';

  if (type === 'pdf') {
    messages = [{
      role: 'user',
      content: [
        { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: content } },
        { type: 'text', text: `Analiza este documento: "${filename}".${adContext}` }
      ]
    }];
  } else if (type === 'image') {
    messages = [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: mediaType, data: content } },
        { type: 'text', text: `Analiza esta imagen: "${filename}".${adContext}` }
      ]
    }];
  } else if (type === 'docx') {
    // Word files: decode base64, extract text using basic XML parsing
    try {
      const buf = Buffer.from(content, 'base64');
      // Try to extract readable text from docx (it's a zip with XML inside)
      const text = buf.toString('utf8', 0, Math.min(buf.length, 50000))
        .replace(/<[^>]+>/g, ' ')
        .replace(/[^\x20-\x7E\xC0-\xFF\u00C0-\u024F\u0400-\u04FF]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 8000);
      messages = [{
        role: 'user',
        content: [{ type: 'text', text: `Analiza este guión de Word: "${filename}"\n\n${text}${adContext}` }]
      }];
    } catch(e) {
      messages = [{
        role: 'user',
        content: [{ type: 'text', text: `Analiza el archivo Word: "${filename}". No se pudo extraer el texto completo.${adContext}` }]
      }];
    }
  } else {
    // plain text
    messages = [{
      role: 'user',
      content: [{ type: 'text', text: `Analiza este contenido: "${filename}"\n\n${content}${adContext}` }]
    }];
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
        max_tokens: 2500,
        system,
        messages
      })
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json({ error: err.error?.message || 'Error de API' });
    }

    const data = await response.json();
    const text = data.content.map(b => b.text || '').join('');
    const clean = text.replace(/```json|```/g, '').trim();
    return res.status(200).json(JSON.parse(clean));

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
