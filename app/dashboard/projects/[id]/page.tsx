import { getProject } from "@/lib/projects"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, MoreVertical, Check } from "lucide-react"
import Link from "next/link"
import { getTasks, updateTaskStatus } from "@/lib/tasks"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

interface ProjectDetailPageProps {
  params: { id: string }
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const project = await getProject(params.id)
  const tasks = await getTasks(params.id)

  if (!project) {
    notFound()
  }

  async function handleStatusChange(formData: FormData) {
    "use server"
    const taskId = formData.get("taskId") as string
    const newStatus = formData.get("status") as string
    await updateTaskStatus(taskId, newStatus)
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Beklemede"
      case "in_progress":
        return "Devam Ediyor"
      case "completed":
        return "Tamamlandı"
      default:
        return status
    }
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{project.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-muted-foreground">{project.description}</p>
          <div className="mb-2">İlerleme: <b>{project.progress}%</b></div>
          <div className="mb-2">Bitiş Tarihi: <b>{new Date(project.dueDate).toLocaleDateString("tr-TR")}</b></div>
          <div className="mb-2">Üye Sayısı: <b>{project.members}</b></div>
          <div className="mb-2">Görevler: <b>{project.completedTasks}/{project.tasks}</b></div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Görevler</h2>
        <Link href={`/dashboard/projects/${params.id}/tasks/new`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Yeni Görev
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-6">
          {tasks.length > 0 ? (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="border-b pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {task.status === "completed" && <Check className="mr-2 h-4 w-4 text-green-500" />}
                      <h3 className="font-medium">{task.title}</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{getStatusText(task.status)}</Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <form action={handleStatusChange}>
                            <input type="hidden" name="taskId" value={task.id} />
                            <DropdownMenuItem asChild>
                              <button type="submit" name="status" value="pending" className="w-full text-left px-2 py-1.5">
                                Beklemede
                              </button>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <button type="submit" name="status" value="in_progress" className="w-full text-left px-2 py-1.5">
                                Devam Ediyor
                              </button>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <button type="submit" name="status" value="completed" className="w-full text-left px-2 py-1.5">
                                Tamamlandı
                              </button>
                            </DropdownMenuItem>
                          </form>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                  <div className="mt-2 text-sm">
                    <span className="text-muted-foreground">Bitiş Tarihi: </span>
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString("tr-TR") : "Belirtilmemiş"}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Henüz görev eklenmemiş</p>
              <Link href={`/dashboard/projects/${params.id}/tasks/new`}>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> İlk Görevi Ekle
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 