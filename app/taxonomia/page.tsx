"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { THEMES, TONES, INTENTS, FORMATS, RISK_LEVELS, PLATFORM_LABELS, PLATFORM_COLORS } from "@/lib/types"
import { SEED_CONTENTS } from "@/lib/seed-data"
import { Tag, Sparkles, Shield, Palette, MonitorPlay, AlertTriangle, CheckCircle, AlertCircle, Info, BookOpen, BrainCircuit, Layers, FileText } from "lucide-react"

const THEME_DESCRIPTIONS: Record<string, { description: string; examples: string; riskFactors: string }> = {
  Salud: { description: "Contenido relacionado con salud fisica, mental, nutricion, bienestar y autocuidado.", examples: "Rutinas de ejercicio, consejos nutricionales, salud mental, meditacion, dietas", riskFactors: "Consejo medico sin cualificacion, promocion de dietas peligrosas, desinformacion sanitaria" },
  Humor: { description: "Contenido comico, memes, parodias y entretenimiento humoristico.", examples: "Sketches, POVs comicos, memes, parodias de situaciones cotidianas", riskFactors: "Humor a costa de colectivos vulnerables, normalizacion de conductas inadecuadas" },
  Relaciones: { description: "Contenido sobre relaciones interpersonales, amistad, pareja y dinamicas sociales.", examples: "Consejos de pareja, dinamicas familiares, experiencias de amistad", riskFactors: "Consejo psicologico no profesional, idealizacion de relaciones toxicas" },
  Tecnologia: { description: "Contenido sobre tecnologia, software, hardware, IA y transformacion digital.", examples: "Reviews de productos, tutoriales, noticias tech, IA, programacion", riskFactors: "Promocion encubierta de productos, hype sin fundamento" },
  Politica: { description: "Contenido sobre politica, gobierno, legislacion y asuntos publicos.", examples: "Noticias politicas, debates, declaraciones, analisis electoral", riskFactors: "Polarizacion, desinformacion, sesgos editoriales, falta de contexto" },
  Educacion: { description: "Contenido educativo, formativo, tutoriales y desarrollo profesional.", examples: "Cursos online, tutoriales, guias, divulgacion cientifica", riskFactors: "Informacion desactualizada, pseudociencia disfrazada de educacion" },
  Finanzas: { description: "Contenido sobre finanzas personales, inversiones, economia y criptomonedas.", examples: "Consejos de inversion, ahorro, criptomonedas, educacion financiera", riskFactors: "Consejo financiero no regulado, esquemas piramidales, promesas de ganancias" },
  Deporte: { description: "Contenido deportivo: fitness, rutinas, competiciones y vida activa.", examples: "Rutinas de gym, HIIT, running, deportes de equipo, nutricion deportiva", riskFactors: "Entrenamiento peligroso sin supervision, promocion de sustancias" },
  Entretenimiento: { description: "Contenido de ocio: series, peliculas, musica, gaming y lifestyle.", examples: "Reviews de series, playlists, gaming, vlogs, lifestyle", riskFactors: "Promocion de consumismo, contenido adictivo, spoilers sin aviso" },
  Viajes: { description: "Contenido sobre viajes, destinos, turismo y experiencias culturales.", examples: "Guias de viaje, vlogs, destinos baratos, road trips, experiencias", riskFactors: "Turismo irresponsable, expectativas irreales, publicidad encubierta" },
  Cocina: { description: "Contenido culinario: recetas, tecnicas, restaurantes y alimentacion.", examples: "Recetas paso a paso, meal prep, restaurantes, hacks de cocina", riskFactors: "Higiene alimentaria, alergenos no mencionados, dietas sin base" },
  Moda: { description: "Contenido de moda, belleza, estilo personal y tendencias.", examples: "Outfits, hauls, skincare, tendencias, reviews de productos", riskFactors: "Estandares de belleza irreales, consumismo, promocion encubierta" },
}

