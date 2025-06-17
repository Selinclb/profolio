import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createTask } from "@/lib/tasks"
import { redirect } from "next/navigation"

interface NewTaskPageProps {
  params: { id: string }
}

export default function NewTaskPage({ params }: NewTaskPageProps) {
  async function handleSubmit(formData: FormData) {
    "use server"
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const dueDate = formData.get("dueDate") as string
    const status = formData.get("status") as string

    await createTask({
      projectId: params.id,
      title,
      description,
      dueDate,
      status,
    })

    redirect(`/dashboard/projects/${params.id}`)
  }

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Yeni Görev Ekle</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Görev Adı</Label>
              <Input id="title" name="title" required />
            </div>
            <div>
              <Label htmlFor="description">Açıklama</Label>
              <Textarea id="description" name="description" />
            </div>
            <div>
              <Label htmlFor="dueDate">Bitiş Tarihi</Label>
              <Input id="dueDate" name="dueDate" type="date" required />
            </div>
            <div>
              <Label htmlFor="status">Durum</Label>
              <Select name="status" defaultValue="pending">
                <SelectTrigger>
                  <SelectValue placeholder="Durum seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Beklemede</SelectItem>
                  <SelectItem value="in_progress">Devam Ediyor</SelectItem>
                  <SelectItem value="completed">Tamamlandı</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit">Görevi Ekle</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 