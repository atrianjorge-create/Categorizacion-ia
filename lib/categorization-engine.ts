// =============================================
// MOTOR LOCAL DE CATEGORIZACION
// Sistema de keywords ponderadas + heuristicas
// Fallback cuando no hay API key de IA
// =============================================

import type { AITags, CategorizationRequest, Theme, Tone, Intent, RiskLevel } from "./types"
import { THEMES, TONES, INTENTS, RISK_LEVELS } from "./types"

// ---- KEYWORD DATABASES CON PESOS ----

const THEME_KEYWORDS: Record<Theme, { word: string; weight: number }[]> = {
  Salud: [
    { word: "salud", weight: 1.0 }, { word: "mental", weight: 0.8 }, { word: "bienestar", weight: 0.9 },
    { word: "dieta", weight: 0.8 }, { word: "nutricion", weight: 0.9 }, { word: "ejercicio", weight: 0.7 },
    { word: "medico", weight: 0.9 }, { word: "enfermedad", weight: 0.8 }, { word: "ansiedad", weight: 0.9 },
    { word: "depresion", weight: 0.9 }, { word: "terapia", weight: 0.8 }, { word: "autocuidado", weight: 0.9 },
    { word: "mindfulness", weight: 0.8 }, { word: "meditacion", weight: 0.7 }, { word: "calorias", weight: 0.7 },
    { word: "vitaminas", weight: 0.7 }, { word: "dormir", weight: 0.6 }, { word: "estres", weight: 0.8 },
    { word: "gym", weight: 0.5 }, { word: "detox", weight: 0.7 }, { word: "ayuno", weight: 0.8 },
    { word: "skincare", weight: 0.5 }, { word: "hospital", weight: 0.9 }, { word: "vacuna", weight: 0.9 },
  ],
  Humor: [
    { word: "humor", weight: 1.0 }, { word: "meme", weight: 0.9 }, { word: "risa", weight: 0.9 },
    { word: "comedia", weight: 0.9 }, { word: "broma", weight: 0.8 }, { word: "gracioso", weight: 0.9 },
    { word: "jaja", weight: 0.7 }, { word: "viral", weight: 0.4 }, { word: "fail", weight: 0.7 },
    { word: "parodia", weight: 0.9 }, { word: "sketch", weight: 0.8 }, { word: "chiste", weight: 0.9 },
  ],
  Relaciones: [
    { word: "relacion", weight: 1.0 }, { word: "pareja", weight: 0.9 }, { word: "amor", weight: 0.8 },
    { word: "cita", weight: 0.8 }, { word: "ruptura", weight: 0.9 }, { word: "amistad", weight: 0.8 },
    { word: "toxica", weight: 0.7 }, { word: "familia", weight: 0.7 }, { word: "limites", weight: 0.5 },
    { word: "infidelidad", weight: 0.9 }, { word: "confianza", weight: 0.6 }, { word: "compromiso", weight: 0.6 },
  ],
  Tecnologia: [
    { word: "tecnologia", weight: 1.0 }, { word: "app", weight: 0.7 }, { word: "software", weight: 0.9 },
    { word: "programacion", weight: 0.9 }, { word: "ia", weight: 0.9 }, { word: "inteligencia artificial", weight: 1.0 },
    { word: "iphone", weight: 0.8 }, { word: "android", weight: 0.8 }, { word: "startup", weight: 0.7 },
    { word: "digital", weight: 0.6 }, { word: "react", weight: 0.8 }, { word: "codigo", weight: 0.8 },
    { word: "hardware", weight: 0.8 }, { word: "gadget", weight: 0.7 }, { word: "robot", weight: 0.8 },
    { word: "cyber", weight: 0.7 }, { word: "blockchain", weight: 0.8 }, { word: "cloud", weight: 0.7 },
  ],
  Politica: [
    { word: "politica", weight: 1.0 }, { word: "gobierno", weight: 0.9 }, { word: "ley", weight: 0.8 },
    { word: "parlamento", weight: 0.9 }, { word: "elecciones", weight: 0.9 }, { word: "partido", weight: 0.7 },
    { word: "presidente", weight: 0.8 }, { word: "regulacion", weight: 0.7 }, { word: "democracia", weight: 0.9 },
    { word: "congreso", weight: 0.9 }, { word: "ideologia", weight: 0.8 }, { word: "protesta", weight: 0.7 },
  ],
  Educacion: [
    { word: "educacion", weight: 1.0 }, { word: "aprender", weight: 0.9 }, { word: "tutorial", weight: 0.9 },
    { word: "curso", weight: 0.8 }, { word: "estudiar", weight: 0.8 }, { word: "universidad", weight: 0.8 },
    { word: "ciencia", weight: 0.7 }, { word: "investigacion", weight: 0.8 }, { word: "libro", weight: 0.6 },
    { word: "guia", weight: 0.6 }, { word: "clase", weight: 0.7 }, { word: "profesor", weight: 0.8 },
    { word: "estudio", weight: 0.7 }, { word: "conocimiento", weight: 0.7 }, { word: "lectura", weight: 0.6 },
  ],
  Finanzas: [
    { word: "finanzas", weight: 1.0 }, { word: "dinero", weight: 0.9 }, { word: "inversion", weight: 0.9 },
    { word: "ahorro", weight: 0.9 }, { word: "euros", weight: 0.7 }, { word: "bolsa", weight: 0.8 },
    { word: "cripto", weight: 0.8 }, { word: "economia", weight: 0.8 }, { word: "presupuesto", weight: 0.7 },
    { word: "banco", weight: 0.7 }, { word: "hipoteca", weight: 0.9 }, { word: "impuestos", weight: 0.8 },
    { word: "ingresos", weight: 0.8 }, { word: "dropshipping", weight: 0.8 }, { word: "negocio", weight: 0.7 },
  ],
  Deporte: [
    { word: "deporte", weight: 1.0 }, { word: "fitness", weight: 0.9 }, { word: "gym", weight: 0.8 },
    { word: "futbol", weight: 0.9 }, { word: "entrenamiento", weight: 0.9 }, { word: "correr", weight: 0.7 },
    { word: "natacion", weight: 0.8 }, { word: "boxeo", weight: 0.8 }, { word: "olimpiadas", weight: 0.9 },
    { word: "gol", weight: 0.8 }, { word: "liga", weight: 0.7 }, { word: "rutina", weight: 0.5 },
    { word: "hiit", weight: 0.9 }, { word: "crossfit", weight: 0.9 }, { word: "yoga", weight: 0.6 },
  ],
  Entretenimiento: [
    { word: "entretenimiento", weight: 1.0 }, { word: "serie", weight: 0.8 }, { word: "pelicula", weight: 0.8 },
    { word: "streaming", weight: 0.7 }, { word: "musica", weight: 0.8 }, { word: "juego", weight: 0.7 },
    { word: "concierto", weight: 0.8 }, { word: "festival", weight: 0.7 }, { word: "netflix", weight: 0.8 },
    { word: "asmr", weight: 0.7 }, { word: "influencer", weight: 0.6 }, { word: "viral", weight: 0.5 },
    { word: "creador", weight: 0.5 }, { word: "gaming", weight: 0.8 }, { word: "anime", weight: 0.8 },
  ],
  Viajes: [
    { word: "viaje", weight: 1.0 }, { word: "destino", weight: 0.9 }, { word: "turismo", weight: 0.9 },
    { word: "hotel", weight: 0.8 }, { word: "avion", weight: 0.7 }, { word: "mochilero", weight: 0.9 },
    { word: "europa", weight: 0.6 }, { word: "playa", weight: 0.6 }, { word: "road trip", weight: 0.9 },
    { word: "camping", weight: 0.7 }, { word: "ruta", weight: 0.6 }, { word: "vuelo", weight: 0.7 },
    { word: "furgoneta", weight: 0.7 }, { word: "alojamiento", weight: 0.8 }, { word: "excursion", weight: 0.8 },
  ],
  Cocina: [
    { word: "cocina", weight: 1.0 }, { word: "receta", weight: 1.0 }, { word: "comida", weight: 0.8 },
    { word: "ingrediente", weight: 0.8 }, { word: "chef", weight: 0.8 }, { word: "restaurante", weight: 0.7 },
    { word: "horno", weight: 0.7 }, { word: "sarten", weight: 0.7 }, { word: "pasta", weight: 0.7 },
    { word: "pan", weight: 0.6 }, { word: "postre", weight: 0.8 }, { word: "vegano", weight: 0.7 },
    { word: "meal prep", weight: 0.9 }, { word: "saludable", weight: 0.4 }, { word: "hack", weight: 0.3 },
  ],
  Moda: [
    { word: "moda", weight: 1.0 }, { word: "outfit", weight: 0.9 }, { word: "ropa", weight: 0.9 },
    { word: "estilo", weight: 0.7 }, { word: "tendencia", weight: 0.7 }, { word: "marca", weight: 0.6 },
    { word: "zara", weight: 0.8 }, { word: "haul", weight: 0.8 }, { word: "skincare", weight: 0.6 },
    { word: "belleza", weight: 0.8 }, { word: "maquillaje", weight: 0.9 }, { word: "accesorio", weight: 0.7 },
    { word: "temporada", weight: 0.4 }, { word: "pasarela", weight: 0.9 }, { word: "look", weight: 0.7 },
  ],
}

