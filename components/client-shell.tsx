"use client"

import { useState, useEffect, type ReactNode } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

export function ClientShell({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex min-h-svh w-full">
        <div className="hidden md:block w-64 border-r bg-sidebar shrink-0">
          <div className="p-4 space-y-4">
            <Skeleton className="h-9 w-full" />
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-1 flex-col">
          <div className="flex h-14 shrink-0 items-center gap-2 border-b bg-card px-4">
            <Skeleton className="h-7 w-7" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Skeleton className="h-4 w-48" />
          </div>
          <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-card px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <span className="text-sm font-medium text-muted-foreground">
            Profile Categorization System
          </span>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
