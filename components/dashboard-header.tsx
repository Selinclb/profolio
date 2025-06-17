"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, Menu, Home, FolderKanban, Calendar, Users, MessageSquare, BarChart, Settings, ShieldCheck } from "lucide-react"
import { logoutUser } from "@/lib/auth"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Notification } from "@/types/notification"

export function DashboardHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Bildirimleri getir
    const fetchNotifications = async () => {
      try {
        const response = await fetch("/api/notifications")
        if (response.ok) {
          const data = await response.json()
          setNotifications(data)
          setUnreadCount(data.filter((n: Notification) => !n.isRead).length)
        }
      } catch (error) {
        console.error("Bildirimler alınamadı:", error)
      }
    }

    fetchNotifications()

    // Periyodik olarak bildirimleri güncelle
    const interval = setInterval(fetchNotifications, 30000) // 30 saniyede bir
    return () => clearInterval(interval)
  }, [])

  const handleLogout = async () => {
    try {
      await logoutUser()
    } catch (error) {
      console.error("Çıkış yapılırken hata oluştu:", error)
    }
  }

  const handleNotificationClick = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "POST",
      })
      if (response.ok) {
        setNotifications(notifications.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        ))
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error("Bildirim okundu olarak işaretlenemedi:", error)
    }
  }

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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="flex h-16 items-center px-4 md:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menüyü Aç/Kapat</span>
        </Button>
        <div className="flex items-center gap-2 font-semibold">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image
              src="/profoliologo.svg"
              alt="Profolio Logo"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="text-xl">Profolio</span>
          </Link>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                    {unreadCount}
                  </span>
                )}
                <span className="sr-only">Bildirimler</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Bildirimler</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <ScrollArea className="h-[300px]">
                {notifications.length > 0 ? (
                  <div className="space-y-1 p-1">
                    {notifications.map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className={cn(
                          "flex flex-col items-start gap-1 p-3 cursor-pointer",
                          !notification.isRead && "bg-muted"
                        )}
                        onClick={() => handleNotificationClick(notification.id)}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{notification.title}</span>
                          {!notification.isRead && (
                            <span className="h-2 w-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>
                            {new Date(notification.createdAt).toLocaleDateString("tr-TR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {notification.type === "task" && (
                            <Badge variant="secondary">Görev</Badge>
                          )}
                          {notification.type === "message" && (
                            <Badge variant="secondary">Mesaj</Badge>
                          )}
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Bildirim bulunmuyor
                  </div>
                )}
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Profil Resmi" />
                  <AvatarFallback>AY</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Hesabım</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">Profil</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">Ayarlar</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Çıkış Yap</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="flex flex-col p-4 space-y-2">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                  pathname === route.href || pathname.startsWith(`${route.href}/`)
                    ? "bg-muted text-primary"
                    : "text-muted-foreground"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <route.icon className="h-5 w-5" />
                <span>{route.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
