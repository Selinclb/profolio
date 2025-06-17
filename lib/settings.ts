"use server"

import { db } from "./db"
import { getCurrentUser } from "./auth"
import { v4 as uuidv4 } from "uuid"
import { SystemSetting } from "@prisma/client"

// Sistem ayarlarını getir
export async function getSystemSettings(category: string) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Bu işlem için yetkiniz yok")
    }

    const settings = await db.systemSetting.findMany({
      where: {
        category: category
      }
    })

    return settings.reduce((acc: Record<string, string>, setting: SystemSetting) => {
      acc[setting.key] = setting.value
      return acc
    }, {})
  } catch (error) {
    console.error("Sistem ayarları getirme hatası:", error)
    throw error
  }
}

// Sistem ayarını güncelle
export async function updateSystemSetting(category: string, key: string, value: string) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Bu işlem için yetkiniz yok")
    }

    // Mevcut ayarı kontrol et ve güncelle veya oluştur
    await db.systemSetting.upsert({
      where: {
        category_key: {
          category: category,
          key: key
        }
      },
      update: {
        value: value,
        updatedAt: new Date()
      },
      create: {
        id: uuidv4(),
        category: category,
        key: key,
        value: value
      }
    })

    return { success: true }
  } catch (error) {
    console.error("Sistem ayarı güncelleme hatası:", error)
    throw error
  }
}

// Tüm sistem ayarlarını güncelle
export async function updateSystemSettings(category: string, settings: Record<string, string>) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Bu işlem için yetkiniz yok")
    }

    // Her bir ayarı güncelle
    for (const [key, value] of Object.entries(settings)) {
      await updateSystemSetting(category, key, value)
    }

    return { success: true }
  } catch (error) {
    console.error("Sistem ayarları güncelleme hatası:", error)
    throw error
  }
} 