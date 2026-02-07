import { NextResponse } from "next/server"
import { getContents } from "@/lib/store"
import type { Platform, Theme, Tone, Format } from "@/lib/types"

// GET /api/contents?platform=instagram&theme=Salud&tone=Positivo&format=Short+video
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  let contents = getContents()

  const platform = searchParams.get("platform")
  if (platform) {
    contents = contents.filter((c) => c.platform === platform)
  }

  const theme = searchParams.get("theme")
  if (theme) {
    contents = contents.filter((c) =>
      c.aiTags.themes.includes(theme as Theme)
    )
  }

  const tone = searchParams.get("tone")
  if (tone) {
    contents = contents.filter((c) => c.aiTags.tone === tone)
  }

  const format = searchParams.get("format")
  if (format) {
    contents = contents.filter((c) => c.format === format)
  }

  const limit = searchParams.get("limit")
  if (limit) {
    contents = contents.slice(0, parseInt(limit, 10))
  }

  return NextResponse.json({
    total: contents.length,
    contents,
  })
}
