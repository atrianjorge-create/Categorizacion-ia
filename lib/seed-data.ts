import type {
  Profile,
  Content,
  Platform,
  Theme,
  Tone,
  Intent,
  Format,
  RiskLevel,
  AggregatedMetrics,
} from "./types"
import { THEMES, TONES, INTENTS, FORMATS, RISK_LEVELS } from "./types"

// =============================================
// DATASET SINTETICO / SEMILLA
// Simula datos que vendrian de MySQL
// =============================================

// ---- DETERMINISTIC PRNG (mulberry32) to avoid hydration mismatch ----
function createPRNG(seed: number) {
  let s = seed | 0
  return function next(): number {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const prng = createPRNG(42)

function randomBetween(min: number, max: number): number {
  return Math.floor(prng() * (max - min + 1)) + min
}

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(prng() * arr.length)]
}

function pickRandomN<T>(arr: readonly T[], n: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - prng())
  return shuffled.slice(0, n)
}

// ---- PERFILES DE EJEMPLO (6 perfiles) ----
export const SEED_PROFILES: Profile[] = [
  {
    id: "p1",
    name: "Ana Garcia",
    description: "Estudiante universitaria de psicologia interesada en salud mental, bienestar digital y vida saludable. Busca contenido educativo y motivacional.",
    avatar: "AG",
    interests: {
      Salud: 85, Educacion: 70, Tecnologia: 60, Entretenimiento: 40,
      Humor: 55, Relaciones: 30, Politica: 10, Finanzas: 25,
      Deporte: 45, Viajes: 35, Cocina: 50, Moda: 65,
    },
    platforms: ["instagram", "tiktok", "youtube"],
    context: {
      ageRange: "18-24", location: "Madrid, Espana",
      objective: "Informarse y entretenerse", dailyHours: 3.5,
      sensitiveTopics: ["Politica"],
    },
    createdAt: "2025-01-15", updatedAt: "2025-06-01",
  },
  {
    id: "p2",
    name: "Carlos Lopez",
    description: "Profesional de marketing digital con 8 anos de experiencia. Analista de tendencias sociales y comportamiento de audiencias en plataformas digitales.",
    avatar: "CL",
    interests: {
      Salud: 20, Educacion: 40, Tecnologia: 90, Entretenimiento: 35,
      Humor: 25, Relaciones: 15, Politica: 55, Finanzas: 80,
      Deporte: 30, Viajes: 45, Cocina: 10, Moda: 50,
    },
    platforms: ["twitter", "linkedin", "youtube", "instagram"],
    context: {
      ageRange: "30-39", location: "Barcelona, Espana",
      objective: "Analizar tendencias del mercado", dailyHours: 5,
      sensitiveTopics: [],
    },
    createdAt: "2025-02-10", updatedAt: "2025-06-15",
  },
  {
    id: "p3",
    name: "Maria Rodriguez",
    description: "Adolescente de 16 anos que consume principalmente contenido de entretenimiento, moda y tendencias virales. Alta exposicion a redes sociales.",
    avatar: "MR",
    interests: {
      Salud: 15, Educacion: 20, Tecnologia: 30, Entretenimiento: 95,
      Humor: 90, Relaciones: 60, Politica: 5, Finanzas: 5,
      Deporte: 40, Viajes: 50, Cocina: 35, Moda: 85,
    },
    platforms: ["tiktok", "instagram"],
    context: {
      ageRange: "13-17", location: "Valencia, Espana",
      objective: "Entretenerse", dailyHours: 4.5,
      sensitiveTopics: ["Politica", "Finanzas"],
    },
    createdAt: "2025-03-01", updatedAt: "2025-06-20",
  },
  {
    id: "p4",
    name: "Jorge Fernandez",
    description: "Deportista semiprofesional de 27 anos enfocado en fitness, nutricion deportiva y rendimiento fisico. Busca contenido tecnico y especializado.",
    avatar: "JF",
    interests: {
      Salud: 90, Educacion: 35, Tecnologia: 25, Entretenimiento: 50,
      Humor: 40, Relaciones: 20, Politica: 10, Finanzas: 30,
      Deporte: 95, Viajes: 55, Cocina: 70, Moda: 15,
    },
    platforms: ["youtube", "instagram", "tiktok"],
    context: {
      ageRange: "25-29", location: "Sevilla, Espana",
      objective: "Mejorar rendimiento fisico", dailyHours: 2,
      sensitiveTopics: [],
    },
    createdAt: "2025-04-05", updatedAt: "2025-06-25",
  },
  {
    id: "p5",
    name: "Laura Mendez",
    description: "Periodista freelance de 35 anos especializada en cultura digital y nuevos medios. Investiga el impacto de las redes sociales en la sociedad.",
    avatar: "LM",
    interests: {
      Salud: 40, Educacion: 85, Tecnologia: 75, Entretenimiento: 60,
      Humor: 30, Relaciones: 50, Politica: 70, Finanzas: 45,
      Deporte: 15, Viajes: 65, Cocina: 25, Moda: 35,
    },
    platforms: ["twitter", "linkedin", "youtube", "instagram", "tiktok"],
    context: {
      ageRange: "30-39", location: "Buenos Aires, Argentina",
      objective: "Investigar y analizar tendencias", dailyHours: 6,
      sensitiveTopics: [],
    },
    createdAt: "2025-01-20", updatedAt: "2025-06-28",
  },
  {
    id: "p6",
    name: "Pedro Sanchez Ruiz",
    description: "Jubilado de 62 anos que se ha iniciado en redes sociales recientemente. Interesado en noticias, salud y viajes. Poco habituado a contenido rapido.",
    avatar: "PS",
    interests: {
      Salud: 75, Educacion: 50, Tecnologia: 20, Entretenimiento: 45,
      Humor: 35, Relaciones: 40, Politica: 65, Finanzas: 55,
      Deporte: 30, Viajes: 80, Cocina: 60, Moda: 10,
    },
    platforms: ["youtube", "twitter"],
    context: {
      ageRange: "50+", location: "Bilbao, Espana",
      objective: "Mantenerse informado y entretenerse", dailyHours: 1.5,
      sensitiveTopics: ["Moda"],
    },
    createdAt: "2025-05-01", updatedAt: "2025-06-30",
  },
]

