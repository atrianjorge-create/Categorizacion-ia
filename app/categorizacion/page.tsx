"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  THEMES,
  TONES,
  INTENTS,
  FORMATS,
  RISK_LEVELS,
  PLATFORM_LABELS,
  type Theme,
  type Tone,
  type Intent,
  type Format,
  type RiskLevel,
  type Platform,
  type AITags,
} from "@/lib/types"
import {
  BrainCircuit,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Database,
  Tag,
  FileText,
  Shield,
} from "lucide-react"

interface SimulatedResult {
  tags: AITags
  processingSteps: { step: string; status: "done" | "processing" }[]
}

function simulateAICategorization(
  title: string,
  description: string
): SimulatedResult {
  const text = `${title} ${description}`.toLowerCase()

  // Detectar temas
  const themeKeywords: Record<string, string[]> = {
    Salud: ["salud", "medico", "bienestar", "fitness", "mental", "dieta", "nutricion"],
    Humor: ["humor", "comedia", "risa", "meme", "divertido", "gracioso", "pov"],
    Relaciones: ["relacion", "amigo", "pareja", "familia", "social"],
    Tecnologia: ["tech", "ia", "app", "digital", "codigo", "software", "iphone", "ai"],
    Politica: ["politica", "gobierno", "ley", "partido", "elecciones"],
    Educacion: ["educacion", "aprender", "curso", "universidad", "estudiar"],
    Finanzas: ["finanzas", "dinero", "inversion", "ahorro", "cripto", "bitcoin"],
    Deporte: ["deporte", "gym", "rutina", "ejercicio", "fitness", "entrenamiento"],
    Entretenimiento: ["streaming", "serie", "pelicula", "musica", "juego"],
    Viajes: ["viaje", "destino", "turismo", "viajar", "hotel"],
    Cocina: ["receta", "cocina", "cocinar", "ingrediente", "plato"],
    Moda: ["moda", "outfit", "estilo", "ropa", "tendencia", "skincare"],
  }

  const detectedThemes: Theme[] = []
  const detectedKeywords: string[] = []

  for (const [theme, keywords] of Object.entries(themeKeywords)) {
    const found = keywords.filter((k) => text.includes(k))
    if (found.length > 0) {
      detectedThemes.push(theme as Theme)
      detectedKeywords.push(...found)
    }
  }

  if (detectedThemes.length === 0) {
    detectedThemes.push("Entretenimiento")
  }

  // Detectar tono
  const negativeWords = ["peor", "terrible", "mal", "problema", "crisis", "drama"]
  const positiveWords = ["mejor", "genial", "increible", "facil", "guia", "top"]
  const sarcasticWords = ["pov", "literalmente", "nadie", "absurdo"]

  let tone: Tone = "Neutro"
  if (negativeWords.some((w) => text.includes(w))) tone = "Negativo"
  else if (positiveWords.some((w) => text.includes(w))) tone = "Positivo"
  else if (sarcasticWords.some((w) => text.includes(w))) tone = "Sarcastico"

  // Detectar intencion
  const sellWords = ["compra", "oferta", "descuento", "ahora", "precio"]
  const educateWords = ["como", "guia", "paso", "tutorial", "aprende"]
  const polarizeWords = ["verdad", "nadie te dice", "escandalo"]

  let intent: Intent = "Informar"
  if (sellWords.some((w) => text.includes(w))) intent = "Vender"
  else if (educateWords.some((w) => text.includes(w))) intent = "Educar"
  else if (polarizeWords.some((w) => text.includes(w))) intent = "Polarizar"

  // Riesgo
  let riskLevel: RiskLevel = "Bajo"
  if (intent === "Vender" || intent === "Polarizar") riskLevel = "Alto"
  else if (detectedThemes.includes("Politica") || detectedThemes.includes("Finanzas"))
    riskLevel = "Medio"

  // Confianza basada en keywords encontrados
  const confidence = Math.min(
    0.95,
    0.6 + detectedKeywords.length * 0.05
  )

  // Explicacion
  const explanation = `Categorizacion basada en analisis de texto. Temas detectados por presencia de palabras clave: [${detectedKeywords.join(", ")}]. Tono "${tone}" inferido por el sentimiento general del texto. Intencion "${intent}" detectada por patrones linguisticos. ${riskLevel === "Alto" ? "ALERTA: Contenido con intencion comercial o polarizante detectada." : ""}`

  return {
    tags: {
      themes: detectedThemes.slice(0, 3) as Theme[],
      primaryTheme: detectedThemes[0] as Theme,
      tone,
      intent,
      riskLevel,
      confidence: Number(confidence.toFixed(2)),
      keywords: [...new Set(detectedKeywords)].slice(0, 6),
      explanation,
    },
    processingSteps: [
      { step: "Preprocesamiento de texto", status: "done" },
      { step: "Extraccion de palabras clave", status: "done" },
      { step: "Clasificacion tematica", status: "done" },
      { step: "Analisis de sentimiento", status: "done" },
      { step: "Deteccion de intencion", status: "done" },
      { step: "Evaluacion de riesgo", status: "done" },
      { step: "Generacion de explicacion", status: "done" },
    ],
  }
}