const TONE_DESCRIPTIONS: Record<string, { description: string; indicators: string[] }> = {
  Positivo: { description: "Contenido con lenguaje motivacional, optimista, constructivo y alentador.", indicators: ["Palabras como 'mejor', 'genial', 'increible', 'facil'", "Tono motivacional", "Enfoque en soluciones"] },
  Negativo: { description: "Contenido con carga emocional negativa, critica destructiva o sensacionalismo.", indicators: ["Palabras como 'peor', 'terrible', 'crisis', 'drama'", "Tono de alarma", "Enfoque en problemas"] },
  Neutro: { description: "Contenido informativo sin carga emocional significativa, equilibrado y objetivo.", indicators: ["Lenguaje informativo", "Datos y hechos", "Sin adjetivos calificativos extremos"] },
  Sarcastico: { description: "Contenido con ironia, humor acido, exageracion intencionada o parodia.", indicators: ["Estructura POV", "Exageracion deliberada", "Ironia textual", "Formato 'literalmente nadie:'"] },
  Emocional: { description: "Contenido con alta carga emocional, testimonios personales o apelacion a sentimientos.", indicators: ["Testimonios en primera persona", "Apelacion a emociones", "Lenguaje vulnerable"] },
}

const INTENT_DESCRIPTIONS: Record<string, { description: string; markers: string[] }> = {
  Informar: { description: "El proposito es transmitir informacion factual o analisis objetivos.", markers: ["Estructura de noticia", "Datos verificables", "Fuentes citadas"] },
  Entretener: { description: "El objetivo es generar entretenimiento, risas o disfrute pasivo.", markers: ["Formato de ocio", "Humor o drama", "Sin proposito educativo directo"] },
  Vender: { description: "Intencion comercial: promocion de productos, servicios o afiliacion.", markers: ["CTAs ('compra ahora')", "Links de afiliados", "Urgencia artificial", "Descuentos"] },
  Polarizar: { description: "Busca generar division, reacciones extremas o engagement mediante controversia.", markers: ["Titulos sensacionalistas", "Falta de matices", "Apelacion a 'verdades ocultas'"] },
  Educar: { description: "Proposito formativo con estructura didactica y valor de aprendizaje.", markers: ["Paso a paso", "Tutoriales", "Guias estructuradas", "Lenguaje didactico"] },
  Inspirar: { description: "Busca motivar, generar aspiracion o modelar comportamientos positivos.", markers: ["Testimonios de exito", "Rutinas aspiracionales", "Storytelling personal"] },
}

