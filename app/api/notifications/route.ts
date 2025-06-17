import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    })

    return NextResponse.json(notifications)
  } catch (error) {
    console.error("Bildirimler alınamadı:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    const { title, message } = body

    if (!title || !message) {
      return new NextResponse("Başlık ve mesaj gereklidir", { status: 400 })
    }

    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        userId: user.id,
      },
    })

    return NextResponse.json(notification)
  } catch (error) {
    console.error("Bildirim oluşturulamadı:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 