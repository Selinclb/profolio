"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Shield, UserIcon, Trash } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { getAllUsers, updateUserRole, deleteUser, isLastAdmin } from "@/lib/admin"
import type { UserRole } from "@/lib/db/schema"
import { getCurrentUser } from "@/lib/auth"

type User = {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt?: string
}

export function UserManagementTable() {
  const { toast } = useToast()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [userToChangeRole, setUserToChangeRole] = useState<User | null>(null)
  const [newRole, setNewRole] = useState<UserRole>("user")

  // Kullanıcıları yükle
  const loadUsers = async () => {
    try {
      setLoading(true)
      const loadedUsers = await getAllUsers()
      setUsers(loadedUsers)
      
      // Mevcut kullanıcıyı al
      const user = await getCurrentUser()
      if (user) {
        setCurrentUser(user)
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Kullanıcılar yüklenirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Sayfa yüklendiğinde kullanıcıları getir
  useEffect(() => {
    loadUsers()
  }, []) // Boş dependency array ile sadece component mount olduğunda çalışır

  // Kullanıcı rolünü değiştir
  const handleRoleChange = async (userId: string, role: UserRole) => {
    try {
      // Son admin mi kontrol et
      if (userToChangeRole?.role === "admin" && role === "user") {
        const lastAdmin = await isLastAdmin(userId)
        if (lastAdmin) {
          toast({
            title: "Hata",
            description: "Son admin kullanıcısının rolünü değiştiremezsiniz.",
            variant: "destructive",
          })
          return
        }
      }

      await updateUserRole(userId, role)
      toast({
        title: "Başarılı",
        description: "Kullanıcı rolü başarıyla güncellendi.",
      })
      loadUsers()
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Kullanıcı rolü güncellenirken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  // Kullanıcıyı sil
  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId)
      toast({
        title: "Başarılı",
        description: "Kullanıcı başarıyla silindi.",
      })
      loadUsers()
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Kullanıcı silinirken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  // Tarih formatla
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date)
  }

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kullanıcı</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Kayıt Tarihi</TableHead>
              <TableHead className="w-[80px]">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === "admin" ? "default" : "outline"}>
                    {user.role === "admin" ? (
                      <>
                        <Shield className="mr-1 h-3 w-3" /> Admin
                      </>
                    ) : (
                      <>
                        <UserIcon className="mr-1 h-3 w-3" /> Kullanıcı
                      </>
                    )}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(user.createdAt || "")}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">İşlemler</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {user.id !== currentUser?.id && (
                        <DropdownMenuItem
                          onClick={() => {
                            setUserToChangeRole(user)
                            setNewRole(user.role === "admin" ? "user" : "admin")
                            setRoleDialogOpen(true)
                          }}
                        >
                          {user.role === "admin" ? (
                            <>
                              <UserIcon className="mr-2 h-4 w-4" /> Kullanıcı Yap
                            </>
                          ) : (
                            <>
                              <Shield className="mr-2 h-4 w-4" /> Admin Yap
                            </>
                          )}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => {
                          setUserToDelete(user)
                          setDeleteDialogOpen(true)
                        }}
                        className="text-destructive"
                      >
                        <Trash className="mr-2 h-4 w-4" /> Sil
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Rol Değiştirme Dialog */}
      <AlertDialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kullanıcı Rolünü Değiştir</AlertDialogTitle>
            <AlertDialogDescription>
              {userToChangeRole?.name} adlı kullanıcının rolünü {newRole === "admin" ? "admin" : "normal kullanıcı"}{" "}
              olarak değiştirmek istediğinize emin misiniz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (userToChangeRole) {
                  handleRoleChange(userToChangeRole.id, newRole)
                }
                setRoleDialogOpen(false)
              }}
            >
              Değiştir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Silme Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kullanıcıyı Sil</AlertDialogTitle>
            <AlertDialogDescription>
              {userToDelete?.name} adlı kullanıcıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (userToDelete) {
                  handleDeleteUser(userToDelete.id)
                }
                setDeleteDialogOpen(false)
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
