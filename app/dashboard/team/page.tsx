"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Mail, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type TeamMember = {
  id: string
  name: string
  email: string
  role: string
}

type User = {
  id: string
  name: string
  email: string
  role: string
}

export default function TeamPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [searchResult, setSearchResult] = useState<User | null>(null)
  const [searchError, setSearchError] = useState("")

  useEffect(() => {
    // Takım üyelerini getir
    const fetchTeamMembers = async () => {
      try {
        const response = await fetch("/api/team/members")
        if (response.ok) {
          const data = await response.json()
          setTeamMembers(data)
        }
      } catch (error) {
        console.error("Takım üyeleri alınamadı:", error)
      }
    }

    fetchTeamMembers()
  }, [])

  const filteredMembers = teamMembers.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddMember = () => {
    setIsDialogOpen(true)
    setSearchQuery("")
    setSearchResult(null)
    setSearchError("")
  }

  const handleSearch = async () => {
    if (!searchQuery) {
      setSearchError("Lütfen bir email adresi girin")
      return
    }

    setIsLoading(true)
    setSearchError("")
    setSearchResult(null)

    try {
      const response = await fetch(`/api/users/search?email=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        if (data) {
          setSearchResult(data)
        } else {
          setSearchError("Kullanıcı bulunamadı")
        }
      } else {
        setSearchError("Kullanıcı arama hatası")
      }
    } catch (error) {
      console.error("Kullanıcı arama hatası:", error)
      setSearchError("Kullanıcı arama hatası")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUserSelect = (user: User) => {
    if (!selectedUsers.find((u) => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user])
      setSearchQuery("")
      setSearchResult(null)
    }
  }

  const handleUserRemove = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((user) => user.id !== userId))
  }

  const handleSaveTeam = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/team/members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ users: selectedUsers }),
      })

      if (response.ok) {
        const updatedTeam = await response.json()
        setTeamMembers(updatedTeam)
        setIsDialogOpen(false)
        setSelectedUsers([])
      }
    } catch (error) {
      console.error("Takım üyeleri eklenemedi:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Takım</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddMember} disabled={isLoading}>
              <Plus className="mr-2 h-4 w-4" />
              {isLoading ? "Ekleniyor..." : "Yeni Üye Ekle"}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Takım Üyesi Ekle</DialogTitle>
              <DialogDescription>
                Email adresi ile kullanıcı arayın ve takıma ekleyin.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Email ile ara..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <Button onClick={handleSearch} disabled={isLoading}>
                  {isLoading ? "Aranıyor..." : "Ara"}
                </Button>
              </div>

              {searchError && (
                <div className="text-sm text-destructive">{searchError}</div>
              )}

              {searchResult && (
                <Card className="cursor-pointer hover:bg-muted" onClick={() => handleUserSelect(searchResult)}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>
                          {searchResult.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{searchResult.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {searchResult.email}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Seçilen Kullanıcılar</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map((user) => (
                    <Badge key={user.id} variant="secondary" className="flex items-center gap-1">
                      {user.name}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => handleUserRemove(user.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false)
                  setSelectedUsers([])
                }}
              >
                İptal
              </Button>
              <Button onClick={handleSaveTeam} disabled={isLoading || selectedUsers.length === 0}>
                {isLoading ? "Ekleniyor..." : "Ekle"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Takım Üyeleri</CardTitle>
          <CardDescription>
            Projenizde çalışan tüm takım üyelerini buradan yönetebilirsiniz.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Takım üyesi ara..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            {filteredMembers.map((member) => (
              <Card key={member.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{member.name}</h3>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span>{member.email}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{member.role}</Badge>
                      <Button variant="ghost" size="sm">
                        Düzenle
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 