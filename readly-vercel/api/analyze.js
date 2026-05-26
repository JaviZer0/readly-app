export const config = { api: { bodyParser: { sizeLimit: '20mb' } } };

const SYSTEM_VERIFY = `Eres Readly, sistema experto en verificacion de contenido. Analiza el contenido y devuelve UNICAMENTE este JSON (sin markdown):
{
  "ai_detection": {
    "probability": <0-100>,
    "verdict": "<AI_GENERATED|HUMAN|UNCERTAIN>",
    "model_detected": "<modelo o ->",
    "signals": ["senal1","senal2","senal3"],
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

const SYSTEM_AD = `Eres Readly Ad Analyzer, experto en analisis creativo publicitario con criterio profesional exigente. Tu mision es evaluar piezas terminadas con la misma rigurosidad que un jurado de Cannes Lions.

CALIBRACION DE PUNTUACIONES (obligatorio respetar):
- 90-100: Obra maestra. Campanas historicas tipo "Just Do It", "1984 Apple", "Real Beauty Dove". Rarisimo.
- 75-89: Trabajo solido y destacable. Buen oficio, insight claro, ejecucion competente. Puede ganar premios locales.
- 60-74: Correcto pero sin brillo. Cumple el brief pero no sorprende. Media del sector.
- 40-59: Problemas claros. Cliches, ejecucion debil, insight generico o mensaje confuso.
- 0-39: Trabajo deficiente. No funciona como pieza publicitaria.

REFERENCIAS FIJAS (ancla de calibracion):
- 95/100: "1984" Apple. Insight cultural profundo, direccion iconica, integracion perfecta de marca.
- 85/100: "Real Beauty" Dove. Verdad humana no explotada, rompio codigos de categoria.
- 75/100: "Dirt is Good" Skip/OMO. Insight solido, diferenciacion clara, consistencia de campana.
- 60/100: Anuncio correcto de detergente con estructura problema-solucion, sin momento memorable.
- 40/100: Pieza generica sin diferenciacion, insight explotado por competencia.

Se honesto y critico. Las puntuaciones infladas no ayudan al cliente a mejorar.

