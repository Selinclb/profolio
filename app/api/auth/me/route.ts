import { getCurrentUser } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return new NextResponse("Not authenticated", { status: 401 })
    }
    return NextResponse.json({ user })
  } catch (error) {
    console.error("Error fetching user info:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
