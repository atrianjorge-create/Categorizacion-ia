"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  THEMES,
  PLATFORM_LABELS,
  type Profile,
  type Platform,
} from "@/lib/types"
import { Save, RotateCcw, User, Globe, Sliders, Shield, Smartphone, Info, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react"

interface ProfileFormProps {
  profile?: Profile
  onSave: (profile: Profile) => void
  onCancel?: () => void
}

const PLATFORMS: Platform[] = ["instagram", "tiktok", "youtube", "twitter", "linkedin"]
const AGE_RANGES = ["13-17", "18-24", "25-29", "30-39", "40-49", "50+"]
const OBJECTIVES = [
  "Informarse",
  "Entretenerse",
  "Comprar productos",
  "Aprender / Formarse",
  "Networking profesional",
  "Crear contenido",
  "Investigar tendencias",
  "Mantenerse al dia",
]
const LANGUAGES = ["Espanol", "Ingles", "Frances", "Aleman", "Portugues", "Italiano", "Catalan"]

export function ProfileForm({ profile, onSave, onCancel }: ProfileFormProps) {
  const [name, setName] = useState(profile?.name ?? "")
  const [description, setDescription] = useState(profile?.description ?? "")
  const [interests, setInterests] = useState<Record<string, number>>(
    profile?.interests ?? Object.fromEntries(THEMES.map((t) => [t, 50]))
  )
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(
    profile?.platforms ?? []
  )
  const [ageRange, setAgeRange] = useState(profile?.context.ageRange ?? "18-24")
  const [location, setLocation] = useState(profile?.context.location ?? "")
  const [objective, setObjective] = useState(profile?.context.objective ?? "")
  const [dailyHours, setDailyHours] = useState(profile?.context.dailyHours ?? 2)
  const [sensitiveTopics, setSensitiveTopics] = useState<string[]>(
    profile?.context.sensitiveTopics ?? []
  )
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    info: true, platforms: true, interests: true, sensitive: false, advanced: false,
  })

  const toggleSection = (s: string) => setExpandedSections((prev) => ({ ...prev, [s]: !prev[s] }))

  const togglePlatform = (p: Platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    )
  }

  const toggleSensitiveTopic = (topic: string) => {
    setSensitiveTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    )
  }

  const handleSubmit = () => {
    const now = new Date().toISOString().slice(0, 10)
    const newProfile: Profile = {
      id: profile?.id ?? `p${Date.now()}`,
      name,
      description,
      avatar: name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2),
      interests,
      platforms: selectedPlatforms,
      context: {
        ageRange,
        location,
        objective,
        dailyHours,
        sensitiveTopics,
      },
      createdAt: profile?.createdAt ?? now,
      updatedAt: now,
    }
    onSave(newProfile)
  }

  const resetInterests = () => {
    setInterests(Object.fromEntries(THEMES.map((t) => [t, 50])))
  }

  // Calculate completeness score
  const completeness = (() => {
    let score = 0
    if (name) score += 15
    if (description && description.length > 20) score += 15
    if (selectedPlatforms.length > 0) score += 20
    if (location) score += 10
    if (objective) score += 10
    const hasCustomInterests = Object.values(interests).some((v) => v !== 50)
    if (hasCustomInterests) score += 20
    if (sensitiveTopics.length > 0) score += 10
    return Math.min(100, score)
  })()

  // Get categories of interests
  const highInterests = Object.entries(interests).filter(([, v]) => v >= 70).sort(([, a], [, b]) => b - a)
  const lowInterests = Object.entries(interests).filter(([, v]) => v <= 30).sort(([, a], [, b]) => a - b)

  return (
    <div className="space-y-4">
      {/* Completeness bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-card-foreground">Completitud del perfil</span>
            </div>
            <span className="text-sm font-bold text-primary">{completeness}%</span>
          </div>
          <Progress value={completeness} className="h-2" />
          <div className="flex flex-wrap gap-2 mt-2">
            {!name && <Badge variant="outline" className="text-xs">Falta nombre</Badge>}
            {selectedPlatforms.length === 0 && <Badge variant="outline" className="text-xs">Falta plataformas</Badge>}
            {!location && <Badge variant="outline" className="text-xs">Falta ubicacion</Badge>}
            {!Object.values(interests).some((v) => v !== 50) && <Badge variant="outline" className="text-xs">Ajustar intereses</Badge>}
          </div>
        </CardContent>
      </Card>

      {/* Info basica */}
      <Card>
        <CardHeader className="cursor-pointer" onClick={() => toggleSection("info")}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <CardTitle className="text-lg">Informacion del Perfil</CardTitle>
            </div>
            {expandedSections.info ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </div>
        </CardHeader>
        {expandedSections.info && (
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nombre del perfil"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Ubicacion</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ciudad, Pais"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripcion</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe el perfil de consumo: quien es, que busca, como usa las redes..."
                rows={3}
              />
              <p className="text-xs text-muted-foreground">{description.length}/500 caracteres</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Rango de edad</Label>
                <Select value={ageRange} onValueChange={setAgeRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AGE_RANGES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r} anos
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="objective">Objetivo principal</Label>
                <Select value={objective} onValueChange={setObjective}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {OBJECTIVES.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Horas diarias: {dailyHours}h</Label>
                <Slider
                  value={[dailyHours]}
                  onValueChange={([v]) => setDailyHours(v)}
                  min={0.5}
                  max={12}
                  step={0.5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0.5h</span>
                  <span>12h</span>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Plataformas */}
      <Card>
        <CardHeader className="cursor-pointer" onClick={() => toggleSection("platforms")}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-primary" />
              <CardTitle className="text-lg">Plataformas</CardTitle>
              {selectedPlatforms.length > 0 && (
                <Badge variant="secondary" className="text-xs">{selectedPlatforms.length} seleccionadas</Badge>
              )}
            </div>
            {expandedSections.platforms ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </div>
        </CardHeader>
        {expandedSections.platforms && (
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">Selecciona las plataformas que usa este perfil habitualmente</p>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {PLATFORMS.map((p) => {
                const selected = selectedPlatforms.includes(p)
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePlatform(p)}
                    className={`flex flex-col items-center gap-1.5 rounded-lg border p-4 text-sm font-medium transition-all ${
                      selected
                        ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/20"
                        : "border-border bg-card text-card-foreground hover:bg-secondary"
                    }`}
                  >
                    <span className="font-semibold">{PLATFORM_LABELS[p]}</span>
                    {selected && (
                      <Badge className="text-xs bg-primary text-primary-foreground">Activa</Badge>
                    )}
                  </button>
                )
              })}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Intereses */}
      <Card>
        <CardHeader className="cursor-pointer" onClick={() => toggleSection("interests")}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-primary" />
              <CardTitle className="text-lg">Pesos de Intereses</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); resetInterests() }}>
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                Resetear
              </Button>
              {expandedSections.interests ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </div>
          </div>
        </CardHeader>
        {expandedSections.interests && (
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Ajusta el nivel de interes (0-100%) para cada tema. Esto determina que contenidos son relevantes para el perfil.</p>
            <div className="grid gap-4 md:grid-cols-2">
              {THEMES.map((theme) => (
                <div key={theme} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">{theme}</Label>
                    <span className={`text-xs font-mono ${
                      interests[theme] >= 70 ? "text-primary font-semibold" :
                      interests[theme] <= 30 ? "text-muted-foreground" : "text-muted-foreground"
                    }`}>
                      {interests[theme]}%
                    </span>
                  </div>
                  <Slider
                    value={[interests[theme]]}
                    onValueChange={([v]) =>
                      setInterests((prev) => ({ ...prev, [theme]: v }))
                    }
                    min={0}
                    max={100}
                    step={5}
                  />
                </div>
              ))}
            </div>

            {/* Summary of interests */}
            <Separator />
            <div className="grid gap-3 sm:grid-cols-2">
              {highInterests.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-card-foreground mb-1.5">Intereses altos (&gt;=70%)</p>
                  <div className="flex flex-wrap gap-1">
                    {highInterests.map(([t, v]) => (
                      <Badge key={t} className="text-xs bg-primary/10 text-primary border-0">{t} {v}%</Badge>
                    ))}
                  </div>
                </div>
              )}
              {lowInterests.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-card-foreground mb-1.5">Intereses bajos (&lt;=30%)</p>
                  <div className="flex flex-wrap gap-1">
                    {lowInterests.map(([t, v]) => (
                      <Badge key={t} variant="outline" className="text-xs">{t} {v}%</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Temas sensibles */}
      <Card>
        <CardHeader className="cursor-pointer" onClick={() => toggleSection("sensitive")}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-destructive" />
              <CardTitle className="text-lg">Limites y Temas Sensibles</CardTitle>
              {sensitiveTopics.length > 0 && (
                <Badge variant="destructive" className="text-xs">{sensitiveTopics.length}</Badge>
              )}
            </div>
            {expandedSections.sensitive ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </div>
        </CardHeader>
        {expandedSections.sensitive && (
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-destructive/5 border border-destructive/20 p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Selecciona temas que el perfil desea limitar o evitar. El sistema
                  marcara estos contenidos como potencialmente no deseados para este perfil
                  y podra filtrarlos automaticamente.
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {THEMES.map((theme) => (
                <div key={theme} className="flex items-center space-x-2">
                  <Checkbox
                    id={`sensitive-${theme}`}
                    checked={sensitiveTopics.includes(theme)}
                    onCheckedChange={() => toggleSensitiveTopic(theme)}
                  />
                  <label
                    htmlFor={`sensitive-${theme}`}
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {theme}
                  </label>
                </div>
              ))}
            </div>
            {sensitiveTopics.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {sensitiveTopics.map((t) => (
                  <Badge key={t} variant="destructive" className="text-xs cursor-pointer" onClick={() => toggleSensitiveTopic(t)}>
                    {t} x
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Acciones */}
      <div className="flex items-center gap-3 justify-between">
        <p className="text-xs text-muted-foreground">
          * Los campos nombre y plataformas son obligatorios
        </p>
        <div className="flex items-center gap-3">
          {onCancel && (
            <Button variant="outline" className="bg-transparent" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button onClick={handleSubmit} disabled={!name || selectedPlatforms.length === 0}>
            <Save className="h-4 w-4 mr-1.5" />
            {profile ? "Guardar Cambios" : "Crear Perfil"}
          </Button>
        </div>
      </div>
    </div>
  )
}
