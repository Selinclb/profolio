import { Calendar } from "@/components/calendar"
import { getProjects } from "@/lib/projects"

export default async function CalendarPage() {
  const projects = await getProjects()

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Takvim</h1>
      <div className="bg-card rounded-lg shadow">
        <Calendar projects={projects} />
      </div>
    </div>
  )
} 