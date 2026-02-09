"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { SEED_CONTENTS } from "@/lib/seed-data"
import { PLATFORM_LABELS, THEMES, TONES, FORMATS, type Content, type Platform, type Theme } from "@/lib/types"
import {
  Search, Eye, ThumbsUp, MessageSquare, Share2, Bookmark, Clock,
  AlertTriangle, CheckCircle, AlertCircle, Info, ChevronLeft, ChevronRight,
  BarChart3, TrendingUp, Filter, ArrowUpDown, SortAsc, SortDesc, Grid3X3, List, X
} from "lucide-react"

const ITEMS_PER_PAGE = 18

function ContentDetailDialog({ content }: { content: Content }) {
  const riskIcon = content.aiTags.riskLevel === "Alto" ? (
    <AlertTriangle className="h-4 w-4 text-destructive" />
  ) : content.aiTags.riskLevel === "Medio" ? (
    <AlertCircle className="h-4 w-4 text-[hsl(var(--warning))]" />
  ) : (
    <CheckCircle className="h-4 w-4 text-[hsl(var(--success))]" />
  )

  const engRate = content.metrics.views > 0
    ? ((content.metrics.likes + content.metrics.comments) / content.metrics.views * 100).toFixed(2)
    : "0"

  return (
    <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-lg leading-snug">{content.title}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">{content.description}</p>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{PLATFORM_LABELS[content.platform]}</Badge>
          <Badge variant="secondary">{content.format}</Badge>
          <Badge variant="secondary">{content.publishedAt}</Badge>
          <Badge variant="outline">{content.author}</Badge>
        </div>

        <Separator />

        {/* Metricas */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">Metricas de Interaccion</h4>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {[
              { icon: Eye, label: "Vistas", value: content.metrics.views },
              { icon: ThumbsUp, label: "Likes", value: content.metrics.likes },
              { icon: MessageSquare, label: "Comentarios", value: content.metrics.comments },
              { icon: Share2, label: "Shares", value: content.metrics.shares },
              { icon: Bookmark, label: "Guardados", value: content.metrics.savedCount },
              { icon: Clock, label: "Tiempo", value: `${Math.round(content.metrics.estimatedWatchTime / 60)}min` },
              { icon: TrendingUp, label: "Eng. Rate", value: `${engRate}%` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="text-center p-2 rounded-lg bg-secondary/30">
                <Icon className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                <p className="text-sm font-semibold text-foreground">
                  {typeof value === "number" ? value.toLocaleString("es-ES") : value}
                </p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Etiquetas IA */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">Categorizacion IA</h4>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Temas</span>
              <div className="flex gap-1">
                {content.aiTags.themes.map((t, i) => (
                  <Badge key={t} className={i === 0 ? "bg-primary text-primary-foreground text-xs" : "bg-primary/10 text-primary border-0 text-xs"}>
                    {i === 0 && "Principal: "}{t}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tono</span>
              <Badge variant="outline" className="text-xs">{content.aiTags.tone}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Intencion</span>
              <Badge variant="outline" className="text-xs">{content.aiTags.intent}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Riesgo</span>
              <div className="flex items-center gap-1.5">{riskIcon}<span className="text-sm font-medium">{content.aiTags.riskLevel}</span></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Confianza</span>
              <div className="flex items-center gap-2">
                <Progress value={content.aiTags.confidence * 100} className="w-20 h-2" />
                <span className="text-sm font-mono">{Math.round(content.aiTags.confidence * 100)}%</span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Explicabilidad */}
        <div className="rounded-lg bg-secondary/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">Explicabilidad IA</h4>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{content.aiTags.explanation}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="text-xs text-muted-foreground mr-1">Palabras clave:</span>
            {content.aiTags.keywords.map((k) => (
              <Badge key={k} variant="outline" className="text-xs">{k}</Badge>
            ))}
          </div>
        </div>

        {content.aiTags.confidence < 0.7 && (
          <div className="rounded-lg border border-[hsl(var(--warning))]/30 bg-[hsl(var(--warning))]/5 p-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-[hsl(var(--warning))]" />
              <p className="text-xs text-muted-foreground">
                La confianza de la IA para esta categorizacion es inferior al 70%. Los resultados deben interpretarse con cautela.
              </p>
            </div>
          </div>
        )}
      </div>
    </DialogContent>
  )
}

export default function ContenidosPage() {
  const [search, setSearch] = useState("")
  const [platform, setPlatform] = useState("all")
  const [theme, setTheme] = useState("all")
  const [tone, setTone] = useState("all")
  const [format, setFormat] = useState("all")
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<"date" | "views" | "confidence" | "risk">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const filtered = useMemo(() => {
    let result = SEED_CONTENTS
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.aiTags.keywords.some((k) => k.toLowerCase().includes(q))
      )
    }
    if (platform !== "all") result = result.filter((c) => c.platform === platform)
    if (theme !== "all") result = result.filter((c) => c.aiTags.themes.includes(theme as Theme))
    if (tone !== "all") result = result.filter((c) => c.aiTags.tone === tone)
    if (format !== "all") result = result.filter((c) => c.format === format)

    // Sort
    result = [...result].sort((a, b) => {
      let cmp = 0
      if (sortBy === "views") cmp = a.metrics.views - b.metrics.views
      else if (sortBy === "confidence") cmp = a.aiTags.confidence - b.aiTags.confidence
      else if (sortBy === "risk") {
        const riskOrder = { Bajo: 0, Medio: 1, Alto: 2 }
        cmp = riskOrder[a.aiTags.riskLevel] - riskOrder[b.aiTags.riskLevel]
      } else cmp = a.publishedAt.localeCompare(b.publishedAt)
      return sortOrder === "desc" ? -cmp : cmp
    })

    return result
  }, [search, platform, theme, tone, format, sortBy, sortOrder])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  // Stats
  const avgConfidence = filtered.length > 0 ? (filtered.reduce((s, c) => s + c.aiTags.confidence, 0) / filtered.length * 100).toFixed(1) : "0"
  const highRisk = filtered.filter(c => c.aiTags.riskLevel === "Alto").length
  const totalViews = filtered.reduce((s, c) => s + c.metrics.views, 0)

  const hasFilters = platform !== "all" || theme !== "all" || tone !== "all" || format !== "all" || search !== ""

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground text-balance">Explorador de Contenidos</h1>
        <p className="text-muted-foreground mt-1">
          Navega y analiza {SEED_CONTENTS.length} contenidos categorizados por la IA. Haz clic en cualquier contenido para ver su detalle completo.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <BarChart3 className="h-4 w-4 text-primary flex-shrink-0" />
            <div>
              <p className="text-lg font-bold text-card-foreground">{filtered.length}</p>
              <p className="text-xs text-muted-foreground">Contenidos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <Eye className="h-4 w-4 text-[hsl(var(--chart-3))] flex-shrink-0" />
            <div>
              <p className="text-lg font-bold text-card-foreground">{totalViews >= 1000000 ? `${(totalViews/1000000).toFixed(1)}M` : `${(totalViews/1000).toFixed(0)}K`}</p>
              <p className="text-xs text-muted-foreground">Vistas totales</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <TrendingUp className="h-4 w-4 text-[hsl(var(--success))] flex-shrink-0" />
            <div>
              <p className="text-lg font-bold text-card-foreground">{avgConfidence}%</p>
              <p className="text-xs text-muted-foreground">Conf. media</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
            <div>
              <p className="text-lg font-bold text-card-foreground">{highRisk}</p>
              <p className="text-xs text-muted-foreground">Riesgo alto</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y Controles */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                placeholder="Buscar por titulo, descripcion o keyword..." className="pl-9"
              />
            </div>
            <Select value={platform} onValueChange={(v) => { setPlatform(v); setPage(1) }}>
              <SelectTrigger className="w-[140px] h-9 text-sm"><SelectValue placeholder="Plataforma" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {(["instagram", "tiktok", "youtube", "twitter", "linkedin"] as const).map((p) => (
                  <SelectItem key={p} value={p}>{PLATFORM_LABELS[p]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={theme} onValueChange={(v) => { setTheme(v); setPage(1) }}>
              <SelectTrigger className="w-[130px] h-9 text-sm"><SelectValue placeholder="Tema" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {THEMES.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={tone} onValueChange={(v) => { setTone(v); setPage(1) }}>
              <SelectTrigger className="w-[120px] h-9 text-sm"><SelectValue placeholder="Tono" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {TONES.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={format} onValueChange={(v) => { setFormat(v); setPage(1) }}>
              <SelectTrigger className="w-[130px] h-9 text-sm"><SelectValue placeholder="Formato" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {FORMATS.map((f) => (<SelectItem key={f} value={f}>{f}</SelectItem>))}
              </SelectContent>
            </Select>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={() => {
                setSearch(""); setPlatform("all"); setTheme("all"); setTone("all"); setFormat("all"); setPage(1)
              }}>
                <X className="h-3.5 w-3.5 mr-1" />Limpiar
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Ordenar por:</span>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Fecha</SelectItem>
                  <SelectItem value="views">Vistas</SelectItem>
                  <SelectItem value="confidence">Confianza</SelectItem>
                  <SelectItem value="risk">Riesgo</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSortOrder(o => o === "asc" ? "desc" : "asc")}>
                {sortOrder === "desc" ? <SortDesc className="h-3.5 w-3.5" /> : <SortAsc className="h-3.5 w-3.5" />}
              </Button>
            </div>
            <div className="flex items-center gap-1">
              <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setViewMode("grid")}>
                <Grid3X3 className="h-3.5 w-3.5" />
              </Button>
              <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setViewMode("list")}>
                <List className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de contenidos */}
      {viewMode === "grid" ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {paginated.map((content) => (
            <Dialog key={content.id}>
              <DialogTrigger asChild>
                <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm leading-snug line-clamp-2">{content.title}</CardTitle>
                      {content.aiTags.riskLevel === "Alto" && (<AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />)}
                    </div>
                    <p className="text-xs text-muted-foreground">{content.author} - {content.publishedAt}</p>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-2">
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs py-0">{PLATFORM_LABELS[content.platform]}</Badge>
                      <Badge variant="secondary" className="text-xs py-0">{content.format}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {content.aiTags.themes.map((t) => (
                        <Badge key={t} className="text-xs bg-primary/10 text-primary border-0 py-0">{t}</Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
                      <span>{content.metrics.views.toLocaleString("es-ES")} vistas</span>
                      <span className="font-mono">{Math.round(content.aiTags.confidence * 100)}% conf.</span>
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <ContentDetailDialog content={content} />
            </Dialog>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {paginated.map((content) => (
                <Dialog key={content.id}>
                  <DialogTrigger asChild>
                    <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-secondary/30 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-card-foreground truncate">{content.title}</p>
                          {content.aiTags.riskLevel === "Alto" && <AlertTriangle className="h-3.5 w-3.5 text-destructive flex-shrink-0" />}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs py-0">{PLATFORM_LABELS[content.platform]}</Badge>
                          {content.aiTags.themes.slice(0, 2).map(t => (
                            <Badge key={t} className="text-xs bg-primary/10 text-primary border-0 py-0">{t}</Badge>
                          ))}
                          <span className="text-xs text-muted-foreground">{content.author}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-semibold text-card-foreground">{content.metrics.views.toLocaleString("es-ES")}</p>
                        <p className="text-xs text-muted-foreground">{Math.round(content.aiTags.confidence * 100)}% conf.</p>
                      </div>
                    </div>
                  </DialogTrigger>
                  <ContentDetailDialog content={content} />
                </Dialog>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {(page - 1) * ITEMS_PER_PAGE + 1}-{Math.min(page * ITEMS_PER_PAGE, filtered.length)} de {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum: number
              if (totalPages <= 7) pageNum = i + 1
              else if (page <= 4) pageNum = i + 1
              else if (page >= totalPages - 3) pageNum = totalPages - 6 + i
              else pageNum = page - 3 + i
              return (
                <Button key={pageNum} variant={pageNum === page ? "default" : "outline"} size="sm" className="w-8 h-8 p-0"
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </Button>
              )
            })}
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No se encontraron contenidos con los filtros aplicados</p>
        </div>
      )}
    </div>
  )
}