// ---- CONTENIDOS DE EJEMPLO (40 plantillas base) ----
const CONTENT_TEMPLATES: {
  title: string
  description: string
  themes: Theme[]
  tone: Tone
  intent: Intent
  format: Format
  platform: Platform
  risk: RiskLevel
  keywords: string[]
  explanation: string
}[] = [
  {
    title: "5 ejercicios para mejorar tu postura",
    description: "Rutina de 10 minutos para aliviar la tension cervical y mejorar tu bienestar diario con movimientos sencillos",
    themes: ["Salud", "Deporte"], tone: "Positivo", intent: "Educar", format: "Short video",
    platform: "tiktok", risk: "Bajo", keywords: ["postura", "ejercicios", "cervical", "salud"],
    explanation: "Clasificado como Salud/Deporte por mencion de ejercicios fisicos y bienestar corporal. Tono positivo detectado por lenguaje motivacional.",
  },
  {
    title: "La verdad sobre las criptomonedas en 2025",
    description: "Analisis profundo del mercado crypto: bitcoin, ethereum y las altcoins con mas potencial este ano",
    themes: ["Finanzas", "Tecnologia"], tone: "Neutro", intent: "Informar", format: "Long video",
    platform: "youtube", risk: "Medio", keywords: ["criptomonedas", "bitcoin", "inversion", "mercado"],
    explanation: "Clasificado como Finanzas por contenido sobre mercados e inversiones. Riesgo medio por potencial de consejo financiero sin disclaimer.",
  },
  {
    title: "POV: Tu amigo te manda un audio de 5 minutos",
    description: "Comedia sobre la vida cotidiana con amigos y las situaciones absurdas del dia a dia",
    themes: ["Humor", "Relaciones"], tone: "Sarcastico", intent: "Entretener", format: "Reel",
    platform: "instagram", risk: "Bajo", keywords: ["humor", "amigos", "audio", "whatsapp"],
    explanation: "Clasificado como Humor/Relaciones por contexto social comico. Tono sarcastico detectado por estructura POV y exageracion.",
  },
  {
    title: "Como la IA esta transformando la educacion universitaria",
    description: "Debate sobre inteligencia artificial en aulas: desde ChatGPT hasta tutores virtuales personalizados",
    themes: ["Tecnologia", "Educacion"], tone: "Neutro", intent: "Informar", format: "Texto",
    platform: "linkedin", risk: "Bajo", keywords: ["IA", "educacion", "universidad", "futuro"],
    explanation: "Clasificado como Tecnologia/Educacion por terminos de inteligencia artificial en contexto academico.",
  },
  {
    title: "Outfit de verano con 3 prendas basicas",
    description: "Moda accesible y sostenible para cualquier presupuesto. Combinaciones que funcionan siempre",
    themes: ["Moda"], tone: "Positivo", intent: "Inspirar", format: "Carrusel",
    platform: "instagram", risk: "Bajo", keywords: ["moda", "outfit", "verano", "basicos"],
    explanation: "Clasificado como Moda por contenido de vestimenta y estilo. Tono positivo por lenguaje inclusivo y accesible.",
  },
  {
    title: "Este politico acaba de decir esto y nadie reacciona",
    description: "Clip viral de declaracion controvertida en el parlamento con reacciones en tiempo real",
    themes: ["Politica"], tone: "Negativo", intent: "Polarizar", format: "Short video",
    platform: "twitter", risk: "Alto", keywords: ["politica", "declaracion", "viral", "controversia"],
    explanation: "Clasificado como Politica por contenido de figuras publicas. Riesgo alto por potencial polarizacion y falta de contexto.",
  },
  {
    title: "Receta: Pad Thai casero en 20 minutos",
    description: "Cocina tailandesa facil paso a paso con ingredientes que encuentras en cualquier supermercado",
    themes: ["Cocina"], tone: "Positivo", intent: "Educar", format: "Long video",
    platform: "youtube", risk: "Bajo", keywords: ["receta", "pad thai", "cocina", "facil"],
    explanation: "Clasificado como Cocina por instrucciones culinarias. Tono positivo con lenguaje didactico.",
  },
  {
    title: "10 destinos baratos para verano 2025",
    description: "Guia completa de viajes economicos por Europa: alojamiento, transporte y presupuesto diario",
    themes: ["Viajes"], tone: "Positivo", intent: "Informar", format: "Carrusel",
    platform: "instagram", risk: "Bajo", keywords: ["viajes", "destinos", "europa", "barato"],
    explanation: "Clasificado como Viajes por referencia a destinos turisticos. Intencion informativa con listado de opciones.",
  },
  {
    title: "Por que deberias invertir en tu salud mental hoy",
    description: "Hilo sobre bienestar emocional, productividad y la importancia del autocuidado diario",
    themes: ["Salud", "Educacion"], tone: "Emocional", intent: "Inspirar", format: "Texto",
    platform: "twitter", risk: "Medio", keywords: ["salud mental", "bienestar", "productividad", "autocuidado"],
    explanation: "Clasificado como Salud por tematica de bienestar. Riesgo medio por potencial de consejo medico sin cualificacion.",
  },
  {
    title: "ASMR: Sonidos de lluvia para estudiar 3 horas",
    description: "Ambiente relajante con sonidos de lluvia y truenos suaves para concentracion y estudio",
    themes: ["Entretenimiento", "Educacion"], tone: "Positivo", intent: "Entretener", format: "Long video",
    platform: "youtube", risk: "Bajo", keywords: ["ASMR", "lluvia", "estudiar", "relajacion"],
    explanation: "Clasificado como Entretenimiento/Educacion por contenido de ambientacion para estudio.",
  },
  {
    title: "Review iPhone 16 Pro tras 2 meses de uso",
    description: "Analisis completo: camara, bateria, rendimiento y comparativa con Android. Vale la pena el cambio?",
    themes: ["Tecnologia"], tone: "Neutro", intent: "Informar", format: "Long video",
    platform: "youtube", risk: "Bajo", keywords: ["iPhone", "review", "tecnologia", "Apple"],
    explanation: "Clasificado como Tecnologia por analisis de producto. Tono neutro informativo con comparativas.",
  },
  {
    title: "Challenge: 30 dias sin azucar refinado",
    description: "Mi experiencia completa eliminando el azucar: cambios fisicos, mentales y lo que aprendi",
    themes: ["Salud"], tone: "Emocional", intent: "Inspirar", format: "Story",
    platform: "instagram", risk: "Medio", keywords: ["challenge", "azucar", "dieta", "salud"],
    explanation: "Clasificado como Salud por contenido nutricional. Riesgo medio por promover dietas sin supervision medica.",
  },
  {
    title: "Las mejores apps de productividad para 2025",
    description: "Herramientas digitales de organizacion, gestion del tiempo y trabajo en equipo que realmente funcionan",
    themes: ["Tecnologia", "Educacion"], tone: "Positivo", intent: "Educar", format: "Carrusel",
    platform: "linkedin", risk: "Bajo", keywords: ["apps", "productividad", "organizacion", "herramientas"],
    explanation: "Clasificado como Tecnologia/Educacion por herramientas digitales de aprendizaje.",
  },
  {
    title: "Rutina de gym para principiantes: plan de 4 semanas",
    description: "Plan completo con ejercicios basicos, repeticiones, series y descansos. Progresion garantizada",
    themes: ["Deporte", "Salud"], tone: "Positivo", intent: "Educar", format: "Reel",
    platform: "instagram", risk: "Bajo", keywords: ["gym", "principiantes", "rutina", "fitness"],
    explanation: "Clasificado como Deporte/Salud por contenido de entrenamiento fisico.",
  },
  {
    title: "Drama en streaming: El peor final de serie del ano",
    description: "Opinion y analisis del desenlace de la serie mas vista del momento. Spoilers incluidos",
    themes: ["Entretenimiento"], tone: "Negativo", intent: "Entretener", format: "Short video",
    platform: "tiktok", risk: "Bajo", keywords: ["serie", "streaming", "final", "opinion"],
    explanation: "Clasificado como Entretenimiento por critica de contenido audiovisual. Tono negativo por decepcion.",
  },
  {
    title: "COMPRA AHORA: Suplementos deportivos con 50% descuento",
    description: "Oferta limitada de proteinas, creatina y pre-workout. Solo esta semana. Link en bio",
    themes: ["Deporte", "Salud"], tone: "Positivo", intent: "Vender", format: "Story",
    platform: "instagram", risk: "Alto", keywords: ["compra", "oferta", "suplementos", "descuento"],
    explanation: "Riesgo alto por intencion puramente comercial con urgencia artificial (AHORA, limitada).",
  },
  {
    title: "Entrevista con CEO de startup de IA valorada en 100M",
    description: "Hablamos sobre el futuro de la inteligencia artificial, regulacion europea y oportunidades laborales",
    themes: ["Tecnologia", "Finanzas"], tone: "Neutro", intent: "Informar", format: "Live",
    platform: "linkedin", risk: "Bajo", keywords: ["CEO", "startup", "IA", "entrevista"],
    explanation: "Clasificado como Tecnologia/Finanzas por contenido empresarial tecnologico.",
  },
  {
    title: "Mi rutina matutina como creador de contenido",
    description: "Un dia en mi vida: despertar a las 5am, ejercicio, meditacion y planificacion del contenido",
    themes: ["Entretenimiento", "Salud"], tone: "Positivo", intent: "Inspirar", format: "Reel",
    platform: "tiktok", risk: "Bajo", keywords: ["rutina", "creador", "manana", "productividad"],
    explanation: "Clasificado como Entretenimiento/Salud por lifestyle de creador.",
  },
  {
    title: "Ahorro vs Inversion para jovenes: que conviene mas",
    description: "Guia completa de educacion financiera para menores de 30. Comparativa con numeros reales",
    themes: ["Finanzas", "Educacion"], tone: "Neutro", intent: "Educar", format: "Long video",
    platform: "youtube", risk: "Medio", keywords: ["ahorro", "inversion", "jovenes", "finanzas"],
    explanation: "Clasificado como Finanzas/Educacion por educacion financiera. Riesgo medio por consejo financiero.",
  },
  {
    title: "Skincare coreano: los 10 pasos explicados",
    description: "Guia completa del ritual de belleza coreano con productos accesibles y rutina paso a paso",
    themes: ["Moda", "Salud"], tone: "Positivo", intent: "Educar", format: "Carrusel",
    platform: "instagram", risk: "Bajo", keywords: ["skincare", "coreano", "belleza", "rutina"],
    explanation: "Clasificado como Moda/Salud por contenido de cuidado personal y belleza.",
  },
  {
    title: "Los peligros del doomscrolling: asi afecta a tu cerebro",
    description: "Estudio cientifico revela como el scroll infinito impacta en la ansiedad y la atencion",
    themes: ["Salud", "Tecnologia"], tone: "Negativo", intent: "Educar", format: "Long video",
    platform: "youtube", risk: "Medio", keywords: ["doomscrolling", "cerebro", "ansiedad", "redes sociales"],
    explanation: "Clasificado como Salud/Tecnologia por impacto de tecnologia en salud mental. Tono negativo informativo.",
  },
  {
    title: "Hack de cocina: como hacer pasta en 5 minutos",
    description: "Truco viral para cocinar pasta perfecta en el microondas. Funciona de verdad?",
    themes: ["Cocina", "Entretenimiento"], tone: "Sarcastico", intent: "Entretener", format: "Short video",
    platform: "tiktok", risk: "Bajo", keywords: ["hack", "cocina", "pasta", "microondas"],
    explanation: "Clasificado como Cocina/Entretenimiento. Tono sarcastico por formato de hack viral con expectativa vs realidad.",
  },
  {
    title: "El gobierno aprueba nueva ley de regulacion digital",
    description: "Analisis de la nueva legislacion sobre privacidad de datos y regulacion de plataformas sociales",
    themes: ["Politica", "Tecnologia"], tone: "Neutro", intent: "Informar", format: "Texto",
    platform: "twitter", risk: "Medio", keywords: ["ley", "regulacion", "privacidad", "digital"],
    explanation: "Clasificado como Politica/Tecnologia por legislacion sobre tecnologia. Riesgo medio por tema politico.",
  },
  {
    title: "Mis 5 libros favoritos del 2025 que cambiaron mi vida",
    description: "Recomendaciones de lectura: desarrollo personal, ciencia ficcion y ensayos que deberias leer",
    themes: ["Educacion", "Entretenimiento"], tone: "Positivo", intent: "Inspirar", format: "Carrusel",
    platform: "instagram", risk: "Bajo", keywords: ["libros", "recomendaciones", "lectura", "desarrollo personal"],
    explanation: "Clasificado como Educacion/Entretenimiento por recomendaciones culturales con tono inspiracional.",
  },
  {
    title: "Como ganar 5000 euros al mes con dropshipping",
    description: "Te explico mi metodo paso a paso para generar ingresos pasivos sin inversion inicial",
    themes: ["Finanzas"], tone: "Positivo", intent: "Vender", format: "Long video",
    platform: "youtube", risk: "Alto", keywords: ["ganar dinero", "dropshipping", "ingresos pasivos", "negocio"],
    explanation: "Riesgo alto por promesas de ingresos sin evidencia verificable. Posible esquema de afiliacion encubierto.",
  },
  {
    title: "Road trip por el sur de Francia en furgoneta",
    description: "7 dias recorriendo la Provenza: rutas, costes, camping y los mejores spots secretos",
    themes: ["Viajes", "Entretenimiento"], tone: "Positivo", intent: "Inspirar", format: "Long video",
    platform: "youtube", risk: "Bajo", keywords: ["road trip", "Francia", "furgoneta", "Provenza"],
    explanation: "Clasificado como Viajes/Entretenimiento por contenido de experiencia de viaje aspiracional.",
  },
  {
    title: "Debate: Es TikTok bueno o malo para los jovenes?",
    description: "Dos expertos en psicologia digital debaten sobre el impacto de TikTok en adolescentes",
    themes: ["Educacion", "Tecnologia", "Salud"], tone: "Neutro", intent: "Informar", format: "Live",
    platform: "youtube", risk: "Medio", keywords: ["TikTok", "jovenes", "debate", "psicologia"],
    explanation: "Clasificado como Educacion/Tecnologia/Salud por debate academico sobre impacto social de redes.",
  },
  {
    title: "Tendencias de moda otono-invierno 2025",
    description: "Los colores, tejidos y siluetas que dominaran la proxima temporada segun las pasarelas",
    themes: ["Moda"], tone: "Positivo", intent: "Informar", format: "Reel",
    platform: "instagram", risk: "Bajo", keywords: ["tendencias", "moda", "otono", "invierno"],
    explanation: "Clasificado como Moda por contenido de tendencias estacionales de vestimenta.",
  },
  {
    title: "Nadie te dice la verdad sobre las dietas detox",
    description: "Desmontando mitos: por que las dietas detox son un negocio y no ciencia",
    themes: ["Salud"], tone: "Negativo", intent: "Educar", format: "Short video",
    platform: "tiktok", risk: "Medio", keywords: ["detox", "dieta", "mitos", "ciencia"],
    explanation: "Clasificado como Salud por contenido nutricional. Tono negativo critico pero educativo.",
  },
  {
    title: "Tutorial: Crea tu primera app con React en 1 hora",
    description: "Curso express de programacion web: de cero a tu primera aplicacion funcionando",
    themes: ["Tecnologia", "Educacion"], tone: "Positivo", intent: "Educar", format: "Long video",
    platform: "youtube", risk: "Bajo", keywords: ["React", "programacion", "tutorial", "desarrollo web"],
    explanation: "Clasificado como Tecnologia/Educacion por tutorial de programacion con enfoque practico.",
  },
  {
    title: "El lado oscuro de las relaciones toxicas digitales",
    description: "Como identificar y salir de relaciones toxicas que se mantienen por redes sociales",
    themes: ["Relaciones", "Salud"], tone: "Emocional", intent: "Educar", format: "Long video",
    platform: "youtube", risk: "Medio", keywords: ["relaciones toxicas", "digital", "salud mental", "limites"],
    explanation: "Clasificado como Relaciones/Salud por tematica de relaciones y bienestar emocional.",
  },
  {
    title: "Preparacion de meal prep para toda la semana",
    description: "Menu semanal completo: 5 comidas y 5 cenas saludables preparadas en 2 horas",
    themes: ["Cocina", "Salud"], tone: "Positivo", intent: "Educar", format: "Long video",
    platform: "youtube", risk: "Bajo", keywords: ["meal prep", "comida saludable", "organizacion", "recetas"],
    explanation: "Clasificado como Cocina/Salud por contenido de preparacion de alimentos saludables.",
  },
  {
    title: "Los 3 deportes que mas calorias queman en 30 min",
    description: "Comparativa cientifica de gasto calorico: HIIT, natacion y boxeo. Cual es mejor para ti?",
    themes: ["Deporte", "Salud"], tone: "Positivo", intent: "Informar", format: "Reel",
    platform: "instagram", risk: "Bajo", keywords: ["calorias", "deporte", "HIIT", "natacion"],
    explanation: "Clasificado como Deporte/Salud por comparativa de actividad fisica con datos.",
  },
  {
    title: "Escandalo: influencer descubierto vendiendo curso falso",
    description: "Investigacion revela que un popular influencer vendio un curso de 997 euros con contenido plagiado",
    themes: ["Entretenimiento", "Finanzas"], tone: "Negativo", intent: "Polarizar", format: "Short video",
    platform: "tiktok", risk: "Alto", keywords: ["escandalo", "influencer", "curso", "estafa"],
    explanation: "Riesgo alto por contenido de denuncia con potencial de difamacion y polarizacion.",
  },
  {
    title: "Guia completa de LinkedIn para conseguir empleo en tech",
    description: "Optimiza tu perfil, estrategia de networking y como destacar ante recruiters de tecnologia",
    themes: ["Tecnologia", "Educacion"], tone: "Positivo", intent: "Educar", format: "Texto",
    platform: "linkedin", risk: "Bajo", keywords: ["LinkedIn", "empleo", "tech", "networking"],
    explanation: "Clasificado como Tecnologia/Educacion por contenido de desarrollo profesional tecnologico.",
  },
  {
    title: "Meditacion guiada para reducir ansiedad (15 min)",
    description: "Sesion de mindfulness con tecnicas de respiracion y visualizacion para calmar la mente",
    themes: ["Salud"], tone: "Positivo", intent: "Educar", format: "Long video",
    platform: "youtube", risk: "Bajo", keywords: ["meditacion", "ansiedad", "mindfulness", "respiracion"],
    explanation: "Clasificado como Salud por contenido de bienestar mental con tecnicas de relajacion.",
  },
  {
    title: "Por que los jovenes ya no quieren comprar casa",
    description: "Analisis socioeconomico del mercado inmobiliario y las nuevas prioridades de la generacion Z",
    themes: ["Finanzas", "Politica"], tone: "Neutro", intent: "Informar", format: "Texto",
    platform: "twitter", risk: "Medio", keywords: ["vivienda", "jovenes", "generacion Z", "economia"],
    explanation: "Clasificado como Finanzas/Politica por tematica socioeconomica. Riesgo medio por contenido politico.",
  },
  {
    title: "Haul de Zara: las piezas que MAS valen la pena",
    description: "Probandome las novedades de temporada: calidad, tallas y si realmente merecen la pena",
    themes: ["Moda", "Entretenimiento"], tone: "Positivo", intent: "Entretener", format: "Reel",
    platform: "instagram", risk: "Bajo", keywords: ["haul", "Zara", "moda", "novedades"],
    explanation: "Clasificado como Moda/Entretenimiento por contenido de compras y prueba de ropa.",
  },
  {
    title: "Como hacer pan casero artesanal sin amasadora",
    description: "La receta mas facil del mundo: solo necesitas harina, agua, sal y levadura. Pan de verdad",
    themes: ["Cocina"], tone: "Positivo", intent: "Educar", format: "Reel",
    platform: "tiktok", risk: "Bajo", keywords: ["pan casero", "receta", "artesanal", "facil"],
    explanation: "Clasificado como Cocina por contenido culinario con instrucciones paso a paso.",
  },
  {
    title: "La verdad sobre el ayuno intermitente segun la ciencia",
    description: "Meta-analisis de 50 estudios: beneficios reales, riesgos y para quien NO es recomendable",
    themes: ["Salud", "Educacion"], tone: "Neutro", intent: "Educar", format: "Long video",
    platform: "youtube", risk: "Medio", keywords: ["ayuno intermitente", "ciencia", "nutricion", "salud"],
    explanation: "Clasificado como Salud/Educacion por contenido cientifico nutricional. Riesgo medio por tema de salud.",
  },
]

