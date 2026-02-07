"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { PLATFORM_LABELS, type Profile } from "@/lib/types"
import { Pencil, Trash2, Eye } from "lucide-react"
import Link from "next/link"

interface ProfileCardProps {
  profile: Profile
  onDelete?: (id: string) => void
}

export function ProfileCard({ profile, onDelete }: ProfileCardProps) {
  const topInterests = Object.entries(profile.interests)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)

  return (
    <Card className="group transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 bg-primary text-primary-foreground">
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-sm">
                {profile.avatar}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-card-foreground">{profile.name}</h3>
              <p className="text-xs text-muted-foreground">
                {profile.context.ageRange} - {profile.context.location}
              </p>
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <Link href={`/perfiles/${profile.id}`}>
                <Eye className="h-3.5 w-3.5" />
                <span className="sr-only">Ver perfil</span>
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <Link href={`/perfiles/${profile.id}/editar`}>
                <Pencil className="h-3.5 w-3.5" />
                <span className="sr-only">Editar perfil</span>
              </Link>
            </Button>
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => onDelete(profile.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="sr-only">Eliminar perfil</span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {profile.description}
        </p>

        <div>
          <p className="text-xs font-medium text-card-foreground mb-1.5">Plataformas</p>
          <div className="flex flex-wrap gap-1.5">
            {profile.platforms.map((p) => (
              <Badge key={p} variant="secondary" className="text-xs">
                {PLATFORM_LABELS[p]}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-card-foreground mb-1.5">Top intereses</p>
          <div className="space-y-1.5">
            {topInterests.map(([theme, value]) => (
              <div key={theme} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-20 truncate">
                  {theme}
                </span>
                <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${value}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-8 text-right">
                  {value}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
          <span>{profile.context.dailyHours}h/dia</span>
          <span>Obj: {profile.context.objective}</span>
        </div>
      </CardContent>
    </Card>
  )
}
