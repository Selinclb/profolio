import { getProjects } from "@/lib/projects"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export default async function ReportsPage() {
  const projects = await getProjects()

  // İstatistikleri hesaplama kısmı
  const totalProjects = projects.length
  const completedProjects = projects.filter((p) => p.progress === 100).length
  const totalTasks = projects.reduce((acc, p) => acc + p.tasks, 0)
  const completedTasks = projects.reduce((acc, p) => acc + p.completedTasks, 0)
  const overallProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Raporlar</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Proje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tamamlanan Proje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedProjects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Görev</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tamamlanan Görev</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Genel İlerleme</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={overallProgress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            {overallProgress.toFixed(1)}% tamamlandı
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 