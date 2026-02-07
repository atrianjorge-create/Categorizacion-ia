import { NextResponse } from "next/server"
import { verifyUser, createSession } from "@/lib/auth-store"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contrasena son obligatorios" },
        { status: 400 }
      )
    }

    const user = verifyUser(email, password)
    if (!user) {
      return NextResponse.json(
        { error: "Email o contrasena incorrectos" },
        { status: 401 }
      )
    }

    const sessionId = createSession(user.id)

    const response = NextResponse.json(
      { user: { id: user.id, name: user.name, email: user.email } },
      { status: 200 }
    )

    response.cookies.set("session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    })

    return response
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
