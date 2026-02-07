"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { SEED_PROFILES, SEED_CONTENTS } from "@/lib/seed-data"
import { THEMES, TONES, INTENTS, FORMATS, PLATFORM_LABELS, PLATFORM_COLORS, type Platform, type Theme } from "@/lib/types"
import {
  FileBarChart, Download, FileText, BarChart3, Eye, TrendingUp,
  AlertTriangle, ThumbsUp, MessageSquare, Share2, Bookmark, Clock,
  Percent, Target, Users, Shield, CheckCircle, AlertCircle,
  Hash, Activity, Layers, Printer,
} from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts"

const CHART_COLORS = [
  "hsl(217, 91%, 50%)", "hsl(160, 60%, 45%)", "hsl(30, 80%, 55%)",
  "hsl(340, 65%, 55%)", "hsl(45, 90%, 55%)", "hsl(270, 60%, 55%)",
  "hsl(190, 70%, 45%)", "hsl(10, 75%, 55%)", "hsl(140, 50%, 40%)",
  "hsl(55, 80%, 50%)", "hsl(300, 50%, 50%)", "hsl(200, 60%, 50%)",
]

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  color: "hsl(var(--card-foreground))",
}

export default function ReportesPage() {
  const [selectedProfile, setSelectedProfile] = useState("all")
  const [reportType, setReportType] = useState("general")

  const contents = useMemo(() => {
    if (selectedProfile === "all") return SEED_CONTENTS
    const profile = SEED_PROFILES.find((p) => p.id === selectedProfile)
    if (!profile) return SEED_CONTENTS
    const topInterests = Object.entries(profile.interests)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([t]) => t)
    return SEED_CONTENTS.filter(
      (c) => c.aiTags.themes.some((t) => topInterests.includes(t)) && profile.platforms.includes(c.platform)
    )
  }, [selectedProfile])

  const stats = useMemo(() => {
    const total = contents.length
    const totalViews = contents.reduce((s, c) => s + c.metrics.views, 0)
    const totalLikes = contents.reduce((s, c) => s + c.metrics.likes, 0)
    const totalComments = contents.reduce((s, c) => s + c.metrics.comments, 0)
    const totalShares = contents.reduce((s, c) => s + c.metrics.shares, 0)
    const totalSaved = contents.reduce((s, c) => s + c.metrics.savedCount, 0)
    const totalWatchTime = contents.reduce((s, c) => s + c.metrics.estimatedWatchTime, 0)
    const avgConfidence = total > 0 ? contents.reduce((s, c) => s + c.aiTags.confidence, 0) / total : 0
    const engRate = totalViews > 0 ? ((totalLikes + totalComments) / totalViews) * 100 : 0
    const highRisk = contents.filter((c) => c.aiTags.riskLevel === "Alto").length
    const medRisk = contents.filter((c) => c.aiTags.riskLevel === "Medio").length

    // By theme
    const themeStats = THEMES.map((t, i) => {
      const tc = contents.filter((c) => c.aiTags.themes.includes(t))
      return {
        theme: t,
        count: tc.length,
        pct: total > 0 ? ((tc.length / total) * 100).toFixed(1) : "0",
        views: tc.reduce((s, c) => s + c.metrics.views, 0),
        engRate: tc.reduce((s, c) => s + c.metrics.views, 0) > 0
          ? (((tc.reduce((s, c) => s + c.metrics.likes, 0) + tc.reduce((s, c) => s + c.metrics.comments, 0)) / tc.reduce((s, c) => s + c.metrics.views, 0)) * 100).toFixed(2)
          : "0",
        color: CHART_COLORS[i],
      }
    }).sort((a, b) => b.count - a.count)

    // By platform
    const platformStats = (["instagram", "tiktok", "youtube", "twitter", "linkedin"] as Platform[]).map((p) => {
      const pc = contents.filter((c) => c.platform === p)
      return {
        platform: p,
        label: PLATFORM_LABELS[p],
        color: PLATFORM_COLORS[p],
        count: pc.length,
        pct: total > 0 ? ((pc.length / total) * 100).toFixed(1) : "0",
        views: pc.reduce((s, c) => s + c.metrics.views, 0),
      }
    }).filter((p) => p.count > 0)

    // By tone
    const toneStats = TONES.map((t) => {
      const tc = contents.filter((c) => c.aiTags.tone === t)
      return { tone: t, count: tc.length, pct: total > 0 ? ((tc.length / total) * 100).toFixed(1) : "0" }
    })

    // By intent
    const intentStats = INTENTS.map((i) => {
      const ic = contents.filter((c) => c.aiTags.intent === i)
      return { intent: i, count: ic.length, pct: total > 0 ? ((ic.length / total) * 100).toFixed(1) : "0" }
    })

    // Top keywords
    const keywordMap: Record<string, number> = {}
    contents.forEach((c) => c.aiTags.keywords.forEach((k) => { keywordMap[k] = (keywordMap[k] || 0) + 1 }))
    const topKeywords = Object.entries(keywordMap).sort(([, a], [, b]) => b - a).slice(0, 15)

    // High risk contents
    const highRiskContents = contents.filter((c) => c.aiTags.riskLevel === "Alto").slice(0, 10)

    return {
      total, totalViews, totalLikes, totalComments, totalShares, totalSaved,
      totalWatchTime, avgConfidence, engRate, highRisk, medRisk,
      themeStats, platformStats, toneStats, intentStats, topKeywords, highRiskContents,
    }
  }, [contents])

  const currentDate = new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })
  const profileName = selectedProfile === "all" ? "Todos los perfiles" : SEED_PROFILES.find((p) => p.id === selectedProfile)?.name

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground text-balance">Informes y Reportes</h1>
          <p className="text-muted-foreground mt-1">
            Genera informes detallados de la categorizacion de contenidos. Los datos se calculan en tiempo real
            a partir del dataset disponible.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-transparent" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-1.5" />
            Imprimir
          </Button>
        </div>
      </div>

      {/* Report config */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-foreground">Perfil</p>
              <Select value={selectedProfile} onValueChange={setSelectedProfile}>
                <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los perfiles</SelectItem>
                  {SEED_PROFILES.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <Separator orientation="vertical" className="h-10" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Fecha del informe: {currentDate}</p>
              <p className="text-xs text-muted-foreground">Dataset: {stats.total} contenidos | {SEED_PROFILES.length} perfiles</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Header */}
      <Card className="border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <FileBarChart className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-lg font-bold text-foreground">Informe de Categorizacion de Contenidos</h2>
              <p className="text-sm text-muted-foreground">Perfil: {profileName} | Generado: {currentDate}</p>
            </div>
          </div>
          <Separator className="mb-4" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            Este informe presenta un analisis completo de la categorizacion de {stats.total} contenidos de redes sociales
            utilizando inteligencia artificial. Se evaluan las dimensiones de tema, tono, intencion y nivel de riesgo,
            junto con metricas de engagement e indicadores de calidad del modelo.
          </p>
        </CardContent>
      </Card>

      {/* Resumen Ejecutivo */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">1. Resumen Ejecutivo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {[
              { label: "Contenidos Analizados", value: stats.total.toLocaleString(), icon: Layers, color: "text-primary" },
              { label: "Vistas Totales", value: stats.totalViews >= 1000000 ? `${(stats.totalViews / 1000000).toFixed(1)}M` : `${(stats.totalViews / 1000).toFixed(0)}K`, icon: Eye, color: "text-[hsl(var(--chart-3))]" },
              { label: "Engagement Rate", value: `${stats.engRate.toFixed(2)}%`, icon: TrendingUp, color: "text-[hsl(var(--success))]" },
              { label: "Confianza IA Media", value: `${(stats.avgConfidence * 100).toFixed(1)}%`, icon: Percent, color: "text-primary" },
              { label: "Contenidos Alto Riesgo", value: stats.highRisk.toString(), icon: AlertTriangle, color: "text-destructive" },
            ].map((kpi) => (
              <div key={kpi.label} className="rounded-lg border p-3 text-center">
                <kpi.icon className={`h-4 w-4 mx-auto mb-1.5 ${kpi.color}`} />
                <p className="text-xl font-bold text-foreground">{kpi.value}</p>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
              </div>
            ))}
          </div>

          <div className="rounded-lg bg-secondary/30 p-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Hallazgos clave:</strong> Se analizaron {stats.total} contenidos con una confianza
              media del modelo de {(stats.avgConfidence * 100).toFixed(1)}%. El engagement rate global es del {stats.engRate.toFixed(2)}%.
              Se identificaron {stats.highRisk} contenidos de alto riesgo ({stats.total > 0 ? ((stats.highRisk / stats.total) * 100).toFixed(1) : "0"}% del total)
              y {stats.medRisk} de riesgo medio. La tematica predominante es &ldquo;{stats.themeStats[0]?.theme}&rdquo;
              con {stats.themeStats[0]?.count} contenidos ({stats.themeStats[0]?.pct}% del total).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Distribucion Tematica */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">2. Distribucion Tematica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.themeStats.slice(0, 8)} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="theme" type="category" tick={{ fontSize: 10 }} width={75} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" name="Contenidos" radius={[0, 4, 4, 0]}>
                  {stats.themeStats.slice(0, 8).map((ts) => (<Cell key={ts.theme} fill={ts.color} />))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tema</TableHead>
                  <TableHead className="text-center">N</TableHead>
                  <TableHead className="text-center">%</TableHead>
                  <TableHead className="text-center">Eng.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.themeStats.map((ts) => (
                  <TableRow key={ts.theme}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: ts.color }} />
                        <span className="text-sm">{ts.theme}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-sm">{ts.count}</TableCell>
                    <TableCell className="text-center text-sm">{ts.pct}%</TableCell>
                    <TableCell className="text-center text-sm">{ts.engRate}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Distribucion por Plataforma */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">3. Distribucion por Plataforma</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-2">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={stats.platformStats} dataKey="count" nameKey="label" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3} label={({ label, pct }) => `${label} (${pct}%)`}>
                  {stats.platformStats.map((ps) => (<Cell key={ps.platform} fill={ps.color} />))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plataforma</TableHead>
                  <TableHead className="text-center">Contenidos</TableHead>
                  <TableHead className="text-center">%</TableHead>
                  <TableHead className="text-center">Vistas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.platformStats.map((ps) => (
                  <TableRow key={ps.platform}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: ps.color }} />
                        <span className="text-sm font-medium">{ps.label}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-sm">{ps.count}</TableCell>
                    <TableCell className="text-center text-sm">{ps.pct}%</TableCell>
                    <TableCell className="text-center text-sm">{ps.views.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Tono e Intencion */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">4. Analisis de Tono e Intencion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-foreground mb-3">Distribucion de Tono</p>
              <div className="space-y-2">
                {stats.toneStats.filter((t) => t.count > 0).map((t) => (
                  <div key={t.tone} className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-24">{t.tone}</span>
                    <Progress value={Number(t.pct)} className="h-3 flex-1" />
                    <span className="text-sm font-mono text-foreground w-16 text-right">{t.count} ({t.pct}%)</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-3">Distribucion de Intencion</p>
              <div className="space-y-2">
                {stats.intentStats.filter((i) => i.count > 0).map((i) => (
                  <div key={i.intent} className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-24">{i.intent}</span>
                    <Progress value={Number(i.pct)} className="h-3 flex-1" />
                    <span className="text-sm font-mono text-foreground w-16 text-right">{i.count} ({i.pct}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Evaluacion de Riesgo */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">5. Evaluacion de Riesgo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { level: "Bajo", icon: CheckCircle, color: "text-[hsl(var(--success))]", border: "border-[hsl(var(--success))]/30", count: stats.total - stats.highRisk - stats.medRisk },
              { level: "Medio", icon: AlertCircle, color: "text-[hsl(var(--warning))]", border: "border-[hsl(var(--warning))]/30", count: stats.medRisk },
              { level: "Alto", icon: AlertTriangle, color: "text-destructive", border: "border-destructive/30", count: stats.highRisk },
            ].map((r) => (
              <div key={r.level} className={`rounded-lg border p-4 text-center ${r.border}`}>
                <r.icon className={`h-6 w-6 mx-auto mb-2 ${r.color}`} />
                <p className="text-2xl font-bold text-foreground">{r.count}</p>
                <p className="text-sm text-muted-foreground">Riesgo {r.level}</p>
                <p className="text-xs text-muted-foreground">{stats.total > 0 ? ((r.count / stats.total) * 100).toFixed(1) : "0"}%</p>
              </div>
            ))}
          </div>

          {stats.highRiskContents.length > 0 && (
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Contenidos de Alto Riesgo Detectados:</p>
              <div className="space-y-2">
                {stats.highRiskContents.map((c) => (
                  <div key={c.id} className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                    <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{c.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-xs">{PLATFORM_LABELS[c.platform]}</Badge>
                        <span className="text-xs text-muted-foreground">Intencion: {c.aiTags.intent}</span>
                        <span className="text-xs text-muted-foreground">Conf: {Math.round(c.aiTags.confidence * 100)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Keywords */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">6. Palabras Clave Mas Frecuentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {stats.topKeywords.map(([keyword, count], i) => (
              <Badge
                key={keyword}
                variant={i < 5 ? "default" : "secondary"}
                className={`text-sm py-1 px-3 ${i < 5 ? "bg-primary text-primary-foreground" : ""}`}
              >
                {keyword} <span className="ml-1 font-mono opacity-70">({count})</span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Calidad del Modelo */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">7. Calidad del Modelo de Categorizacion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4 text-center">
              <p className="text-3xl font-bold text-primary">{(stats.avgConfidence * 100).toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">Confianza Media</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <p className="text-3xl font-bold text-foreground">
                {contents.filter((c) => c.aiTags.confidence >= 0.8).length}
              </p>
              <p className="text-sm text-muted-foreground">Conf. {">"} 80%</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <p className="text-3xl font-bold text-foreground">
                {contents.filter((c) => c.aiTags.confidence < 0.7).length}
              </p>
              <p className="text-sm text-muted-foreground">Conf. {"<"} 70% (revision)</p>
            </div>
          </div>
          <div className="rounded-lg bg-secondary/30 p-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Nota metodologica:</strong> El modelo utiliza un pipeline de categorizacion
              basado en deteccion de palabras clave, analisis de sentimiento y clasificacion de intenciones.
              Los contenidos con confianza inferior al 70% requieren revision manual. La explicabilidad
              de cada categorizacion se almacena junto con las etiquetas, permitiendo auditar las decisiones
              del modelo.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <Card className="border-primary/20">
        <CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">
            Informe generado automaticamente por el sistema Profile Categorization | {currentDate} | {stats.total} contenidos analizados
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
