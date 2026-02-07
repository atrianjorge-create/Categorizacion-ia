"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PLATFORM_LABELS, type Content } from "@/lib/types"
import { Info, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react"

function RiskBadge({ level }: { level: string }) {
  if (level === "Alto") {
    return (
      <Badge variant="destructive" className="text-xs gap-1">
        <AlertTriangle className="h-3 w-3" />
        Alto
      </Badge>
    )
  }
  if (level === "Medio") {
    return (
      <Badge className="text-xs gap-1 bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))]">
        <AlertCircle className="h-3 w-3" />
        Medio
      </Badge>
    )
  }
  return (
    <Badge variant="secondary" className="text-xs gap-1">
      <CheckCircle className="h-3 w-3" />
      Bajo
    </Badge>
  )
}

function ConfidenceBar({ value }: { value: number }) {
  const percent = Math.round(value * 100)
  const colorClass =
    percent >= 80
      ? "bg-[hsl(var(--success))]"
      : percent >= 60
        ? "bg-[hsl(var(--warning))]"
        : "bg-destructive"

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${colorClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-xs font-mono text-muted-foreground">{percent}%</span>
    </div>
  )
}

export function ContentTable({ contents }: { contents: Content[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Contenidos Recientes</CardTitle>
        <p className="text-xs text-muted-foreground">
          Ultimos contenidos analizados con etiquetas IA y explicabilidad
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Titulo</TableHead>
                <TableHead>Plataforma</TableHead>
                <TableHead>Formato</TableHead>
                <TableHead>Tema</TableHead>
                <TableHead>Tono</TableHead>
                <TableHead>Intencion</TableHead>
                <TableHead>Riesgo</TableHead>
                <TableHead>Confianza</TableHead>
                <TableHead className="w-[40px]">
                  <span className="sr-only">Info</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contents.map((content) => (
                <TableRow key={content.id}>
                  <TableCell className="font-medium text-sm">
                    <div>
                      <p className="truncate max-w-[250px]">{content.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {content.author} - {content.publishedAt}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {PLATFORM_LABELS[content.platform]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {content.format}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {content.aiTags.themes.map((t) => (
                        <Badge key={t} variant="secondary" className="text-xs">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">{content.aiTags.tone}</TableCell>
                  <TableCell className="text-xs">{content.aiTags.intent}</TableCell>
                  <TableCell>
                    <RiskBadge level={content.aiTags.riskLevel} />
                  </TableCell>
                  <TableCell>
                    <ConfidenceBar value={content.aiTags.confidence} />
                  </TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button type="button" className="text-muted-foreground hover:text-foreground" aria-label="Ver explicacion IA">
                            <Info className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="max-w-[300px]">
                          <p className="text-xs font-medium mb-1">Explicabilidad IA</p>
                          <p className="text-xs">{content.aiTags.explanation}</p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {content.aiTags.keywords.map((k) => (
                              <Badge key={k} variant="outline" className="text-xs">
                                {k}
                              </Badge>
                            ))}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
