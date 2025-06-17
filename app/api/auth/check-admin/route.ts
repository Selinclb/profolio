import { NextResponse } from "next/server"
import { checkAdmin } from "@/lib/auth"

export async function GET() {
  try {
    const isAdmin = await checkAdmin()

    return NextResponse.json({ isAdmin })
  } catch (error) {
    return NextResponse.json({ isAdmin: false }, { status: 401 })
  }
}
