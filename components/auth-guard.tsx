"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Loader2 } from "lucide-react"

interface AuthUser {
  id: string
  name: string
  email: string
}

interface AuthGuardProps {
  children: React.ReactNode
}

// Public routes that don't need auth
const PUBLIC_ROUTES = ["/login", "/register"]

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // Don't check auth for public routes
    if (PUBLIC_ROUTES.includes(pathname)) {
      setChecking(false)
      return
    }

    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me")
        if (res.ok) {
          const data = await res.json()
          if (data.user) {
            setUser(data.user)
            setChecking(false)
            return
          }
        }
        router.replace("/login")
      } catch {
        router.replace("/login")
      }
    }

    checkAuth()
  }, [pathname, router])

  // Public routes render immediately
  if (PUBLIC_ROUTES.includes(pathname)) {
    return <>{children}</>
  }

  // Loading state
  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verificando sesion...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}

// Hook to get current user from the auth guard
export function useAuthUser() {
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me")
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
        }
      } catch {
        // silent
      }
    }
    fetchUser()
  }, [])

  return user
}
