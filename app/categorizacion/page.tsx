"use client"

import { useState, useCallback } from "react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  THEMES,
  TONES,
  INTENTS,
  FORMATS,
  PLATFORM_LABELS,
  type Theme,
  type Format,
  type Platform,
  type AITags,
  type CategorizationRequest,
  type Content,
} from "@/lib/types"
import { addContent, addContents, getContents } from "@/lib/store"
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
  Cpu,
  Zap,
  Save,
  ListPlus,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

// ---- Types ----

type EngineMode = "auto" | "ai" | "local"

interface CategorizeResponse {
  results: AITags[]
  method: "ai" | "local"
  processingTime: number
  count: number
}

// ---- Helper: create Content object from request + tags ----

function buildContent(
  req: CategorizationRequest,
  tags: AITags,
  index: number
): Content {
  return {
    id: `cat-${Date.now()}-${index}`,
    title: req.title,
    description: req.description,
    platform: req.platform,
    format: req.format,
    publishedAt: new Date().toISOString().slice(0, 10),
    author: req.author || "@usuario",
    url: req.url || "",
    metrics: {
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      savedCount: 0,
      estimatedWatchTime: 0,
    },
    aiTags: tags,
  }
}

// ---- Sub-components ----

function ConfidenceBar({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 100)
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-16 flex-shrink-0">{label}</span>
      <Progress value={pct} className="h-2 flex-1" />
      <span className="text-xs font-mono font-semibold text-card-foreground w-10 text-right">
        {pct}%
      </span>
    </div>
  )
}

