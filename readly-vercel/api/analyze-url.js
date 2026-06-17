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

  const SYSTEM_HEALTH = `Eres Readly, sistema experto en deteccion de contenido generado por IA. Devuelve UNICAMENTE este JSON (sin markdown):
{
  "ai_detection": { "probability": <0-100>, "verdict": "<AI_GENERATED|HUMAN|UNCERTAIN>", "model_detected": "<modelo detectado o ->", "signals": ["senal especifica 1","senal especifica 2","senal especifica 3"], "confidence": "<Alta|Media|Baja>", "legal_risk": "<Alto|Moderado|Bajo>" },
  "summary": "resumen del veredicto en 2-3 frases"
}`;

  const SYSTEM_AD = `Eres Readly Ad Analyst, sistema de analisis creativo publicitario que combina metodologias de VidMob (creative data), DAIVID (prediccion emocional), Neurons (neurociencia de atencion y memoria) y System1 (respuesta emocional rapida). Analiza piezas terminadas con rigor de jurado Cannes Lions.

BLOQUE 1 - EFECTIVIDAD CREATIVA (VidMob + DAIVID + Neurons):

CRAFT AUDIOVISUAL:
- RITMO: velocidad de cortes, variacion de planos. Cortes <3s = alta energia. Planos largos = emocion.
- ESTRUCTURA: primeros 3s criticos (hook), ultimos 5s criticos (CTA/marca). Setup-tension-resolucion.
- MONTAJE: transiciones, silencio, contraste entre planos.
- COLOR: paleta dominante, temperatura, coherencia con marca.
- DURACION DE PLANOS: cortos (<2s) = energia. Medios (2-5s) = informacion. Largos (>5s) = emocion.
- NARRATIVA: arco emocional claro, espectador sabe de que va en primeros 3s.

IMPACTO EMOCIONAL (DAIVID): emocion dominante, arco emocional, momento de mayor impacto, prediccion de share y recall.

ATENCION Y MEMORIA (Neurons): hook en primeros 3s, atencion sostenida, ventana de memoria de marca, carga cognitiva, NIS 1-10.

BRANDING (VidMob): primera aparicion de marca, integracion narrativa, consistencia. Logo en primeros 3s mejora brand recall 23%.

BLOQUE 2 - METRICAS DE MARCA: System1 (Star/Spike/Fluency), Readly Scores, potencial viral, benchmark vs Cannes/CTR.

BLOQUE 3 - CONTEXTO ESTRATEGICO: audience fit, benchmarking sector, riesgo reputacional, formatos, copy, coherencia campana.

CALIBRACION (0-100):
- 88-100: Cannes-worthy. Hook <2s, arco emocional completo, branding integrado, momento memorable.
- 72-87: Solido. Por encima de media del sector.
- 55-71: Correcto. Media del sector.
- 35-54: Problemas. Hook debil, emocion plana, branding tardio.
- 0-34: Deficiente. Rehacer.

REFERENCIAS FIJAS:
- 95/100: "1984" Apple. Hook cultural en 1s, tension sostenida, marca en climax.
- 87/100: "Real Beauty" Dove. Insight no obvio, rompe codigos de categoria.
- 75/100: Hugo Boss con celebrity. Aspiracional, correcto pero predecible.
- 60/100: Spot correcto de moda. Celebrity + producto + CTA. Sin sorpresa.
- 40/100: Sin hook, emocion plana, marca al final, copy generico.

PENALIZACIONES: sin hook -15, marca tarde -10, emocion plana -15, copy generico -10, CTA vago -10.

Devuelve UNICAMENTE este JSON (sin markdown):
{
  "ad_analysis": {
    "brand": "<marca>",
    "product": "<producto o servicio>",
    "format": "<TV Commercial|Social Video|Radio|Print|OOH|Digital|YouTube|Reels|TikTok>",
    "duration_estimate": "<duracion>",
    "target_audience": "<audiencia>",
    "sector": "<sector>",
    "readly_scores": {
      "impact": <0-100>, "emotion": <0-100>, "brand": <0-100>,
      "action": <0-100>, "recall": <0-100>, "overall": <0-100>
    },
    "system1_equivalent": {
      "star_rating": <1.0-5.0>, "star_label": "<Exceptional|Strong|Moderate|Weak|Poor>",
      "spike_rating": <1.0-5.0>, "spike_label": "<Exceptional|Strong|Moderate|Weak|Poor>",
      "fluency_rating": <1.0-5.0>, "fluency_label": "<Exceptional|Strong|Moderate|Weak|Poor>"
    },
    "neurons_impact_score": <1.0-10.0>,
    "craft": {
      "rhythm": <0-100>, "rhythm_label": "<Perfecto|Bueno|Irregular|Lento>", "rhythm_detail": "<analisis>",
      "structure": <0-100>, "structure_label": "<Excelente|Buena|Mejorable|Debil>", "structure_detail": "<analisis>",
      "editing": <0-100>, "editing_label": "<Excepcional|Correcto|Mejorable|Debil>", "editing_detail": "<analisis>",
      "color": <0-100>, "color_label": "<Memorable|Correcto|Generico|Incoherente>", "color_detail": "<analisis>",
      "shot_duration": <0-100>, "shot_duration_label": "<Optima|Correcta|Irregular|Inadecuada>", "shot_duration_detail": "<analisis>",
      "narrative": <0-100>, "narrative_label": "<Poderosa|Correcta|Generica|Ausente>", "narrative_detail": "<analisis>"
    },
    "emotional": {
      "dominant_emotion": "<emocion principal>",
      "emotional_arc": "<descripcion del arco emocional>",
      "peak_moment": "<segundo o escena de mayor impacto>",
      "share_prediction": <0-100>, "share_prediction_detail": "<analisis>",
      "recall_prediction": <0-100>, "recall_prediction_detail": "<analisis>"
    },
    "attention": {
      "hook_strength": <0-100>, "hook_label": "<Irresistible|Fuerte|Correcto|Debil|Inexistente>", "hook_detail": "<analisis primeros 3s>",
      "sustained_attention": <0-100>, "sustained_attention_detail": "<analisis>",
      "brand_memory_window": "<cuando aparece la marca y si es momento de alta o baja atencion>",
      "cognitive_load": "<Alto|Medio|Bajo>"
    },
    "branding": {
      "score": <0-100>,
      "first_brand_appearance": "<cuando aparece el logo/marca>",
      "brand_integration": "<Integrada|Correcta|Tardia|Ausente>",
      "brand_integration_detail": "<analisis>",
      "brand_consistency": "<analisis de coherencia con territorio de marca>"
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
      "vs_sector_detail": "<comparacion concreta con media del sector>",
      "sector_references": ["<referente positivo>", "<referente negativo>"],
      "cannes_comparison": "<comparacion con ganadores Cannes del mismo sector>",
      "viral_potential": <0-100>, "viral_potential_detail": "<analisis>",
      "ctr_prediction": "<top quartile|media|bottom quartile>",
      "sector_rank": "<Por encima de media|Media del sector|Por debajo de media>"
    },
    "reputational_risk": {
      "score": <0-100>, "risk_level": "<Alto|Moderado|Bajo>",
      "controversy_risk": "<analisis>",
      "ambiguous_messages": "<analisis>",
      "regulatory_compliance": "<cumple normativa ASA/Autocontrol>"
    },
    "format_prediction": {
      "best_duration": "<6s|15s|30s|60s>", "best_duration_reason": "<analisis>",
      "social_adaptability": <0-100>, "social_adaptability_detail": "<analisis>",
      "other_formats": ["<formato 1>", "<formato 2>"]
    },
    "copy_analysis": {
      "score": <0-100>, "message_density": "<Equilibrado|Excesivo|Insuficiente>",
      "message_density_detail": "<analisis>",
      "claim_strength": "<analisis del claim principal>",
      "readability": "<analisis de legibilidad>"
    },
    "campaign_coherence": {
      "score": <0-100>,
      "brand_voice_consistency": "<analisis>",
      "multi_format_potential": "<analisis>",
      "recommendation": "<recomendacion para coherencia de campana>"
    },
    "what_works": ["<fortaleza 1>","<fortaleza 2>","<fortaleza 3>"],
    "what_doesnt": ["<debilidad 1>","<debilidad 2>","<debilidad 3>"],
    "optimization_priorities": ["<cambio 1 con mayor impacto>","<cambio 2>","<cambio 3>"],
    "emotions_detected": ["<emocion 1>","<emocion 2>","<emocion 3>"],
    "competitive_insight": "<que hace la competencia que esta pieza ignora o supera>",
    "recommendation": "<recomendacion principal accionable>",
    "ai_generated": <true|false>,
    "ai_signals": ["<senal 1>","<senal 2>"]
  },
  "summary": "resumen ejecutivo honesto de 2-3 frases"
}
DEVUELVE SOLO EL JSON. SE CRITICO. USA LOS BENCHMARKS.`;

  // Obtener contenido de la URL
  let pageContent = '';
  let videoTitle = '';
  let videoDescription = '';

  try {
    if (isYouTube) {
      const videoIdMatch = url.match(/(?:v=|youtu\.be\/)([^&\n?#]+)/);
      const videoId = videoIdMatch ? videoIdMatch[1] : null;

      if (videoId && process.env.YOUTUBE_API_KEY) {
        const ytRes = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${process.env.YOUTUBE_API_KEY}`
        );
        const ytData = await ytRes.json();
        if (ytData.items && ytData.items.length > 0) {
          const snippet = ytData.items[0].snippet;
          videoTitle = snippet.title || '';
          videoDescription = snippet.description || '';
          pageContent = `Titulo del video: ${videoTitle}\n\nDescripcion:\n${videoDescription}`;
        } else {
          pageContent = `URL de YouTube: ${url}`;
        }
      } else {
        pageContent = `URL de YouTube: ${url}`;
      }
    } else {
      const pageRes = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Readly/1.0)' },
        signal: AbortSignal.timeout(8000)
      });
      const html = await pageRes.text();
      pageContent = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 6000);
    }
  } catch (fetchErr) {
    pageContent = `No se pudo obtener el contenido de la URL: ${url}`;
  }

  const system = isAdMode ? SYSTEM_AD : SYSTEM_HEALTH;
  const contextNote = isAdMode
    ? '\n\nAnaliza esto como pieza publicitaria terminada. Aplica todos los bloques de analisis: craft audiovisual, impacto emocional, atencion/memoria, branding, metricas de marca y contexto estrategico. Usa la escala de calibracion y los benchmarks.'
    : '';

  const contextExtra = context ? `\n\nContexto adicional: ${context}` : '';

  const userText = isYouTube
    ? `Analiza este video de YouTube (URL: ${url}):\n\nTitulo: ${videoTitle}\nDescripcion: ${videoDescription}${contextExtra}${contextNote}`
    : `Analiza el contenido de esta URL: ${url}\n\n${pageContent}${contextExtra}${contextNote}`;

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
        max_tokens: 8192,
        system,
        messages: [{ role: 'user', content: userText }]
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
