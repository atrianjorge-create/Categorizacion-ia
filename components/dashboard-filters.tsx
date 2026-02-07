"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  THEMES,
  TONES,
  FORMATS,
  PLATFORM_LABELS,
  type Platform,
  type Theme,
  type Tone,
  type Format,
} from "@/lib/types"
import type { Profile } from "@/lib/types"
import { X, Filter } from "lucide-react"

interface DashboardFiltersProps {
  profiles: Profile[]
  selectedProfile: string
  onProfileChange: (id: string) => void
  selectedPlatform: string
  onPlatformChange: (p: string) => void
  selectedTheme: string
  onThemeChange: (t: string) => void
  selectedTone: string
  onToneChange: (t: string) => void
  selectedFormat: string
  onFormatChange: (f: string) => void
  onReset: () => void
}

export function DashboardFilters({
  profiles,
  selectedProfile,
  onProfileChange,
  selectedPlatform,
  onPlatformChange,
  selectedTheme,
  onThemeChange,
  selectedTone,
  onToneChange,
  selectedFormat,
  onFormatChange,
  onReset,
}: DashboardFiltersProps) {
  const hasFilters =
    selectedProfile !== "all" ||
    selectedPlatform !== "all" ||
    selectedTheme !== "all" ||
    selectedTone !== "all" ||
    selectedFormat !== "all"

  const platforms: Platform[] = [
    "instagram",
    "tiktok",
    "youtube",
    "twitter",
    "linkedin",
  ]

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">Filtros</span>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onReset} className="ml-auto">
            <X className="h-3.5 w-3.5 mr-1" />
            Limpiar
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Select value={selectedProfile} onValueChange={onProfileChange}>
          <SelectTrigger className="w-[180px] h-9 text-sm">
            <SelectValue placeholder="Perfil" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los perfiles</SelectItem>
            {profiles.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedPlatform} onValueChange={onPlatformChange}>
          <SelectTrigger className="w-[160px] h-9 text-sm">
            <SelectValue placeholder="Plataforma" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {platforms.map((p) => (
              <SelectItem key={p} value={p}>
                {PLATFORM_LABELS[p]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedTheme} onValueChange={onThemeChange}>
          <SelectTrigger className="w-[150px] h-9 text-sm">
            <SelectValue placeholder="Tema" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los temas</SelectItem>
            {THEMES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedTone} onValueChange={onToneChange}>
          <SelectTrigger className="w-[140px] h-9 text-sm">
            <SelectValue placeholder="Tono" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tonos</SelectItem>
            {TONES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedFormat} onValueChange={onFormatChange}>
          <SelectTrigger className="w-[150px] h-9 text-sm">
            <SelectValue placeholder="Formato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {FORMATS.map((f) => (
              <SelectItem key={f} value={f}>
                {f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <div className="flex flex-wrap gap-1.5">
          {selectedProfile !== "all" && (
            <Badge variant="secondary" className="text-xs gap-1">
              Perfil: {profiles.find((p) => p.id === selectedProfile)?.name}
              <button type="button" onClick={() => onProfileChange("all")} aria-label="Quitar filtro perfil">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {selectedPlatform !== "all" && (
            <Badge variant="secondary" className="text-xs gap-1">
              {PLATFORM_LABELS[selectedPlatform as Platform]}
              <button type="button" onClick={() => onPlatformChange("all")} aria-label="Quitar filtro plataforma">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {selectedTheme !== "all" && (
            <Badge variant="secondary" className="text-xs gap-1">
              {selectedTheme}
              <button type="button" onClick={() => onThemeChange("all")} aria-label="Quitar filtro tema">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {selectedTone !== "all" && (
            <Badge variant="secondary" className="text-xs gap-1">
              {selectedTone}
              <button type="button" onClick={() => onToneChange("all")} aria-label="Quitar filtro tono">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {selectedFormat !== "all" && (
            <Badge variant="secondary" className="text-xs gap-1">
              {selectedFormat}
              <button type="button" onClick={() => onFormatChange("all")} aria-label="Quitar filtro formato">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
