"use server"

import { prisma } from "./prisma"
import { getCurrentUser } from "./auth"
import type { UserRole } from "./prisma"

// Tüm kullanıcıları getir
export async function getAllUsers() {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Bu işlem için yetkiniz yok")
    }

    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    return allUsers
  } catch (error) {
    console.error("Kullanıcıları getirme hatası:", error)
    if (error instanceof Error) {
      throw new Error(`Kullanıcıları getirme hatası: ${error.message}`)
    }
    throw new Error("Kullanıcıları getirme hatası.")
  }
}

// Kullanıcı rolünü güncelle
export async function updateUserRole(userId: string, newRole: UserRole) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Bu işlem için yetkiniz yok")
    }

    // Admin kendi rolünü değiştirmeye çalışıyorsa engelle
    if (userId === currentUser.id) {
      throw new Error("Kendi rolünüzü değiştiremezsiniz")
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        role: newRole,
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Kullanıcı rolü güncelleme hatası:", error)
    if (error instanceof Error) {
      throw new Error(`Kullanıcı rolü güncelleme hatası: ${error.message}`)
    }
    throw new Error("Kullanıcı rolü güncelleme hatası.")
  }
}

// Kullanıcı sil
export async function deleteUser(userId: string) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Bu işlem için yetkiniz yok")
    }

    // Admin kendini silemez
    if (userId === currentUser.id) {
      throw new Error("Kendinizi silemezsiniz")
    }

    await prisma.user.delete({
      where: { id: userId },
    })

    return { success: true }
  } catch (error) {
    console.error("Kullanıcı silme hatası:", error)
    if (error instanceof Error) {
      throw new Error(`Kullanıcı silme hatası: ${error.message}`)
    }
    throw new Error("Kullanıcı silme hatası.")
  }
}

// Admin sayısını kontrol et
export async function getAdminCount() {
  try {
    const adminCount = await prisma.user.count({
      where: { role: "admin" },
    })

    return adminCount
  } catch (error) {
    console.error("Admin sayısı kontrol hatası:", error)
    if (error instanceof Error) {
      throw new Error(`Admin sayısı kontrol hatası: ${error.message}`)
    }
    throw new Error("Admin sayısı kontrol hatası.")
  }
}

// Son admin mi kontrol et
export async function isLastAdmin(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user || user.role !== "admin") {
      return false
    }

    const adminCount = await getAdminCount()
    return adminCount <= 1
  } catch (error) {
    console.error("Son admin kontrolü hatası:", error)
    if (error instanceof Error) {
      throw new Error(`Son admin kontrolü hatası: ${error.message}`)
    }
    throw new Error("Son admin kontrolü hatası.")
  }
}
