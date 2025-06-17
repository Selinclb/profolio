import { ProjectCard } from "@/components/project-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import Link from "next/link"
import { getProjects } from "@/lib/projects"

export default async function ProjectsPage() {
  // Kullanıcının projelerini getirecek
  const projects = await getProjects()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Projeler</h1>
        <Link href="/dashboard/projects/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Yeni Proje
          </Button>
        </Link>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Projelerde ara..." className="pl-8" />
        </div>
        <Button variant="outline">Filtrele</Button>
      </div>

      {projects.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">Henüz projeniz yok</h3>
          <p className="text-muted-foreground mb-4">İlk projenizi oluşturarak başlayın.</p>
          <Link href="/dashboard/projects/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Yeni Proje Oluştur
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
