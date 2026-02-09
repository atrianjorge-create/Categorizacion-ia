"use client"

import { useState, useMemo } from "react"
import { SEED_PROFILES, SEED_CONTENTS } from "@/lib/seed-data"
import { PLATFORM_LABELS, THEMES, TONES, type Theme, type Platform } from "@/lib/types"
import { DashboardFilters } from "@/components/dashboard-filters"
import {
  KpiCards,
  ThemeDistributionChart,
  PlatformDistributionChart,
  TimelineChart,
  ToneChart,
  IntentChart,
  FormatDistributionChart,
  ConfidenceDistributionChart,
  EngagementScatterChart,
  RiskHeatmap,
  TopContentsCard,
  EngagementSummary,
  ConfidenceTimelineChart,
} from "@/components/dashboard-charts"
import { ContentTable } from "@/components/content-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertTriangle, CheckCircle, AlertCircle, TrendingUp, Hash,
  Users, Layers, Eye, ThumbsUp, MessageSquare, Share2, Bookmark,
} from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const [selectedProfile, setSelectedProfile] = useState("all")
  const [selectedPlatform, setSelectedPlatform] = useState("all")
  const [selectedTheme, setSelectedTheme] = useState("all")
  const [selectedTone, setSelectedTone] = useState("all")
  const [selectedFormat, setSelectedFormat] = useState("all")

  const filteredContents = useMemo(() => {
    let result = SEED_CONTENTS

    if (selectedPlatform !== "all") {
      result = result.filter((c) => c.platform === selectedPlatform)
    }
    if (selectedTheme !== "all") {
      result = result.filter((c) => c.aiTags.themes.includes(selectedTheme as Theme))
    }
    if (selectedTone !== "all") {
      result = result.filter((c) => c.aiTags.tone === selectedTone)
    }
    if (selectedFormat !== "all") {
      result = result.filter((c) => c.format === selectedFormat)
    }
    return result
  }, [selectedPlatform, selectedTheme, selectedTone, selectedFormat])

  const resetFilters = () => {
    setSelectedProfile("all")
    setSelectedPlatform("all")
    setSelectedTheme("all")
    setSelectedTone("all")
    setSelectedFormat("all")
  }

  // Quick summary stats
  const totalContents = filteredContents.length
  const totalAllContents = SEED_CONTENTS.length
  const isFiltered = totalContents !== totalAllContents

  // Additional computed stats for the bottom sections
  const topKeywords = useMemo(() => {
    const map: Record<string, number> = {}
    filteredContents.forEach((c) => c.aiTags.keywords.forEach((k) => { map[k] = (map[k] || 0) + 1 }))
    return Object.entries(map).sort(([, a], [, b]) => b - a).slice(0, 20)
  }, [filteredContents])

  const riskSummary = useMemo(() => ({
    bajo: filteredContents.filter((c) => c.aiTags.riskLevel === "Bajo").length,
    medio: filteredContents.filter((c) => c.aiTags.riskLevel === "Medio").length,
    alto: filteredContents.filter((c) => c.aiTags.riskLevel === "Alto").length,
  }), [filteredContents])

  const platformSummary = useMemo(() => {
    const map: Record<string, { count: number; views: number; likes: number }> = {}
    filteredContents.forEach((c) => {
      if (!map[c.platform]) map[c.platform] = { count: 0, views: 0, likes: 0 }
      map[c.platform].count++
      map[c.platform].views += c.metrics.views
      map[c.platform].likes += c.metrics.likes
    })
    return Object.entries(map)
      .map(([p, stats]) => ({ platform: p, label: PLATFORM_LABELS[p as Platform], ...stats }))
      .sort((a, b) => b.count - a.count)
  }, [filteredContents])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground text-balance">
            Dashboard de Categorizacion
          </h1>
          <p className="text-muted-foreground mt-1">
            Analisis completo de {totalAllContents} contenidos en redes sociales con categorizacion asistida por IA
          </p>
        </div>
        {isFiltered && (
          <Badge variant="secondary" className="text-xs self-start md:self-auto">
            Mostrando {totalContents} de {totalAllContents} contenidos
          </Badge>
        )}
      </div>

      {/* Filtros */}
      <DashboardFilters
        profiles={SEED_PROFILES}
        selectedProfile={selectedProfile}
        onProfileChange={setSelectedProfile}
        selectedPlatform={selectedPlatform}
        onPlatformChange={setSelectedPlatform}
        selectedTheme={selectedTheme}
        onThemeChange={setSelectedTheme}
        selectedTone={selectedTone}
        onToneChange={setSelectedTone}
        selectedFormat={selectedFormat}
        onFormatChange={setSelectedFormat}
        onReset={resetFilters}
      />

      {/* KPI Cards */}
      <KpiCards contents={filteredContents} />

      {/* Main Charts Tabs */}
      <Tabs defaultValue="categorias" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="categorias">Categorias</TabsTrigger>
          <TabsTrigger value="plataformas">Plataformas</TabsTrigger>
          <TabsTrigger value="temporal">Temporal</TabsTrigger>
          <TabsTrigger value="sentimiento">Sentimiento</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="confianza">Confianza IA</TabsTrigger>
          <TabsTrigger value="riesgo">Riesgo</TabsTrigger>
        </TabsList>

        <TabsContent value="categorias">
          <div className="grid gap-4 lg:grid-cols-2">
            <ThemeDistributionChart contents={filteredContents} />
            <IntentChart contents={filteredContents} />
          </div>
        </TabsContent>

        <TabsContent value="plataformas">
          <div className="grid gap-4 lg:grid-cols-2">
            <PlatformDistributionChart contents={filteredContents} />
            <FormatDistributionChart contents={filteredContents} />
          </div>
        </TabsContent>

        <TabsContent value="temporal">
          <div className="grid gap-4 lg:grid-cols-1">
            <TimelineChart contents={filteredContents} />
            <ConfidenceTimelineChart contents={filteredContents} />
          </div>
        </TabsContent>

        <TabsContent value="sentimiento">
          <div className="grid gap-4 lg:grid-cols-2">
            <ToneChart contents={filteredContents} />
            <IntentChart contents={filteredContents} />
          </div>
        </TabsContent>

        <TabsContent value="engagement">
          <div className="space-y-4">
            <EngagementSummary contents={filteredContents} />
            <EngagementScatterChart contents={filteredContents} />
          </div>
        </TabsContent>

        <TabsContent value="confianza">
          <div className="grid gap-4 lg:grid-cols-2">
            <ConfidenceDistributionChart contents={filteredContents} />
            <ConfidenceTimelineChart contents={filteredContents} />
          </div>
        </TabsContent>

        <TabsContent value="riesgo">
          <div className="grid gap-4 lg:grid-cols-2">
            <RiskHeatmap contents={filteredContents} />
            <TopContentsCard contents={filteredContents} />
          </div>
        </TabsContent>
      </Tabs>

      {/* Risk summary + Keywords */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Evaluacion de Riesgo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { level: "Bajo", count: riskSummary.bajo, icon: CheckCircle, color: "text-[hsl(var(--success))]" },
              { level: "Medio", count: riskSummary.medio, icon: AlertCircle, color: "text-[hsl(var(--warning))]" },
              { level: "Alto", count: riskSummary.alto, icon: AlertTriangle, color: "text-destructive" },
            ].map((r) => (
              <div key={r.level} className="flex items-center gap-3">
                <r.icon className={`h-4 w-4 ${r.color} flex-shrink-0`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-foreground">Riesgo {r.level}</span>
                    <span className="text-sm font-semibold text-foreground">{r.count}</span>
                  </div>
                  <Progress value={totalContents > 0 ? (r.count / totalContents) * 100 : 0} className="h-1.5" />
                </div>
              </div>
            ))}
            <Separator />
            <p className="text-xs text-muted-foreground">
              {riskSummary.alto > 0
                ? `${riskSummary.alto} contenidos requieren revision por riesgo alto.`
                : "No se detectaron contenidos de alto riesgo."}
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-semibold">Palabras Clave Mas Frecuentes</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {topKeywords.map(([keyword, count], i) => (
                <Badge
                  key={keyword}
                  variant={i < 5 ? "default" : "secondary"}
                  className={`text-xs py-1 px-2.5 ${i < 5 ? "bg-primary text-primary-foreground" : ""}`}
                >
                  {keyword} <span className="ml-1 font-mono opacity-70">({count})</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform summary */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-semibold">Resumen por Plataforma</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {platformSummary.map((ps) => (
              <div key={ps.platform} className="rounded-lg border p-3 space-y-2">
                <p className="text-sm font-semibold text-foreground">{ps.label}</p>
                <div className="grid grid-cols-3 gap-1 text-center">
                  <div>
                    <p className="text-lg font-bold text-foreground">{ps.count}</p>
                    <p className="text-xs text-muted-foreground">Posts</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground">{ps.views >= 1000000 ? `${(ps.views / 1000000).toFixed(1)}M` : `${(ps.views / 1000).toFixed(0)}K`}</p>
                    <p className="text-xs text-muted-foreground">Vistas</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground">{ps.likes >= 1000000 ? `${(ps.likes / 1000000).toFixed(1)}M` : `${(ps.likes / 1000).toFixed(0)}K`}</p>
                    <p className="text-xs text-muted-foreground">Likes</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Profiles overview */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-semibold">Perfiles Registrados</CardTitle>
            </div>
            <Link href="/perfiles" className="text-xs text-primary hover:underline">
              Ver todos
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SEED_PROFILES.map((p) => {
              const topTheme = Object.entries(p.interests).sort(([, a], [, b]) => b - a)[0]
              return (
                <Link key={p.id} href="/perfiles" className="rounded-lg border p-3 hover:bg-secondary/30 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">{p.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.context.ageRange} - {p.context.location.split(",")[0]}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                    <div className="flex gap-1">
                      {p.platforms.slice(0, 3).map((pl) => (
                        <Badge key={pl} variant="outline" className="text-xs py-0 px-1">
                          {PLATFORM_LABELS[pl].charAt(0)}
                        </Badge>
                      ))}
                    </div>
                    <span>{topTheme[0]} {topTheme[1]}%</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Bottom section: recent table */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ContentTable contents={filteredContents.slice(0, 12)} />
        </div>
        <TopContentsCard contents={filteredContents} />
      </div>
    </div>
  )
}
