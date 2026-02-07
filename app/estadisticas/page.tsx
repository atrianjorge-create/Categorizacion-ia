"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { SEED_CONTENTS, SEED_PROFILES } from "@/lib/seed-data"
import { THEMES, TONES, INTENTS, FORMATS, PLATFORM_LABELS, PLATFORM_COLORS, type Theme, type Platform } from "@/lib/types"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts"
import {
  BarChart3, Eye, TrendingUp, AlertTriangle, Clock, ThumbsUp,
  MessageSquare, Share2, Bookmark, Activity, Target, ShieldAlert,
  Percent, ArrowUp, ArrowDown, Minus, Zap, Hash, FileText,
} from "lucide-react"

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

export default function EstadisticasPage() {
  const contents = SEED_CONTENTS
  const profiles = SEED_PROFILES

  const stats = useMemo(() => {
    const total = contents.length
    const totalViews = contents.reduce((s, c) => s + c.metrics.views, 0)
    const totalLikes = contents.reduce((s, c) => s + c.metrics.likes, 0)
    const totalComments = contents.reduce((s, c) => s + c.metrics.comments, 0)
    const totalShares = contents.reduce((s, c) => s + c.metrics.shares, 0)
    const totalSaved = contents.reduce((s, c) => s + c.metrics.savedCount, 0)
    const totalWatchTime = contents.reduce((s, c) => s + c.metrics.estimatedWatchTime, 0)
    const avgConfidence = contents.reduce((s, c) => s + c.aiTags.confidence, 0) / total
    const avgViews = totalViews / total
    const avgLikes = totalLikes / total
    const engRate = totalViews > 0 ? (totalLikes + totalComments) / totalViews * 100 : 0

    // Per platform stats
    const platformStats = (["instagram", "tiktok", "youtube", "twitter", "linkedin"] as Platform[]).map(p => {
      const pc = contents.filter(c => c.platform === p)
      const pViews = pc.reduce((s, c) => s + c.metrics.views, 0)
      const pLikes = pc.reduce((s, c) => s + c.metrics.likes, 0)
      const pComments = pc.reduce((s, c) => s + c.metrics.comments, 0)
      const pShares = pc.reduce((s, c) => s + c.metrics.shares, 0)
      return {
        platform: p,
        label: PLATFORM_LABELS[p],
        color: PLATFORM_COLORS[p],
        count: pc.length,
        views: pViews,
        likes: pLikes,
        comments: pComments,
        shares: pShares,
        engRate: pViews > 0 ? (pLikes + pComments) / pViews * 100 : 0,
        avgConfidence: pc.length > 0 ? pc.reduce((s, c) => s + c.aiTags.confidence, 0) / pc.length * 100 : 0,
        highRisk: pc.filter(c => c.aiTags.riskLevel === "Alto").length,
      }
    }).filter(p => p.count > 0)

    // Per theme stats
    const themeStats = THEMES.map((t, i) => {
      const tc = contents.filter(c => c.aiTags.themes.includes(t))
      const tViews = tc.reduce((s, c) => s + c.metrics.views, 0)
      const tLikes = tc.reduce((s, c) => s + c.metrics.likes, 0)
      return {
        theme: t,
        count: tc.length,
        views: tViews,
        likes: tLikes,
        engRate: tViews > 0 ? (tLikes + tc.reduce((s, c) => s + c.metrics.comments, 0)) / tViews * 100 : 0,
        avgConfidence: tc.length > 0 ? tc.reduce((s, c) => s + c.aiTags.confidence, 0) / tc.length * 100 : 0,
        color: CHART_COLORS[i],
      }
    }).sort((a, b) => b.count - a.count)

    // Monthly trends
    const months = ["2025-01", "2025-02", "2025-03", "2025-04", "2025-05", "2025-06"]
    const labels = ["Ene", "Feb", "Mar", "Abr", "May", "Jun"]
    const monthlyData = months.map((m, i) => {
      const mc = contents.filter(c => c.publishedAt.startsWith(m))
      return {
        month: labels[i],
        contenidos: mc.length,
        vistas: mc.reduce((s, c) => s + c.metrics.views, 0),
        likes: mc.reduce((s, c) => s + c.metrics.likes, 0),
        confianza: mc.length > 0 ? Number((mc.reduce((s, c) => s + c.aiTags.confidence, 0) / mc.length * 100).toFixed(1)) : 0,
      }
    })

    // Top keywords
    const keywordMap: Record<string, number> = {}
    contents.forEach(c => c.aiTags.keywords.forEach(k => { keywordMap[k] = (keywordMap[k] || 0) + 1 }))
    const topKeywords = Object.entries(keywordMap).sort(([, a], [, b]) => b - a).slice(0, 20)

    // Authors
    const authorMap: Record<string, { count: number; views: number }> = {}
    contents.forEach(c => {
      if (!authorMap[c.author]) authorMap[c.author] = { count: 0, views: 0 }
      authorMap[c.author].count++
      authorMap[c.author].views += c.metrics.views
    })
    const topAuthors = Object.entries(authorMap).sort(([, a], [, b]) => b.views - a.views).slice(0, 10)

    // Cross-tab: theme x tone
    const themeToneCross = THEMES.slice(0, 6).map(theme => {
      const row: Record<string, unknown> = { theme }
      TONES.forEach(tone => {
        row[tone] = contents.filter(c => c.aiTags.themes.includes(theme) && c.aiTags.tone === tone).length
      })
      return row
    })

    return {
      total, totalViews, totalLikes, totalComments, totalShares, totalSaved, totalWatchTime,
      avgConfidence, avgViews, avgLikes, engRate,
      platformStats, themeStats, monthlyData, topKeywords, topAuthors, themeToneCross,
    }
  }, [contents])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground text-balance">Estadisticas Avanzadas</h1>
        <p className="text-muted-foreground mt-1">
          Analisis profundo de {stats.total} contenidos: metricas de engagement, rendimiento por plataforma,
          distribucion tematica y analisis de calidad del modelo IA.
        </p>
      </div>

      {/* Mega KPI Grid */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {[
          { label: "Contenidos", value: stats.total.toLocaleString(), icon: FileText, color: "text-primary" },
          { label: "Vistas Totales", value: stats.totalViews >= 1000000 ? `${(stats.totalViews/1000000).toFixed(1)}M` : `${(stats.totalViews/1000).toFixed(0)}K`, icon: Eye, color: "text-[hsl(var(--chart-3))]" },
          { label: "Engagement Rate", value: `${stats.engRate.toFixed(2)}%`, icon: TrendingUp, color: "text-[hsl(var(--success))]" },
          { label: "Confianza IA", value: `${(stats.avgConfidence * 100).toFixed(1)}%`, icon: Percent, color: "text-primary" },
          { label: "Perfiles", value: profiles.length.toString(), icon: Target, color: "text-[hsl(var(--chart-4))]" },
          { label: "Total Likes", value: stats.totalLikes >= 1000000 ? `${(stats.totalLikes/1000000).toFixed(1)}M` : `${(stats.totalLikes/1000).toFixed(0)}K`, icon: ThumbsUp, color: "text-primary" },
          { label: "Comentarios", value: stats.totalComments.toLocaleString(), icon: MessageSquare, color: "text-[hsl(var(--chart-2))]" },
          { label: "Shares", value: stats.totalShares.toLocaleString(), icon: Share2, color: "text-[hsl(var(--chart-5))]" },
          { label: "Guardados", value: stats.totalSaved.toLocaleString(), icon: Bookmark, color: "text-[hsl(var(--warning))]" },
          { label: "Watch Time", value: `${Math.round(stats.totalWatchTime/3600)}h`, icon: Clock, color: "text-muted-foreground" },
        ].map(kpi => (
          <Card key={kpi.label}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-1">
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
              <p className="text-xl font-bold text-card-foreground">{kpi.value}</p>
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="plataformas" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="plataformas">Por Plataforma</TabsTrigger>
          <TabsTrigger value="temas">Por Tema</TabsTrigger>
          <TabsTrigger value="temporal">Tendencias</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
          <TabsTrigger value="cruzado">Analisis Cruzado</TabsTrigger>
          <TabsTrigger value="autores">Autores</TabsTrigger>
        </TabsList>

        {/* Platform deep dive */}
        <TabsContent value="plataformas" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Contenidos por Plataforma</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.platformStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {stats.platformStats.map(ps => (<Cell key={ps.platform} fill={ps.color} />))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Engagement Rate por Plataforma</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.platformStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v.toFixed(1)}%`} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v.toFixed(2)}%`} />
                    <Bar dataKey="engRate" radius={[4, 4, 0, 0]} name="Eng. Rate">
                      {stats.platformStats.map(ps => (<Cell key={ps.platform} fill={ps.color} />))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Detalle Completo por Plataforma</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plataforma</TableHead>
                    <TableHead className="text-center">Posts</TableHead>
                    <TableHead className="text-center">Vistas</TableHead>
                    <TableHead className="text-center">Likes</TableHead>
                    <TableHead className="text-center">Comentarios</TableHead>
                    <TableHead className="text-center">Shares</TableHead>
                    <TableHead className="text-center">Eng. Rate</TableHead>
                    <TableHead className="text-center">Conf. IA</TableHead>
                    <TableHead className="text-center">Riesgo Alto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.platformStats.map(ps => (
                    <TableRow key={ps.platform}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ps.color }} />
                          <span className="font-medium text-sm">{ps.label}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-sm">{ps.count}</TableCell>
                      <TableCell className="text-center text-sm">{ps.views.toLocaleString()}</TableCell>
                      <TableCell className="text-center text-sm">{ps.likes.toLocaleString()}</TableCell>
                      <TableCell className="text-center text-sm">{ps.comments.toLocaleString()}</TableCell>
                      <TableCell className="text-center text-sm">{ps.shares.toLocaleString()}</TableCell>
                      <TableCell className="text-center text-sm font-semibold">{ps.engRate.toFixed(2)}%</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Progress value={ps.avgConfidence} className="w-12 h-1.5" />
                          <span className="text-xs font-mono">{ps.avgConfidence.toFixed(0)}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {ps.highRisk > 0 ? (
                          <Badge variant="destructive" className="text-xs">{ps.highRisk}</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">0</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Theme deep dive */}
        <TabsContent value="temas" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Distribucion Tematica</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={stats.themeStats} layout="vertical" margin={{ left: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="theme" type="category" tick={{ fontSize: 10 }} width={75} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {stats.themeStats.map(ts => (<Cell key={ts.theme} fill={ts.color} />))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Engagement por Tema</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={stats.themeStats.slice(0, 8)}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="theme" tick={{ fontSize: 9 }} />
                    <PolarRadiusAxis tick={{ fontSize: 9 }} />
                    <Radar name="Eng. Rate" dataKey="engRate" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
                    <Radar name="Confianza" dataKey="avgConfidence" stroke="hsl(var(--success))" fill="hsl(var(--success))" fillOpacity={0.1} strokeWidth={1} strokeDasharray="5 5" />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v.toFixed(2)}%`} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Ranking de Temas</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Tema</TableHead>
                    <TableHead className="text-center">Contenidos</TableHead>
                    <TableHead className="text-center">Vistas</TableHead>
                    <TableHead className="text-center">Likes</TableHead>
                    <TableHead className="text-center">Eng. Rate</TableHead>
                    <TableHead className="text-center">Confianza</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.themeStats.map((ts, i) => (
                    <TableRow key={ts.theme}>
                      <TableCell className="font-bold text-muted-foreground">{i + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ts.color }} />
                          <span className="font-medium text-sm">{ts.theme}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-sm">{ts.count}</TableCell>
                      <TableCell className="text-center text-sm">{ts.views.toLocaleString()}</TableCell>
                      <TableCell className="text-center text-sm">{ts.likes.toLocaleString()}</TableCell>
                      <TableCell className="text-center text-sm font-semibold">{ts.engRate.toFixed(2)}%</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Progress value={ts.avgConfidence} className="w-12 h-1.5" />
                          <span className="text-xs font-mono">{ts.avgConfidence.toFixed(0)}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Temporal */}
        <TabsContent value="temporal" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Evolucion de Contenidos y Vistas</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={stats.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickFormatter={v => v >= 1000000 ? `${(v/1000000).toFixed(0)}M` : `${(v/1000).toFixed(0)}K`} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area yAxisId="right" type="monotone" dataKey="vistas" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3))" fillOpacity={0.1} name="Vistas" />
                  <Area yAxisId="left" type="monotone" dataKey="contenidos" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} name="Contenidos" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Confianza IA Mensual</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={stats.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={[60, 100]} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v}%`} />
                  <Line type="monotone" dataKey="confianza" stroke="hsl(var(--primary))" strokeWidth={2} name="Confianza" dot={{ fill: "hsl(var(--primary))", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Keywords */}
        <TabsContent value="keywords" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Hash className="h-5 w-5 text-primary" />
                <CardTitle className="text-sm font-semibold">Top 20 Palabras Clave</CardTitle>
              </div>
              <p className="text-xs text-muted-foreground">Frecuencia de aparicion en los contenidos analizados</p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 md:grid-cols-2">
                {stats.topKeywords.map(([keyword, count], i) => (
                  <div key={keyword} className="flex items-center gap-3 py-1.5 px-2 rounded hover:bg-secondary/30">
                    <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-card-foreground">{keyword}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Progress value={(count / stats.topKeywords[0][1]) * 100} className="w-16 h-1.5" />
                      <span className="text-xs font-mono text-muted-foreground w-6 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cross analysis: Theme x Tone */}
        <TabsContent value="cruzado" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Analisis Cruzado: Tema vs Tono</CardTitle>
              <p className="text-xs text-muted-foreground">Cantidad de contenidos por combinacion de tema y tono (top 6 temas)</p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tema</TableHead>
                      {TONES.map(t => (<TableHead key={t} className="text-center text-xs">{t}</TableHead>))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.themeToneCross.map(row => (
                      <TableRow key={row.theme as string}>
                        <TableCell className="font-medium text-sm">{row.theme as string}</TableCell>
                        {TONES.map(t => {
                          const val = row[t] as number
                          return (
                            <TableCell key={t} className="text-center">
                              <div className="inline-flex items-center justify-center w-8 h-6 rounded text-xs font-semibold"
                                style={{ backgroundColor: val > 0 ? `hsla(217, 91%, 50%, ${Math.min(val * 0.15, 0.6)})` : "transparent" }}
                              >
                                <span className="text-card-foreground">{val}</span>
                              </div>
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Tema vs Tono (Barras Agrupadas)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={stats.themeToneCross}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="theme" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  {TONES.map((tone, i) => (
                    <Bar key={tone} dataKey={tone} fill={CHART_COLORS[i]} radius={[2, 2, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Authors */}
        <TabsContent value="autores" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Top 10 Creadores por Alcance</CardTitle>
              <p className="text-xs text-muted-foreground">Autores con mayor numero de vistas acumuladas</p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Autor</TableHead>
                    <TableHead className="text-center">Contenidos</TableHead>
                    <TableHead className="text-center">Vistas Totales</TableHead>
                    <TableHead className="text-center">Vistas/Post</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.topAuthors.map(([author, data], i) => (
                    <TableRow key={author}>
                      <TableCell className="font-bold text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="font-medium text-sm font-mono">{author}</TableCell>
                      <TableCell className="text-center text-sm">{data.count}</TableCell>
                      <TableCell className="text-center text-sm font-semibold">{data.views.toLocaleString()}</TableCell>
                      <TableCell className="text-center text-sm">{Math.round(data.views / data.count).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
