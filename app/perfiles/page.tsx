"use client"

import { useState, useMemo } from "react"
import { ProfileCard } from "@/components/profile-card"
import { ProfileForm } from "@/components/profile-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SEED_PROFILES, SEED_CONTENTS } from "@/lib/seed-data"
import { PLATFORM_LABELS, THEMES, type Profile, type Content } from "@/lib/types"
import {
  Plus, X, Search, UserCircle, Eye, ThumbsUp, MessageSquare,
  Clock, MapPin, Target, Activity, Shield, AlertTriangle,
  CheckCircle, TrendingUp, BarChart3, Hash, Layers,
} from "lucide-react"
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Cell, PieChart, Pie,
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

function ProfileDetailDialog({ profile }: { profile: Profile }) {
  const contents = SEED_CONTENTS

  // Simulated profile-relevant content (by matching top interests)
  const topInterests = Object.entries(profile.interests)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([t]) => t)

  const relevantContents = contents.filter((c) =>
    c.aiTags.themes.some((t) => topInterests.includes(t)) &&
    profile.platforms.includes(c.platform)
  )

  const totalViews = relevantContents.reduce((s, c) => s + c.metrics.views, 0)
  const totalLikes = relevantContents.reduce((s, c) => s + c.metrics.likes, 0)
  const avgConfidence = relevantContents.length > 0
    ? relevantContents.reduce((s, c) => s + c.aiTags.confidence, 0) / relevantContents.length
    : 0
  const highRisk = relevantContents.filter((c) => c.aiTags.riskLevel === "Alto").length
  const engRate = totalViews > 0 ? ((totalLikes + relevantContents.reduce((s, c) => s + c.metrics.comments, 0)) / totalViews * 100) : 0

  // Radar data
  const radarData = THEMES.map((theme) => ({
    theme,
    value: profile.interests[theme] ?? 0,
  }))

  // Theme distribution of relevant content
  const themeCount: Record<string, number> = {}
  for (const c of relevantContents) {
    for (const t of c.aiTags.themes) {
      themeCount[t] = (themeCount[t] || 0) + 1
    }
  }
  const themeData = Object.entries(themeCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([name, value], i) => ({ name, value, fill: CHART_COLORS[i] }))

  // Platform breakdown
  const platformCount: Record<string, number> = {}
  for (const c of relevantContents) {
    platformCount[c.platform] = (platformCount[c.platform] || 0) + 1
  }
  const platformData = Object.entries(platformCount).map(([p, count], i) => ({
    name: PLATFORM_LABELS[p as keyof typeof PLATFORM_LABELS] ?? p,
    value: count,
    fill: CHART_COLORS[i],
  }))

  // Risk breakdown
  const riskCount = { Bajo: 0, Medio: 0, Alto: 0 }
  for (const c of relevantContents) {
    riskCount[c.aiTags.riskLevel]++
  }

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-3">
          <Avatar className="h-10 w-10 bg-primary text-primary-foreground">
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">{profile.avatar}</AvatarFallback>
          </Avatar>
          <div>
            <span className="text-lg">{profile.name}</span>
            <p className="text-sm font-normal text-muted-foreground">{profile.context.ageRange} - {profile.context.location}</p>
          </div>
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-5">
        <p className="text-sm text-muted-foreground leading-relaxed">{profile.description}</p>

        {/* Quick Stats */}
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "Contenidos", value: relevantContents.length, icon: Layers, color: "text-primary" },
            { label: "Vistas", value: totalViews >= 1000000 ? `${(totalViews / 1000000).toFixed(1)}M` : `${(totalViews / 1000).toFixed(0)}K`, icon: Eye, color: "text-[hsl(var(--chart-3))]" },
            { label: "Eng. Rate", value: `${engRate.toFixed(2)}%`, icon: TrendingUp, color: "text-[hsl(var(--success))]" },
            { label: "Conf. IA", value: `${(avgConfidence * 100).toFixed(0)}%`, icon: BarChart3, color: "text-primary" },
            { label: "Riesgo Alto", value: highRisk.toString(), icon: AlertTriangle, color: "text-destructive" },
            { label: "Uso diario", value: `${profile.context.dailyHours}h`, icon: Clock, color: "text-muted-foreground" },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-lg border p-2.5 text-center">
              <kpi.icon className={`h-4 w-4 mx-auto mb-1 ${kpi.color}`} />
              <p className="text-lg font-bold text-foreground">{kpi.value}</p>
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
            </div>
          ))}
        </div>

        {/* Context Info */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border p-3 space-y-2">
            <p className="text-xs font-semibold text-foreground">Contexto del Perfil</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{profile.context.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{profile.context.objective}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Activity className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{profile.context.dailyHours}h/dia en redes</span>
            </div>
            <div className="flex flex-wrap gap-1 pt-1">
              {profile.platforms.map((p) => (
                <Badge key={p} variant="secondary" className="text-xs">{PLATFORM_LABELS[p]}</Badge>
              ))}
            </div>
          </div>
          <div className="rounded-lg border p-3 space-y-2">
            <p className="text-xs font-semibold text-foreground">Distribucion de Riesgo</p>
            <div className="space-y-1.5">
              {(["Bajo", "Medio", "Alto"] as const).map((r) => (
                <div key={r} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-12">{r}</span>
                  <Progress value={relevantContents.length > 0 ? (riskCount[r] / relevantContents.length) * 100 : 0} className="h-2 flex-1" />
                  <span className="text-xs font-mono text-muted-foreground w-8 text-right">{riskCount[r]}</span>
                </div>
              ))}
            </div>
            {profile.context.sensitiveTopics.length > 0 && (
              <div className="pt-1">
                <p className="text-xs text-muted-foreground mb-1">Temas sensibles:</p>
                <div className="flex flex-wrap gap-1">
                  {profile.context.sensitiveTopics.map((t) => (
                    <Badge key={t} variant="destructive" className="text-xs">{t}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Charts */}
        <Tabs defaultValue="radar" className="space-y-3">
          <TabsList className="h-auto flex-wrap gap-1">
            <TabsTrigger value="radar">Intereses</TabsTrigger>
            <TabsTrigger value="temas">Temas</TabsTrigger>
            <TabsTrigger value="plataformas">Plataformas</TabsTrigger>
            <TabsTrigger value="contenidos">Contenidos</TabsTrigger>
          </TabsList>

          <TabsContent value="radar">
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="theme" tick={{ fontSize: 9 }} />
                <PolarRadiusAxis tick={{ fontSize: 9 }} domain={[0, 100]} />
                <Radar name="Intereses" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.25} strokeWidth={2} />
                <Tooltip contentStyle={tooltipStyle} />
              </RadarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="temas">
            {themeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={themeData} layout="vertical" margin={{ left: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={75} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {themeData.map((d) => (<Cell key={d.name} fill={d.fill} />))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No hay contenidos relevantes para este perfil</p>
            )}
          </TabsContent>

          <TabsContent value="plataformas">
            {platformData.length > 0 ? (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="50%" height={250}>
                  <PieChart>
                    <Pie data={platformData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={3}>
                      {platformData.map((d) => (<Cell key={d.name} fill={d.fill} />))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {platformData.map((d) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.fill }} />
                      <span className="text-sm text-foreground">{d.name}</span>
                      <span className="text-xs text-muted-foreground font-mono">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No hay datos de plataforma</p>
            )}
          </TabsContent>

          <TabsContent value="contenidos">
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {relevantContents.slice(0, 15).map((c) => (
                <div key={c.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-secondary/30">
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="text-sm font-medium text-foreground truncate">{c.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-xs py-0">{PLATFORM_LABELS[c.platform]}</Badge>
                      {c.aiTags.themes.slice(0, 2).map((t) => (
                        <Badge key={t} className="text-xs bg-primary/10 text-primary border-0 py-0">{t}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-semibold text-foreground">{c.metrics.views.toLocaleString("es-ES")}</p>
                    <p className="text-xs text-muted-foreground">{Math.round(c.aiTags.confidence * 100)}%</p>
                  </div>
                </div>
              ))}
              {relevantContents.length > 15 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  + {relevantContents.length - 15} contenidos mas
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Dates */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <span>Creado: {profile.createdAt}</span>
          <span>Actualizado: {profile.updatedAt}</span>
        </div>
      </div>
    </DialogContent>
  )
}

export default function PerfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>(SEED_PROFILES)
  const [showForm, setShowForm] = useState(false)
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterPlatform, setFilterPlatform] = useState("all")

  const filteredProfiles = useMemo(() => {
    let result = profiles
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.context.location.toLowerCase().includes(q)
      )
    }
    if (filterPlatform !== "all") {
      result = result.filter((p) => p.platforms.includes(filterPlatform as any))
    }
    return result
  }, [profiles, searchQuery, filterPlatform])

  const handleCreate = (profile: Profile) => {
    if (editingProfile) {
      setProfiles((prev) => prev.map((p) => (p.id === profile.id ? profile : p)))
      setEditingProfile(null)
    } else {
      setProfiles((prev) => [...prev, profile])
    }
    setShowForm(false)
  }

  const handleDelete = (id: string) => {
    setProfiles((prev) => prev.filter((p) => p.id !== id))
  }

  const handleEdit = (profile: Profile) => {
    setEditingProfile(profile)
    setShowForm(true)
  }

  // Aggregate stats
  const totalProfiles = profiles.length
  const avgInterests = profiles.length > 0
    ? (profiles.reduce((s, p) => s + Object.values(p.interests).reduce((a, b) => a + b, 0) / Object.keys(p.interests).length, 0) / profiles.length).toFixed(0)
    : "0"
  const allPlatformsSet = new Set(profiles.flatMap((p) => p.platforms))
  const avgDailyHours = profiles.length > 0
    ? (profiles.reduce((s, p) => s + p.context.dailyHours, 0) / profiles.length).toFixed(1)
    : "0"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground text-balance">
            Perfiles de Consumo
          </h1>
          <p className="text-muted-foreground mt-1">
            Crea, gestiona y analiza perfiles con atributos editables, plataformas y contexto situacional.
            Haz clic en un perfil para ver su analisis detallado.
          </p>
        </div>
        <Button onClick={() => { setShowForm(!showForm); setEditingProfile(null) }}>
          {showForm ? (
            <><X className="h-4 w-4 mr-1.5" />Cerrar</>
          ) : (
            <><Plus className="h-4 w-4 mr-1.5" />Nuevo Perfil</>
          )}
        </Button>
      </div>

      {/* Aggregate Stats */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <UserCircle className="h-4 w-4 text-primary flex-shrink-0" />
            <div>
              <p className="text-lg font-bold text-card-foreground">{totalProfiles}</p>
              <p className="text-xs text-muted-foreground">Perfiles totales</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <Activity className="h-4 w-4 text-[hsl(var(--success))] flex-shrink-0" />
            <div>
              <p className="text-lg font-bold text-card-foreground">{avgInterests}%</p>
              <p className="text-xs text-muted-foreground">Interes promedio</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <Layers className="h-4 w-4 text-[hsl(var(--chart-3))] flex-shrink-0" />
            <div>
              <p className="text-lg font-bold text-card-foreground">{allPlatformsSet.size}</p>
              <p className="text-xs text-muted-foreground">Plataformas cubiertas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <Clock className="h-4 w-4 text-[hsl(var(--chart-5))] flex-shrink-0" />
            <div>
              <p className="text-lg font-bold text-card-foreground">{avgDailyHours}h</p>
              <p className="text-xs text-muted-foreground">Promedio diario</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search / Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, descripcion o ubicacion..."
            className="pl-9"
          />
        </div>
        <div className="flex gap-1">
          {["all", "instagram", "tiktok", "youtube", "twitter", "linkedin"].map((p) => (
            <Button
              key={p}
              size="sm"
              variant={filterPlatform === p ? "default" : "outline"}
              className={filterPlatform !== p ? "bg-transparent" : ""}
              onClick={() => setFilterPlatform(p)}
            >
              {p === "all" ? "Todas" : PLATFORM_LABELS[p as keyof typeof PLATFORM_LABELS]}
            </Button>
          ))}
        </div>
      </div>

      {showForm && (
        <ProfileForm
          profile={editingProfile ?? undefined}
          onSave={handleCreate}
          onCancel={() => { setShowForm(false); setEditingProfile(null) }}
        />
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredProfiles.map((profile) => (
          <Dialog key={profile.id}>
            <DialogTrigger asChild>
              <div className="cursor-pointer">
                <ProfileCard
                  profile={profile}
                  onDelete={handleDelete}
                />
              </div>
            </DialogTrigger>
            <ProfileDetailDialog profile={profile} />
          </Dialog>
        ))}
      </div>

      {filteredProfiles.length === 0 && (
        <div className="text-center py-12">
          <UserCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">
            {searchQuery || filterPlatform !== "all"
              ? "No se encontraron perfiles con los filtros aplicados"
              : "No hay perfiles creados"}
          </p>
          {!searchQuery && filterPlatform === "all" && (
            <Button variant="outline" className="mt-4 bg-transparent" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              Crear primer perfil
            </Button>
          )}
        </div>
      )}

      {/* Summary Table */}
      {filteredProfiles.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Resumen de Perfiles</CardTitle>
            <p className="text-xs text-muted-foreground">Vista de tabla con informacion clave de cada perfil</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Perfil</TableHead>
                    <TableHead className="text-center">Edad</TableHead>
                    <TableHead>Ubicacion</TableHead>
                    <TableHead className="text-center">Plataformas</TableHead>
                    <TableHead className="text-center">Horas/dia</TableHead>
                    <TableHead>Top Interes</TableHead>
                    <TableHead className="text-center">Temas Sensibles</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProfiles.map((p) => {
                    const topInterest = Object.entries(p.interests).sort(([, a], [, b]) => b - a)[0]
                    return (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7 bg-primary text-primary-foreground">
                              <AvatarFallback className="bg-primary text-primary-foreground text-xs">{p.avatar}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium text-card-foreground">{p.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center text-sm">{p.context.ageRange}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{p.context.location.split(",")[0]}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-wrap justify-center gap-1">
                            {p.platforms.map((pl) => (
                              <Badge key={pl} variant="outline" className="text-xs py-0">{PLATFORM_LABELS[pl].charAt(0)}</Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-center text-sm font-semibold">{p.context.dailyHours}h</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-card-foreground">{topInterest[0]}</span>
                            <span className="text-xs text-muted-foreground font-mono">{topInterest[1]}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {p.context.sensitiveTopics.length > 0 ? (
                            <Badge variant="destructive" className="text-xs">{p.context.sensitiveTopics.length}</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
