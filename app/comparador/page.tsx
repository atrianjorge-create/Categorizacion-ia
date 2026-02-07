"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ProfileRadarChart } from "@/components/dashboard-charts"
import { SEED_PROFILES, SEED_CONTENTS } from "@/lib/seed-data"
import { THEMES, PLATFORM_LABELS, type Theme, type Platform } from "@/lib/types"
import { ArrowUp, ArrowDown, Minus, GitCompareArrows, Users, Target, Shield, Activity, Clock, MapPin } from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts"

const COLOR_A = "hsl(217, 91%, 50%)"
const COLOR_B = "hsl(160, 60%, 45%)"

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  color: "hsl(var(--card-foreground))",
}

function cosineSimilarity(a: Record<string, number>, b: Record<string, number>): number {
  const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])]
  let dotProduct = 0
  let normA = 0
  let normB = 0
  for (const key of keys) {
    const va = a[key] ?? 0
    const vb = b[key] ?? 0
    dotProduct += va * vb
    normA += va * va
    normB += vb * vb
  }
  if (normA === 0 || normB === 0) return 0
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

export default function ComparadorPage() {
  const [profileAId, setProfileAId] = useState(SEED_PROFILES[0]?.id ?? "")
  const [profileBId, setProfileBId] = useState(SEED_PROFILES[1]?.id ?? "")

  const profileA = SEED_PROFILES.find((p) => p.id === profileAId)
  const profileB = SEED_PROFILES.find((p) => p.id === profileBId)

  const comparison = useMemo(() => {
    if (!profileA || !profileB) return null

    const themeComparison = THEMES.map((theme) => ({
      theme,
      profileA: profileA.interests[theme] ?? 0,
      profileB: profileB.interests[theme] ?? 0,
      delta: (profileA.interests[theme] ?? 0) - (profileB.interests[theme] ?? 0),
    }))

    const topDifferences = [...themeComparison]
      .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
      .slice(0, 8)

    const platformComparison = (["instagram", "tiktok", "youtube", "twitter", "linkedin"] as const).map((p) => ({
      platform: p,
      label: PLATFORM_LABELS[p],
      profileA: profileA.platforms.includes(p) ? 1 : 0,
      profileB: profileB.platforms.includes(p) ? 1 : 0,
    }))

    const similarity = cosineSimilarity(profileA.interests, profileB.interests)

    const sharedPlatforms = (["instagram", "tiktok", "youtube", "twitter", "linkedin"] as const)
      .filter(p => profileA.platforms.includes(p) && profileB.platforms.includes(p))

    const avgInterestA = Object.values(profileA.interests).reduce((s, v) => s + v, 0) / Object.keys(profileA.interests).length
    const avgInterestB = Object.values(profileB.interests).reduce((s, v) => s + v, 0) / Object.keys(profileB.interests).length

    const topThemeA = Object.entries(profileA.interests).sort(([, a], [, b]) => b - a)[0]
    const topThemeB = Object.entries(profileB.interests).sort(([, a], [, b]) => b - a)[0]

    return { themeComparison, topDifferences, platformComparison, similarity, sharedPlatforms, avgInterestA, avgInterestB, topThemeA, topThemeB }
  }, [profileA, profileB])

  const barData = comparison?.themeComparison.map((item) => ({
    name: item.theme,
    [profileA?.name ?? "A"]: item.profileA,
    [profileB?.name ?? "B"]: item.profileB,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground text-balance">
          Comparador de Perfiles
        </h1>
        <p className="text-muted-foreground mt-1">
          Compara intereses, plataformas, patrones de consumo y similitud entre dos perfiles.
          Selecciona los perfiles a comparar.
        </p>
      </div>

      {/* Selectores */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLOR_A }} />
              <span className="text-sm font-semibold text-card-foreground">Perfil A</span>
            </div>
            <Select value={profileAId} onValueChange={setProfileAId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SEED_PROFILES.map((p) => (
                  <SelectItem key={p.id} value={p.id} disabled={p.id === profileBId}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {profileA && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 bg-primary text-primary-foreground">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">{profileA.avatar}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">{profileA.name}</p>
                    <p className="text-xs text-muted-foreground">{profileA.context.ageRange} - {profileA.context.location}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{profileA.description}</p>
                <div className="flex flex-wrap gap-1">
                  {profileA.platforms.map(p => (
                    <Badge key={p} variant="secondary" className="text-xs">{PLATFORM_LABELS[p]}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLOR_B }} />
              <span className="text-sm font-semibold text-card-foreground">Perfil B</span>
            </div>
            <Select value={profileBId} onValueChange={setProfileBId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SEED_PROFILES.map((p) => (
                  <SelectItem key={p.id} value={p.id} disabled={p.id === profileAId}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {profileB && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 bg-[hsl(160,60%,45%)] text-[hsl(0,0%,100%)]">
                    <AvatarFallback className="bg-[hsl(160,60%,45%)] text-[hsl(0,0%,100%)] text-xs font-semibold">{profileB.avatar}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">{profileB.name}</p>
                    <p className="text-xs text-muted-foreground">{profileB.context.ageRange} - {profileB.context.location}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{profileB.description}</p>
                <div className="flex flex-wrap gap-1">
                  {profileB.platforms.map(p => (
                    <Badge key={p} variant="secondary" className="text-xs">{PLATFORM_LABELS[p]}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {comparison && profileA && profileB && (
        <>
          {/* Similarity Score & Quick Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="md:col-span-2">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <GitCompareArrows className="h-5 w-5 text-primary" />
                  <span className="text-sm font-semibold text-card-foreground">Indice de Similitud</span>
                </div>
                <div className="flex items-end gap-3">
                  <span className="text-4xl font-bold text-primary">{(comparison.similarity * 100).toFixed(1)}%</span>
                  <span className="text-sm text-muted-foreground mb-1">similitud coseno</span>
                </div>
                <Progress value={comparison.similarity * 100} className="h-2 mt-3" />
                <p className="text-xs text-muted-foreground mt-2">
                  {comparison.similarity > 0.85 ? "Perfiles muy similares en intereses" :
                    comparison.similarity > 0.65 ? "Perfiles con similitud moderada" :
                      "Perfiles significativamente diferentes"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Users className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
                <p className="text-2xl font-bold text-card-foreground">{comparison.sharedPlatforms.length}</p>
                <p className="text-xs text-muted-foreground">Plataformas en comun</p>
                <div className="flex flex-wrap justify-center gap-1 mt-2">
                  {comparison.sharedPlatforms.map(p => (
                    <Badge key={p} variant="outline" className="text-xs">{PLATFORM_LABELS[p]}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLOR_A }} />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Tema top: {comparison.topThemeA[0]}</p>
                      <p className="text-sm font-semibold text-card-foreground">{comparison.topThemeA[1]}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLOR_B }} />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Tema top: {comparison.topThemeB[0]}</p>
                      <p className="text-sm font-semibold text-card-foreground">{comparison.topThemeB[1]}%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detail comparison cards */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Profile A details */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLOR_A }} />
                  <CardTitle className="text-sm font-semibold">{profileA.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Uso diario</p>
                      <p className="text-sm font-semibold text-card-foreground">{profileA.context.dailyHours}h/dia</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Ubicacion</p>
                      <p className="text-sm font-semibold text-card-foreground">{profileA.context.location.split(",")[0]}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Objetivo</p>
                      <p className="text-sm font-semibold text-card-foreground truncate">{profileA.context.objective}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Interes medio</p>
                      <p className="text-sm font-semibold text-card-foreground">{comparison.avgInterestA.toFixed(0)}%</p>
                    </div>
                  </div>
                </div>
                {profileA.context.sensitiveTopics.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Temas sensibles:</p>
                    <div className="flex flex-wrap gap-1">
                      {profileA.context.sensitiveTopics.map(t => (
                        <Badge key={t} variant="destructive" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Profile B details */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLOR_B }} />
                  <CardTitle className="text-sm font-semibold">{profileB.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Uso diario</p>
                      <p className="text-sm font-semibold text-card-foreground">{profileB.context.dailyHours}h/dia</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Ubicacion</p>
                      <p className="text-sm font-semibold text-card-foreground">{profileB.context.location.split(",")[0]}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Objetivo</p>
                      <p className="text-sm font-semibold text-card-foreground truncate">{profileB.context.objective}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Interes medio</p>
                      <p className="text-sm font-semibold text-card-foreground">{comparison.avgInterestB.toFixed(0)}%</p>
                    </div>
                  </div>
                </div>
                {profileB.context.sensitiveTopics.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Temas sensibles:</p>
                    <div className="flex flex-wrap gap-1">
                      {profileB.context.sensitiveTopics.map(t => (
                        <Badge key={t} variant="destructive" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Radar Chart */}
          <ProfileRadarChart
            profiles={[
              { profile: profileA, color: COLOR_A },
              { profile: profileB, color: COLOR_B },
            ]}
          />

          {/* Barras comparativas */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Comparativa de Intereses por Tema</CardTitle>
              <p className="text-xs text-muted-foreground">Peso de cada tema por perfil (0-100%)</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={380}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey={profileA.name} fill={COLOR_A} radius={[4, 4, 0, 0]} />
                  <Bar dataKey={profileB.name} fill={COLOR_B} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Tabla de diferencias */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <GitCompareArrows className="h-5 w-5 text-primary" />
                <CardTitle className="text-sm font-semibold">Top Diferencias</CardTitle>
              </div>
              <p className="text-xs text-muted-foreground">Temas con mayor diferencia entre los dos perfiles</p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tema</TableHead>
                    <TableHead className="text-center">{profileA.name}</TableHead>
                    <TableHead className="text-center">{profileB.name}</TableHead>
                    <TableHead className="text-center">Delta</TableHead>
                    <TableHead className="text-center">Barra</TableHead>
                    <TableHead>Ventaja</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comparison.topDifferences.map((diff) => (
                    <TableRow key={diff.theme}>
                      <TableCell className="font-medium text-sm">{diff.theme}</TableCell>
                      <TableCell className="text-center text-sm">{diff.profileA}%</TableCell>
                      <TableCell className="text-center text-sm">{diff.profileB}%</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={Math.abs(diff.delta) > 30 ? "destructive" : "secondary"} className="text-xs">
                          {diff.delta > 0 ? "+" : ""}{diff.delta}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 w-32">
                          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${diff.profileA}%`, backgroundColor: COLOR_A }} />
                          </div>
                          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${diff.profileB}%`, backgroundColor: COLOR_B }} />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {diff.delta > 0 ? (
                          <span className="flex items-center gap-1 text-xs text-primary"><ArrowUp className="h-3 w-3" />A mayor</span>
                        ) : diff.delta < 0 ? (
                          <span className="flex items-center gap-1 text-xs text-[hsl(160,60%,45%)]"><ArrowDown className="h-3 w-3" />B mayor</span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground"><Minus className="h-3 w-3" />Igual</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Plataformas en comun */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Plataformas</CardTitle>
              <p className="text-xs text-muted-foreground">Coincidencias y diferencias en plataformas seleccionadas</p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-5">
                {comparison.platformComparison.map((item) => {
                  const both = item.profileA && item.profileB
                  const neither = !item.profileA && !item.profileB
                  return (
                    <div key={item.platform} className={`rounded-lg border p-3 text-center transition-all ${
                      both ? "border-primary bg-primary/5" : neither ? "border-border bg-secondary/30 opacity-50" : "border-border"
                    }`}>
                      <p className="text-sm font-medium text-card-foreground">{item.label}</p>
                      <div className="mt-2 flex items-center justify-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.profileA ? COLOR_A : "hsl(var(--border))" }} title={profileA.name} />
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.profileB ? COLOR_B : "hsl(var(--border))" }} title={profileB.name} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {both ? "Ambos" : item.profileA && !item.profileB ? "Solo A" : !item.profileA && item.profileB ? "Solo B" : "Ninguno"}
                      </p>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