const TONE_SIGNALS: Record<Tone, { word: string; weight: number }[]> = {
  Positivo: [
    { word: "mejor", weight: 0.6 }, { word: "facil", weight: 0.5 }, { word: "increible", weight: 0.8 },
    { word: "favorito", weight: 0.7 }, { word: "genial", weight: 0.8 }, { word: "recomiendo", weight: 0.7 },
    { word: "excelente", weight: 0.8 }, { word: "perfecto", weight: 0.7 }, { word: "vale la pena", weight: 0.8 },
    { word: "inspirar", weight: 0.6 }, { word: "motivar", weight: 0.6 }, { word: "guia completa", weight: 0.5 },
  ],
  Negativo: [
    { word: "peor", weight: 0.8 }, { word: "peligro", weight: 0.8 }, { word: "oscuro", weight: 0.6 },
    { word: "problema", weight: 0.6 }, { word: "drama", weight: 0.7 }, { word: "escandalo", weight: 0.9 },
    { word: "estafa", weight: 0.9 }, { word: "falso", weight: 0.8 }, { word: "toxico", weight: 0.8 },
    { word: "nadie te dice", weight: 0.7 }, { word: "verdad sobre", weight: 0.6 }, { word: "desmontando", weight: 0.6 },
  ],
  Neutro: [
    { word: "analisis", weight: 0.8 }, { word: "estudio", weight: 0.7 }, { word: "comparativa", weight: 0.8 },
    { word: "review", weight: 0.7 }, { word: "segun", weight: 0.6 }, { word: "datos", weight: 0.7 },
    { word: "debate", weight: 0.6 }, { word: "meta-analisis", weight: 0.9 }, { word: "investigacion", weight: 0.7 },
  ],
  Sarcastico: [
    { word: "supuestamente", weight: 0.8 }, { word: "funciona de verdad", weight: 0.7 },
    { word: "hack", weight: 0.5 }, { word: "si claro", weight: 0.9 }, { word: "spoiler", weight: 0.5 },
    { word: "expectativa", weight: 0.6 }, { word: "realidad", weight: 0.5 },
  ],
  Emocional: [
    { word: "cambio mi vida", weight: 0.9 }, { word: "experiencia", weight: 0.5 },
    { word: "emocional", weight: 0.9 }, { word: "sentir", weight: 0.7 }, { word: "llorar", weight: 0.8 },
    { word: "corazon", weight: 0.7 }, { word: "mi historia", weight: 0.8 }, { word: "autocuidado", weight: 0.6 },
    { word: "hoy", weight: 0.3 }, { word: "deberias", weight: 0.5 },
  ],
}

