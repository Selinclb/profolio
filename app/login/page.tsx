"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { loginUser } from "@/lib/auth"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      await loginUser(email, password)
      router.push("/dashboard")
    } catch (err) {
      setError("Giriş başarısız. Lütfen email ve şifrenizi kontrol edin.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/40">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Image
                src="/profoliologo.svg"
                alt="Profolio Logo"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <div className="text-xl font-semibold">Profolio</div>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex min-h-screen items-center justify-center p-4 pt-24">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Giriş Yap</CardTitle>
            <CardDescription>Profolio hesabınıza giriş yapın</CardDescription>
          </CardHeader>
          <CardContent>
            {error && <div className="mb-4 rounded-lg bg-destructive/15 p-3 text-sm text-destructive">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Şifre</Label>
                  <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                    Şifremi Unuttum
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Giriş Yapılıyor..." : "Giriş Yap"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm">
              Hesabınız yok mu?{" "}
              <Link href="/signup" className="text-primary hover:underline">
                Kayıt Olun
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
