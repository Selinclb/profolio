export type NotificationType = "task" | "message"

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
  type: NotificationType
  metadata?: {
    taskId?: string
    messageId?: string
    dueDate?: string
    senderId?: string
  }
} 