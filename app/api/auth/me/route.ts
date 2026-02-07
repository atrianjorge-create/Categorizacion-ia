import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getSession, getUserById } from "@/lib/auth-store"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session")?.value

    if (!sessionId) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    const session = getSession(sessionId)
    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    const user = getUserById(session.userId)
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email },
    })
  } catch {
    return NextResponse.json({ user: null }, { status: 500 })
  }
}