const INTENT_SIGNALS: Record<Intent, { word: string; weight: number }[]> = {
  Informar: [
    { word: "guia", weight: 0.8 }, { word: "analisis", weight: 0.9 }, { word: "datos", weight: 0.7 },
    { word: "estudio", weight: 0.8 }, { word: "como funciona", weight: 0.7 }, { word: "explicado", weight: 0.8 },
    { word: "review", weight: 0.7 }, { word: "entrevista", weight: 0.7 }, { word: "segun", weight: 0.6 },
  ],
  Entretener: [
    { word: "viral", weight: 0.7 }, { word: "challenge", weight: 0.7 }, { word: "fail", weight: 0.8 },
    { word: "meme", weight: 0.9 }, { word: "asmr", weight: 0.7 }, { word: "streaming", weight: 0.6 },
    { word: "serie", weight: 0.6 }, { word: "opinion", weight: 0.5 }, { word: "drama", weight: 0.6 },
  ],
  Vender: [
    { word: "compra", weight: 0.9 }, { word: "oferta", weight: 0.9 }, { word: "descuento", weight: 0.9 },
    { word: "link en bio", weight: 1.0 }, { word: "codigo", weight: 0.5 }, { word: "limitada", weight: 0.8 },
    { word: "ahora", weight: 0.4 }, { word: "promocion", weight: 0.9 }, { word: "gratis", weight: 0.7 },
    { word: "ganar dinero", weight: 0.8 }, { word: "ingresos pasivos", weight: 0.8 },
  ],
  Polarizar: [
    { word: "nadie reacciona", weight: 0.9 }, { word: "la verdad", weight: 0.6 },
    { word: "escandalo", weight: 0.8 }, { word: "conspiracion", weight: 0.9 },
    { word: "manipulacion", weight: 0.8 }, { word: "no quieren que sepas", weight: 1.0 },
    { word: "censurado", weight: 0.9 }, { word: "controvertido", weight: 0.8 },
  ],
  Educar: [
    { word: "tutorial", weight: 0.9 }, { word: "paso a paso", weight: 0.9 }, { word: "aprender", weight: 0.8 },
    { word: "curso", weight: 0.8 }, { word: "explicado", weight: 0.8 }, { word: "guia completa", weight: 0.9 },
    { word: "principiantes", weight: 0.8 }, { word: "como hacer", weight: 0.8 }, { word: "tecnica", weight: 0.6 },
  ],
  Inspirar: [
    { word: "cambio mi vida", weight: 0.9 }, { word: "favoritos", weight: 0.6 },
    { word: "motivacion", weight: 0.9 }, { word: "inspirar", weight: 1.0 }, { word: "sueno", weight: 0.7 },
    { word: "historia", weight: 0.5 }, { word: "rutina matutina", weight: 0.7 }, { word: "superacion", weight: 0.9 },
  ],
}

