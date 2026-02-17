import { NextResponse } from "next/server"
import type { CategorizationRequest, AITags } from "@/lib/types"
import { categorizeLocal, categorizeBatchLocal } from "@/lib/categorization-engine"
import {
  categorizeWithAI,
  categorizeBatchWithAI,
  categorizeAuto,
  categorizeBatchAuto,
} from "@/lib/categorization-ai"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { contents, mode = "auto" } = body as {
      contents: CategorizationRequest[]
      mode?: "ai" | "local" | "auto"
    }

    if (!contents || !Array.isArray(contents) || contents.length === 0) {
      return NextResponse.json(
        { error: "Se requiere al menos un contenido para categorizar" },
        { status: 400 }
      )
    }

    // Validate each content
    for (const c of contents) {
      if (!c.title || !c.description || !c.platform || !c.format) {
        return NextResponse.json(
          { error: "Cada contenido requiere: title, description, platform, format" },
          { status: 400 }
        )
      }
    }

    let results: AITags[]
    let usedMethod: "ai" | "local"

    const startTime = Date.now()

    switch (mode) {
      case "ai": {
        const hasAIKey = !!process.env.AI_GATEWAY_API_KEY
        if (!hasAIKey) {
          return NextResponse.json(
            { error: "No hay API key de IA configurada. Usa modo 'local' o 'auto'." },
            { status: 400 }
          )
        }
        results = contents.length === 1
          ? [await categorizeWithAI(contents[0])]
          : await categorizeBatchWithAI(contents)
        usedMethod = results[0]?.method ?? "ai"
        break
      }
      case "local": {
        results = contents.length === 1
          ? [categorizeLocal(contents[0])]
          : categorizeBatchLocal(contents)
        usedMethod = "local"
        break
      }
      case "auto":
      default: {
        results = contents.length === 1
          ? [await categorizeAuto(contents[0])]
          : await categorizeBatchAuto(contents)
        usedMethod = results[0]?.method ?? "local"
        break
      }
    }

    const processingTime = Date.now() - startTime

    return NextResponse.json({
      results,
      method: usedMethod,
      processingTime,
      count: results.length,
    })
  } catch (error) {
    console.error("[api/categorize] Error:", error)
    return NextResponse.json(
      { error: "Error interno al procesar la categorizacion" },
      { status: 500 }
    )
  }
}
