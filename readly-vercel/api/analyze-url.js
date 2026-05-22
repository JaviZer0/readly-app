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
      "tone_match": "<el tono encaja con la audiencia objetivo>",
      "cultural_moment": "<el momento cultural y estacionalidad son adecuados>",
      "channel_fit": "<el canal es el optimo para este target>"
    },
    "benchmarking": {
      "sector_average": <0-100>,
      "vs_sector": "<Por encima|A la par|Por debajo>",
      "vs_sector_detail": "<comparacion concreta con la media del sector>",
      "sector_references": ["<referente positivo del sector>", "<referente negativo>"]
    },
    "reputational_risk": {
      "score": <0-100>,
      "risk_level": "<Alto|Moderado|Bajo>",
      "controversy_risk": "<podria generar controversia>",
      "ambiguous_messages": "<hay mensajes ambiguos>",
      "regulatory_compliance": "<cumple normativa ASA/Autocontrol>"
    },
    "format_prediction": {
      "best_duration": "<6s|15s|30s|60s>",
      "best_duration_reason": "<por que esa duracion>",
      "social_adaptability": <0-100>,
      "social_adaptability_detail": "<adaptabilidad a redes sociales>",
      "other_formats": ["<formato alternativo 1>", "<formato alternativo 2>"]
    },
    "virality": {
      "score": <0-100>,
      "shareable_elements": ["<elemento viral 1>", "<elemento viral 2>"],
      "conversation_potential": "<genera conversacion>",
      "memorable_moment": "<hay un momento memorable>"
    },
    "copy_analysis": {
      "score": <0-100>,
      "message_density": "<Equilibrado|Excesivo|Insuficiente>",
      "message_density_detail": "<dice demasiado poco o lo justo>",
      "claim_strength": "<analisis del claim principal>",
      "readability": "<legibilidad del texto>"
    },
    "campaign_coherence": {
      "score": <0-100>,
      "brand_voice_consistency": "<la marca habla con una sola voz>",
      "multi_format_potential": "<podria ser parte de campana mayor>",
      "recommendation": "<recomendacion para coherencia de campana>"
    },
    "what_works": ["<fortaleza 1>","<fortaleza 2>","<fortaleza 3>"],
    "what_doesnt": ["<debilidad 1>","<debilidad 2>","<debilidad 3>"],
    "emotions_detected": ["<emocion 1>","<emocion 2>","<emocion 3>"],
    "hook_strength": "<fuerte|moderado|debil>",
    "hook_analysis": "<analisis del gancho>",
    "brand_integration": "<analisis de integracion de marca>",
    "cta_effectiveness": "<analisis del CTA>",
    "recommendation": "<recomendacion principal accionable>",
    "competitive_insight": "<insight sobre contexto competitivo>",
    "ai_generated": <true|false>,
    "ai_signals": ["<senal 1>","<senal 2>"]
  },
  "summary": "resumen ejecutivo de 2-3 frases para presentar a un cliente"
}
Star Rating: conexion emocional y potencial de marca a largo plazo. Spike Rating: urgencia y accion inmediata. Fluency Rating: reconocimiento de marca. Incluye TODOS los bloques: audience_fit, benchmarking, reputational_risk, format_prediction, virality, copy_analysis, campaign_coherence. DEVUELVE SOLO EL JSON.`;


