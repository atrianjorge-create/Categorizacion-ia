import React from "react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-[hsl(220,25%,12%)] p-10 text-[hsl(220,10%,85%)]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(217,91%,50%)] font-bold text-sm text-[hsl(0,0%,100%)]">
            PC
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm text-[hsl(0,0%,100%)]">
              Profile Categorization
            </span>
            <span className="text-xs text-[hsl(220,10%,60%)]">
              Social Media Analytics
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-[hsl(0,0%,100%)] leading-tight text-balance">
            Categoriza y analiza contenidos de redes sociales con IA
          </h1>
          <p className="text-[hsl(220,10%,65%)] leading-relaxed max-w-md">
            Crea perfiles de audiencia, analiza contenidos automaticamente y descubre patrones con nuestro sistema de categorizacion inteligente.
          </p>
          <div className="flex flex-col gap-4 pt-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[hsl(217,91%,50%)]/20">
                <svg className="h-4 w-4 text-[hsl(217,91%,60%)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm text-[hsl(220,10%,75%)]">Categorizacion automatica con IA</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[hsl(160,60%,45%)]/20">
                <svg className="h-4 w-4 text-[hsl(160,60%,55%)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-sm text-[hsl(220,10%,75%)]">Dashboard de analisis en tiempo real</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[hsl(30,80%,55%)]/20">
                <svg className="h-4 w-4 text-[hsl(30,80%,60%)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <span className="text-sm text-[hsl(220,10%,75%)]">Perfiles de audiencia y comparador</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-[hsl(220,10%,45%)]">
          Profile Categorization System - Social Media Analytics
        </p>
      </div>

      {/* Right panel - auth form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background p-6 md:p-10">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-bold text-sm text-primary-foreground">
              PC
            </div>
            <span className="font-semibold text-foreground">
              Profile Categorization
            </span>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