// Generar contenidos con variaciones
export function generateContents(): Content[] {
  const contents: Content[] = []
  const months = ["2025-01", "2025-02", "2025-03", "2025-04", "2025-05", "2025-06"]

  // Base templates
  CONTENT_TEMPLATES.forEach((template, idx) => {
    const month = months[idx % months.length]
    const day = String(randomBetween(1, 28)).padStart(2, "0")

    contents.push({
      id: `c${idx + 1}`,
      title: template.title,
      description: template.description,
      platform: template.platform,
      format: template.format,
      publishedAt: `${month}-${day}`,
      author: `@creador_${idx + 1}`,
      url: `https://ejemplo.com/contenido/${idx + 1}`,
      metrics: {
        views: randomBetween(1000, 500000),
        likes: randomBetween(100, 50000),
        comments: randomBetween(10, 5000),
        shares: randomBetween(5, 10000),
        savedCount: randomBetween(10, 8000),
        estimatedWatchTime: randomBetween(10, 600),
      },
      aiTags: {
        themes: template.themes,
        primaryTheme: template.themes[0],
        tone: template.tone,
        intent: template.intent,
        riskLevel: template.risk,
        confidence: Math.floor(70 + prng() * 29) / 100,
        keywords: template.keywords,
        explanation: template.explanation,
        method: "local",
        detectedKeywords: template.keywords,
        confidenceBreakdown: {
          theme: Math.floor(75 + prng() * 24) / 100,
          tone: Math.floor(70 + prng() * 28) / 100,
          intent: Math.floor(68 + prng() * 30) / 100,
          risk: Math.floor(72 + prng() * 26) / 100,
        },
        summary: `${template.themes[0]}: ${template.title.slice(0, 60)}`,
      },
    })
  })

  // Generate additional random variations for bulk (80 more)
  const authors = [
    "@influencer_maria", "@tech_carlos", "@fit_jorge", "@chef_elena", "@travel_marta",
    "@news_lucia", "@humor_pablo", "@edu_sara", "@beauty_ana", "@finance_marcos",
    "@sport_david", "@music_carmen", "@art_rodrigo", "@lifestyle_ines", "@science_hugo",
    "@gaming_alex", "@food_rosa", "@health_dr_lopez", "@moda_patricia", "@viajes_tomas",
  ]

  for (let i = 0; i < 80; i++) {
    const tpl = CONTENT_TEMPLATES[i % CONTENT_TEMPLATES.length]
    const platforms: Platform[] = ["instagram", "tiktok", "youtube", "twitter", "linkedin"]
    const month = months[i % months.length]
    const day = String(randomBetween(1, 28)).padStart(2, "0")
    const platform = pickRandom(platforms)
    const themes = pickRandomN(THEMES, randomBetween(1, 3)) as Theme[]

    contents.push({
      id: `c${CONTENT_TEMPLATES.length + i + 1}`,
      title: `${tpl.title} (${pickRandom(["ed.", "v.", "pt.", "cap."])} ${i + 1})`,
      description: tpl.description,
      platform,
      format: pickRandom(FORMATS),
      publishedAt: `${month}-${day}`,
      author: pickRandom(authors),
      url: `https://ejemplo.com/contenido/${CONTENT_TEMPLATES.length + i + 1}`,
      metrics: {
        views: randomBetween(500, 1200000),
        likes: randomBetween(50, 120000),
        comments: randomBetween(5, 12000),
        shares: randomBetween(2, 25000),
        savedCount: randomBetween(5, 18000),
        estimatedWatchTime: randomBetween(5, 1200),
      },
      aiTags: {
        themes,
        primaryTheme: themes[0],
        tone: pickRandom(TONES),
        intent: pickRandom(INTENTS),
        riskLevel: pickRandom(RISK_LEVELS),
        confidence: Math.floor(55 + prng() * 41) / 100,
        keywords: tpl.keywords,
        explanation: `Categorizado automaticamente con confianza variable. Tema principal: ${themes[0]}. Clasificacion basada en analisis NLP del titulo y descripcion.`,
        method: "local",
        detectedKeywords: tpl.keywords,
        confidenceBreakdown: {
          theme: Math.floor(55 + prng() * 40) / 100,
          tone: Math.floor(50 + prng() * 45) / 100,
          intent: Math.floor(48 + prng() * 47) / 100,
          risk: Math.floor(52 + prng() * 43) / 100,
        },
        summary: `${themes[0]}: ${tpl.title.slice(0, 60)}`,
      },
    })
  }

  return contents
}

