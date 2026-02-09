"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Legend, AreaChart, Area, ScatterChart,
  Scatter, ZAxis,
} from "recharts"
import type { Content, Profile, Theme } from "@/lib/types"
import { THEMES, TONES, INTENTS, FORMATS, PLATFORM_LABELS, PLATFORM_COLORS } from "@/lib/types"
import {
  TrendingUp, TrendingDown, AlertTriangle, Eye, ThumbsUp, MessageSquare,
  Share2, Bookmark, Activity, ShieldAlert, BarChart3, Percent,
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

// ---- KPI CARDS (expanded) ----
export function KpiCards({ contents }: { contents: Content[] }) {
  const totalContents = contents.length
  const avgConfidence = contents.length > 0
    ? Math.floor(contents.reduce((sum, c) => sum + c.aiTags.confidence * 100, 0) / contents.length) / 100
    : 0
  const highRisk = contents.filter((c) => c.aiTags.riskLevel === "Alto").length
  const mediumRisk = contents.filter((c) => c.aiTags.riskLevel === "Medio").length
  const platforms = new Set(contents.map((c) => c.platform)).size
  const totalViews = contents.reduce((sum, c) => sum + c.metrics.views, 0)
  const totalLikes = contents.reduce((sum, c) => sum + c.metrics.likes, 0)
  const totalComments = contents.reduce((sum, c) => sum + c.metrics.comments, 0)
  const avgEngagement = contents.length > 0
    ? Math.floor((totalLikes + totalComments) / totalViews * 10000) / 100
    : 0

  const kpis = [
    {
      label: "Total Contenidos",
      value: totalContents.toLocaleString("es-ES"),
      description: "Analizados por IA",
      icon: BarChart3,
      color: "text-primary",
    },
    {
      label: "Confianza Media IA",
      value: `${Math.floor(avgConfidence * 100)}%`,
      description: "Score promedio del modelo",
      icon: Percent,
      color: "text-[hsl(var(--success))]",
    },
    {
      label: "Contenido de Riesgo",
      value: highRisk,
      description: `${mediumRisk} medio, ${highRisk} alto`,
      icon: ShieldAlert,
      color: "text-destructive",
      alert: highRisk > 0,
    },
    {
      label: "Plataformas Activas",
      value: platforms,
      description: "Fuentes analizadas",
      icon: Activity,
      color: "text-primary",
    },
    {
      label: "Vistas Totales",
      value: totalViews >= 1000000 ? `${Math.floor(totalViews / 100000) / 10}M` : `${Math.floor(totalViews / 1000)}K`,
      description: "Alcance acumulado",
      icon: Eye,
      color: "text-[hsl(var(--chart-3))]",
    },
    {
      label: "Engagement Rate",
      value: `${avgEngagement}%`,
      description: "(Likes + Comments) / Views",
      icon: TrendingUp,
      color: "text-[hsl(var(--success))]",
    },
    {
      label: "Total Likes",
      value: totalLikes >= 1000000 ? `${Math.floor(totalLikes / 100000) / 10}M` : `${Math.floor(totalLikes / 1000)}K`,
      description: "Reacciones positivas",
      icon: ThumbsUp,
      color: "text-primary",
    },
    {
      label: "Total Shares",
      value: contents.reduce((sum, c) => sum + c.metrics.shares, 0).toLocaleString("es-ES"),
      description: "Veces compartido",
      icon: Share2,
      color: "text-[hsl(var(--chart-4))]",
    },
  ]

  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.label} className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground truncate">{kpi.label}</p>
                <p className="text-xl font-bold text-card-foreground mt-0.5">{kpi.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{kpi.description}</p>
              </div>
              <div className={`flex-shrink-0 ${kpi.color}`}>
                <kpi.icon className="h-5 w-5" />
              </div>
            </div>
            {kpi.alert && (
              <Badge variant="destructive" className="absolute top-2 right-2 text-xs px-1.5 py-0">
                !
              </Badge>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ---- DISTRIBUCION POR CATEGORIAS (Barras horizontales) ----
export function ThemeDistributionChart({ contents }: { contents: Content[] }) {
  const data = THEMES.map((theme, i) => ({
    name: theme,
    count: contents.filter((c) => c.aiTags.themes.includes(theme)).length,
    fill: CHART_COLORS[i],
  })).sort((a, b) => b.count - a.count)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Distribucion por Categorias</CardTitle>
        <p className="text-xs text-muted-foreground">Cantidad de contenidos por tema principal</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={data} layout="vertical" margin={{ left: 80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={75} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// ---- DISTRIBUCION POR PLATAFORMA (Donut) ----
export function PlatformDistributionChart({ contents }: { contents: Content[] }) {
  const platforms = ["instagram", "tiktok", "youtube", "twitter", "linkedin"] as const
  const data = platforms.map((p) => ({
    name: PLATFORM_LABELS[p],
    value: contents.filter((c) => c.platform === p).length,
    color: PLATFORM_COLORS[p],
  })).filter((d) => d.value > 0)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Contenido por Plataforma</CardTitle>
        <p className="text-xs text-muted-foreground">Distribucion de contenidos analizados</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={340}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={100}
              paddingAngle={3} dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry) => (<Cell key={entry.name} fill={entry.color} />))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// ---- EVOLUCION TEMPORAL (Area chart) ----
export function TimelineChart({ contents }: { contents: Content[] }) {
  const months = ["2025-01", "2025-02", "2025-03", "2025-04", "2025-05", "2025-06"]
  const labels = ["Ene", "Feb", "Mar", "Abr", "May", "Jun"]
  const data = months.map((month, i) => {
    const mc = contents.filter((c) => c.publishedAt.startsWith(month))
    return {
      month: labels[i],
      total: mc.length,
      riskAlto: mc.filter((c) => c.aiTags.riskLevel === "Alto").length,
      riskMedio: mc.filter((c) => c.aiTags.riskLevel === "Medio").length,
      riskBajo: mc.filter((c) => c.aiTags.riskLevel === "Bajo").length,
      avgConfidence: mc.length > 0
        ? Number((mc.reduce((s, c) => s + c.aiTags.confidence, 0) / mc.length * 100).toFixed(1))
        : 0,
    }
  })

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Evolucion Temporal</CardTitle>
        <p className="text-xs text-muted-foreground">Contenidos por mes, nivel de riesgo y confianza</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="riskBajo" stackId="1" stroke="hsl(var(--success))" fill="hsl(var(--success))" fillOpacity={0.3} name="Riesgo Bajo" />
            <Area type="monotone" dataKey="riskMedio" stackId="1" stroke="hsl(var(--warning))" fill="hsl(var(--warning))" fillOpacity={0.3} name="Riesgo Medio" />
            <Area type="monotone" dataKey="riskAlto" stackId="1" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.3} name="Riesgo Alto" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// ---- TONO CHART ----
export function ToneChart({ contents }: { contents: Content[] }) {
  const data = TONES.map((tone, i) => ({
    name: tone,
    value: contents.filter((c) => c.aiTags.tone === tone).length,
    fill: CHART_COLORS[i],
  }))

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Distribucion por Tono</CardTitle>
        <p className="text-xs text-muted-foreground">Analisis de sentimiento del contenido</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((entry) => (<Cell key={entry.name} fill={entry.fill} />))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// ---- INTENCION CHART ----
export function IntentChart({ contents }: { contents: Content[] }) {
  const data = INTENTS.map((intent, i) => ({
    name: intent,
    value: contents.filter((c) => c.aiTags.intent === intent).length,
    fill: CHART_COLORS[i + 5],
  }))

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Intencion del Contenido</CardTitle>
        <p className="text-xs text-muted-foreground">Proposito detectado por la IA</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" outerRadius={90} dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry) => (<Cell key={entry.name} fill={entry.fill} />))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// ---- FORMAT DISTRIBUTION ----
export function FormatDistributionChart({ contents }: { contents: Content[] }) {
  const data = FORMATS.map((format, i) => ({
    name: format,
    value: contents.filter((c) => c.format === format).length,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  })).filter(d => d.value > 0).sort((a, b) => b.value - a.value)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Formatos de Contenido</CardTitle>
        <p className="text-xs text-muted-foreground">Tipos de formato analizados</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" height={50} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((entry) => (<Cell key={entry.name} fill={entry.fill} />))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// ---- CONFIDENCE DISTRIBUTION ----
export function ConfidenceDistributionChart({ contents }: { contents: Content[] }) {
  const buckets = [
    { range: "50-60%", min: 0.5, max: 0.6 },
    { range: "60-70%", min: 0.6, max: 0.7 },
    { range: "70-80%", min: 0.7, max: 0.8 },
    { range: "80-90%", min: 0.8, max: 0.9 },
    { range: "90-100%", min: 0.9, max: 1.01 },
  ]

  const data = buckets.map((b) => ({
    range: b.range,
    count: contents.filter((c) => c.aiTags.confidence >= b.min && c.aiTags.confidence < b.max).length,
  }))

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Distribucion de Confianza</CardTitle>
        <p className="text-xs text-muted-foreground">Fiabilidad del modelo de IA por rango</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="range" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// ---- ENGAGEMENT SCATTER ----
export function EngagementScatterChart({ contents }: { contents: Content[] }) {
  const data = contents.map((c) => ({
    views: c.metrics.views,
    engagement: c.metrics.likes + c.metrics.comments,
    confidence: c.aiTags.confidence * 100,
    title: c.title.slice(0, 30),
    risk: c.aiTags.riskLevel,
  }))

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Engagement vs Alcance</CardTitle>
        <p className="text-xs text-muted-foreground">Relacion entre vistas y engagement (likes + comentarios)</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis type="number" dataKey="views" name="Vistas" tick={{ fontSize: 10 }}
              tickFormatter={(v) => v >= 1000000 ? `${(v/1000000).toFixed(0)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : v}
            />
            <YAxis type="number" dataKey="engagement" name="Engagement" tick={{ fontSize: 10 }}
              tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v}
            />
            <ZAxis type="number" dataKey="confidence" range={[30, 150]} name="Confianza" />
            <Tooltip contentStyle={tooltipStyle} formatter={(value: number, name: string) => [
              name === "Vistas" ? value.toLocaleString("es-ES") : name === "Engagement" ? value.toLocaleString("es-ES") : `${value.toFixed(0)}%`,
              name === "Vistas" ? "Vistas" : name === "Engagement" ? "Engagement" : "Confianza"
            ]} />
            <Scatter data={data} fill="hsl(var(--primary))" fillOpacity={0.6} />
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// ---- RISK HEATMAP ----
export function RiskHeatmap({ contents }: { contents: Content[] }) {
  const platforms = ["instagram", "tiktok", "youtube", "twitter", "linkedin"] as const
  const risks = ["Bajo", "Medio", "Alto"] as const

  const maxCount = Math.max(
    ...platforms.flatMap(p => risks.map(r =>
      contents.filter(c => c.platform === p && c.aiTags.riskLevel === r).length
    )),
    1
  )

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Mapa de Riesgo por Plataforma</CardTitle>
        <p className="text-xs text-muted-foreground">Concentracion de riesgo en cada plataforma</p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-xs font-medium text-muted-foreground text-left py-2 pr-3">Plataforma</th>
                {risks.map(r => (
                  <th key={r} className="text-xs font-medium text-muted-foreground text-center py-2 px-2">{r}</th>
                ))}
                <th className="text-xs font-medium text-muted-foreground text-center py-2 px-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {platforms.map(p => {
                const total = contents.filter(c => c.platform === p).length
                return (
                  <tr key={p} className="border-t border-border">
                    <td className="text-sm font-medium text-card-foreground py-2 pr-3">{PLATFORM_LABELS[p]}</td>
                    {risks.map(r => {
                      const count = contents.filter(c => c.platform === p && c.aiTags.riskLevel === r).length
                      const intensity = count / maxCount
                      const bgColor = r === "Alto"
                        ? `rgba(239, 68, 68, ${intensity * 0.6})`
                        : r === "Medio"
                          ? `rgba(234, 179, 8, ${intensity * 0.6})`
                          : `rgba(34, 197, 94, ${intensity * 0.6})`
                      return (
                        <td key={r} className="text-center py-2 px-2">
                          <div className="inline-flex items-center justify-center w-12 h-8 rounded text-xs font-semibold text-card-foreground"
                            style={{ backgroundColor: bgColor }}
                          >
                            {count}
                          </div>
                        </td>
                      )
                    })}
                    <td className="text-center py-2 px-2">
                      <span className="text-sm font-semibold text-card-foreground">{total}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

// ---- TOP CONTENTS TABLE ----
export function TopContentsCard({ contents }: { contents: Content[] }) {
  const sorted = [...contents].sort((a, b) => b.metrics.views - a.metrics.views).slice(0, 8)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Top Contenidos por Alcance</CardTitle>
        <p className="text-xs text-muted-foreground">Los 8 contenidos con mas vistas</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sorted.map((c, i) => (
            <div key={c.id} className="flex items-center gap-3 py-1.5 rounded hover:bg-secondary/30 px-2 -mx-2">
              <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-card-foreground truncate">{c.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="outline" className="text-xs py-0">{PLATFORM_LABELS[c.platform]}</Badge>
                  <span className="text-xs text-muted-foreground">{c.aiTags.primaryTheme}</span>
                  {c.aiTags.riskLevel === "Alto" && (
                    <AlertTriangle className="h-3 w-3 text-destructive" />
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold text-card-foreground">{c.metrics.views >= 1000000 ? `${(c.metrics.views/1000000).toFixed(1)}M` : `${(c.metrics.views/1000).toFixed(0)}K`}</p>
                <p className="text-xs text-muted-foreground">{Math.round(c.aiTags.confidence * 100)}% conf.</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ---- ENGAGEMENT SUMMARY CARDS ----
export function EngagementSummary({ contents }: { contents: Content[] }) {
  const platforms = ["instagram", "tiktok", "youtube", "twitter", "linkedin"] as const
  const platformStats = platforms.map(p => {
    const pc = contents.filter(c => c.platform === p)
    const totalViews = pc.reduce((s, c) => s + c.metrics.views, 0)
    const totalLikes = pc.reduce((s, c) => s + c.metrics.likes, 0)
    const totalComments = pc.reduce((s, c) => s + c.metrics.comments, 0)
    const totalShares = pc.reduce((s, c) => s + c.metrics.shares, 0)
    const avgWatch = pc.length > 0 ? Math.round(pc.reduce((s, c) => s + c.metrics.estimatedWatchTime, 0) / pc.length) : 0
    const engRate = totalViews > 0 ? ((totalLikes + totalComments) / totalViews * 100) : 0
    return {
      platform: p,
      label: PLATFORM_LABELS[p],
      color: PLATFORM_COLORS[p],
      count: pc.length,
      totalViews,
      totalLikes,
      totalComments,
      totalShares,
      avgWatch,
      engRate,
    }
  }).filter(p => p.count > 0)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Engagement por Plataforma</CardTitle>
        <p className="text-xs text-muted-foreground">Metricas clave de cada red social</p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {platformStats.map(ps => (
            <div key={ps.platform} className="rounded-lg border p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ps.color }} />
                <span className="text-sm font-semibold text-card-foreground">{ps.label}</span>
                <Badge variant="secondary" className="text-xs ml-auto">{ps.count} posts</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">Vistas</p>
                  <p className="text-sm font-semibold text-card-foreground">{ps.totalViews >= 1000000 ? `${(ps.totalViews/1000000).toFixed(1)}M` : `${(ps.totalViews/1000).toFixed(0)}K`}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Eng. Rate</p>
                  <p className="text-sm font-semibold text-card-foreground">{ps.engRate.toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Likes</p>
                  <p className="text-sm font-semibold text-card-foreground">{ps.totalLikes.toLocaleString("es-ES")}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Shares</p>
                  <p className="text-sm font-semibold text-card-foreground">{ps.totalShares.toLocaleString("es-ES")}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ---- RADAR COMPARATIVO (para perfiles) ----
export function ProfileRadarChart({ profiles }: { profiles: { profile: Profile; color: string }[] }) {
  const topThemes = THEMES.slice(0, 8) as Theme[]
  const data = topThemes.map((theme) => {
    const point: Record<string, unknown> = { theme }
    for (const { profile } of profiles) {
      point[profile.name] = profile.interests[theme] ?? 0
    }
    return point
  })

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Radar de Intereses</CardTitle>
        <p className="text-xs text-muted-foreground">Comparacion de pesos por tema entre perfiles</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <RadarChart data={data}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis dataKey="theme" tick={{ fontSize: 10 }} />
            <PolarRadiusAxis tick={{ fontSize: 9 }} />
            {profiles.map(({ profile, color }) => (
              <Radar key={profile.id} name={profile.name} dataKey={profile.name}
                stroke={color} fill={color} fillOpacity={0.15} strokeWidth={2}
              />
            ))}
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// ---- CONFIDENCE TIMELINE ----
export function ConfidenceTimelineChart({ contents }: { contents: Content[] }) {
  const months = ["2025-01", "2025-02", "2025-03", "2025-04", "2025-05", "2025-06"]
  const labels = ["Ene", "Feb", "Mar", "Abr", "May", "Jun"]

  const data = months.map((month, i) => {
    const mc = contents.filter((c) => c.publishedAt.startsWith(month))
    const avg = mc.length > 0 ? mc.reduce((s, c) => s + c.aiTags.confidence, 0) / mc.length : 0
    const min = mc.length > 0 ? Math.min(...mc.map(c => c.aiTags.confidence)) : 0
    const max = mc.length > 0 ? Math.max(...mc.map(c => c.aiTags.confidence)) : 0
    return {
      month: labels[i],
      promedio: Number((avg * 100).toFixed(1)),
      minimo: Number((min * 100).toFixed(1)),
      maximo: Number((max * 100).toFixed(1)),
    }
  })

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Confianza IA en el Tiempo</CardTitle>
        <p className="text-xs text-muted-foreground">Evolucion del score de confianza del modelo</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} domain={[40, 100]} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v}%`} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="promedio" stroke="hsl(var(--primary))" strokeWidth={2} name="Promedio" dot={{ fill: "hsl(var(--primary))" }} />
            <Line type="monotone" dataKey="maximo" stroke="hsl(var(--success))" strokeWidth={1} strokeDasharray="5 5" name="Maximo" />
            <Line type="monotone" dataKey="minimo" stroke="hsl(var(--destructive))" strokeWidth={1} strokeDasharray="5 5" name="Minimo" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