export default function TaxonomiaPage() {
  const contents = SEED_CONTENTS

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground text-balance">Taxonomia de Categorizacion</h1>
        <p className="text-muted-foreground mt-1">
          Documentacion completa del sistema de clasificacion: definiciones, criterios de deteccion, indicadores de riesgo
          y guia de interpretacion de cada dimension del modelo.
        </p>
      </div>

      {/* Overview */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "Temas", value: THEMES.length, icon: Tag, color: "text-primary" },
          { label: "Tonos", value: TONES.length, icon: Palette, color: "text-[hsl(var(--chart-2))]" },
          { label: "Intenciones", value: INTENTS.length, icon: Sparkles, color: "text-[hsl(var(--chart-3))]" },
          { label: "Formatos", value: FORMATS.length, icon: MonitorPlay, color: "text-[hsl(var(--chart-4))]" },
          { label: "Niveles Riesgo", value: RISK_LEVELS.length, icon: Shield, color: "text-destructive" },
          { label: "Plataformas", value: 5, icon: Layers, color: "text-[hsl(var(--chart-5))]" },
        ].map(item => (
          <Card key={item.label}>
            <CardContent className="p-3 text-center">
              <item.icon className={`h-5 w-5 mx-auto mb-1 ${item.color}`} />
              <p className="text-2xl font-bold text-card-foreground">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="temas" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="temas">Temas</TabsTrigger>
          <TabsTrigger value="tonos">Tonos</TabsTrigger>
          <TabsTrigger value="intenciones">Intenciones</TabsTrigger>
          <TabsTrigger value="riesgo">Niveles de Riesgo</TabsTrigger>
          <TabsTrigger value="formatos">Formatos</TabsTrigger>
          <TabsTrigger value="plataformas">Plataformas</TabsTrigger>
          <TabsTrigger value="metodologia">Metodologia</TabsTrigger>
        </TabsList>

        {/* TEMAS */}
        <TabsContent value="temas" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {THEMES.map((theme) => {
              const desc = THEME_DESCRIPTIONS[theme]
              const count = contents.filter(c => c.aiTags.themes.includes(theme)).length
              return (
                <Card key={theme}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold">{theme}</CardTitle>
                      <Badge variant="secondary" className="text-xs">{count} contenidos</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground leading-relaxed">{desc.description}</p>
                    <div>
                      <p className="text-xs font-medium text-card-foreground mb-1">Ejemplos:</p>
                      <p className="text-xs text-muted-foreground">{desc.examples}</p>
                    </div>
                    <div className="rounded-lg bg-destructive/5 border border-destructive/20 p-2">
                      <p className="text-xs font-medium text-card-foreground mb-0.5 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-destructive" /> Factores de riesgo
                      </p>
                      <p className="text-xs text-muted-foreground">{desc.riskFactors}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* TONOS */}
        <TabsContent value="tonos" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {TONES.map((tone) => {
              const desc = TONE_DESCRIPTIONS[tone]
              const count = contents.filter(c => c.aiTags.tone === tone).length
              return (
                <Card key={tone}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold">{tone}</CardTitle>
                      <Badge variant="secondary" className="text-xs">{count}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground leading-relaxed">{desc.description}</p>
                    <div>
                      <p className="text-xs font-medium text-card-foreground mb-1">Indicadores de deteccion:</p>
                      <ul className="space-y-0.5">
                        {desc.indicators.map(ind => (
                          <li key={ind} className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <span className="text-primary mt-0.5">-</span> {ind}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* INTENCIONES */}
        <TabsContent value="intenciones" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {INTENTS.map((intent) => {
              const desc = INTENT_DESCRIPTIONS[intent]
              const count = contents.filter(c => c.aiTags.intent === intent).length
              return (
                <Card key={intent}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold">{intent}</CardTitle>
                      <Badge variant="secondary" className="text-xs">{count}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground leading-relaxed">{desc.description}</p>
                    <div>
                      <p className="text-xs font-medium text-card-foreground mb-1">Marcadores:</p>
                      <div className="flex flex-wrap gap-1">
                        {desc.markers.map(m => (
                          <Badge key={m} variant="outline" className="text-xs">{m}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* RIESGO */}
        <TabsContent value="riesgo" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            {[
              {
                level: "Bajo", icon: CheckCircle, color: "text-[hsl(var(--success))]", border: "border-[hsl(var(--success))]/30",
                bg: "bg-[hsl(var(--success))]/5",
                description: "Contenido sin riesgos significativos. Informativo, educativo o de entretenimiento inocuo.",
                criteria: ["Sin intencion comercial agresiva", "Tono equilibrado", "Sin potencial de desinformacion", "Contenido verificable"],
              },
              {
                level: "Medio", icon: AlertCircle, color: "text-[hsl(var(--warning))]", border: "border-[hsl(var(--warning))]/30",
                bg: "bg-[hsl(var(--warning))]/5",
                description: "Contenido con riesgos moderados que requiere contexto adicional para su interpretacion.",
                criteria: ["Consejo profesional sin disclaimer", "Temas politicos o financieros", "Potencial de mala interpretacion", "Contenido emocional intenso"],
              },
              {
                level: "Alto", icon: AlertTriangle, color: "text-destructive", border: "border-destructive/30",
                bg: "bg-destructive/5",
                description: "Contenido con riesgos significativos. Puede contener desinformacion, manipulacion o intencion danina.",
                criteria: ["Intencion comercial agresiva", "Potencial de polarizacion", "Promesas sin evidencia", "Falta de contexto critico", "Contenido potencialmente danino"],
              },
            ].map(risk => {
              const count = contents.filter(c => c.aiTags.riskLevel === risk.level).length
              return (
                <Card key={risk.level} className={risk.border}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <risk.icon className={`h-5 w-5 ${risk.color}`} />
                        <CardTitle className="text-sm font-semibold">Riesgo {risk.level}</CardTitle>
                      </div>
                      <Badge variant="secondary" className="text-xs">{count} contenidos</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">{risk.description}</p>
                    <div>
                      <p className="text-xs font-medium text-card-foreground mb-1.5">Criterios de clasificacion:</p>
                      <ul className="space-y-1">
                        {risk.criteria.map(c => (
                          <li key={c} className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <span className={risk.color}>-</span> {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* FORMATOS */}
        <TabsContent value="formatos" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Formatos de Contenido</CardTitle>
              <p className="text-xs text-muted-foreground">Tipos de contenido soportados por el sistema de categorizacion</p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Formato</TableHead>
                    <TableHead>Descripcion</TableHead>
                    <TableHead className="text-center">Contenidos</TableHead>
                    <TableHead>Plataformas tipicas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { format: "Short video", desc: "Video corto (<60s). Reels, TikToks, Shorts", platforms: "TikTok, Instagram, YouTube" },
                    { format: "Long video", desc: "Video largo (>60s). Tutoriales, vlogs, reviews", platforms: "YouTube, LinkedIn" },
                    { format: "Imagen", desc: "Imagen estatica individual con o sin texto", platforms: "Instagram, Twitter" },
                    { format: "Carrusel", desc: "Multiples imagenes/slides deslizables", platforms: "Instagram, LinkedIn" },
                    { format: "Texto", desc: "Publicacion escrita, hilo o articulo", platforms: "Twitter, LinkedIn" },
                    { format: "Story", desc: "Contenido efimero de 24 horas", platforms: "Instagram, TikTok" },
                    { format: "Reel", desc: "Video vertical optimizado para engagement", platforms: "Instagram, TikTok" },
                    { format: "Live", desc: "Emision en directo con interaccion real", platforms: "YouTube, Instagram, TikTok" },
                  ].map(f => (
                    <TableRow key={f.format}>
                      <TableCell className="font-medium text-sm">
                        <Badge variant="outline" className="text-xs">{f.format}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{f.desc}</TableCell>
                      <TableCell className="text-center text-sm">{contents.filter(c => c.format === f.format).length}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{f.platforms}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PLATAFORMAS */}
        <TabsContent value="plataformas" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {([
              { platform: "instagram" as const, desc: "Red visual centrada en imagenes, reels y stories. Alto engagement con formatos visuales.", formats: ["Imagen", "Carrusel", "Reel", "Story"], audience: "18-34 anos, predominantemente femenino" },
              { platform: "tiktok" as const, desc: "Plataforma de video corto con algoritmo de descubrimiento potente. Viralidad alta.", formats: ["Short video", "Reel", "Live"], audience: "13-24 anos, ambos generos" },
              { platform: "youtube" as const, desc: "Plataforma de video largo. Ideal para contenido educativo, reviews y entretenimiento.", formats: ["Long video", "Short video", "Live"], audience: "18-44 anos, ligera mayoria masculina" },
              { platform: "twitter" as const, desc: "Microblogging y debate publico. Contenido de opinion, noticias y tendencias.", formats: ["Texto", "Short video", "Imagen"], audience: "25-44 anos, predominantemente masculino" },
              { platform: "linkedin" as const, desc: "Red profesional. Contenido de networking, carrera y liderazgo de pensamiento.", formats: ["Texto", "Carrusel", "Long video", "Live"], audience: "25-54 anos, profesionales" },
            ]).map(p => {
              const count = contents.filter(c => c.platform === p.platform).length
              return (
                <Card key={p.platform}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: PLATFORM_COLORS[p.platform] }} />
                        <CardTitle className="text-sm font-semibold">{PLATFORM_LABELS[p.platform]}</CardTitle>
                      </div>
                      <Badge variant="secondary" className="text-xs">{count}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                    <div>
                      <p className="text-xs font-medium text-card-foreground mb-1">Formatos principales:</p>
                      <div className="flex flex-wrap gap-1">
                        {p.formats.map(f => (<Badge key={f} variant="outline" className="text-xs">{f}</Badge>))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Audiencia tipica: {p.audience}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* METODOLOGIA */}
        <TabsContent value="metodologia" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Metodologia de Categorizacion</CardTitle>
              </div>
              <p className="text-xs text-muted-foreground">
                Pipeline completo de procesamiento y las decisiones de diseno detras del sistema
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                {
                  step: "1. Ingesta de Contenido",
                  desc: "El contenido se recibe con titulo, descripcion, metadatos (plataforma, formato, autor) y metricas de interaccion. Todos los campos se validan y normalizan.",
                  detail: "Se aplica limpieza de texto: eliminacion de emojis excesivos, normalizacion Unicode, deteccion de idioma."
                },
                {
                  step: "2. Extraccion de Palabras Clave",
                  desc: "Se extraen keywords del titulo y descripcion usando patron matching con diccionarios tematicos predefinidos.",
                  detail: "Cada tema tiene un diccionario de 5-10 palabras clave asociadas. Se detecta la presencia y frecuencia de cada keyword."
                },
                {
                  step: "3. Clasificacion Tematica",
                  desc: "Se asignan 1-3 temas basandose en las keywords detectadas. El tema con mas coincidencias es el tema principal.",
                  detail: "Si ningun tema tiene coincidencias, se asigna 'Entretenimiento' como default. Se permite multi-etiquetado."
                },
                {
                  step: "4. Analisis de Sentimiento / Tono",
                  desc: "Se clasifica el tono en 5 categorias: Positivo, Negativo, Neutro, Sarcastico, Emocional.",
                  detail: "Se usan listas de palabras indicadoras para cada tono. Prioridad: Sarcastico > Negativo > Positivo > Emocional > Neutro."
                },
                {
                  step: "5. Deteccion de Intencion",
                  desc: "Se identifica el proposito del contenido: Informar, Entretener, Vender, Polarizar, Educar, Inspirar.",
                  detail: "Palabras como 'compra', 'oferta' indican Vender. 'Tutorial', 'guia' indican Educar. 'Verdad oculta' indica Polarizar."
                },
                {
                  step: "6. Evaluacion de Riesgo",
                  desc: "Se asigna un nivel de riesgo (Bajo, Medio, Alto) basado en la intencion, tema y tono detectados.",
                  detail: "Intencion Vender/Polarizar -> Alto. Temas Politica/Finanzas -> Medio. Resto -> Bajo. Se consideran combinaciones."
                },
                {
                  step: "7. Calculo de Confianza",
                  desc: "Score 0-1 que indica la fiabilidad de la categorizacion. Basado en la cantidad de evidencia encontrada.",
                  detail: "Base: 0.60. Se suma 0.05 por cada keyword detectada, con maximo de 0.95. Menos keywords = menor confianza."
                },
                {
                  step: "8. Generacion de Explicabilidad",
                  desc: "Se genera un texto explicando POR QUE se tomaron las decisiones de categorizacion.",
                  detail: "Incluye: keywords detectadas, motivo del tono asignado, justificacion del riesgo. Esencial para interpretacion critica."
                },
              ].map((step, i) => (
                <div key={step.step} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {i + 1}
                    </div>
                    {i < 7 && <div className="w-0.5 flex-1 bg-border mt-2" />}
                  </div>
                  <div className="pb-6">
                    <h4 className="text-sm font-semibold text-card-foreground">{step.step}</h4>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{step.desc}</p>
                    <div className="mt-2 rounded-lg bg-secondary/50 p-2.5">
                      <p className="text-xs text-muted-foreground leading-relaxed">{step.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                <CardTitle className="text-sm font-semibold">Limitaciones del Sistema</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {[
                  "El sistema actual usa patron matching basico, no un modelo de deep learning. La precision es limitada.",
                  "No se analiza contenido multimedia (imagenes, video). Solo se procesa texto (titulo + descripcion).",
                  "El modelo de tono no detecta sarcasmo contextual complejo, solo indicadores lexicos directos.",
                  "La evaluacion de riesgo es binaria y no considera el contexto completo ni la audiencia objetivo.",
                  "Los scores de confianza son heuristicos, no probabilidades calibradas de un modelo estadistico.",
                  "El sistema no aprende de correcciones manuales. No hay feedback loop implementado.",
                  "Las keywords son estaticas y predefinidas. No se adaptan a nuevas tendencias o argot.",
                ].map(limit => (
                  <li key={limit} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="h-3.5 w-3.5 text-[hsl(var(--warning))] mt-0.5 flex-shrink-0" />
                    <span>{limit}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
