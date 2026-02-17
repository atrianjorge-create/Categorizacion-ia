// =============================================
// MODELO DE DATOS - Profile Categorization
// Equivalente al schema MySQL del proyecto
// =============================================

// ---- PERFILES ----
export interface Profile {
  id: string
  name: string
  description: string
  avatar: string // initials
  interests: Record<string, number> // tema -> peso (0-100)
  platforms: Platform[]
  context: ProfileContext
  createdAt: string
  updatedAt: string
}

export interface ProfileContext {
  ageRange: string
  location: string
  objective: string // informarse, entretenerse, comprar, etc.
  dailyHours: number
  sensitiveTopics: string[] // temas que desea limitar
}

// ---- PLATAFORMAS ----
export type Platform = "instagram" | "tiktok" | "youtube" | "twitter" | "linkedin"

export const PLATFORM_LABELS: Record<Platform, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  twitter: "X / Twitter",
  linkedin: "LinkedIn",
}

export const PLATFORM_COLORS: Record<Platform, string> = {
  instagram: "hsl(340, 75%, 55%)",
  tiktok: "hsl(180, 70%, 45%)",
  youtube: "hsl(0, 72%, 51%)",
  twitter: "hsl(217, 91%, 55%)",
  linkedin: "hsl(210, 80%, 42%)",
}

// ---- TAXONOMIA IA ----
export const THEMES = [
  "Salud",
  "Humor",
  "Relaciones",
  "Tecnologia",
  "Politica",
  "Educacion",
  "Finanzas",
  "Deporte",
  "Entretenimiento",
  "Viajes",
  "Cocina",
  "Moda",
] as const
export type Theme = (typeof THEMES)[number]

export const TONES = ["Positivo", "Negativo", "Neutro", "Sarcastico", "Emocional"] as const
export type Tone = (typeof TONES)[number]

export const INTENTS = ["Informar", "Entretener", "Vender", "Polarizar", "Educar", "Inspirar"] as const
export type Intent = (typeof INTENTS)[number]

export const FORMATS = ["Short video", "Long video", "Imagen", "Carrusel", "Texto", "Story", "Reel", "Live"] as const
export type Format = (typeof FORMATS)[number]

export const RISK_LEVELS = ["Bajo", "Medio", "Alto"] as const
export type RiskLevel = (typeof RISK_LEVELS)[number]

// ---- CONTENIDO ----
export interface Content {
  id: string
  title: string
  description: string
  platform: Platform
  format: Format
  publishedAt: string
  author: string
  url: string
  metrics: ContentMetrics
  aiTags: AITags
}

export interface ContentMetrics {
  views: number
  likes: number
  comments: number
  shares: number
  savedCount: number
  estimatedWatchTime: number // en segundos
}

export interface AITags {
  themes: Theme[]
  primaryTheme: Theme
  tone: Tone
  intent: Intent
  riskLevel: RiskLevel
  confidence: number // 0-1
  keywords: string[]
  explanation: string // explicabilidad: por que se categorizo asi
  // Campos de explicabilidad enriquecida
  method: "ai" | "local"            // motor que genero las etiquetas
  detectedKeywords: string[]         // palabras clave detectadas con su contexto
  confidenceBreakdown: {             // confianza desglosada por dimension
    theme: number
    tone: number
    intent: number
    risk: number
  }
  summary: string                    // resumen corto de 1 linea
}

// Solicitud de categorizacion (individual o batch)
export interface CategorizationRequest {
  title: string
  description: string
  platform: Platform
  format: Format
  author?: string
  url?: string
}

// ---- METRICAS AGREGADAS ----
export interface AggregatedMetrics {
  profileId: string
  platform: Platform
  period: string // YYYY-MM
  themeDistribution: Record<Theme, number>
  toneDistribution: Record<Tone, number>
  intentDistribution: Record<Intent, number>
  formatDistribution: Record<Format, number>
  totalContents: number
  avgConfidence: number
  riskDistribution: Record<RiskLevel, number>
}

// ---- COMPARADOR ----
export interface ComparisonResult {
  profileA: Profile
  profileB: Profile
  themeComparison: { theme: Theme; profileA: number; profileB: number }[]
  platformComparison: { platform: Platform; profileA: number; profileB: number }[]
  topDifferences: { label: string; profileA: number; profileB: number; delta: number }[]
}

// ---- FILTROS ----
export interface DashboardFilters {
  profileIds: string[]
  platforms: Platform[]
  dateRange: { from: string; to: string }
  themes: Theme[]
  formats: Format[]
  tones: Tone[]
}
