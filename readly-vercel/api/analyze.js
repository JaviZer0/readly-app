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

const SYSTEM_AD = `Eres Readly Ad Analyzer, experto en análisis creativo publicitario. Analiza la pieza o guión y devuelve ÚNICAMENTE este JSON (sin markdown):
{
  "ad_analysis": {
    "brand": "<marca detectada o Desconocida>",
    "product": "<producto o servicio>",
    "format": "<TV Commercial|Social Video|Radio|Print|OOH|Digital|Guión>",
    "duration_estimate": "<duración estimada>",
    "target_audience": "<audiencia objetivo>",
    "sector": "<Moda|Alimentación|Banca|Tech|Automoción|Salud|Belleza|Retail|Otro>",
    "readly_scores": {
      "impact": <0-100>, "emotion": <0-100>, "brand": <0-100>,
      "action": <0-100>, "recall": <0-100>, "overall": <0-100>
    },
    "system1_equivalent": {
      "star_rating": <1.0-5.0>, "star_label": "<Exceptional|Strong|Moderate|Weak|Poor>",
      "spike_rating": <1.0-5.0>, "spike_label": "<Exceptional|Strong|Moderate|Weak|Poor>",
      "fluency_rating": <1.0-5.0>, "fluency_label": "<Exceptional|Strong|Moderate|Weak|Poor>"
    },
    "script_analysis": {
      "narrative_clarity": <0-100>, "narrative_clarity_label": "<Excelente|Buena|Mejorable|Débil>", "narrative_clarity_detail": "<1-2 frases>",
      "dramatic_structure": <0-100>, "dramatic_structure_label": "<Excelente|Buena|Mejorable|Débil>", "dramatic_structure_detail": "<gancho, desarrollo, cierre>",
      "tone_voice": <0-100>, "tone_voice_label": "<Excelente|Buena|Mejorable|Débil>", "tone_voice_detail": "<coherencia tono con marca>",
      "cta_clarity": <0-100>, "cta_clarity_label": "<Excelente|Buena|Mejorable|Débil>", "cta_clarity_detail": "<análisis CTA>",
      "originality": <0-100>, "originality_label": "<Excelente|Buena|Mejorable|Débil>", "originality_detail": "<diferenciación>"
    },
    "audience_fit": {
      "score": <0-100>,
      "tone_match": "<¿el tono encaja con la audiencia objetivo?>",
      "cultural_moment": "<¿el momento cultural y estacionalidad son adecuados?>",
      "channel_fit": "<¿el canal es el óptimo para este target?>"
    },
    "benchmarking": {
      "sector_average": <0-100>,
      "vs_sector": "<Por encima|A la par|Por debajo>",
      "vs_sector_detail": "<comparación concreta con la media del sector>",
      "sector_references": ["<referente positivo del sector>", "<referente negativo>"]
    },
    "reputational_risk": {
      "score": <0-100>,
      "risk_level": "<Alto|Moderado|Bajo>",
      "controversy_risk": "<¿podría generar controversia?>",
      "ambiguous_messages": "<¿hay mensajes ambiguos?>",
      "regulatory_compliance": "<¿cumple normativa ASA/Autocontrol?>"
    },
    "format_prediction": {
      "best_duration": "<6s|15s|30s|60s>",
      "best_duration_reason": "<por qué esa duración>",
      "social_adaptability": <0-100>,
      "social_adaptability_detail": "<adaptabilidad a redes sociales>",
      "other_formats": ["<formato alternativo 1>", "<formato alternativo 2>"]
    },
    "virality": {
      "score": <0-100>,
      "shareable_elements": ["<elemento viral 1>", "<elemento viral 2>"],
      "conversation_potential": "<¿genera conversación?>",
      "memorable_moment": "<¿hay un momento memorable?>"
    },
    "copy_analysis": {
      "score": <0-100>,
      "message_density": "<Equilibrado|Excesivo|Insuficiente>",
      "message_density_detail": "<¿dice demasiado, poco o lo justo?>",
      "claim_strength": "<análisis del claim principal>",
      "readability": "<legibilidad del texto>"
    },
    "campaign_coherence": {
      "score": <0-100>,
      "brand_voice_consistency": "<¿la marca habla con una sola voz?>",
      "multi_format_potential": "<¿podría ser parte de campaña mayor?>",
      "recommendation": "<recomendación para coherencia de campaña>"
    },
    "what_works": ["<fortaleza 1>","<fortaleza 2>","<fortaleza 3>"],
    "what_doesnt": ["<debilidad 1>","<debilidad 2>","<debilidad 3>"],
    "emotions_detected": ["<emoción 1>","<emoción 2>","<emoción 3>"],
    "hook_strength": "<fuerte|moderado|débil>",
    "hook_analysis": "<análisis del gancho>",
    "brand_integration": "<análisis de integración de marca>",
    "cta_effectiveness": "<análisis del CTA>",
    "recommendation": "<recomendación principal accionable>",
    "competitive_insight": "<insight sobre contexto competitivo>",
    "ai_generated": <true|false>,
    "ai_signals": ["<señal 1>","<señal 2>"]
  },
  "summary": "resumen ejecutivo de 2-3 frases para presentar a un cliente"
}
Star Rating: conexión emocional y potencial de marca a largo plazo. Spike Rating: urgencia y acción inmediata. Fluency Rating: reconocimiento de marca. audience_fit: encaje real del tono con audiencia, momento cultural y canal. benchmarking: compara con media del sector, cita referentes concretos. reputational_risk: controversia, mensajes ambiguos y cumplimiento normativo. format_prediction: duración óptima y adaptabilidad. virality: elementos compartibles y momento memorable. copy_analysis: densidad de mensaje y potencia del claim. campaign_coherence: consistencia de voz y potencial de campaña.
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
    try {
      const buf = Buffer.from(content, 'base64');
      const raw = buf.toString('latin1');
      let text = raw
        .replace(/<[^>]+>/g, ' ')
        .replace(/[^\x20-\x7E]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 8000);
      messages = [{
        role: 'user',
        content: [{ type: 'text', text: `Analiza este guion de Word: "${filename}"\n\n${text}${adContext}` }]
      }];
    } catch(e) {
      messages = [{
        role: 'user',
        content: [{ type: 'text', text: `Analiza el archivo Word: "${filename}". No se pudo extraer el texto.${adContext}` }]
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
