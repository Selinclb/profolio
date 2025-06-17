"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { v4 as uuidv4 } from "uuid"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"

// Şifre hash'leme
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

// Şifre doğrulama
async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Kullanıcı kaydı
export async function registerUser(name: string, email: string, password: string, role: "user" | "admin" = "user") {
  try {
    // Email'in kullanılıp kullanılmadığını kontrol et
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      throw new Error("Bu email adresi zaten kullanılıyor.")
    }

    // Şifreyi hash'le
    const hashedPassword = await hashPassword(password)

    // Yeni kullanıcı oluştur
    const user = await prisma.user.create({
      data: {
        id: uuidv4(),
        name,
        email,
        password: hashedPassword,
        role,
      }
    })

    // Oturum oluştur
    await createSession(user.id)

    return { success: true }
  } catch (error) {
    console.error("Kullanıcı kaydı hatası:", error)
    throw error
  }
}

// Kullanıcı girişi
export async function loginUser(email: string, password: string) {
  try {
    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      throw new Error("Geçersiz email veya şifre")
    }

    // Şifreyi doğrula
    const isPasswordValid = await verifyPassword(password, user.password)

    if (!isPasswordValid) {
      throw new Error("Geçersiz email veya şifre")
    }

    // Oturum oluştur
    await createSession(user.id)

    return { success: true }
  } catch (error) {
    console.error("Kullanıcı girişi hatası:", error)
    throw error
  }
}

// Oturum oluştur
async function createSession(userId: string) {
  // Eski oturumları temizle
  await prisma.session.deleteMany({
    where: { userId }
  })

  // Yeni oturum oluştur
  const sessionId = uuidv4()
  const expiresAtTimestampInSeconds = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 // 7 gün
  const expiresAt = new Date(expiresAtTimestampInSeconds * 1000) // Date objesi oluştur

  await prisma.session.create({
    data: {
      id: sessionId,
      userId,
      expiresAt,
    }
  })

  // Oturum çerezini ayarla
  const cookieStore = await cookies()
  cookieStore.set("session_id", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 gün
    path: "/",
  })
}

// Kullanıcı çıkışı
export async function logoutUser() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session_id")?.value

  if (sessionId) {
    try {
      // Oturumu veritabanından sil
      await prisma.session.delete({
        where: { id: sessionId }
      })
    } catch (error) {
      console.error("Oturum silme hatası:", error)
      // Hata olsa bile çerezi silmeye devam et
    }
    // Çerezi sil
    cookieStore.delete("session_id")
  }

  redirect("/")
}

// Mevcut kullanıcıyı getir
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session_id")?.value

    if (!sessionId) {
      return null
    }

    // Oturumu bul
    const session = await prisma.session.findUnique({
      where: { id: sessionId }
    })

    if (!session) {
      return null
    }

    // Oturumun süresinin dolup dolmadığını kontrol et
    if (session.expiresAt < Math.floor(Date.now() / 1000)) {
      try {
        await prisma.session.delete({
          where: { id: sessionId }
        })
      } catch (error) {
        console.error("Süresi dolmuş oturum silme hatası:", error)
      }
      cookieStore.delete("session_id")
      return null
    }

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      }
    })

    if (!user) {
      return null
    }

    return user
  } catch (error) {
    console.error("Kullanıcı bilgisi getirme hatası:", error)
    return null
  }
}

// Oturum kontrolü
export async function checkAuth() {
  const user = await getCurrentUser()
  return !!user
}

// Admin kontrolü
export async function checkAdmin() {
  const user = await getCurrentUser()
  return user?.role === "admin"
}

// Profil güncelleme
export async function updateProfile(data: { name?: string; email?: string }) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      throw new Error("Kullanıcı bulunamadı")
    }

    // Email değiştiyse, yeni email'in kullanılıp kullanılmadığını kontrol et
    if (data.email && data.email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email }
      })

      if (existingUser) {
        throw new Error("Bu email adresi zaten kullanılıyor.")
      }
    }

    // Kullanıcı bilgilerini güncelle
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: data.name,
        email: data.email,
      }
    })

    return { success: true }
  } catch (error) {
    console.error("Profil güncelleme hatası:", error)
    throw error
  }
}

// İlk admin kullanıcısını oluştur (uygulama başlatıldığında)
export async function createInitialAdminUser() {
  try {
    // Herhangi bir admin kullanıcısı var mı kontrol et
    const adminUserCount = await prisma.user.count({
      where: { role: "admin" }
    })

    // Eğer admin yoksa, bir tane oluştur
    if (adminUserCount === 0) {
      const adminEmail = "admin@example.com"
      const adminPassword = "admin123" // Gerçek uygulamada güçlü bir şifre kullanılmalı

      // Admin kullanıcısının zaten var olup olmadığını kontrol et
      const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail }
      })

      if (!existingAdmin) {
        await registerUser("Admin Kullanıcı", adminEmail, adminPassword, "admin")
        console.log("İlk admin kullanıcısı oluşturuldu")
      }
    }
  } catch (error) {
    console.error("İlk admin kullanıcısı oluşturma hatası:", error)
  }
}
