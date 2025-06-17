"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { updateProfile } from "@/lib/auth"
import { useRouter } from "next/navigation"

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const [uploadSuccess, sadSuccess] = useState("")

  const fileInputRef = useRef<HTMLInputElement>(null)

  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me")
        if (!res.ok) {
          if (res.status === 401) {
            router.push("/login")
          } else {
            setError("Kullanıcı bilgileri yüklenirken bir hata oluştu.")
          }
          return
        }
        const data = await res.json()
        setUser(data.user)
        setName(data.user.name)
        setEmail(data.user.email)
      } catch (err) {
        console.error("Kullanıcı bilgileri alınamadı:", err)
        setError("Kullanıcı bilgileri yüklenirken bir hata oluştu.")
      } finally {
        setLoadingUser(false)
      }
    }

    fetchUser()
  }, [router])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      await updateProfile({ name, email })
      setSuccess("Profil bilgileriniz başarıyla güncellendi.")
    } catch (err) {
      setError("Profil güncellenirken bir hata oluştu.")
    } finally {
      setIsLoading(false)
    }
  }

  if (loadingUser) {
    return <div className="flex justify-center items-center h-screen">Yükleniyor...</div>
  }

  if (!user && !loadingUser) {
    return <div className="flex justify-center items-center h-screen text-destructive">Kullanıcı bilgileri yüklenemedi veya oturum süresi doldu. Lütfen tekrar giriş yapın.</div>
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-3xl font-bold">Profil Ayarları</h1>

      <div className="mb-6 flex items-center space-x-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={user?.avatarUrl || "/placeholder.svg?height=80&width=80"} alt="Profil Resmi" />
          <AvatarFallback>{user?.name ? user.name.slice(0, 2).toUpperCase() : "?"}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-xl font-semibold">{name}</h2>
          <p className="text-muted-foreground">{email}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profil Bilgileri</CardTitle>
          <CardDescription>Kişisel bilgilerinizi güncelleyin</CardDescription>
        </CardHeader>
        <CardContent>
          {error && <div className="mb-4 rounded-lg bg-destructive/15 p-3 text-sm text-destructive">{error}</div>}
          {success && <div className="mb-4 rounded-lg bg-green-100 p-3 text-sm text-green-800">{success}</div>}
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Ad Soyad</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Güncelleniyor..." : "Güncelle"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
