"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MYSQL_SCHEMA } from "@/lib/seed-data"
import { Database, Table2, Key, Link2, Code2, Server } from "lucide-react"

const ENTITIES = [
  {
    name: "profiles",
    description: "Perfiles de consumo con atributos editables, intereses ponderados y contexto situacional",
    columns: [
      { name: "id", type: "VARCHAR(36)", pk: true },
      { name: "name", type: "VARCHAR(100)", pk: false },
      { name: "description", type: "TEXT", pk: false },
      { name: "avatar", type: "VARCHAR(10)", pk: false },
      { name: "interests", type: "JSON", pk: false },
      { name: "platforms", type: "JSON", pk: false },
      { name: "context_age_range", type: "VARCHAR(20)", pk: false },
      { name: "context_location", type: "VARCHAR(100)", pk: false },
      { name: "context_objective", type: "VARCHAR(200)", pk: false },
      { name: "context_daily_hours", type: "DECIMAL(3,1)", pk: false },
      { name: "context_sensitive_topics", type: "JSON", pk: false },
      { name: "created_at", type: "TIMESTAMP", pk: false },
      { name: "updated_at", type: "TIMESTAMP", pk: false },
    ],
  },
  {
    name: "contents",
    description: "Contenidos de redes sociales con metadatos y metricas de interaccion",
    columns: [
      { name: "id", type: "VARCHAR(36)", pk: true },
      { name: "title", type: "VARCHAR(255)", pk: false },
      { name: "description", type: "TEXT", pk: false },
      { name: "platform", type: "ENUM", pk: false },
      { name: "format", type: "ENUM", pk: false },
      { name: "published_at", type: "DATE", pk: false },
      { name: "author", type: "VARCHAR(100)", pk: false },
      { name: "url", type: "VARCHAR(500)", pk: false },
      { name: "views", type: "INT", pk: false },
      { name: "likes_count", type: "INT", pk: false },
      { name: "comments_count", type: "INT", pk: false },
      { name: "shares_count", type: "INT", pk: false },
      { name: "saved_count", type: "INT", pk: false },
      { name: "estimated_watch_time", type: "INT", pk: false },
    ],
  },
  {
    name: "ai_tags",
    description: "Etiquetas generadas por IA: temas, tono, intencion, riesgo y explicabilidad",
    columns: [
      { name: "id", type: "VARCHAR(36)", pk: true },
      { name: "content_id", type: "VARCHAR(36) FK", pk: false },
      { name: "themes", type: "JSON", pk: false },
      { name: "primary_theme", type: "VARCHAR(50)", pk: false },
      { name: "tone", type: "ENUM", pk: false },
      { name: "intent", type: "ENUM", pk: false },
      { name: "risk_level", type: "ENUM", pk: false },
      { name: "confidence", type: "DECIMAL(3,2)", pk: false },
      { name: "keywords", type: "JSON", pk: false },
      { name: "explanation", type: "TEXT", pk: false },
    ],
  },
  {
    name: "aggregated_metrics",
    description: "Metricas agregadas por perfil, plataforma y periodo temporal",
    columns: [
      { name: "id", type: "VARCHAR(36)", pk: true },
      { name: "profile_id", type: "VARCHAR(36) FK", pk: false },
      { name: "platform", type: "ENUM", pk: false },
      { name: "period", type: "VARCHAR(7)", pk: false },
      { name: "theme_distribution", type: "JSON", pk: false },
      { name: "tone_distribution", type: "JSON", pk: false },
      { name: "intent_distribution", type: "JSON", pk: false },
      { name: "format_distribution", type: "JSON", pk: false },
      { name: "total_contents", type: "INT", pk: false },
      { name: "avg_confidence", type: "DECIMAL(3,2)", pk: false },
      { name: "risk_distribution", type: "JSON", pk: false },
    ],
  },
  {
    name: "profile_content_interactions",
    description: "Interacciones entre perfiles y contenidos (views, likes, saves, shares)",
    columns: [
      { name: "id", type: "VARCHAR(36)", pk: true },
      { name: "profile_id", type: "VARCHAR(36) FK", pk: false },
      { name: "content_id", type: "VARCHAR(36) FK", pk: false },
      { name: "interaction_type", type: "ENUM", pk: false },
      { name: "interaction_at", type: "TIMESTAMP", pk: false },
    ],
  },
]

const API_ENDPOINTS = [
  {
    method: "GET",
    path: "/api/profiles",
    description: "Lista todos los perfiles de consumo",
    params: [],
  },
  {
    method: "POST",
    path: "/api/profiles",
    description: "Crea un nuevo perfil",
    params: ["body: Profile object"],
  },
  {
    method: "GET",
    path: "/api/contents",
    description: "Lista contenidos con filtros opcionales",
    params: ["platform", "theme", "tone", "format", "limit"],
  },
  {
    method: "GET",
    path: "/api/metrics",
    description: "Metricas agregadas, opcionalmente por perfil",
    params: ["profileId"],
  },
]

