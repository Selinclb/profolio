"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BarChart, Calendar, FolderKanban, Home, Settings, Users, ShieldCheck, MessageSquare } from "lucide-react"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { getUnreadMessageCount } from "@/lib/messages"

type User = {
  id: string
  name: string
  email: string
  role: string
}

export function DashboardSidebar() {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Kullanıcı bilgilerini getir
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          const userData = await response.json()
          setUser(userData.user)
        }
      } catch (error) {
        console.error("Kullanıcı bilgileri alınamadı:", error)
      } finally {
        setLoading(false)
      }
    }

    // Okunmamış mesaj sayısını getir
    const fetchUnreadCount = async () => {
      try {
        const count = await getUnreadMessageCount()
        setUnreadCount(count)
      } catch (error) {
        console.error("Okunmamış mesaj sayısı alınamadı:", error)
      }
    }

    fetchUser()
    fetchUnreadCount()

    // Periyodik olarak okunmamış mesaj sayısını güncelle
    const interval = setInterval(fetchUnreadCount, 30000) // 30 saniyede bir
    return () => clearInterval(interval)
  }, [])

  const routes = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      name: "Projeler",
      href: "/dashboard/projects",
      icon: FolderKanban,
    },
    {
      name: "Takvim",
      href: "/dashboard/calendar",
      icon: Calendar,
    },
    {
      name: "Ekip",
      href: "/dashboard/team",
      icon: Users,
    },
    {
      name: "Mesajlar",
      href: "/dashboard/messages",
      icon: MessageSquare,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      name: "Raporlar",
      href: "/dashboard/reports",
      icon: BarChart,
    },
    {
      name: "Ayarlar",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ]

  // Admin için ek menü öğesi
  const adminRoutes = [
    {
      name: "Admin Paneli",
      href: "/dashboard/admin",
      icon: ShieldCheck,
    },
  ]

  return (
    <aside className="hidden w-64 flex-col border-r bg-background md:flex">
      <div className="flex flex-col gap-2 p-4">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
              pathname === route.href || pathname.startsWith(`${route.href}/`)
                ? "bg-muted text-primary"
                : "text-muted-foreground",
            )}
          >
            <route.icon className="h-5 w-5" />
            <span className="flex-1">{route.name}</span>
            {route.badge && (
              <Badge variant="default" className="ml-auto">
                {route.badge}
              </Badge>
            )}
          </Link>
        ))}

        {/* Admin menüsü */}
        {!loading && user?.role === "admin" && (
          <>
            <div className="my-2 h-px bg-border" />
            {adminRoutes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                  pathname.startsWith(route.href) ? "bg-muted text-primary" : "text-muted-foreground",
                )}
              >
                <route.icon className="h-5 w-5" />
                {route.name}
              </Link>
            ))}
          </>
        )}
      </div>
    </aside>
  )
}
