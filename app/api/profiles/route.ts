import { NextResponse } from "next/server"
import { getProfiles, createProfile } from "@/lib/store"

// GET /api/profiles
export async function GET() {
  const profiles = getProfiles()
  return NextResponse.json(profiles)
}

// POST /api/profiles
export async function POST(request: Request) {
  try {
    const data = await request.json()
    const profile = createProfile(data)
    return NextResponse.json(profile, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Error al crear el perfil" },
      { status: 400 }
    )
  }
}
