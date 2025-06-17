import { NextResponse } from "next/server"
import { getAllUsersForMessaging } from "@/lib/messages"

export async function GET() {
  try {
    const users = await getAllUsersForMessaging()
    return NextResponse.json(users)
  } catch (error) {
    console.error("API kullanıcı getirme hatası:", error)
    return new NextResponse("Kullanıcılar alınamadı", { status: 500 })
  }
}