export default function SchemaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground text-balance">
          Base de Datos y API
        </h1>
        <p className="text-muted-foreground mt-1">
          Estructura de datos, schema MySQL, endpoints REST y documentacion tecnica
        </p>
      </div>

      <Tabs defaultValue="modelo" className="space-y-4">
        <TabsList>
          <TabsTrigger value="modelo">Modelo de Datos</TabsTrigger>
          <TabsTrigger value="sql">Schema MySQL</TabsTrigger>
          <TabsTrigger value="api">Endpoints API</TabsTrigger>
        </TabsList>

        {/* Modelo de datos visual */}
        <TabsContent value="modelo" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {ENTITIES.map((entity) => (
              <Card key={entity.name}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Table2 className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base font-mono">
                      {entity.name}
                    </CardTitle>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {entity.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {entity.columns.map((col) => (
                      <div
                        key={col.name}
                        className="flex items-center justify-between py-1 px-2 rounded text-sm hover:bg-secondary/50"
                      >
                        <div className="flex items-center gap-2">
                          {col.pk && (
                            <Key className="h-3 w-3 text-primary" />
                          )}
                          {col.type.includes("FK") && (
                            <Link2 className="h-3 w-3 text-[hsl(var(--success))]" />
                          )}
                          <span
                            className={`font-mono text-xs ${
                              col.pk
                                ? "font-semibold text-primary"
                                : "text-card-foreground"
                            }`}
                          >
                            {col.name}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-xs font-mono"
                        >
                          {col.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Relaciones */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Link2 className="h-5 w-5 text-[hsl(var(--success))]" />
                <CardTitle className="text-base">Relaciones</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  "ai_tags.content_id -> contents.id (1:1)",
                  "aggregated_metrics.profile_id -> profiles.id (N:1)",
                  "profile_content_interactions.profile_id -> profiles.id (N:1)",
                  "profile_content_interactions.content_id -> contents.id (N:1)",
                ].map((rel) => (
                  <div
                    key={rel}
                    className="flex items-center gap-2 py-1.5 px-3 rounded bg-secondary/30 text-sm font-mono"
                  >
                    <Link2 className="h-3 w-3 text-muted-foreground" />
                    <span className="text-card-foreground">{rel}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SQL Schema */}
        <TabsContent value="sql">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Schema MySQL Completo</CardTitle>
              </div>
              <p className="text-xs text-muted-foreground">
                Script SQL listo para ejecutar en MySQL. Incluye tablas, relaciones
                e indices de rendimiento.
              </p>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-[hsl(220,25%,12%)] p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-[hsl(220,10%,85%)] whitespace-pre leading-relaxed">
                  {MYSQL_SCHEMA}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Endpoints */}
        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Server className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Endpoints REST API</CardTitle>
              </div>
              <p className="text-xs text-muted-foreground">
                Mock API funcional con datos sinteticos. Lista para conectar a MySQL en produccion.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {API_ENDPOINTS.map((endpoint) => (
                  <div
                    key={`${endpoint.method}-${endpoint.path}`}
                    className="rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        className={`text-xs font-mono ${
                          endpoint.method === "GET"
                            ? "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]"
                            : "bg-primary text-primary-foreground"
                        }`}
                      >
                        {endpoint.method}
                      </Badge>
                      <code className="text-sm font-mono text-card-foreground">
                        {endpoint.path}
                      </code>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {endpoint.description}
                    </p>
                    {endpoint.params.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {endpoint.params.map((param) => (
                          <Badge
                            key={param}
                            variant="outline"
                            className="text-xs font-mono"
                          >
                            ?{param}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Code2 className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Ejemplo de Uso</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-[hsl(220,25%,12%)] p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-[hsl(220,10%,85%)] whitespace-pre leading-relaxed">{`// Obtener todos los perfiles
const res = await fetch('/api/profiles')
const profiles = await res.json()

// Obtener contenidos filtrados
const res2 = await fetch('/api/contents?platform=instagram&theme=Salud')
const { total, contents } = await res2.json()

// Obtener metricas de un perfil
const res3 = await fetch('/api/metrics?profileId=p1')
const { metrics } = await res3.json()

// Crear un nuevo perfil
const res4 = await fetch('/api/profiles', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 'p5',
    name: 'Nuevo Perfil',
    interests: { Salud: 80, Tecnologia: 60 },
    platforms: ['instagram', 'youtube'],
    context: { ageRange: '25-29', location: 'Madrid' }
  })
})`}</pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
