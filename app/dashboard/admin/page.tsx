import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, ShieldCheck, Settings } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { checkAdmin } from "@/lib/auth"
import { getAllUsers, getAdminCount } from "@/lib/admin"

export default async function AdminDashboardPage() {
  // Admin kontrolü
  const isAdmin = await checkAdmin()
  if (!isAdmin) {
    redirect("/dashboard")
  }

  // İstatistikler
  const users = await getAllUsers()
  const adminCount = await getAdminCount()
  const userCount = users.length - adminCount

  const stats = [
    { title: "Toplam Kullanıcı", value: users.length.toString(), icon: Users },
    { title: "Admin Kullanıcılar", value: adminCount.toString(), icon: ShieldCheck },
    { title: "Normal Kullanıcılar", value: userCount.toString(), icon: Users },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Paneli</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Kullanıcı Yönetimi</CardTitle>
            <CardDescription>Kullanıcıları yönetin ve rollerini değiştirin</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/admin/users">
              <Button className="w-full">
                <Users className="mr-2 h-4 w-4" />
                Kullanıcıları Yönet
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Sistem Ayarları</CardTitle>
            <CardDescription>Sistem ayarlarını yapılandırın</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/admin/settings">
              <Button className="w-full">
                <Settings className="mr-2 h-4 w-4" />
                Ayarları Yönet
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