// Generar metricas agregadas por perfil
export function generateAggregatedMetrics(
  profiles: Profile[],
  contents: Content[]
): AggregatedMetrics[] {
  const metrics: AggregatedMetrics[] = []
  const months = ["2025-01", "2025-02", "2025-03", "2025-04", "2025-05", "2025-06"]

  profiles.forEach((profile) => {
    profile.platforms.forEach((platform) => {
      months.forEach((month) => {
        const platformContents = contents.filter(
          (c) => c.platform === platform && c.publishedAt.startsWith(month)
        )

        const themeDist: Record<string, number> = {}
        THEMES.forEach((t) => {
          themeDist[t] = platformContents.filter((c) =>
            c.aiTags.themes.includes(t)
          ).length
          if (profile.interests[t]) {
            themeDist[t] = Math.round(themeDist[t] * (profile.interests[t] / 50))
          }
        })

        const toneDist: Record<string, number> = {}
        TONES.forEach((t) => (toneDist[t] = platformContents.filter((c) => c.aiTags.tone === t).length))

        const intentDist: Record<string, number> = {}
        INTENTS.forEach((i) => (intentDist[i] = platformContents.filter((c) => c.aiTags.intent === i).length))

        const formatDist: Record<string, number> = {}
        FORMATS.forEach((f) => (formatDist[f] = platformContents.filter((c) => c.format === f).length))

        const riskDist: Record<string, number> = {}
        RISK_LEVELS.forEach((r) => (riskDist[r] = platformContents.filter((c) => c.aiTags.riskLevel === r).length))

        metrics.push({
          profileId: profile.id,
          platform,
          period: month,
          themeDistribution: themeDist as Record<Theme, number>,
          toneDistribution: toneDist as Record<Tone, number>,
          intentDistribution: intentDist as Record<Intent, number>,
          formatDistribution: formatDist as Record<Format, number>,
          totalContents: platformContents.length,
          avgConfidence:
            platformContents.length > 0
              ? Math.floor(platformContents.reduce((sum, c) => sum + c.aiTags.confidence * 100, 0) / platformContents.length) / 100
              : 0,
          riskDistribution: riskDist as Record<RiskLevel, number>,
        })
      })
    })
  })

  return metrics
}