Analiza la pieza y devuelve UNICAMENTE este JSON (sin markdown):
{
  "ad_analysis": {
    "brand": "<marca detectada o Desconocida>",
    "product": "<producto o servicio>",
    "format": "<TV Commercial|Social Video|Radio|Print|OOH|Digital>",
    "duration_estimate": "<duracion estimada>",
    "target_audience": "<audiencia objetivo>",
    "sector": "<Moda|Alimentacion|Banca|Tech|Automocion|Salud|Belleza|Retail|Limpieza|Otro>",
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
      "narrative_clarity": <0-100>, "narrative_clarity_label": "<Excelente|Buena|Mejorable|Debil>", "narrative_clarity_detail": "<critica especifica>",
      "dramatic_structure": <0-100>, "dramatic_structure_label": "<Excelente|Buena|Mejorable|Debil>", "dramatic_structure_detail": "<gancho, desarrollo, cierre>",
      "tone_voice": <0-100>, "tone_voice_label": "<Excelente|Buena|Mejorable|Debil>", "tone_voice_detail": "<coherencia tono con marca>",
      "cta_clarity": <0-100>, "cta_clarity_label": "<Excelente|Buena|Mejorable|Debil>", "cta_clarity_detail": "<analisis CTA>",
      "originality": <0-100>, "originality_label": "<Excelente|Buena|Mejorable|Debil>", "originality_detail": "<diferenciacion real o cliche>"
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
      "message_density_detail": "<dice demasiado, poco o lo justo>",
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
  "summary": "resumen ejecutivo honesto de 2-3 frases"
}
Star Rating: conexion emocional y potencial de marca a largo plazo. Spike Rating: urgencia y accion inmediata. Fluency Rating: reconocimiento de marca. Incluye TODOS los bloques. DEVUELVE SOLO EL JSON.`;

const SYSTEM_SCRIPT = `Eres Readly Script Critic, un director creativo senior con 20 anos de experiencia en agencias top (BBDO, Wieden+Kennedy, DDB). Tu trabajo es leer guiones publicitarios con ojo clinico y dar un veredicto honesto, sin condescendencia ni halagos vacios.

COMO ANALIZAS UN GUION — en este orden de prioridad:

1. LA IDEA: ¿Hay una idea real o es estructura sin alma? ¿Podria ser de cualquier marca o solo de esta? Si no hay idea propia, todo lo demas falla.

2. INSIGHT: ¿La verdad humana en la que se apoya es obvia o no obvia? ¿Ya la ha explotado la competencia? ¿Es especifica o generica?

3. DIFERENCIACION: ¿Que hace este guion que la competencia no puede copiar manana? ¿Hay un territorio visual, verbal o emocional propietario?

4. ESTRUCTURA DRAMATICA: Gancho, tension, resolucion. ¿Hay tension real o solo ilustracion del problema?

5. MARCA: ¿Cuando aparece? ¿Como de integrada esta? ¿La recuerdas al final o recuerdas la historia sin saber de que marca era?

6. COPY: Cada linea debe ganarse su sitio. ¿Hay alguna frase que no puedas olvidar? ¿O son frases de relleno?

7. CTA: ¿Es accionable o decorativo? ¿Da una razon para actuar ahora?

8. PRODUCIBILIDAD: ¿Funciona con presupuesto real o depende de una direccion milagrosa?

PREGUNTA FINAL (la mas importante): ¿Recordarias este anuncio al dia siguiente sin ver el logo? Si la respuesta es no, el overall no puede pasar de 45.

CALIBRACION DE PUNTUACIONES:
- 85-100: Guion excepcional. Idea clara, diferenciacion real, marca integrada, copy memorable. Listo para producir.
- 70-84: Buen guion con oficio. Idea solida pero ejecutable con trabajo. Uno o dos problemas menores.
- 55-69: Guion correcto pero generico. Cumple el brief pero no sorprende. Necesita reescritura de alguna capa.
- 35-54: Problemas estructurales. Insight explotado, marca debil, copy de relleno. Reescribir antes de producir.
- 0-34: No funciona. Sin idea propia, sin diferenciacion, sin voz. Empezar de cero.

PENALIZACIONES AUTOMATICAS (aplicar siempre):
- Placeholder [MARCA] o [NOMBRE DEL PRODUCTO]: -20 puntos en idea_strength y brand_score. Es un error critico.
- Insight ya explotado por competencia directa: -15 puntos en originality
- Estructura problema-solucion sin giro ni sorpresa: -10 puntos en dramatic_structure
- Copy generico sin frase memorable: -10 puntos en copy_score
- Mas de 3 escenas de montaje haciendo el mismo punto: -5 puntos en dramatic_structure

REFERENCIAS FIJAS (ancla de calibracion):
- 90/100: Guion "1984" Apple. Una sola idea poderosa, tension real, resolucion inesperada, marca integrada en el climax.
- 80/100: Guion "Real Beauty" Dove. Insight no obvio, rompe codigos de categoria, casting como argumento.
- 65/100: Guion correcto de detergente. Problema-solucion bien ejecutado, personajes reales, pero sin sorpresa.
- 40/100: Guion con placeholder de marca, insight de categoria (no de marca), montaje largo, CTA vacio.
- 20/100: Sin estructura, sin idea, copia formatos vistos, no hay razon para recordarlo.

Se directo. Si el guion es mediocre, dilo con claridad y explica exactamente por que y como arreglarlo. Un creativo bueno prefiere critica honesta a halagos vacios.

Devuelve UNICAMENTE este JSON (sin markdown):
{
  "script_evaluation": {
    "brand": "<marca detectada o Desconocida>",
    "product": "<producto o servicio>",
    "format": "<Spot TV|Social Video|Radio|OOH|Digital>",
    "duration_estimate": "<duracion estimada>",
    "target_audience": "<audiencia objetivo>",
    "sector": "<Moda|Alimentacion|Banca|Tech|Automocion|Salud|Belleza|Retail|Limpieza|Otro>",
    "has_real_idea": <true|false>,
    "memorable_without_logo": <true|false>,
    "overall_score": <0-100>,
    "overall_label": "<Excepcional|Bueno|Correcto|Problematico|No funciona>",
    "criteria": {
      "idea_strength": <0-100>,
      "idea_label": "<Excepcional|Solida|Generica|Inexistente>",
      "idea_detail": "<hay una idea real o es estructura sin alma — ser directo>",
      "insight_quality": <0-100>,
      "insight_label": "<No obvio|Valido|Explotado|Generico>",
      "insight_detail": "<la verdad humana es propia o ya la usa la competencia>",
      "differentiation": <0-100>,
      "differentiation_label": "<Propietario|Diferenciado|Generico|Copiable>",
      "differentiation_detail": "<que tiene este guion que la competencia no puede copiar>",
      "dramatic_structure": <0-100>,
      "dramatic_structure_label": "<Excelente|Buena|Mejorable|Debil>",
      "dramatic_structure_detail": "<gancho — tension — resolucion, hay sorpresa o es predecible>",
      "brand_integration": <0-100>,
      "brand_integration_label": "<Integrada|Correcta|Tardia|Ausente>",
      "brand_integration_detail": "<cuando aparece la marca, como de integrada esta, penalizar placeholders>",
      "copy_score": <0-100>,
      "copy_label": "<Memorable|Bueno|Correcto|Generico>",
      "copy_detail": "<hay alguna frase que no puedas olvidar o es copy de relleno>",
      "cta_score": <0-100>,
      "cta_label": "<Accionable|Correcto|Vago|Ausente>",
      "cta_detail": "<es accionable o decorativo, da una razon para actuar>",
      "producibility": <0-100>,
      "producibility_label": "<Listo|Viable|Depende|Inviable>",
      "producibility_detail": "<funciona con presupuesto real o necesita direccion milagrosa>"
    },
    "what_works": ["<fortaleza especifica 1>","<fortaleza especifica 2>","<fortaleza especifica 3>"],
    "what_doesnt": ["<problema concreto 1>","<problema concreto 2>","<problema concreto 3>"],
    "critical_issues": ["<problema critico que impide producir — puede estar vacio []>"],
    "rewrite_priority": ["<lo primero que hay que reescribir>","<lo segundo>","<lo tercero>"],
    "benchmark_comparison": "<con que campana real se compara este guion y por que queda por debajo o encima>",
    "competitive_blind_spot": "<que esta haciendo la competencia que este guion ignora>",
    "verdict": "<veredicto directo en 1 frase — como lo diria un CD en una reunion de agencia>"
  },
  "summary": "resumen critico en 2-3 frases sin suavizar los problemas"
}
DEVUELVE SOLO EL JSON. SIN MARKDOWN. SE CRITICO Y ESPECIFICO.`;

const SYSTEM_BRIEF = `Eres Readly Brief Analyzer, experto en planificacion estrategica publicitaria. Analiza el brief creativo y devuelve UNICAMENTE este JSON (sin markdown):
{
  "brief_analysis": {
    "brand": "<marca>",
    "product": "<producto o servicio>",
    "objective": "<objetivo principal del brief>",
    "target_audience": "<audiencia objetivo>",
    "brief_quality": <0-100>,
    "clarity_score": <0-100>,
    "strategic_insight": "<el insight estrategico es solido o vago>",
    "what_works": ["<fortaleza 1>","<fortaleza 2>"],
    "what_doesnt": ["<debilidad 1>","<debilidad 2>"],
    "missing_elements": ["<elemento que falta 1>","<elemento que falta 2>"],
    "recommendation": "<recomendacion principal para mejorar el brief>"
  },
  "summary": "resumen en 2-3 frases"
}`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = req.headers['x-api-key'];
  if (!apiKey) return res.status(401).json({ error: 'API key requerida' });

  const { type, content, mediaType, filename, mode, contentType } = req.body;

  // Seleccionar system prompt segun modo y tipo de contenido
  let system;
  let contextNote;
  if (mode === 'ad') {
    if (contentType === 'script') {
      system = SYSTEM_SCRIPT;
      contextNote = '\n\nAnaliza esto como guion publicitario. Aplica criterio editorial estricto.';
    } else if (contentType === 'brief') {
      system = SYSTEM_BRIEF;
      contextNote = '\n\nAnaliza esto como brief creativo.';
    } else {
      system = SYSTEM_AD;
      contextNote = '\n\nAnaliza esto como pieza publicitaria terminada. Usa la escala de calibracion del sistema.';
    }
  } else {
    system = SYSTEM_VERIFY;
    contextNote = '';
  }

  let messages;

  if (type === 'pdf') {
    messages = [{
      role: 'user',
      content: [
        { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: content } },
        { type: 'text', text: `Analiza este documento: "${filename}".${contextNote}` }
      ]
    }];
  } else if (type === 'image') {
    messages = [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: mediaType, data: content } },
        { type: 'text', text: `Analiza esta imagen: "${filename}".${contextNote}` }
      ]
    }];
  } else if (type === 'docx') {
    try {
      const buf = Buffer.from(content, 'base64');
      const zipStr = buf.toString('binary');
      const matches = zipStr.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || [];
      let text = matches
        .map(m => m.replace(/<[^>]+>/g, ''))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 8000);

      if (text.length < 50) {
        text = zipStr
          .replace(/<[^>]+>/g, ' ')
          .replace(/[^\x20-\x7E\xC0-\xFF]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 8000);
      }

      messages = [{
        role: 'user',
        content: [{ type: 'text', text: `Analiza este archivo Word: "${filename}"\n\n${text}${contextNote}` }]
      }];
    } catch(e) {
      messages = [{
        role: 'user',
        content: [{ type: 'text', text: `Analiza el archivo Word: "${filename}". No se pudo extraer el texto.${contextNote}` }]
      }];
    }
  } else {
    messages = [{
      role: 'user',
      content: [{ type: 'text', text: `Analiza este contenido: "${filename}"\n\n${content}${contextNote}` }]
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
        max_tokens: 4096,
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
