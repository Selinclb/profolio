import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const notification = await prisma.notification.update({
      where: {
        id: params.id,
        userId: user.id,
      },
      data: {
        read: true,
      },
    })

    return NextResponse.json(notification)
  } catch (error) {
    console.error("Bildirim güncellenemedi:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 