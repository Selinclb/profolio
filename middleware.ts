import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Admin sayfalarını kontrol et
  if (request.nextUrl.pathname.startsWith("/dashboard/admin")) {
    const sessionId = request.cookies.get("session_id")?.value

    if (!sessionId) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Admin kontrolü için API endpoint'i çağır
    try {
      const response = await fetch(new URL("/api/auth/check-admin", request.url), {
        headers: {
          Cookie: `session_id=${sessionId}`,
        },
      })

      if (!response.ok) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }

      const data = await response.json()

      if (!data.isAdmin) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    } catch (error) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/admin/:path*"],
}