function EngineSelector({
  mode,
  onChange,
}: {
  mode: EngineMode
  onChange: (m: EngineMode) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <Label className="text-xs text-muted-foreground flex-shrink-0">Motor:</Label>
      <div className="flex gap-1">
        {([
          { value: "auto", label: "Auto", icon: Zap, desc: "IA con fallback local" },
          { value: "ai", label: "Solo IA", icon: BrainCircuit, desc: "Requiere API key" },
          { value: "local", label: "Local", icon: Cpu, desc: "Sin API key" },
        ] as const).map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
              mode === opt.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:bg-secondary"
            }`}
            title={opt.desc}
          >
            <opt.icon className="h-3.5 w-3.5" />
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function PipelineVisual({
  loading,
  progress,
  done,
  method,
}: {
  loading: boolean
  progress: number
  done: boolean
  method?: "ai" | "local"
}) {
  const steps = [
    { icon: FileText, label: "Entrada de contenido", desc: "Titulo + descripcion + metadatos" },
    { icon: Tag, label: "Extraccion de keywords", desc: "Deteccion de senales en el texto" },
    { icon: BrainCircuit, label: "Clasificacion tematica", desc: "Mapeo a taxonomia definida" },
    { icon: Sparkles, label: "Analisis de sentimiento", desc: "Tono positivo/negativo/neutro" },
    { icon: ArrowRight, label: "Deteccion de intencion", desc: "Informar/vender/educar/polarizar" },
    { icon: Shield, label: "Evaluacion de riesgo", desc: "Bajo/medio/alto con justificacion" },
    { icon: Database, label: "Normalizacion y salida", desc: "Estructura final con explicabilidad" },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Pipeline IA</CardTitle>
          </div>
          {done && method && (
            <Badge variant="outline" className="text-xs">
              {method === "ai" ? "LLM" : "Local"}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Flujo de procesamiento del contenido
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {steps.map((step, i) => (
            <div
              key={step.label}
              className={`flex items-center gap-3 rounded-lg border p-3 transition-all ${
                done
                  ? "border-[hsl(var(--success))]/30 bg-[hsl(var(--success))]/5"
                  : loading && progress >= ((i + 1) / steps.length) * 100
                    ? "border-primary/30 bg-primary/5"
                    : "border-border"
              }`}
            >
              <step.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-card-foreground">{step.label}</p>
                <p className="text-xs text-muted-foreground">{step.desc}</p>
              </div>
              {done && <CheckCircle className="h-4 w-4 text-[hsl(var(--success))] flex-shrink-0" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ResultCard({
  tags,
  onSave,
  saved,
  compact = false,
}: {
  tags: AITags
  onSave?: () => void
  saved?: boolean
  compact?: boolean
}) {
  const [expanded, setExpanded] = useState(!compact)

  return (
    <Card>
      <CardHeader className={compact ? "pb-2" : undefined}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-[hsl(var(--success))]" />
            <CardTitle className="text-base">
              {compact ? tags.summary : "Resultado de Categorizacion"}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {tags.method === "ai" ? "LLM" : "Local"}
            </Badge>
            {compact && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-muted-foreground hover:text-foreground"
              >
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            )}
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4">
          {/* Themes */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">TEMAS DETECTADOS</p>
            <div className="flex flex-wrap gap-2">
              {tags.themes.map((t, i) => (
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

          {/* Classification grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">TONO</p>
              <p className="text-sm font-semibold text-card-foreground">{tags.tone}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">INTENCION</p>
              <p className="text-sm font-semibold text-card-foreground">{tags.intent}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">RIESGO</p>
              <div className="flex items-center gap-1.5">
                {tags.riskLevel === "Alto" ? (
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                ) : tags.riskLevel === "Medio" ? (
                  <AlertTriangle className="h-4 w-4 text-[hsl(var(--warning))]" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-[hsl(var(--success))]" />
                )}
                <p className="text-sm font-semibold text-card-foreground">{tags.riskLevel}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">CONFIANZA GLOBAL</p>
              <div className="flex items-center gap-2">
                <Progress value={tags.confidence * 100} className="h-2 flex-1" />
                <span className="text-sm font-mono font-semibold text-card-foreground">
                  {Math.round(tags.confidence * 100)}%
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Confidence Breakdown */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-3">CONFIANZA POR DIMENSION</p>
            <div className="space-y-2">
              <ConfidenceBar label="Tema" value={tags.confidenceBreakdown.theme} />
              <ConfidenceBar label="Tono" value={tags.confidenceBreakdown.tone} />
              <ConfidenceBar label="Intencion" value={tags.confidenceBreakdown.intent} />
              <ConfidenceBar label="Riesgo" value={tags.confidenceBreakdown.risk} />
            </div>
          </div>

          <Separator />

          {/* Keywords */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">PALABRAS CLAVE DETECTADAS</p>
            <div className="flex flex-wrap gap-1.5">
              {tags.detectedKeywords.map((k) => (
                <Badge key={k} variant="outline" className="text-xs">
                  {k}
                </Badge>
              ))}
            </div>
          </div>

          {/* Save button */}
          {onSave && (
            <>
              <Separator />
              <Button
                onClick={onSave}
                disabled={saved}
                variant={saved ? "outline" : "default"}
                className="w-full"
              >
                {saved ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Guardado en el sistema
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar en el sistema
                  </>
                )}
              </Button>
            </>
          )}
        </CardContent>
      )}
    </Card>
  )
}

function ExplainabilityCard({ tags }: { tags: AITags }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">Explicabilidad</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground">
          Por que el sistema tomo estas decisiones
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Summary */}
        <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
          <p className="text-xs font-medium text-primary mb-1">RESUMEN</p>
          <p className="text-sm text-card-foreground">{tags.summary}</p>
        </div>

        {/* Full explanation */}
        <div className="rounded-lg bg-secondary/50 p-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {tags.explanation}
          </p>
        </div>

        {tags.confidence < 0.7 && (
          <div className="rounded-lg border border-[hsl(var(--warning))]/30 bg-[hsl(var(--warning))]/5 p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-[hsl(var(--warning))] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-card-foreground">
                  Incertidumbre detectada
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  La confianza del modelo es inferior al 70%. Los resultados
                  pueden requerir revision manual.
                </p>
              </div>
            </div>
          </div>
        )}

        {tags.riskLevel === "Alto" && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-card-foreground">
                  Contenido de alto riesgo
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Se ha detectado intencion comercial agresiva o potencial
                  polarizacion. Se recomienda revision etica.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ---- Main Page ----

export default function CategorizacionPage() {
  // Shared
  const [engineMode, setEngineMode] = useState<EngineMode>("auto")

  // Individual tab
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [author, setAuthor] = useState("")
  const [url, setUrl] = useState("")
  const [platform, setPlatform] = useState<string>("instagram")
  const [format, setFormat] = useState<string>("Short video")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AITags | null>(null)
  const [progress, setProgress] = useState(0)
  const [savedSingle, setSavedSingle] = useState(false)
  const [responseMethod, setResponseMethod] = useState<"ai" | "local" | null>(null)

  // Batch tab
  const [batchText, setBatchText] = useState("")
  const [batchPlatform, setBatchPlatform] = useState<string>("instagram")
  const [batchFormat, setBatchFormat] = useState<string>("Short video")
  const [batchLoading, setBatchLoading] = useState(false)
  const [batchResults, setBatchResults] = useState<AITags[]>([])
  const [batchRequests, setBatchRequests] = useState<CategorizationRequest[]>([])
  const [batchProgress, setBatchProgress] = useState(0)
  const [batchSaved, setBatchSaved] = useState(false)
  const [batchMethod, setBatchMethod] = useState<"ai" | "local" | null>(null)
  const [batchTime, setBatchTime] = useState(0)

  // ---- Individual handlers ----

  const handleCategorize = useCallback(async () => {
    setLoading(true)
    setResult(null)
    setSavedSingle(false)
    setProgress(0)
    setResponseMethod(null)

    // Animate pipeline progress
    const steps = 7
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return prev
        }
        return prev + (100 / steps)
      })
    }, 200)

    try {
      const res = await fetch("/api/categorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            title,
            description,
            platform,
            format,
            author: author || undefined,
            url: url || undefined,
          }] satisfies CategorizationRequest[],
          mode: engineMode,
        }),
      })

      const data: CategorizeResponse = await res.json()

      if (!res.ok) {
        throw new Error((data as unknown as { error: string }).error || "Error al categorizar")
      }

      clearInterval(progressInterval)
      setProgress(100)
      setResult(data.results[0])
      setResponseMethod(data.method)
    } catch (err) {
      clearInterval(progressInterval)
      setProgress(0)
      console.error("[v0] Error categorizing:", err)
    } finally {
      setLoading(false)
    }
  }, [title, description, platform, format, author, url, engineMode])

  const handleSaveSingle = useCallback(() => {
    if (!result) return
    const req: CategorizationRequest = { title, description, platform: platform as Platform, format: format as Format, author, url }
    const content = buildContent(req, result, 0)
    addContent(content)
    setSavedSingle(true)
  }, [result, title, description, platform, format, author, url])

  // ---- Batch handlers ----

  const parseBatchText = useCallback((): CategorizationRequest[] => {
    const lines = batchText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0)

    return lines.map((line) => {
      // Format: title | description (optional)
      const parts = line.split("|").map((p) => p.trim())
      return {
        title: parts[0] || line,
        description: parts[1] || parts[0] || line,
        platform: batchPlatform as Platform,
        format: batchFormat as Format,
      }
    })
  }, [batchText, batchPlatform, batchFormat])

  const handleBatchCategorize = useCallback(async () => {
    const reqs = parseBatchText()
    if (reqs.length === 0) return

    setBatchLoading(true)
    setBatchResults([])
    setBatchRequests(reqs)
    setBatchSaved(false)
    setBatchProgress(0)
    setBatchMethod(null)
    setBatchTime(0)

    // Animate progress
    const progressInterval = setInterval(() => {
      setBatchProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return prev
        }
        return prev + 2
      })
    }, 100)

    try {
      const res = await fetch("/api/categorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: reqs, mode: engineMode }),
      })

      const data: CategorizeResponse = await res.json()

      if (!res.ok) {
        throw new Error((data as unknown as { error: string }).error || "Error al categorizar batch")
      }

      clearInterval(progressInterval)
      setBatchProgress(100)
      setBatchResults(data.results)
      setBatchMethod(data.method)
      setBatchTime(data.processingTime)
    } catch (err) {
      clearInterval(progressInterval)
      setBatchProgress(0)
      console.error("[v0] Error batch categorizing:", err)
    } finally {
      setBatchLoading(false)
    }
  }, [parseBatchText, engineMode])

  const handleSaveBatch = useCallback(() => {
    if (batchResults.length === 0 || batchRequests.length === 0) return
    const newContents = batchResults.map((tags, i) =>
      buildContent(batchRequests[i], tags, i)
    )
    addContents(newContents)
    setBatchSaved(true)
  }, [batchResults, batchRequests])

  // ---- Batch statistics ----
  const batchStats = batchResults.length > 0
    ? {
        avgConfidence: Math.round(
          (batchResults.reduce((s, r) => s + r.confidence, 0) / batchResults.length) * 100
        ),
        riskCounts: {
          Bajo: batchResults.filter((r) => r.riskLevel === "Bajo").length,
          Medio: batchResults.filter((r) => r.riskLevel === "Medio").length,
          Alto: batchResults.filter((r) => r.riskLevel === "Alto").length,
        },
        themeCounts: THEMES.reduce(
          (acc, t) => {
            const count = batchResults.filter((r) => r.themes.includes(t)).length
            if (count > 0) acc[t] = count
            return acc
          },
          {} as Record<string, number>
        ),
      }
    : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground text-balance">
            Categorizacion con IA
          </h1>
          <p className="text-muted-foreground mt-1">
            Pipeline de categorizacion con motor dual: IA (LLM) + fallback local.
            Analiza contenidos individual o masivamente.
          </p>
        </div>
        <EngineSelector mode={engineMode} onChange={setEngineMode} />
      </div>

      <Tabs defaultValue="individual" className="space-y-6">
        <TabsList>
          <TabsTrigger value="individual" className="gap-1.5">
            <FileText className="h-4 w-4" />
            Individual
          </TabsTrigger>
          <TabsTrigger value="batch" className="gap-1.5">
            <ListPlus className="h-4 w-4" />
            Batch
          </TabsTrigger>
        </TabsList>

        {/* ===== INDIVIDUAL TAB ===== */}
        <TabsContent value="individual">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left column: Input + Pipeline */}
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
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="cat-author">Autor (opcional)</Label>
                      <Input
                        id="cat-author"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="@creador"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cat-url">URL (opcional)</Label>
                      <Input
                        id="cat-url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://..."
                      />
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
                        Categorizar
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

              <PipelineVisual
                loading={loading}
                progress={progress}
                done={!!result}
                method={responseMethod ?? undefined}
              />
            </div>

            {/* Right column: Results */}
            <div className="space-y-4">
              {result ? (
                <>
                  <ResultCard
                    tags={result}
                    onSave={handleSaveSingle}
                    saved={savedSingle}
                  />
                  <ExplainabilityCard tags={result} />
                </>
              ) : (
                <Card className="h-full flex items-center justify-center min-h-[400px]">
                  <CardContent className="text-center py-12">
                    <BrainCircuit className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">
                      Introduce un contenido y ejecuta la categorizacion
                    </p>
                    <p className="text-sm text-muted-foreground/70 mt-1 max-w-sm mx-auto">
                      El pipeline procesara el contenido a traves del motor seleccionado
                      ({engineMode === "auto" ? "IA con fallback" : engineMode === "ai" ? "solo IA" : "solo local"})
                      con explicabilidad completa.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ===== BATCH TAB ===== */}
        <TabsContent value="batch">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Input */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ListPlus className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Entrada Masiva</CardTitle>
                </div>
                <p className="text-xs text-muted-foreground">
                  Un contenido por linea. Formato: titulo | descripcion (la descripcion es opcional)
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={batchText}
                  onChange={(e) => setBatchText(e.target.value)}
                  placeholder={`5 consejos para mejorar tu salud mental | Guia practica de bienestar emocional\nReceta: Pad Thai casero en 20 min\nReview iPhone 16 Pro | Analisis completo de camara y bateria`}
                  rows={10}
                  className="font-mono text-xs"
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-xs">Plataforma</Label>
                    <Select value={batchPlatform} onValueChange={setBatchPlatform}>
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
                    <Label className="text-xs">Formato</Label>
                    <Select value={batchFormat} onValueChange={setBatchFormat}>
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

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {batchText.split("\n").filter((l) => l.trim()).length} contenido(s)
                  </span>
                </div>

                <Button
                  onClick={handleBatchCategorize}
                  disabled={!batchText.trim() || batchLoading}
                  className="w-full"
                >
                  {batchLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Procesando lote...
                    </>
                  ) : (
                    <>
                      <BrainCircuit className="h-4 w-4 mr-2" />
                      Categorizar lote
                    </>
                  )}
                </Button>

                {batchLoading && (
                  <div className="space-y-2">
                    <Progress value={batchProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground text-center">
                      Procesando lote de contenidos...
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results */}
            <div className="lg:col-span-2 space-y-4">
              {batchResults.length > 0 ? (
                <>
                  {/* Summary stats */}
                  {batchStats && (
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            <CardTitle className="text-base">
                              Resumen del lote ({batchResults.length} contenidos)
                            </CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {batchMethod === "ai" ? "LLM" : "Local"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {batchTime}ms
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 sm:grid-cols-3">
                          {/* Confidence */}
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2">CONFIANZA MEDIA</p>
                            <div className="flex items-center gap-2">
                              <Progress value={batchStats.avgConfidence} className="h-2 flex-1" />
                              <span className="text-sm font-mono font-semibold text-card-foreground">
                                {batchStats.avgConfidence}%
                              </span>
                            </div>
                          </div>

                          {/* Risk */}
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2">RIESGO</p>
                            <div className="flex gap-2">
                              <Badge variant="outline" className="text-xs">
                                Bajo: {batchStats.riskCounts.Bajo}
                              </Badge>
                              <Badge variant="outline" className="text-xs border-[hsl(var(--warning))]/50">
                                Medio: {batchStats.riskCounts.Medio}
                              </Badge>
                              <Badge variant="outline" className="text-xs border-destructive/50">
                                Alto: {batchStats.riskCounts.Alto}
                              </Badge>
                            </div>
                          </div>

                          {/* Top themes */}
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2">TEMAS</p>
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(batchStats.themeCounts)
                                .sort(([, a], [, b]) => b - a)
                                .slice(0, 5)
                                .map(([theme, count]) => (
                                  <Badge key={theme} variant="secondary" className="text-xs">
                                    {theme} ({count})
                                  </Badge>
                                ))}
                            </div>
                          </div>
                        </div>

                        <Separator className="my-4" />

                        <Button
                          onClick={handleSaveBatch}
                          disabled={batchSaved}
                          variant={batchSaved ? "outline" : "default"}
                          className="w-full"
                        >
                          {batchSaved ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              {batchResults.length} contenidos guardados
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Guardar todos en el sistema
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {/* Individual results */}
                  <div className="space-y-3">
                    {batchResults.map((tags, i) => (
                      <ResultCard key={i} tags={tags} compact />
                    ))}
                  </div>
                </>
              ) : (
                <Card className="flex items-center justify-center min-h-[400px]">
                  <CardContent className="text-center py-12">
                    <ListPlus className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">
                      Introduce contenidos para categorizar en lote
                    </p>
                    <p className="text-sm text-muted-foreground/70 mt-1 max-w-sm mx-auto">
                      Pega un contenido por linea. El sistema categorizara todos
                      simultaneamente y mostrara un resumen agregado con opcion
                      de guardar al sistema.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Taxonomia reference */}
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
