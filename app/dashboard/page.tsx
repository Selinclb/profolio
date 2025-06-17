import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProjectCard } from "@/components/project-card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { getProjects } from "@/lib/projects"
import { getCurrentUser } from "@/lib/auth"
import { getTasks } from "@/lib/tasks"
import { CalendarIcon, CheckSquare, Clock } from "lucide-react"

export default async function DashboardPage() {
  // Kullanıcının projelerini getir
  const projects = await getProjects()
  const user = await getCurrentUser()

  // Projeleri ve görevleri getir
  const allTasks = await Promise.all(projects.map(project => getTasks(project.id)))
  const tasks = allTasks.flat()

  // İstatistikleri hesapla
  const totalProjects = projects.length
  const completedProjects = projects.filter((p) => p.progress === 100).length
  const totalTasks = projects.reduce((acc, p) => acc + p.tasks, 0)
  const completedTasks = projects.reduce((acc, p) => acc + p.completedTasks, 0)

  // Yaklaşan görevleri filtrele (7 gün içinde bitmesi gereken ve tamamlanmamış görevler)
  const today = new Date()
  const nextWeek = new Date(today)
  nextWeek.setDate(today.getDate() + 7)

  const upcomingTasks = tasks
    .filter(task => {
      if (!task.dueDate || task.status === "completed") return false
      const dueDate = new Date(task.dueDate)
      return dueDate >= today && dueDate <= nextWeek
    })
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Hoş Geldiniz, {user?.name}</h1>
        <Link href="/dashboard/projects/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Yeni Proje
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Proje</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tamamlanan Proje</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedProjects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Görev</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tamamlanan Görev</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks}</div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-bold">Son Projeler</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.slice(0, 3).map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Yaklaşan Görevler</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingTasks.length > 0 ? (
            <div className="space-y-4">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Bitiş: {new Date(task.dueDate!).toLocaleDateString("tr-TR")}
                      </p>
                    </div>
                  </div>
                  <Link href={`/dashboard/projects/${task.projectId}`}>
                    <Button variant="ghost" size="sm">
                      Görüntüle
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">Yaklaşan görev bulunmuyor</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
