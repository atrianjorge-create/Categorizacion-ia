"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  UserCircle,
  GitCompareArrows,
  Layers,
  Database,
  BrainCircuit,
  BarChart3,
  BookOpen,
  FileBarChart,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { SEED_PROFILES, SEED_CONTENTS } from "@/lib/seed-data"

const NAV_ITEMS = [
  {
    group: "Principal",
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard, description: "Panel general" },
      { label: "Estadisticas", href: "/estadisticas", icon: BarChart3, description: "Analisis avanzado" },
      { label: "Reportes", href: "/reportes", icon: FileBarChart, description: "Informes exportables" },
    ],
  },
  {
    group: "Perfiles",
    items: [
      { label: "Constructor", href: "/perfiles", icon: UserCircle, description: "Crear y gestionar" },
      { label: "Comparador", href: "/comparador", icon: GitCompareArrows, description: "A vs B" },
    ],
  },
  {
    group: "Contenidos",
    items: [
      { label: "Explorador", href: "/contenidos", icon: Layers, description: "Navegar contenidos" },
      { label: "Categorizacion IA", href: "/categorizacion", icon: BrainCircuit, description: "Pipeline simulado" },
    ],
  },
  {
    group: "Documentacion",
    items: [
      { label: "Taxonomia", href: "/taxonomia", icon: BookOpen, description: "Sistema de clasificacion" },
      { label: "Base de Datos", href: "/schema", icon: Database, description: "Schema y API" },
    ],
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            PC
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm text-sidebar-foreground">
              Profile Categorization
            </span>
            <span className="text-xs text-sidebar-foreground/60">
              Social Media Analytics
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        {NAV_ITEMS.map((group) => (
          <SidebarGroup key={group.group}>
            <SidebarGroupLabel>{group.group}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href)
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4" />
                          <div className="flex flex-col">
                            <span>{item.label}</span>
                          </div>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="rounded-lg border border-sidebar-border bg-sidebar-accent/50 p-3 space-y-2">
          <p className="text-xs font-medium text-sidebar-foreground">Modo Demo</p>
          <div className="flex flex-wrap gap-1">
            <Badge variant="outline" className="text-xs border-sidebar-border text-sidebar-foreground/80">
              {SEED_PROFILES.length} perfiles
            </Badge>
            <Badge variant="outline" className="text-xs border-sidebar-border text-sidebar-foreground/80">
              {SEED_CONTENTS.length} contenidos
            </Badge>
          </div>
          <p className="text-xs text-sidebar-foreground/50">
            Dataset sintetico con datos generados para demo
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