export const SEED_CONTENTS = generateContents()
export const SEED_METRICS = generateAggregatedMetrics(SEED_PROFILES, SEED_CONTENTS)

// ---- SQL SCHEMA REFERENCE (para MySQL) ----
export const MYSQL_SCHEMA = `-- ==============================================
-- SCHEMA MySQL: Profile Content Categorization
-- Version 2.0 - Modelo Relacional Completo
-- ==============================================

CREATE DATABASE IF NOT EXISTS profile_categorization
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE profile_categorization;

-- ---- TABLA: profiles ----
CREATE TABLE profiles (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  avatar VARCHAR(10),
  interests JSON NOT NULL COMMENT 'Mapa tema -> peso (0-100)',
  platforms JSON NOT NULL COMMENT 'Array de plataformas seleccionadas',
  context_age_range VARCHAR(20),
  context_location VARCHAR(100),
  context_objective VARCHAR(200),
  context_daily_hours DECIMAL(3,1),
  context_sensitive_topics JSON COMMENT 'Array de temas sensibles',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_profiles_created (created_at),
  INDEX idx_profiles_age (context_age_range)
);

-- ---- TABLA: contents ----
CREATE TABLE contents (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  platform ENUM('instagram','tiktok','youtube','twitter','linkedin') NOT NULL,
  format ENUM('Short video','Long video','Imagen','Carrusel','Texto','Story','Reel','Live') NOT NULL,
  published_at DATE NOT NULL,
  author VARCHAR(100),
  url VARCHAR(500),
  views INT UNSIGNED DEFAULT 0,
  likes_count INT UNSIGNED DEFAULT 0,
  comments_count INT UNSIGNED DEFAULT 0,
  shares_count INT UNSIGNED DEFAULT 0,
  saved_count INT UNSIGNED DEFAULT 0,
  estimated_watch_time INT UNSIGNED DEFAULT 0 COMMENT 'En segundos',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_contents_platform (platform),
  INDEX idx_contents_published (published_at),
  INDEX idx_contents_format (format),
  INDEX idx_contents_platform_date (platform, published_at)
);

-- ---- TABLA: ai_tags ----
CREATE TABLE ai_tags (
  id VARCHAR(36) PRIMARY KEY,
  content_id VARCHAR(36) NOT NULL UNIQUE,
  themes JSON NOT NULL COMMENT 'Array de temas detectados',
  primary_theme VARCHAR(50) NOT NULL,
  tone ENUM('Positivo','Negativo','Neutro','Sarcastico','Emocional') NOT NULL,
  intent ENUM('Informar','Entretener','Vender','Polarizar','Educar','Inspirar') NOT NULL,
  risk_level ENUM('Bajo','Medio','Alto') NOT NULL,
  confidence DECIMAL(3,2) NOT NULL COMMENT 'Score 0.00-1.00',
  keywords JSON COMMENT 'Array de palabras clave',
  explanation TEXT COMMENT 'Texto de explicabilidad de la IA',
  model_version VARCHAR(50) DEFAULT 'v1.0' COMMENT 'Version del modelo de IA',
  processing_time_ms INT UNSIGNED COMMENT 'Tiempo de procesamiento en ms',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE CASCADE,
  INDEX idx_tags_theme (primary_theme),
  INDEX idx_tags_tone (tone),
  INDEX idx_tags_risk (risk_level),
  INDEX idx_tags_confidence (confidence),
  INDEX idx_tags_content (content_id)
);

-- ---- TABLA: aggregated_metrics ----
CREATE TABLE aggregated_metrics (
  id VARCHAR(36) PRIMARY KEY,
  profile_id VARCHAR(36) NOT NULL,
  platform ENUM('instagram','tiktok','youtube','twitter','linkedin') NOT NULL,
  period VARCHAR(7) NOT NULL COMMENT 'Formato YYYY-MM',
  theme_distribution JSON,
  tone_distribution JSON,
  intent_distribution JSON,
  format_distribution JSON,
  total_contents INT UNSIGNED DEFAULT 0,
  avg_confidence DECIMAL(3,2),
  risk_distribution JSON,
  computed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
  UNIQUE KEY uq_metrics_profile_platform_period (profile_id, platform, period),
  INDEX idx_metrics_period (period),
  INDEX idx_metrics_profile (profile_id)
);

-- ---- TABLA: profile_content_interactions ----
CREATE TABLE profile_content_interactions (
  id VARCHAR(36) PRIMARY KEY,
  profile_id VARCHAR(36) NOT NULL,
  content_id VARCHAR(36) NOT NULL,
  interaction_type ENUM('view','like','save','share','comment','skip','report') NOT NULL,
  interaction_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  duration_seconds INT UNSIGNED COMMENT 'Tiempo de visualizacion',
  FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE CASCADE,
  INDEX idx_interactions_profile (profile_id),
  INDEX idx_interactions_content (content_id),
  INDEX idx_interactions_type (interaction_type),
  INDEX idx_interactions_date (interaction_at)
);

-- ---- TABLA: categorization_audit_log ----
CREATE TABLE categorization_audit_log (
  id VARCHAR(36) PRIMARY KEY,
  content_id VARCHAR(36) NOT NULL,
  action ENUM('auto_categorize','manual_override','review','approve','reject') NOT NULL,
  previous_tags JSON COMMENT 'Tags antes del cambio',
  new_tags JSON COMMENT 'Tags despues del cambio',
  user_id VARCHAR(36) COMMENT 'Usuario que realizo la accion',
  reason TEXT COMMENT 'Motivo del cambio',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE CASCADE,
  INDEX idx_audit_content (content_id),
  INDEX idx_audit_date (created_at)
);

-- ---- VISTAS ----
CREATE VIEW v_content_full AS
SELECT
  c.*,
  t.themes, t.primary_theme, t.tone, t.intent,
  t.risk_level, t.confidence, t.keywords, t.explanation
FROM contents c
JOIN ai_tags t ON c.id = t.content_id;

CREATE VIEW v_risk_summary AS
SELECT
  platform,
  risk_level,
  COUNT(*) as total,
  AVG(t.confidence) as avg_confidence
FROM contents c
JOIN ai_tags t ON c.id = t.content_id
GROUP BY platform, risk_level;

CREATE VIEW v_monthly_trends AS
SELECT
  DATE_FORMAT(c.published_at, '%Y-%m') as period,
  c.platform,
  t.primary_theme,
  COUNT(*) as total,
  AVG(t.confidence) as avg_confidence
FROM contents c
JOIN ai_tags t ON c.id = t.content_id
GROUP BY period, c.platform, t.primary_theme;
`
