import { prisma } from "../lib/prisma"
import { v4 as uuidv4 } from "uuid"
import bcrypt from "bcryptjs"

async function main() {
  console.log("Admin kullanıcısı oluşturuluyor...")

  const hashedPassword = await bcrypt.hash("admin123", 10)
  
  // Admin kullanıcısının zaten var olup olmadığını kontrol et
  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@example.com" }
  })

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        id: uuidv4(),
        name: "Admin",
        email: "admin@example.com",
        password: hashedPassword,
        role: "admin",
      },
    })
    console.log("Admin kullanıcısı başarıyla oluşturuldu!")
  } else {
    console.log("Admin kullanıcısı zaten mevcut.")
  }

}

main().catch((e) => {
  console.error(e)
  process.exit(1)
}) 