"use client"

import type { ReactNode } from "react"
import dynamic from "next/dynamic"

const ClientShell = dynamic(
  () => import("@/components/client-shell").then((m) => m.ClientShell),
  { ssr: false }
)

export function ClientShellWrapper({ children }: { children: ReactNode }) {
  return <ClientShell>{children}</ClientShell>
}
