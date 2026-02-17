import React from "react"
import type { Metadata } from "next"
import dynamic from "next/dynamic"
import { Inter, JetBrains_Mono } from "next/font/google"

import "./globals.css"

const ClientShell = dynamic(
  () => import("@/components/client-shell").then((m) => m.ClientShell),
  { ssr: false }
)

const _inter = Inter({ subsets: ["latin"] })
const _jetbrainsMono = JetBrains_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Profile Categorization - Social Media Analytics",
  description:
    "Herramienta de categorizacion de contenidos en redes sociales con IA. Crea perfiles, analiza contenidos y compara resultados.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  )
}
