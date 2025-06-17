"use server"

import { v4 as uuidv4 } from "uuid"
import { prisma } from "./prisma"
import { getCurrentUser } from "./auth"

// Mesaj gönder
export async function sendMessage(receiverId: string, content: string) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      throw new Error("Oturum açmanız gerekiyor")
    }

    if (!content.trim()) {
      throw new Error("Mesaj içeriği boş olamaz")
    }

    // Alıcı kullanıcının var olup olmadığını kontrol et
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId }
    })

    if (!receiver) {
      throw new Error("Alıcı kullanıcı bulunamadı")
    }

    // Kendine mesaj göndermeyi engelle
    if (currentUser.id === receiverId) {
      throw new Error("Kendinize mesaj gönderemezsiniz")
    }

    // Mesajı oluştur
    const message = await prisma.message.create({
      data: {
        id: uuidv4(),
        content,
        senderId: currentUser.id,
        receiverId,
        createdAt: new Date(),
      },
    })

    return { success: true, messageId: message.id }
  } catch (error) {
    console.error("Mesaj gönderme hatası:", error)
    if (error instanceof Error) {
      throw new Error(`Mesaj gönderme hatası: ${error.message}`);
    }
    throw new Error("Mesaj gönderme hatası.")
  }
}

// Belirli bir kullanıcıyla olan mesajları getir
export async function getConversation(otherUserId: string) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      throw new Error("Oturum açmanız gerekiyor")
    }

    // Mesajları getir (gönderilen ve alınan)
    const conversation = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: currentUser.id,
            receiverId: otherUserId,
          },
          {
            senderId: otherUserId,
            receiverId: currentUser.id,
          },
        ],
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    // Okunmamış mesajları okundu olarak işaretle
    await prisma.message.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: currentUser.id,
        isRead: false, // Prisma boolean kullanır
      },
      data: {
        isRead: true,
      },
    })

    return conversation
  } catch (error) {
    console.error("Konuşma getirme hatası:", error)
     if (error instanceof Error) {
      throw new Error(`Konuşma getirme hatası: ${error.message}`);
    }
    throw new Error("Konuşma getirme hatası.")
  }
}

// Kullanıcının tüm konuşmalarını getir
export async function getConversations() {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      throw new Error("Oturum açmanız gerekiyor")
    }

    // Kullanıcının mesajlaştığı diğer kullanıcıları bul
    // Distinct kullanarak benzersiz kullanıcıları bulabiliriz
    const conversationUsers = await prisma.user.findMany({
      where: {
        NOT: { id: currentUser.id },
        OR: [
          { sentMessages: { some: { receiverId: currentUser.id } } },
          { receivedMessages: { some: { senderId: currentUser.id } } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    type ConversationUser = typeof conversationUsers[number];

    // Her kullanıcı için son mesajı ve okunmamış mesaj sayısını getir
    const conversationsWithDetails = await Promise.all(
      conversationUsers.map(async (user: ConversationUser) => {
        // Son mesajı getir
        const lastMessage = await prisma.message.findFirst({
          where: {
            OR: [
              {
                senderId: currentUser.id,
                receiverId: user.id,
              },
              {
                senderId: user.id,
                receiverId: currentUser.id,
              },
            ],
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        // Okunmamış mesaj sayısını getir
        const unreadCount = await prisma.message.count({
          where: {
            senderId: user.id,
            receiverId: currentUser.id,
            isRead: false,
          },
        });

        return {
          user,
          lastMessage: lastMessage || null,
          unreadCount: unreadCount,
        };
      })
    );

    // Son mesaj tarihine göre sırala
    return conversationsWithDetails.sort((a, b) => {
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime();
    });

  } catch (error) {
    console.error("Konuşmaları getirme hatası:", error);
     if (error instanceof Error) {
      throw new Error(`Konuşmaları getirme hatası: ${error.message}`);
    }
    throw new Error("Konuşmaları getirme hatası.");
  }
}

// Tüm kullanıcıları getir (mesajlaşma için)
export async function getAllUsersForMessaging() {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      throw new Error("Oturum açmanız gerekiyor")
    }

    // Kendisi hariç tüm kullanıcıları getir
    const allUsers = await prisma.user.findMany({
      where: {
        NOT: { id: currentUser.id },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return allUsers
  } catch (error) {
    console.error("Kullanıcıları getirme hatası:", error);
     if (error instanceof Error) {
      throw new Error(`Kullanıcıları getirme hatası: ${error.message}`);
    }
    throw new Error("Kullanıcıları getirme hatası.");
  }
}

// Okunmamış mesaj sayısını getir
export async function getUnreadMessageCount() {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return 0
    }

    const unreadCount = await prisma.message.count({
      where: {
        receiverId: currentUser.id,
        isRead: false, // Prisma boolean kullanır
      },
    });

    return unreadCount
  } catch (error) {
    console.error("Okunmamış mesaj sayısı getirme hatası:", error);
     if (error instanceof Error) {
      throw new Error(`Okunmamış mesaj sayısı getirme hatası: ${error.message}`);
    }
    throw new Error("Okunmamış mesaj sayısı getirme hatası.");
  }
}