// ---- SCORING ENGINE ----

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
}

function scoreKeywords(
  text: string,
  keywords: { word: string; weight: number }[],
  titleBoost: boolean = false
): { score: number; matched: string[] } {
  const norm = normalizeText(text)
  let score = 0
  const matched: string[] = []

  for (const kw of keywords) {
    const kwNorm = normalizeText(kw.word)
    if (norm.includes(kwNorm)) {
      const multiplier = titleBoost ? 1.5 : 1.0
      score += kw.weight * multiplier
      matched.push(kw.word)
    }
  }

  return { score, matched }
}

function detectRisk(
  themes: Theme[],
  tone: Tone,
  intent: Intent,
  text: string
): { level: RiskLevel; confidence: number } {
  let riskScore = 0

  // Intent-based risk
  if (intent === "Polarizar") riskScore += 0.4
  if (intent === "Vender") riskScore += 0.2

  // Tone-based risk
  if (tone === "Negativo") riskScore += 0.15
  if (tone === "Sarcastico") riskScore += 0.05

  // Theme-based risk
  if (themes.includes("Politica")) riskScore += 0.2
  if (themes.includes("Salud") && intent !== "Educar") riskScore += 0.15
  if (themes.includes("Finanzas") && intent === "Vender") riskScore += 0.25

  // Combination bonuses
  if (themes.includes("Politica") && tone === "Negativo") riskScore += 0.15
  if (themes.includes("Salud") && intent === "Vender") riskScore += 0.2

  // Text-based urgency signals
  const urgencyWords = ["ahora", "urgente", "limitada", "solo hoy", "no te pierdas", "ultima oportunidad"]
  const norm = normalizeText(text)
  for (const w of urgencyWords) {
    if (norm.includes(w)) riskScore += 0.1
  }

  // Clickbait signals
  const clickbaitPatterns = ["nadie te dice", "no quieren que", "la verdad sobre", "descubierto"]
  for (const p of clickbaitPatterns) {
    if (norm.includes(p)) riskScore += 0.15
  }

  const clampedScore = Math.min(1, riskScore)
  const level: RiskLevel = clampedScore >= 0.5 ? "Alto" : clampedScore >= 0.25 ? "Medio" : "Bajo"
  const confidence = 0.6 + clampedScore * 0.35

  return { level, confidence }
}

// ---- MAIN CATEGORIZE FUNCTION ----

