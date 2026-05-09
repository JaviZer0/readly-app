export const config = { api: { bodyParser: { sizeLimit: '20mb' } } };

const SYSTEM = `Eres Readly, un sistema experto en verificación de contenido. Analiza el contenido que te envíen y devuelve ÚNICAMENTE un JSON con esta estructura exacta (sin texto adicional, sin markdown):

{
  "ai_detection": {
    "probability": <número 0-100>,
    "verdict": "<AI_GENERATED|HUMAN|UNCERTAIN>",
    "model_detected": "<nombre del modelo o —>",
    "signals": ["<señal 1>", "<señal 2>", "<señal 3>"],
    "confidence": "<Alta|Media|Baja>",
    "legal_risk": "<Alto|Moderado|Bajo>"
  },
  "health_verification": {
    "is_health_content": <true|false>,
    "overall_score": <número 0-100>,
    "claims": [
      {
        "claim": "<afirmación extraída del texto>",
        "verdict": "<true|false|partial>",
        "explanation": "<explicación basada en evidencia científica>",
        "source": "<fuente oficial: OMS, AEMPS, NIH, Mayo Clinic, etc.>"
      }
    ],
    "advice": "<consejo general para el usuario>"
  },
  "summary": "<resumen en 2-3 frases del análisis>"
}

Para detección de IA analiza: estructura del lenguaje, patrones repetitivos, ausencia de perspectiva personal, coherencia excesiva, terminología vaga o pseudocientífica, ausencia de errores naturales, afirmaciones imposibles o sin respaldo.

Para verificación de salud contrasta cada afirmación con conocimiento científico oficial actualizado. Sé directo y preciso. Si no es contenido de salud devuelve is_health_content: false y claims: [].

DEVUELVE SOLO EL JSON, sin explicaciones.`;

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = req.headers['x-api-key'];
  if (!apiKey) return res.status(401).json({ error: 'API key requerida' });

  const { type, content, mediaType, filename } = req.body;

  let messages;

  if (type === 'pdf') {
    messages = [{
      role: 'user',
      content: [
        {
          type: 'document',
          source: { type: 'base64', media_type: 'application/pdf', data: content }
        },
        { type: 'text', text: `Analiza este PDF en profundidad: "${filename}". Detecta si fue generado por IA y verifica todas las afirmaciones de salud.` }
      ]
    }];
  } else if (type === 'image') {
    messages = [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: { type: 'base64', media_type: mediaType, data: content }
        },
        { type: 'text', text: 'Analiza esta imagen. Detecta si fue generada por IA y verifica cualquier información de salud visible.' }
      ]
    }];
  } else {
    // plain text
    messages = [{
      role: 'user',
      content: [{ type: 'text', text: `Analiza este contenido:\n\n${content}` }]
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
        max_tokens: 2000,
        system: SYSTEM,
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
    const result = JSON.parse(clean);
    return res.status(200).json(result);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
