import { NextResponse } from "next/server"
import { getMetrics, getMetricsByProfile } from "@/lib/store"

// GET /api/metrics?profileId=p1
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const profileId = searchParams.get("profileId")

  const metrics = profileId ? getMetricsByProfile(profileId) : getMetrics()

  return NextResponse.json({
    total: metrics.length,
    metrics,
  })
}
