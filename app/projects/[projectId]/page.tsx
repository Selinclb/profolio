import { getProject } from "@/lib/projects"
import { getTasks } from "@/lib/tasks"
import { notFound } from "next/navigation"
import { TaskList } from "@/components/task-list"
import { TaskForm } from "@/components/task-form"
import { Progress } from "@/components/ui/progress"

export default async function ProjectPage({ params }: { params: { projectId: string } }) {
  const project = await getProject(params.projectId)
  if (!project) {
    notFound()
  }

  const tasks = await getTasks(params.projectId)

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
        <p className="text-gray-600 mb-4">{project.description}</p>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-gray-600">İlerleme:</span>
          <span className="text-sm font-medium">{project.progress}%</span>
        </div>
        <Progress value={project.progress} className="w-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Görevler</h2>
          <TaskList tasks={tasks} />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Yeni Görev Ekle</h2>
          <TaskForm projectId={params.projectId} />
        </div>
      </div>
    </div>
  )
} 