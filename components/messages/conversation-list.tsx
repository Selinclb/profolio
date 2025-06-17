"use client"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

type Conversation = {
  user: {
    id: string
    name: string
    email: string
  }
  lastMessage: {
    id: string
    content: string
    senderId: string
    receiverId: string
    isRead: number
    createdAt: string
  } | null
  unreadCount: number
}

interface ConversationListProps {
  conversations: Conversation[]
}

export function ConversationList({ conversations }: ConversationListProps) {
  // Mesaj zamanını formatla
  const formatMessageTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: tr,
    })
  }

  // Mesaj içeriğini kısalt
  const truncateMessage = (content: string, maxLength = 60) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + "..."
  }

  // Kullanıcı avatarı için kısaltma oluştur
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="space-y-4">
      {conversations.map((conversation) => (
        <Link key={conversation.user.id} href={`/dashboard/messages/${conversation.user.id}`}>
          <Card className="flex cursor-pointer items-center gap-4 p-4 transition-colors hover:bg-muted/50">
            <Avatar className="h-12 w-12">
              <AvatarFallback>{getInitials(conversation.user.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{conversation.user.name}</h3>
                {conversation.lastMessage && (
                  <span className="text-xs text-muted-foreground">
                    {formatMessageTime(conversation.lastMessage.createdAt)}
                  </span>
                )}
              </div>
              {conversation.lastMessage ? (
                <p className="text-sm text-muted-foreground truncate">
                  {truncateMessage(conversation.lastMessage.content)}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">Henüz mesaj yok</p>
              )}
            </div>
            {conversation.unreadCount > 0 && (
              <Badge variant="default" className="ml-2">
                {conversation.unreadCount}
              </Badge>
            )}
          </Card>
        </Link>
      ))}
    </div>
  )
}
