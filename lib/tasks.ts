"use server"

import { prisma } from "./prisma"
import { getCurrentUser } from "./auth"
import { v4 as uuidv4 } from "uuid"
import { revalidatePath } from "next/cache"

// Görev oluştur
export async function createTask(taskData: {
  title: string
  description: string
  dueDate: string
  projectId: string
  assignedTo?: string
  status?: "pending" | "in_progress" | "completed"
}) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      throw new Error("Kullanıcı bulunamadı")
    }

    // Kullanıcının bu projeye erişimi olup olmadığını kontrol et
    const project = await prisma.project.findUnique({
      where: {
        id: taskData.projectId,
        members: {
          some: {
            userId: user.id,
          },
        },
      },
    })

    if (!project) {
      throw new Error("Bu projeye görev ekleme yetkiniz yok")
    }

    // Görevi oluştur
    const task = await prisma.task.create({
      data: {
        id: uuidv4(),
        title: taskData.title,
        description: taskData.description,
        dueDate: new Date(taskData.dueDate),
        status: taskData.status || "pending",
        project: {
          connect: { id: taskData.projectId }
        },
        assignedTo: taskData.assignedTo ? { connect: { id: taskData.assignedTo } } : undefined,
        createdBy: { connect: { id: user.id } },
      },
    })

    return { id: task.id }
  } catch (error) {
    console.error("Görev oluşturma hatası:", error)
    if (error instanceof Error) {
      throw new Error(`Görev oluşturma hatası: ${error.message}`)
    }
    throw new Error("Görev oluşturma hatası")
  }
}

// Görevleri getir
export async function getTasks(projectId: string) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      throw new Error("Kullanıcı bulunamadı")
    }

    // Kullanıcının bu projeye erişimi olup olmadığını kontrol et
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
        members: {
          some: {
            userId: user.id,
          },
        },
      },
    })

    if (!project) {
      throw new Error("Bu projenin görevlerini görme yetkiniz yok")
    }

    // Görevleri getir
    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        dueDate: "asc",
      },
    })

    return tasks
  } catch (error) {
    console.error("Görevleri getirme hatası:", error)
    if (error instanceof Error) {
      throw new Error(`Görevleri getirme hatası: ${error.message}`)
    }
    throw new Error("Görevleri getirme hatası")
  }
}

// Görevi güncelle
export async function updateTask(
  id: string,
  taskData: {
    title?: string
    description?: string
    dueDate?: string
    status?: "pending" | "in_progress" | "completed"
    assignedTo?: string
  },
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      throw new Error("Kullanıcı bulunamadı")
    }

    // Görevi ve projesini getir
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            members: true,
          },
        },
      },
    })

    if (!task) {
      throw new Error("Görev bulunamadı")
    }

    // Kullanıcının bu projeye erişimi olup olmadığını kontrol et
    const isProjectMember = task.project.members.some(
      (member: { userId: string }) => member.userId === user.id
    )

    if (!isProjectMember) {
      throw new Error("Bu görevi güncelleme yetkiniz yok")
    }

    // Görevi güncelle
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        title: taskData.title,
        description: taskData.description,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
        status: taskData.status,
        assignedTo: taskData.assignedTo ? { connect: { id: taskData.assignedTo } } : undefined,
      },
    })

    // Görev güncellendikten sonra ilgili proje sayfasını yeniden doğrula
    revalidatePath(`/dashboard/projects/${task.projectId}`)

    return { success: true, task: updatedTask }
  } catch (error) {
    console.error("Görev güncelleme hatası:", error)
    if (error instanceof Error) {
      throw new Error(`Görev güncelleme hatası: ${error.message}`)
    }
    throw new Error("Görev güncelleme hatası")
  }
}

// Görevi sil
export async function deleteTask(id: string) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      throw new Error("Kullanıcı bulunamadı")
    }

    // Görevi ve projesini getir
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            members: true,
          },
        },
      },
    })

    if (!task) {
      throw new Error("Görev bulunamadı")
    }

    // Kullanıcının bu projeye erişimi olup olmadığını kontrol et
    const isProjectMember = task.project.members.some(
      (member: { userId: string }) => member.userId === user.id
    )

    if (!isProjectMember) {
      throw new Error("Bu görevi silme yetkiniz yok")
    }

    // Görevi sil
    await prisma.task.delete({
      where: { id },
    })

    return { success: true }
  } catch (error) {
    console.error("Görev silme hatası:", error)
    if (error instanceof Error) {
      throw new Error(`Görev silme hatası: ${error.message}`)
    }
    throw new Error("Görev silme hatası")
  }
}

// Görev durumunu güncelle
export async function updateTaskStatus(id: string, status: "pending" | "in_progress" | "completed") {
  try {
    const user = await getCurrentUser()

    if (!user) {
      throw new Error("Kullanıcı bulunamadı")
    }

    // Görevi ve projesini getir
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            members: true,
          },
        },
      },
    })

    if (!task) {
      throw new Error("Görev bulunamadı")
    }

    // Kullanıcının bu projeye erişimi olup olmadığını kontrol et
    const isProjectMember = task.project.members.some(
      (member: { userId: string }) => member.userId === user.id
    )

    if (!isProjectMember) {
      throw new Error("Bu görevin durumunu güncelleme yetkiniz yok")
    }

    // Görev durumunu güncelle
    const updatedTask = await prisma.task.update({
      where: { id },
      data: { status },
    })

    // Görev güncellendikten sonra ilgili proje sayfasını yeniden doğrula
    revalidatePath(`/dashboard/projects/${task.projectId}`)

    return { success: true, task: updatedTask }
  } catch (error) {
    console.error("Görev durumu güncelleme hatası:", error)
    if (error instanceof Error) {
      throw new Error(`Görev durumu güncelleme hatası: ${error.message}`)
    }
    throw new Error("Görev durumu güncelleme hatası")
  }
}

// Görevi atama
export async function assignTask(id: string, userId: string) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      throw new Error("Kullanıcı bulunamadı")
    }

    // Görevi ve projesini getir
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            members: true,
          },
        },
      },
    })

    if (!task) {
      throw new Error("Görev bulunamadı")
    }

    // Kullanıcının bu projeye erişimi olup olmadığını kontrol et
    const isProjectMember = task.project.members.some(
      (member: { userId: string }) => member.userId === user.id
    )

    if (!isProjectMember) {
      throw new Error("Bu görevi atama yetkiniz yok")
    }

    // Atanacak kullanıcının proje üyesi olup olmadığını kontrol et
    const isAssigneeProjectMember = task.project.members.some(
      (member: { userId: string }) => member.userId === userId
    )

    if (!isAssigneeProjectMember) {
      throw new Error("Atamak istediğiniz kullanıcı proje üyesi değil")
    }

    // Görevi ata
    const updatedTask = await prisma.task.update({
      where: { id },
      data: { assignedTo: userId },
    })

    return { success: true, task: updatedTask }
  } catch (error) {
    console.error("Görev atama hatası:", error)
    if (error instanceof Error) {
      throw new Error(`Görev atama hatası: ${error.message}`)
    }
    throw new Error("Görev atama hatası")
  }
} 