
"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface User {
  id: string
  name: string
  email: string
}

export function NewMessageDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState("")
  const router = useRouter()

  useEffect(() => {
    if (open) {
      fetch("/api/messages/users")
        .then((res) => res.json())
        .then(setUsers)
        .catch((err) => console.error("Kullanıcıları getirme hatası:", err))
    }
  }, [open])

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <h2 className="text-lg font-semibold mb-2">Yeni Mesaj</h2>
        <Input
          placeholder="Kullanıcı ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <Button
                key={user.id}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  router.push(`/dashboard/messages/${user.id}`)
                  setOpen(false)
                }}
              >
                {user.name} <span className="ml-2 text-sm text-muted-foreground">({user.email})</span>
              </Button>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Kullanıcı bulunamadı.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
