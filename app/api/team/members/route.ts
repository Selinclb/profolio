import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { nanoid } from "nanoid"

// Takım üyelerini getir
export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return new NextResponse("Yetkilendirme gerekli", { status: 401 })
    }

    // Kullanıcının takım üyeliğini bul
    let userTeamMember = await db.teamMember.findFirst({
      where: { userId: user.id },
    })

    let teamId: string

    // Eğer kullanıcının takımı yoksa yeni takım oluştur
    if (!userTeamMember) {
      const newTeam = await db.team.create({
        data: {
          id: nanoid(),
          name: `${user.name}'in Takımı`,
          description: `${user.name} tarafından oluşturulan takım`,
        },
      })

      teamId = newTeam.id

      // Kullanıcıyı takımın yöneticisi olarak ekle
      await db.teamMember.create({
        data: {
          id: nanoid(),
          userId: user.id,
          teamId: teamId,
          role: "admin",
        },
      })
    } else {
      teamId = userTeamMember.teamId
    }

    // Takımdaki tüm üyeleri getir (kullanıcı bilgileriyle birlikte)
    const members = await db.teamMember.findMany({
      where: { teamId: teamId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        user: { name: "asc" },
      },
    })

    // Üye listesini istenen formata dönüştür
    const formattedMembers = members.map((member: any) => ({
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
      role: member.role,
    }))

    return NextResponse.json(formattedMembers)
  } catch (error) {
    console.error("Takım üyeleri getirme hatası:", error)
    if (error instanceof Error) {
      return new NextResponse(`Takım üyeleri alınamadı: ${error.message}`, { status: 500 })
    }
    return new NextResponse("Takım üyeleri alınamadı", { status: 500 })
  }
}

// Takım üyesi ekle
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return new NextResponse("Yetkilendirme gerekli", { status: 401 })
    }

    const body = await request.json()
    const { users: selectedUsers } = body

    if (!selectedUsers || !Array.isArray(selectedUsers)) {
      return new NextResponse("Geçersiz istek", { status: 400 })
    }

    // Kullanıcının takım üyeliğini bul (sadece adminler ekleyebilir varsayımı)
    let userTeamMember = await db.teamMember.findFirst({
      where: { userId: user.id, role: "admin" },
    })

    if (!userTeamMember) {
      return new NextResponse("Takım üyesi ekleme yetkiniz yok", { status: 403 })
    }

    const teamId = userTeamMember.teamId

    // Eklemek istediğimiz kullanıcıların id'lerini al
    const userIdsToAdd = selectedUsers.map((u: any) => u.id)

    // Zaten takımda olan kullanıcıları bul
    const existingMembers = await db.teamMember.findMany({
      where: {
        teamId: teamId,
        userId: {
          in: userIdsToAdd
        }
      },
      select: { userId: true }
    })

    const existingUserIds = existingMembers.map((m: any) => m.userId)

    // Yeni üyeleri filtrele (zaten takımda olmayanlar)
    const newMembersData = userIdsToAdd
      .filter((userId: string) => !existingUserIds.includes(userId))
      .map((userId: string) => ({
        id: nanoid(),
        userId: userId,
        teamId: teamId,
        role: "member", // Varsayılan olarak üye rolü
      }))

    if (newMembersData.length > 0) {
      // Yeni üyeleri toplu olarak ekle
      await db.teamMember.createMany({
        data: newMembersData,
        skipDuplicates: true, // Duplicate hatalarını atla
      })
    }

    // Güncel takım üyelerini getir (yeni eklenenlerle birlikte)
    const members = await db.teamMember.findMany({
      where: { teamId: teamId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        user: { name: "asc" },
      },
    })

    // Güncel üye listesini istenen formata dönüştür
    const formattedMembers = members.map((member: any) => ({
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
      role: member.role,
    }))

    return NextResponse.json(formattedMembers)
  } catch (error) {
    console.error("Takım üyesi ekleme hatası:", error)
    if (error instanceof Error) {
      return new NextResponse(`Takım üyesi eklenemedi: ${error.message}`, { status: 500 })
    }
    return new NextResponse("Takım üyesi eklenemedi", { status: 500 })
  }
} 