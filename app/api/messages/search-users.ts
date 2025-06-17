import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { like, ne } from "drizzle-orm"
import { getCurrentUser } from "@/lib/auth"

export async function GET(req: Request) {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const query = searchParams.get("query") || ""

  if (query.trim().length === 0) {
    return Response.json([])
  }

  const results = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
    })
    .from(users)
    .where(
      and(
        ne(users.id, currentUser.id),
        like(users.name, `%${query}%`)
      )
    )
    .limit(10)

  return Response.json(results)
}
