"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Settings, Mail, Shield, Database, Bell } from "lucide-react"
import { getSystemSettings, updateSystemSettings } from "@/lib/settings"

export function SystemSettings() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  // Genel ayarlar
  const [siteName, setSiteName] = useState("Proje Yönetim Sistemi")
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [allowRegistration, setAllowRegistration] = useState(true)

  // Email ayarları
  const [smtpHost, setSmtpHost] = useState("")
  const [smtpPort, setSmtpPort] = useState("")
  const [smtpUser, setSmtpUser] = useState("")
  const [smtpPassword, setSmtpPassword] = useState("")

  // Güvenlik ayarları
  const [maxLoginAttempts, setMaxLoginAttempts] = useState("5")
  const [sessionTimeout, setSessionTimeout] = useState("30")
  const [requireTwoFactor, setRequireTwoFactor] = useState(false)

  // Bildirim ayarları
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [projectUpdates, setProjectUpdates] = useState(true)
  const [taskReminders, setTaskReminders] = useState(true)

  // Ayarları yükle
  const loadSettings = async (category: string) => {
    try {
      const settings = await getSystemSettings(category)
      
      switch (category) {
        case "general":
          setSiteName(settings.siteName || "Proje Yönetim Sistemi")
          setMaintenanceMode(settings.maintenanceMode === "true")
          setAllowRegistration(settings.allowRegistration !== "false")
          break
        case "email":
          setSmtpHost(settings.smtpHost || "")
          setSmtpPort(settings.smtpPort || "")
          setSmtpUser(settings.smtpUser || "")
          setSmtpPassword(settings.smtpPassword || "")
          break
        case "security":
          setMaxLoginAttempts(settings.maxLoginAttempts || "5")
          setSessionTimeout(settings.sessionTimeout || "30")
          setRequireTwoFactor(settings.requireTwoFactor === "true")
          break
        case "notifications":
          setEmailNotifications(settings.emailNotifications !== "false")
          setProjectUpdates(settings.projectUpdates !== "false")
          setTaskReminders(settings.taskReminders !== "false")
          break
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Ayarlar yüklenirken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  // Sayfa yüklendiğinde ayarları getir
  useEffect(() => {
    const loadAllSettings = async () => {
      try {
        setInitialLoading(true)
        await Promise.all([
          loadSettings("general"),
          loadSettings("email"),
          loadSettings("security"),
          loadSettings("notifications"),
        ])
      } finally {
        setInitialLoading(false)
      }
    }

    loadAllSettings()
  }, [])

  // Ayarları kaydet
  const handleSaveSettings = async (category: string) => {
    try {
      setLoading(true)
      
      let settings: Record<string, string> = {}
      
      switch (category) {
        case "general":
          settings = {
            siteName,
            maintenanceMode: maintenanceMode.toString(),
            allowRegistration: allowRegistration.toString(),
          }
          break
        case "email":
          settings = {
            smtpHost,
            smtpPort,
            smtpUser,
            smtpPassword,
          }
          break
        case "security":
          settings = {
            maxLoginAttempts,
            sessionTimeout,
            requireTwoFactor: requireTwoFactor.toString(),
          }
          break
        case "notifications":
          settings = {
            emailNotifications: emailNotifications.toString(),
            projectUpdates: projectUpdates.toString(),
            taskReminders: taskReminders.toString(),
          }
          break
      }

      await updateSystemSettings(category, settings)
      
      toast({
        title: "Başarılı",
        description: `${category} ayarları başarıyla kaydedildi.`,
      })
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Ayarlar kaydedilirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <Tabs defaultValue="general" className="space-y-4">
      <TabsList>
        <TabsTrigger value="general">
          <Settings className="mr-2 h-4 w-4" />
          Genel
        </TabsTrigger>
        <TabsTrigger value="email">
          <Mail className="mr-2 h-4 w-4" />
          Email
        </TabsTrigger>
        <TabsTrigger value="security">
          <Shield className="mr-2 h-4 w-4" />
          Güvenlik
        </TabsTrigger>
        <TabsTrigger value="notifications">
          <Bell className="mr-2 h-4 w-4" />
          Bildirimler
        </TabsTrigger>
      </TabsList>

      {/* Genel Ayarlar */}
      <TabsContent value="general">
        <Card>
          <CardHeader>
            <CardTitle>Genel Ayarlar</CardTitle>
            <CardDescription>Sistemin genel ayarlarını buradan yapılandırabilirsiniz.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Adı</Label>
              <Input
                id="siteName"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="Site adını girin"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Bakım Modu</Label>
                <p className="text-sm text-muted-foreground">
                  Sistem bakımdayken sadece adminler erişebilir
                </p>
              </div>
              <Switch
                checked={maintenanceMode}
                onCheckedChange={setMaintenanceMode}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Yeni Kayıt</Label>
                <p className="text-sm text-muted-foreground">
                  Yeni kullanıcı kaydına izin ver
                </p>
              </div>
              <Switch
                checked={allowRegistration}
                onCheckedChange={setAllowRegistration}
              />
            </div>

            <Button
              onClick={() => handleSaveSettings("Genel")}
              disabled={loading}
            >
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Email Ayarları */}
      <TabsContent value="email">
        <Card>
          <CardHeader>
            <CardTitle>Email Ayarları</CardTitle>
            <CardDescription>SMTP sunucu ayarlarını yapılandırın.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="smtpHost">SMTP Sunucu</Label>
              <Input
                id="smtpHost"
                value={smtpHost}
                onChange={(e) => setSmtpHost(e.target.value)}
                placeholder="smtp.example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtpPort">SMTP Port</Label>
              <Input
                id="smtpPort"
                value={smtpPort}
                onChange={(e) => setSmtpPort(e.target.value)}
                placeholder="587"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtpUser">SMTP Kullanıcı</Label>
              <Input
                id="smtpUser"
                value={smtpUser}
                onChange={(e) => setSmtpUser(e.target.value)}
                placeholder="user@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtpPassword">SMTP Şifre</Label>
              <Input
                id="smtpPassword"
                type="password"
                value={smtpPassword}
                onChange={(e) => setSmtpPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <Button
              onClick={() => handleSaveSettings("Email")}
              disabled={loading}
            >
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Güvenlik Ayarları */}
      <TabsContent value="security">
        <Card>
          <CardHeader>
            <CardTitle>Güvenlik Ayarları</CardTitle>
            <CardDescription>Sistem güvenlik ayarlarını yapılandırın.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="maxLoginAttempts">Maksimum Giriş Denemesi</Label>
              <Input
                id="maxLoginAttempts"
                type="number"
                value={maxLoginAttempts}
                onChange={(e) => setMaxLoginAttempts(e.target.value)}
                min="1"
                max="10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Oturum Zaman Aşımı (dakika)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
                min="5"
                max="1440"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>İki Faktörlü Doğrulama</Label>
                <p className="text-sm text-muted-foreground">
                  Admin kullanıcıları için iki faktörlü doğrulama zorunlu
                </p>
              </div>
              <Switch
                checked={requireTwoFactor}
                onCheckedChange={setRequireTwoFactor}
              />
            </div>

            <Button
              onClick={() => handleSaveSettings("Güvenlik")}
              disabled={loading}
            >
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Bildirim Ayarları */}
      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle>Bildirim Ayarları</CardTitle>
            <CardDescription>Sistem bildirim ayarlarını yapılandırın.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Bildirimleri</Label>
                <p className="text-sm text-muted-foreground">
                  Tüm email bildirimlerini etkinleştir
                </p>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Proje Güncellemeleri</Label>
                <p className="text-sm text-muted-foreground">
                  Proje durumu değişikliklerinde bildirim gönder
                </p>
              </div>
              <Switch
                checked={projectUpdates}
                onCheckedChange={setProjectUpdates}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Görev Hatırlatıcıları</Label>
                <p className="text-sm text-muted-foreground">
                  Yaklaşan görevler için hatırlatma gönder
                </p>
              </div>
              <Switch
                checked={taskReminders}
                onCheckedChange={setTaskReminders}
              />
            </div>

            <Button
              onClick={() => handleSaveSettings("Bildirim")}
              disabled={loading}
            >
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
} 