"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Send } from "lucide-react"
import { sendMessage, getConversation } from "@/lib/messages"
import { useToast } from "@/components/ui/use-toast"

type User = {
  id: string
  name: string
  email: string
}

type Message = {
  id: string
  content: string
  senderId: string
  receiverId: string
  isRead: number
  createdAt: string
}

interface MessageThreadProps {
  otherUser: User
  initialMessages: Message[]
}

export function MessageThread({ otherUser, initialMessages }: MessageThreadProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Mesaj zamanını formatla
  const formatMessageTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: tr,
    })
  }

  // Mesaj gönder
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    try {
      setIsSending(true)
      await sendMessage(otherUser.id, newMessage)

      // Mesajları yenile
      const updatedMessages = await getConversation(otherUser.id)
      setMessages(updatedMessages)
      setNewMessage("")
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Mesaj gönderilemedi",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  // Enter tuşu ile mesaj gönder
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Mesajları periyodik olarak yenile
  useEffect(() => {
    const refreshMessages = async () => {
      try {
        const updatedMessages = await getConversation(otherUser.id)
        setMessages(updatedMessages)
      } catch (error) {
        console.error("Mesajları yenileme hatası:", error)
      }
    }

    const interval = setInterval(refreshMessages, 10000) // 10 saniyede bir yenile
    return () => clearInterval(interval)
  }, [otherUser.id])

  // Yeni mesaj geldiğinde otomatik olarak aşağı kaydır
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-center text-muted-foreground">
              Henüz mesaj yok. Aşağıdan ilk mesajınızı gönderebilirsiniz.
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isSentByMe = message.receiverId === otherUser.id
            return (
              <div key={message.id} className={`flex ${isSentByMe ? "justify-end" : "justify-start"}`}>
                <Card
                  className={`max-w-[80%] px-4 py-2 ${isSentByMe ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                >
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  <div
                    className={`mt-1 text-right text-xs ${
                      isSentByMe ? "text-primary-foreground/80" : "text-muted-foreground"
                    }`}
                  >
                    {formatMessageTime(message.createdAt)}
                  </div>
                </Card>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Mesajınızı yazın..."
            className="min-h-[80px] flex-1 resize-none"
          />
          <Button onClick={handleSendMessage} disabled={!newMessage.trim() || isSending} className="self-end">
            <Send className="h-4 w-4" />
            <span className="sr-only">Gönder</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