export default function CategorizacionPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [platform, setPlatform] = useState<string>("instagram")
  const [format, setFormat] = useState<string>("Short video")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SimulatedResult | null>(null)
  const [progress, setProgress] = useState(0)

  const handleCategorize = async () => {
    setLoading(true)
    setResult(null)
    setProgress(0)

    // Simular pipeline de procesamiento
    const steps = 7
    for (let i = 1; i <= steps; i++) {
      await new Promise((r) => setTimeout(r, 300))
      setProgress((i / steps) * 100)
    }

    const sim = simulateAICategorization(title, description)
    setResult(sim)
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground text-balance">
          Categorizacion con IA
        </h1>
        <p className="text-muted-foreground mt-1">
          Introduce un contenido para simular el pipeline de categorizacion IA.
          El sistema analiza el texto, detecta temas, tono, intencion y evalua riesgos.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Contenido a Analizar</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cat-title">Titulo del contenido</Label>
                <Input
                  id="cat-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: 5 consejos para mejorar tu salud mental..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-desc">Descripcion / Texto</Label>
                <Textarea
                  id="cat-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Escribe o pega el texto del contenido aqui..."
                  rows={4}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Plataforma</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(["instagram", "tiktok", "youtube", "twitter", "linkedin"] as const).map(
                        (p) => (
                          <SelectItem key={p} value={p}>
                            {PLATFORM_LABELS[p]}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Formato</Label>
                  <Select value={format} onValueChange={setFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FORMATS.map((f) => (
                        <SelectItem key={f} value={f}>
                          {f}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleCategorize}
                disabled={!title || loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <BrainCircuit className="h-4 w-4 mr-2" />
                    Categorizar con IA
                  </>
                )}
              </Button>

              {loading && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-center">
                    Pipeline de categorizacion en progreso...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pipeline visual */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Pipeline IA</CardTitle>
              </div>
              <p className="text-xs text-muted-foreground">
                Flujo de procesamiento del contenido
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { icon: FileText, label: "Entrada de contenido", desc: "Titulo + descripcion + metadatos" },
                  { icon: Tag, label: "Extraccion de keywords", desc: "NLP basico con patrones" },
                  { icon: BrainCircuit, label: "Clasificacion tematica", desc: "Mapeo a taxonomia definida" },
                  { icon: Sparkles, label: "Analisis de sentimiento", desc: "Tono positivo/negativo/neutro" },
                  { icon: ArrowRight, label: "Deteccion de intencion", desc: "Informar/vender/educar/polarizar" },
                  { icon: Shield, label: "Evaluacion de riesgo", desc: "Bajo/medio/alto con justificacion" },
                  { icon: Database, label: "Almacenamiento", desc: "Guardado con explicabilidad" },
                ].map((step, i) => (
                  <div
                    key={step.label}
                    className={`flex items-center gap-3 rounded-lg border p-3 transition-all ${
                      result
                        ? "border-[hsl(var(--success))]/30 bg-[hsl(var(--success))]/5"
                        : loading && progress >= ((i + 1) / 7) * 100
                          ? "border-primary/30 bg-primary/5"
                          : "border-border"
                    }`}
                  >
                    <step.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-card-foreground">{step.label}</p>
                      <p className="text-xs text-muted-foreground">{step.desc}</p>
                    </div>
                    {result && <CheckCircle className="h-4 w-4 text-[hsl(var(--success))] flex-shrink-0" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resultado */}
        <div className="space-y-4">
          {result ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-[hsl(var(--success))]" />
                    <CardTitle className="text-base">Resultado de Categorizacion</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      TEMAS DETECTADOS
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {result.tags.themes.map((t, i) => (
                        <Badge
                          key={t}
                          className={
                            i === 0
                              ? "bg-primary text-primary-foreground"
                              : "bg-primary/10 text-primary border-0"
                          }
                        >
                          {i === 0 && "Principal: "}
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">TONO</p>
                      <p className="text-sm font-semibold text-card-foreground">{result.tags.tone}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">INTENCION</p>
                      <p className="text-sm font-semibold text-card-foreground">{result.tags.intent}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">RIESGO</p>
                      <div className="flex items-center gap-1.5">
                        {result.tags.riskLevel === "Alto" ? (
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                        ) : result.tags.riskLevel === "Medio" ? (
                          <AlertTriangle className="h-4 w-4 text-[hsl(var(--warning))]" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-[hsl(var(--success))]" />
                        )}
                        <p className="text-sm font-semibold text-card-foreground">{result.tags.riskLevel}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">CONFIANZA</p>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={result.tags.confidence * 100}
                          className="h-2 flex-1"
                        />
                        <span className="text-sm font-mono font-semibold text-card-foreground">
                          {Math.round(result.tags.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      PALABRAS CLAVE
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.tags.keywords.map((k) => (
                        <Badge key={k} variant="outline" className="text-xs">
                          {k}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Explicabilidad */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">Explicabilidad</CardTitle>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Por que la IA tomo estas decisiones
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg bg-secondary/50 p-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {result.tags.explanation}
                    </p>
                  </div>

                  {result.tags.confidence < 0.7 && (
                    <div className="mt-3 rounded-lg border border-[hsl(var(--warning))]/30 bg-[hsl(var(--warning))]/5 p-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-[hsl(var(--warning))] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-card-foreground">
                            Incertidumbre detectada
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            La confianza del modelo es inferior al 70%. Los resultados
                            pueden requerir revision manual. El sistema NO inventa
                            certezas cuando la evidencia es insuficiente.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {result.tags.riskLevel === "Alto" && (
                    <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-card-foreground">
                            Contenido de alto riesgo
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Se ha detectado intencion comercial agresiva o potencial
                            polarizacion. Se recomienda revision etica antes de
                            consumir o compartir.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="h-full flex items-center justify-center min-h-[400px]">
              <CardContent className="text-center py-12">
                <BrainCircuit className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">
                  Introduce un contenido y ejecuta la categorizacion
                </p>
                <p className="text-sm text-muted-foreground/70 mt-1 max-w-sm mx-auto">
                  El pipeline simulara el proceso de analisis: extraccion de keywords,
                  clasificacion tematica, sentimiento, intencion y riesgo con
                  explicabilidad completa.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Taxonomia */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Taxonomia Definida</CardTitle>
          <p className="text-xs text-muted-foreground">
            Categorias, tonos, intenciones y formatos del sistema
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs font-semibold text-foreground mb-2">TEMAS ({THEMES.length})</p>
              <div className="flex flex-wrap gap-1">
                {THEMES.map((t) => (
                  <Badge key={t} variant="secondary" className="text-xs">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground mb-2">TONOS ({TONES.length})</p>
              <div className="flex flex-wrap gap-1">
                {TONES.map((t) => (
                  <Badge key={t} variant="outline" className="text-xs">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground mb-2">INTENCIONES ({INTENTS.length})</p>
              <div className="flex flex-wrap gap-1">
                {INTENTS.map((t) => (
                  <Badge key={t} variant="outline" className="text-xs">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground mb-2">FORMATOS ({FORMATS.length})</p>
              <div className="flex flex-wrap gap-1">
                {FORMATS.map((t) => (
                  <Badge key={t} variant="outline" className="text-xs">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
