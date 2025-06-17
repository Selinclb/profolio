"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { createProject } from "@/lib/projects"

export default function NewProjectPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!name || !description || !date) {
      setError("Lütfen tüm alanları doldurun.")
      setIsLoading(false)
      return
    }

    try {
      await createProject({
        name,
        description,
        dueDate: date.toISOString().split("T")[0],
      })
      router.push("/dashboard/projects")
      router.refresh()
    } catch (err) {
      setError("Proje oluşturulurken bir hata oluştu.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-3xl font-bold">Yeni Proje Oluştur</h1>
      <Card>
        <CardHeader>
          <CardTitle>Proje Detayları</CardTitle>
          <CardDescription>Yeni projenizin detaylarını girin</CardDescription>
        </CardHeader>
        <CardContent>
          {error && <div className="mb-4 rounded-lg bg-destructive/15 p-3 text-sm text-destructive">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Proje Adı</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Projenizin adını girin"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Proje açıklamasını girin"
                rows={4}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Bitiş Tarihi</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP", { locale: tr }) : "Tarih seçin"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="pt-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Oluşturuluyor..." : "Proje Oluştur"}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            İptal
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
