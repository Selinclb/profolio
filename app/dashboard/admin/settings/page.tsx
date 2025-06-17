import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { checkAdmin } from "@/lib/auth"
import { SystemSettings } from "@/components/admin/system-settings"

export default async function AdminSettingsPage() {
  // Admin kontrolü
  const isAdmin = await checkAdmin()
  if (!isAdmin) {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/admin">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Sistem Ayarları</h1>
        </div>
      </div>

      <SystemSettings />
    </div>
  )
} 