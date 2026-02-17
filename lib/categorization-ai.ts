// =============================================
// PIPELINE DE CATEGORIZACION CON IA (AI SDK 6)
// Usa generateText + Output.object() con schema Zod
// Fallback automatico al motor local
// =============================================

import { generateText, Output } from "ai"
import { z } from "zod"
import type { AITags, CategorizationRequest } from "./types"
import { THEMES, TONES, INTENTS, RISK_LEVELS } from "./types"
import { categorizeLocal, categorizeBatchLocal } from "./categorization-engine"

// ---- ZOD SCHEMA para structured output ----

const aiTagsSchema = z.object({
  themes: z.array(z.enum(THEMES)).min(1).max(3).describe("Temas principales detectados (1-3)"),
  primaryTheme: z.enum(THEMES).describe("El tema principal mas relevante"),
  tone: z.enum(TONES).describe("Tono emocional del contenido"),
  intent: z.enum(INTENTS).describe("Intencion principal del contenido"),
  riskLevel: z.enum(RISK_LEVELS).describe("Nivel de riesgo del contenido"),
  confidence: z.number().min(0).max(1).describe("Confianza general de la clasificacion (0-1)"),
  keywords: z.array(z.string()).min(1).max(10).describe("Palabras clave detectadas en el texto"),
  explanation: z.string().describe("Explicacion detallada de por que se clasifico asi, incluyendo senales detectadas"),
  confidenceBreakdown: z.object({
    theme: z.number().min(0).max(1).describe("Confianza en la clasificacion de tema"),
    tone: z.number().min(0).max(1).describe("Confianza en la clasificacion de tono"),
    intent: z.number().min(0).max(1).describe("Confianza en la clasificacion de intencion"),
    risk: z.number().min(0).max(1).describe("Confianza en la evaluacion de riesgo"),
  }).describe("Desglose de confianza por cada dimension"),
  summary: z.string().max(120).describe("Resumen corto de 1 linea sobre el contenido y su clasificacion"),
})

// ---- SYSTEM PROMPT ----

const SYSTEM_PROMPT = `Eres un sistema experto de clasificacion de contenido en redes sociales. Tu trabajo es analizar contenido y categorizarlo segun la siguiente taxonomia:

## TAXONOMIA

### Temas (elige 1-3):
${THEMES.join(", ")}

### Tonos (elige 1):
${TONES.join(", ")}
- Positivo: contenido optimista, motivacional, constructivo
- Negativo: critico, alarmista, pesimista, denunciante
- Neutro: informativo objetivo, analitico, sin carga emocional
- Sarcastico: ironico, con doble sentido, humor critico
- Emocional: personal, vulnerable, que apela a sentimientos

### Intenciones (elige 1):
${INTENTS.join(", ")}
- Informar: transmitir datos, noticias, analisis
- Entretener: divertir, pasar el rato, contenido de ocio
- Vender: promocionar productos/servicios con intencion comercial
- Polarizar: dividir opiniones, generar controversia
- Educar: ensenar, tutoriales, guias practicas
- Inspirar: motivar, compartir experiencias positivas

### Niveles de Riesgo:
- Bajo: contenido seguro, sin problemas potenciales
- Medio: requiere atencion (consejo medico/financiero sin cualificacion, temas sensibles)
- Alto: riesgo significativo (desinformacion, manipulacion, venta agresiva, polarizacion extrema)

## REGLAS
1. Sigue ESTRICTAMENTE los valores de la taxonomia (no inventes categorias).
2. Devuelve confianza realista (no siempre 0.95+). Si hay ambiguedad, refleja con 0.6-0.8.
3. En la explicacion, menciona las senales concretas del texto que te llevaron a cada decision.
4. El summary debe ser una frase concisa de maximo 120 caracteres.
5. Detecta keywords del texto original (no inventes, extrae del contenido).
6. Evalua riesgo considerando: tema + tono + intencion + senales de urgencia/clickbait.`

// ---- CATEGORIZE WITH AI ----

export async function categorizeWithAI(
  req: CategorizationRequest
): Promise<AITags> {
  try {
    const userMessage = `Clasifica el siguiente contenido de ${req.platform} (formato: ${req.format}):

TITULO: ${req.title}
DESCRIPCION: ${req.description}
${req.author ? `AUTOR: ${req.author}` : ""}
${req.url ? `URL: ${req.url}` : ""}`

    const { output } = await generateText({
      model: "openai/gpt-4o-mini",
      system: SYSTEM_PROMPT,
      output: Output.object({ schema: aiTagsSchema }),
      messages: [{ role: "user", content: userMessage }],
    })

    if (!output) {
      throw new Error("No se recibio output estructurado del modelo")
    }

    return {
      ...output,
      method: "ai",
      detectedKeywords: output.keywords,
    }
  } catch (error) {
    console.error("[categorization-ai] Error en categorizacion con IA, usando fallback local:", error)
    return categorizeLocal(req)
  }
}

export async function categorizeBatchWithAI(
  reqs: CategorizationRequest[]
): Promise<AITags[]> {
  // Process in parallel with a concurrency limit of 5
  const CONCURRENCY = 5
  const results: AITags[] = []

  for (let i = 0; i < reqs.length; i += CONCURRENCY) {
    const batch = reqs.slice(i, i + CONCURRENCY)
    const batchResults = await Promise.all(
      batch.map((req) => categorizeWithAI(req))
    )
    results.push(...batchResults)
  }

  return results
}

// ---- AUTO MODE: try AI, fallback to local ----

export async function categorizeAuto(
  req: CategorizationRequest
): Promise<AITags> {
  // Check if AI Gateway key is available (set by Vercel integration)
  const hasAIKey = !!process.env.AI_GATEWAY_API_KEY
  if (hasAIKey) {
    return categorizeWithAI(req)
  }
  return categorizeLocal(req)
}

export async function categorizeBatchAuto(
  reqs: CategorizationRequest[]
): Promise<AITags[]> {
  const hasAIKey = !!process.env.AI_GATEWAY_API_KEY
  if (hasAIKey) {
    return categorizeBatchWithAI(reqs)
  }
  return categorizeBatchLocal(reqs)
}
