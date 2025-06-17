import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { CalendarIcon, CheckSquare } from "lucide-react"

interface ProjectCardProps {
  project: {
    id: string
    name: string
    description: string
    progress: number
    dueDate: string
    members: number
    tasks: number
    completedTasks: number
  }
}

export function ProjectCard({ project }: ProjectCardProps) {
  // Bitiş tarihini formatla
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date)
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <Link href={`/dashboard/projects/${project.id}`}>
          <CardTitle className="text-lg hover:text-primary hover:underline">{project.name}</CardTitle>
        </Link>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="mb-4 text-sm text-muted-foreground">{project.description}</p>
        <div className="mb-2 space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span>İlerleme</span>
            <span className="font-medium">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-2" />
        </div>
        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-4 w-4" />
            <span>{formatDate(project.dueDate)}</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckSquare className="h-4 w-4" />
            <span>
              {project.completedTasks}/{project.tasks}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="flex w-full items-center justify-between">
          <div className="flex -space-x-2">
            {Array.from({ length: Math.min(3, project.members) }).map((_, i) => (
              <Avatar key={i} className="h-7 w-7 border-2 border-background">
                <AvatarFallback className="text-xs">{String.fromCharCode(65 + i)}</AvatarFallback>
              </Avatar>
            ))}
            {project.members > 3 && (
              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-muted text-xs">
                +{project.members - 3}
              </div>
            )}
          </div>
          <Link href={`/dashboard/projects/${project.id}`} className="text-sm font-medium text-primary hover:underline">
            Detaylar
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
