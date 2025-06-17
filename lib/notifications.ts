import { prisma } from "./prisma"
import type { NotificationType } from "@/types/notification"

interface CreateNotificationParams {
  userId: string
  title: string
  message: string
  type: NotificationType
  metadata?: {
    taskId?: string
    messageId?: string
    dueDate?: string
    senderId?: string
  }
}

export async function createNotification({
  userId,
  title,
  message,
  type,
  metadata,
}: CreateNotificationParams) {
  return prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  })
}

// Yaklaşan görevler için bildirim oluştur
export async function createTaskReminderNotification(
  userId: string,
  taskTitle: string,
  dueDate: Date,
  taskId: string
) {
  const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  
  return createNotification({
    userId,
    title: "Yaklaşan Görev Hatırlatması",
    message: `"${taskTitle}" görevi ${daysUntilDue} gün içinde sona erecek.`,
    type: "task",
    metadata: {
      taskId,
      dueDate: dueDate.toISOString(),
    },
  })
}

// Yeni mesaj bildirimi oluştur
export async function createMessageNotification(
  userId: string,
  senderName: string,
  messageId: string,
  senderId: string
) {
  return createNotification({
    userId,
    title: "Yeni Mesaj",
    message: `${senderName} size yeni bir mesaj gönderdi.`,
    type: "message",
    metadata: {
      messageId,
      senderId,
    },
  })
} 