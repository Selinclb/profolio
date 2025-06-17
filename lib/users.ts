"use server"

import { prisma } from "./prisma"

// Kullanıcı bilgilerini getir
export async function getUserById(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })

    return user
  } catch (error) {
    console.error("Kullanıcı bilgisi getirme hatası:", error)
    return null
  }
}