export function categorizeLocal(req: CategorizationRequest): AITags {
  const fullText = `${req.title} ${req.description}`
  const allDetectedKeywords: string[] = []

  // 1. THEME DETECTION (multi-signal: title weighted 1.5x)
  const themeScores: { theme: Theme; score: number; keywords: string[] }[] = []
  for (const theme of THEMES) {
    const titleResult = scoreKeywords(req.title, THEME_KEYWORDS[theme], true)
    const descResult = scoreKeywords(req.description, THEME_KEYWORDS[theme], false)
    const totalScore = titleResult.score + descResult.score
    const keywords = [...new Set([...titleResult.matched, ...descResult.matched])]
    if (totalScore > 0) {
      themeScores.push({ theme, score: totalScore, keywords })
      allDetectedKeywords.push(...keywords)
    }
  }
  themeScores.sort((a, b) => b.score - a.score)

  const themes: Theme[] = themeScores.length > 0
    ? themeScores.filter((t) => t.score >= themeScores[0].score * 0.4).map((t) => t.theme).slice(0, 3)
    : ["Entretenimiento"]
  const primaryTheme = themes[0]
  const themeConfidence = themeScores.length > 0
    ? Math.min(0.98, 0.5 + themeScores[0].score * 0.15)
    : 0.4

  // 2. TONE DETECTION
  const toneScores: { tone: Tone; score: number }[] = []
  for (const tone of TONES) {
    const { score, matched } = scoreKeywords(fullText, TONE_SIGNALS[tone])
    if (score > 0) {
      toneScores.push({ tone, score })
      allDetectedKeywords.push(...matched)
    }
  }
  toneScores.sort((a, b) => b.score - a.score)
  const tone: Tone = toneScores.length > 0 ? toneScores[0].tone : "Neutro"
  const toneConfidence = toneScores.length > 0
    ? Math.min(0.95, 0.45 + toneScores[0].score * 0.2)
    : 0.35

  // 3. INTENT DETECTION
  const intentScores: { intent: Intent; score: number }[] = []
  for (const intent of INTENTS) {
    const { score, matched } = scoreKeywords(fullText, INTENT_SIGNALS[intent])
    if (score > 0) {
      intentScores.push({ intent, score })
      allDetectedKeywords.push(...matched)
    }
  }
  intentScores.sort((a, b) => b.score - a.score)
  const intent: Intent = intentScores.length > 0 ? intentScores[0].intent : "Informar"
  const intentConfidence = intentScores.length > 0
    ? Math.min(0.95, 0.45 + intentScores[0].score * 0.2)
    : 0.35

  // 4. RISK DETECTION
  const risk = detectRisk(themes, tone, intent, fullText)

  // 5. OVERALL CONFIDENCE
  const overallConfidence = Math.round(
    ((themeConfidence + toneConfidence + intentConfidence + risk.confidence) / 4) * 100
  ) / 100

  // 6. UNIQUE KEYWORDS
  const uniqueKeywords = [...new Set(allDetectedKeywords)].slice(0, 10)

  // 7. GENERATE EXPLANATION
  const themeExpl = `Tema principal "${primaryTheme}" detectado por palabras clave: ${themeScores[0]?.keywords.join(", ") || "heuristicas generales"}.`
  const toneExpl = `Tono "${tone}" identificado por senales linguisticas en el texto.`
  const intentExpl = `Intencion "${intent}" inferida del contexto y estructura del contenido.`
  const riskExpl = risk.level !== "Bajo"
    ? ` Riesgo ${risk.level.toLowerCase()} por ${themes.includes("Politica") ? "contenido politico" : ""}${intent === "Vender" ? " intencion comercial" : ""}${tone === "Negativo" ? " tono negativo" : ""}.`
    : ""
  const explanation = `${themeExpl} ${toneExpl} ${intentExpl}${riskExpl}`

  // 8. SUMMARY
  const summary = `Contenido de ${primaryTheme.toLowerCase()} con tono ${tone.toLowerCase()} e intencion de ${intent.toLowerCase()}. Riesgo: ${risk.level.toLowerCase()}.`

  return {
    themes,
    primaryTheme,
    tone,
    intent,
    riskLevel: risk.level,
    confidence: overallConfidence,
    keywords: uniqueKeywords,
    explanation,
    method: "local",
    detectedKeywords: uniqueKeywords,
    confidenceBreakdown: {
      theme: themeConfidence,
      tone: toneConfidence,
      intent: intentConfidence,
      risk: risk.confidence,
    },
    summary,
  }
}

export function categorizeBatchLocal(reqs: CategorizationRequest[]): AITags[] {
  return reqs.map(categorizeLocal)
}
