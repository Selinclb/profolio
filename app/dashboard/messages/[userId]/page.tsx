import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { checkAuth } from "@/lib/auth"
import { getConversation } from "@/lib/messages"
import { MessageThread } from "@/components/messages/message-thread"
import { getUserById } from "@/lib/users"

export default async function ConversationPage({
  params,
}: {
  params: { userId: string }
}) {
  // Oturum kontrolü
  const isAuthenticated = await checkAuth()
  if (!isAuthenticated) {
    redirect("/login")
  }

  const userId = params.userId

  // Kullanıcı bilgilerini ve konuşmayı getir
  const otherUser = await getUserById(userId)
  if (!otherUser) {
    redirect("/dashboard/messages")
  }

  const messages = await getConversation(userId)

  return (
    <div className="flex h-full flex-col space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/dashboard/messages">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">{otherUser.name}</h1>
      </div>

      <MessageThread otherUser={otherUser} initialMessages={messages} />
    </div>
  )
}
