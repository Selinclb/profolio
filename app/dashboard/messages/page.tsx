import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { checkAuth } from "@/lib/auth"
import { getConversations } from "@/lib/messages"
import { ConversationList } from "@/components/messages/conversation-list"
import { NewMessageDialog } from "@/components/messages/new-message-dialog"

export default async function MessagesPage() {
  // Oturum kontrolü
  const isAuthenticated = await checkAuth()
  if (!isAuthenticated) {
    redirect("/login")
  }

  // Konuşmaları getir
  const conversations = await getConversations()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mesajlar</h1>
        <NewMessageDialog>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Yeni Mesaj
          </Button>
        </NewMessageDialog>
      </div>

      {conversations.length > 0 ? (
        <ConversationList conversations={conversations} />
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <h3 className="mb-2 text-lg font-medium">Henüz mesajınız yok</h3>
          <p className="mb-6 text-sm text-muted-foreground">Yeni bir mesaj göndererek konuşma başlatabilirsiniz.</p>
          <NewMessageDialog>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Yeni Mesaj Gönder
            </Button>
          </NewMessageDialog>
        </div>
      )}
    </div>
  )
}
