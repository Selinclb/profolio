import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return new NextResponse("Yetkilendirme gerekli", { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return new NextResponse("Email parametresi gerekli", { status: 400 })
    }

    // Email ile kullanıcı ara
    const result = await db.user.findUnique({
      where: {
        email: email
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })

    if (!result) {
      return new NextResponse(null, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Kullanıcı arama hatası:", error)
    return new NextResponse("Kullanıcı arama hatası", { status: 500 })
  }
} 