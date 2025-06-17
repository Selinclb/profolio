"use server"

import { v4 as uuidv4 } from "uuid"
import { prisma } from "./prisma"
import { getCurrentUser } from "./auth"

// Proje oluştur
export async function createProject(projectData: {
  name: string
  description: string
  dueDate: string
}) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      throw new Error("Kullanıcı bulunamadı")
    }

    // Projeyi oluştur
    const project = await prisma.project.create({
      data: {
        id: uuidv4(),
        name: projectData.name,
        description: projectData.description,
        dueDate: new Date(projectData.dueDate), // Tarih stringini Date objesine çevir
        userId: user.id,
      },
    })

    // Kullanıcıyı proje üyesi olarak ekle
    await prisma.projectMember.create({
      data: {
        id: uuidv4(),
        projectId: project.id,
        userId: user.id,
        role: "owner",
      },
    })

    return { id: project.id }
  } catch (error) {
    console.error("Proje oluşturma hatası:", error)
    if (error instanceof Error) {
      throw new Error(`Proje oluşturma hatası: ${error.message}`);
    }
    throw new Error("Proje oluşturma hatası.")
  }
}

// Kullanıcının projelerini getir
export async function getProjects() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      throw new Error("Kullanıcı bulunamadı")
    }

    // Kullanıcının üye olduğu projeleri bul ve detayları ile birlikte getir
    const projectsWithDetails = await prisma.project.findMany({
      where: {
        members: {
          some: {
            userId: user.id,
          },
        },
      },
      include: { // İlişkili verileri dahil et
        members: true,
        tasks: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Her proje için ek bilgileri hesapla
    const projectsWithCounts = projectsWithDetails.map((project: any) => {
      const completedTasksCount = project.tasks.filter((task: any) => task.status === "completed").length;
      return {
        ...project,
        progress: project.progress || 0,
        members: project.members.length,
        tasks: project.tasks.length,
        completedTasks: completedTasksCount,
        // projectMembers ve tasks artık doğrudan proje objesinin içinde
      };
    });

    return projectsWithCounts

  } catch (error) {
    console.error("Projeleri getirme hatası:", error);
    if (error instanceof Error) {
      throw new Error(`Projeleri getirme hatası: ${error.message}`);
    }
    throw new Error("Projeleri getirme hatası.");
  }
}

// Belirli bir projeyi getir
export async function getProject(id: string) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      throw new Error("Kullanıcı bulunamadı")
    }

    // Kullanıcının bu projeye erişimi olup olmadığını kontrol et ve projeyi detayları ile birlikte getir
    const project = await prisma.project.findUnique({
      where: {
        id: id,
        members: {
          some: {
            userId: user.id,
          },
        },
      },
      include: { // İlişkili verileri dahil et
        members: {
          include: { // Proje üyelerinin kullanıcı bilgilerini dahil et
            user: {
              select: { // Sadece belirli alanları seç
                id: true,
                name: true,
                email: true,
              }
            }
          }
        },
        tasks: true,
        projectStages: true,
      },
    });

    if (!project) {
      throw new Error("Proje bulunamadı veya erişim izniniz yok")
    }

     // Proje için ek bilgileri hesapla
    const completedTasksCount = project.tasks.filter((task: any) => task.status === "completed").length;

    return {
      ...project,
      members: project.members.length,
      tasks: project.tasks.length,
      completedTasks: completedTasksCount,
      teamMembers: project.members.map((pm: any) => ({ // projectMembers'ı teamMembers olarak map et
        id: pm.user.id, // Kullanıcı ID'si
        name: pm.user.name, // Kullanıcı Adı
        email: pm.user.email, // Kullanıcı Email
        role: pm.role, // Proje Üyesi Rolü
      })),
    }

  } catch (error) {
    console.error("Proje getirme hatası:", error);
    if (error instanceof Error) {
      throw new Error(`Proje getirme hatası: ${error.message}`);
    }
    throw new Error("Proje getirme hatası.");
  }
}

// Projeyi güncelle
export async function updateProject(
  id: string,
  projectData: {
    name?: string
    description?: string
    dueDate?: string
    progress?: number
  },
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      throw new Error("Kullanıcı bulunamadı")
    }

    // Kullanıcının bu projeye erişimi olup olmadığını kontrol et (sahiplik gerekebilir, schema'ya göre ayarlanır)
     const project = await prisma.project.findUnique({
      where: {
        id: id,
        members: {
          some: {
            userId: user.id, // Erişim izni kontrolü
            role: "owner" // Sadece sahibi güncelleyebilir varsayımı
          }
        }
      }
    });

    if (!project) {
       throw new Error("Projeyi güncelleme yetkiniz yok veya proje bulunamadı")
    }

    // Projeyi güncelle
    const updatedProject = await prisma.project.update({
      where: { id: id },
      data: {
        name: projectData.name,
        description: projectData.description,
        dueDate: projectData.dueDate ? new Date(projectData.dueDate) : undefined, // Tarih stringini Date objesine çevir
        progress: projectData.progress,
      },
    });

    return { success: true, project: updatedProject }
  } catch (error) {
    console.error("Proje güncelleme hatası:", error);
    if (error instanceof Error) {
      throw new Error(`Proje güncelleme hatası: ${error.message}`);
    }
    throw new Error("Proje güncelleme hatası.");
  }
}

// Projeyi sil
export async function deleteProject(id: string) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      throw new Error("Kullanıcı bulunamadı")
    }

    // Kullanıcının bu projenin sahibi olup olmadığını kontrol et
    const project = await prisma.project.findUnique({
      where: {
        id: id,
        members: {
          some: {
            userId: user.id,
            role: "owner",
          },
        },
      },
    });

    if (!project) {
      throw new Error("Bu projeyi silme yetkiniz yok veya proje bulunamadı")
    }

    // Projeyi sil (cascade ile ilişkili kayıtlar da silinecek)
    await prisma.project.delete({
      where: { id: id },
    });

    return { success: true }
  } catch (error) {
    console.error("Proje silme hatası:", error);
    if (error instanceof Error) {
      throw new Error(`Proje silme hatası: ${error.message}`);
    }
    throw new Error("Proje silme hatası.");
  }
}

// Proje aşaması ekle
export async function addProjectStage(projectId: string, stageData: {
  name: string
  description?: string
  startDate: string
  endDate: string
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
        id: projectId,
        members: {
          some: {
            userId: user.id,
          },
        },
      },
    });

    if (!project) {
       throw new Error("Bu projeye aşama ekleme yetkiniz yok veya proje bulunamadı")
    }

     // Proje aşamasını oluştur
    const newStage = await prisma.projectStage.create({
      data: {
        id: uuidv4(),
        projectId: projectId,
        name: stageData.name,
        description: stageData.description,
        startDate: new Date(stageData.startDate), // Tarih stringlerini Date objesine çevir
        endDate: new Date(stageData.endDate),     // Tarih stringlerini Date objesine çevir
        status: stageData.status || "pending",
      },
    });

    return { success: true, stage: newStage }

  } catch (error) {
    console.error("Proje aşaması ekleme hatası:", error);
    if (error instanceof Error) {
      throw new Error(`Proje aşaması ekleme hatası: ${error.message}`);
    }
    throw new Error("Proje aşaması ekleme hatası.");
  }
}

// Proje aşamasını güncelle
export async function updateProjectStage(stageId: string, stageData: {
  name?: string
  description?: string
  startDate?: string
  endDate?: string
  status?: "pending" | "in_progress" | "completed"
}) {
   try {
    const user = await getCurrentUser()

    if (!user) {
      throw new Error("Kullanıcı bulunamadı")
    }

     // Kullanıcının bu aşamanın ait olduğu projeye erişimi olup olmadığını kontrol et
     const stage = await prisma.projectStage.findUnique({
       where: { id: stageId },
       include: { project: { include: { members: true } } }
     });

     if (!stage || !stage.project.members.some((pm: any) => pm.userId === user.id)) {
        throw new Error("Bu proje aşamasını güncelleme yetkiniz yok veya aşama bulunamadı")
     }

     // Proje aşamasını güncelle
     const updatedStage = await prisma.projectStage.update({
       where: { id: stageId },
       data: {
         name: stageData.name,
         description: stageData.description,
         startDate: stageData.startDate ? new Date(stageData.startDate) : undefined,
         endDate: stageData.endDate ? new Date(stageData.endDate) : undefined,
         status: stageData.status,
       },
     });

     return { success: true, stage: updatedStage }

   } catch (error) {
    console.error("Proje aşaması güncelleme hatası:", error);
    if (error instanceof Error) {
      throw new Error(`Proje aşaması güncelleme hatası: ${error.message}`);
    }
    throw new Error("Proje aşaması güncelleme hatası.");
   }
}

// Proje aşamasını sil
export async function deleteProjectStage(stageId: string) {
   try {
    const user = await getCurrentUser()

    if (!user) {
      throw new Error("Kullanıcı bulunamadı")
    }

     // Kullanıcının bu aşamanın ait olduğu projeye erişimi olup olmadığını kontrol et
     const stage = await prisma.projectStage.findUnique({
       where: { id: stageId },
       include: { project: { include: { members: true } } }
     });

     if (!stage || !stage.project.members.some((pm: any) => pm.userId === user.id)) {
        throw new Error("Bu proje aşamasını silme yetkiniz yok veya aşama bulunamadı")
     }

     // Proje aşamasını sil
     await prisma.projectStage.delete({
       where: { id: stageId },
     });

     return { success: true }

   } catch (error) {
    console.error("Proje aşaması silme hatası:", error);
    if (error instanceof Error) {
      throw new Error(`Proje aşaması silme hatası: ${error.message}`);
    }
    throw new Error("Proje aşaması silme hatası.");
   }
}

// Proje aşamalarını getir
export async function getProjectStages(projectId: string) {
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
    });

    if (!project) {
       throw new Error("Bu proje aşamalarını görme yetkiniz yok veya proje bulunamadı")
    }

     // Proje aşamalarını getir
     const stages = await prisma.projectStage.findMany({
       where: { projectId: projectId },
       orderBy: { startDate: "asc" }
     });

     return stages

   } catch (error) {
    console.error("Proje aşamalarını getirme hatası:", error);
    if (error instanceof Error) {
      throw new Error(`Proje aşamalarını getirme hatası: ${error.message}`);
    }
    throw new Error("Proje aşamalarını getirme hatası.");
   }
}

// Proje üyesi ekle
export async function addProjectMember(projectId: string, userId: string, role: "member" | "owner") {
   try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      throw new Error("Kullanıcı bulunamadı")
    }

    // Mevcut kullanıcının projenin sahibi olup olmadığını kontrol et
    const projectMembership = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: { // Bileşik unique alan
          projectId: projectId,
          userId: currentUser.id,
        }
      },
      select: { role: true }
    });

    if (!projectMembership || projectMembership.role !== "owner") {
      throw new Error("Bu projeye üye ekleme yetkiniz yok")
    }

     // Eklenecek kullanıcının var olup olmadığını kontrol et
     const userToAdd = await prisma.user.findUnique({
       where: { id: userId }
     });

     if (!userToAdd) {
       throw new Error("Eklemek istediğiniz kullanıcı bulunamadı")
     }

     // Kullanıcının zaten üye olup olmadığını kontrol et
     const existingMembership = await prisma.projectMember.findUnique({
       where: {
         projectId_userId: { // Bileşik unique alan
           projectId: projectId,
           userId: userId,
         }
       }
     });

     if (existingMembership) {
       throw new Error("Kullanıcı zaten projenin bir üyesi")
     }

     // Proje üyesini ekle
     const newMember = await prisma.projectMember.create({
       data: {
         id: uuidv4(),
         projectId: projectId,
         userId: userId,
         role: role,
       },
        include: { user: { select: { id: true, name: true, email: true } } } // Eklenen üyenin kullanıcı bilgilerini de döndür
     });

     return { success: true, member: { ...newMember, ...newMember.user, role: newMember.role } } // Formatı ayarla

   } catch (error) {
    console.error("Proje üyesi ekleme hatası:", error);
    if (error instanceof Error) {
      throw new Error(`Proje üyesi ekleme hatası: ${error.message}`);
    }
    throw new Error("Proje üyesi ekleme hatası.");
   }
}

// Proje üyesini rolünü güncelle
export async function updateProjectMemberRole(projectMemberId: string, newRole: "member" | "owner") {
   try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      throw new Error("Kullanıcı bulunamadı")
    }

     // Güncellenecek proje üyeliğini ve projesini getir
     const projectMembership = await prisma.projectMember.findUnique({
       where: { id: projectMemberId },
       include: { project: { include: { members: true } } }
     });

     if (!projectMembership) {
       throw new Error("Proje üyeliği bulunamadı")
     }

     // Mevcut kullanıcının projenin sahibi olup olmadığını kontrol et
     const isCurrentUserOwner = projectMembership.project.members.some((pm: any) => pm.userId === currentUser.id && pm.role === "owner");

     if (!isCurrentUserOwner) {
       throw new Error("Bu proje üyesinin rolünü değiştirme yetkiniz yok")
     }

     // Sahibin rolünü değiştirmeye çalışıyorsa ve tek sahibi ise engelle
     const ownersInProject = projectMembership.project.members.filter((pm: any) => pm.role === "owner").length;
     if (projectMembership.role === "owner" && newRole === "member" && ownersInProject <= 1) {
        throw new Error("Projenin tek sahibinin rolünü değiştiremezsiniz")
     }

     // Proje üyesinin rolünü güncelle
     const updatedMembership = await prisma.projectMember.update({
       where: { id: projectMemberId },
       data: { role: newRole },
     });

     return { success: true, member: updatedMembership }

   } catch (error) {
    console.error("Proje üyesi rolü güncelleme hatası:", error);
    if (error instanceof Error) {
      throw new Error(`Proje üyesi rolü güncelleme hatası: ${error.message}`);
    }
    throw new Error("Proje üyesi rolü güncelleme hatası.");
   }
}

// Proje üyesini kaldır
export async function removeProjectMember(projectMemberId: string) {
   try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      throw new Error("Kullanıcı bulunamadı")
    }

     // Kaldırılacak proje üyeliğini ve projesini getir
     const projectMembership = await prisma.projectMember.findUnique({
       where: { id: projectMemberId },
       include: { project: { include: { members: true } } }
     });

     if (!projectMembership) {
       throw new Error("Proje üyeliği bulunamadı")
     }

     // Mevcut kullanıcının projenin sahibi olup olmadığını kontrol et
     const isCurrentUserOwner = projectMembership.project.members.some((pm: any) => pm.userId === currentUser.id && pm.role === "owner");

     if (!isCurrentUserOwner && projectMembership.userId !== currentUser.id) {
       throw new Error("Bu proje üyesini kaldırma yetkiniz yok")
     }

     // Sahibin kendini kaldırmaya çalışıyorsa ve tek sahibi ise engelle
      const ownersInProject = projectMembership.project.members.filter((pm: any) => pm.role === "owner").length;
      if (projectMembership.role === "owner" && projectMembership.userId === currentUser.id && ownersInProject <= 1) {
         throw new Error("Projenin tek sahibi kendisini kaldıramaz")
      }

     // Proje üyesini sil
     await prisma.projectMember.delete({
       where: { id: projectMemberId },
     });

     return { success: true }

   } catch (error) {
    console.error("Proje üyesi kaldırma hatası:", error);
    if (error instanceof Error) {
      throw new Error(`Proje üyesi kaldırma hatası: ${error.message}`);
    }
    throw new Error("Proje üyesi kaldırma hatası.");
   }
}

// Projeye kullanıcı ekle (email ile arama sonrası)
export async function addProjectMemberByEmail(projectId: string, email: string, role: "member" | "owner") {
   try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      throw new Error("Kullanıcı bulunamadı")
    }

     // Mevcut kullanıcının projenin sahibi olup olmadığını kontrol et
    const projectMembership = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: { 
          projectId: projectId,
          userId: currentUser.id,
        }
      },
      select: { role: true }
    });

    if (!projectMembership || projectMembership.role !== "owner") {
      throw new Error("Bu projeye üye ekleme yetkiniz yok")
    }

     // Eklemek istediğimiz kullanıcıyı email ile bul
     const userToAdd = await prisma.user.findUnique({
       where: { email: email }
     });

     if (!userToAdd) {
       throw new Error("Belirtilen email adresine sahip kullanıcı bulunamadı")
     }

      // Kullanıcının zaten üye olup olmadığını kontrol et
     const existingMembership = await prisma.projectMember.findUnique({
       where: {
         projectId_userId: { 
           projectId: projectId,
           userId: userToAdd.id,
         }
       }
     });

     if (existingMembership) {
       throw new Error("Kullanıcı zaten projenin bir üyesi")
     }

     // Proje üyesini ekle
     const newMember = await prisma.projectMember.create({
       data: {
         id: uuidv4(),
         projectId: projectId,
         userId: userToAdd.id,
         role: role,
       },
        include: { user: { select: { id: true, name: true, email: true } } } // Eklenen üyenin kullanıcı bilgilerini de döndür
     });

     return { success: true, member: { ...newMember, ...newMember.user, role: newMember.role } } // Formatı ayarla

   } catch (error) {
    console.error("Email ile proje üyesi ekleme hatası:", error);
    if (error instanceof Error) {
      throw new Error(`Email ile proje üyesi ekleme hatası: ${error.message}`);
    }
    throw new Error("Email ile proje üyesi ekleme hatası.");
   }
}

// Proje üyelerini getir
export async function getProjectMembers(projectId: string) {
   try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      throw new Error("Kullanıcı bulunamadı")
    }

     // Kullanıcının bu projeye erişimi olup olmadığını kontrol et
     const project = await prisma.project.findUnique({
      where: {
        id: projectId,
        members: {
          some: {
            userId: currentUser.id,
          },
        },
      },
    });

    if (!project) {
       throw new Error("Bu projenin üyelerini görme yetkiniz yok veya proje bulunamadı")
    }

     // Proje üyelerini kullanıcı bilgileriyle birlikte getir
     const members = await prisma.projectMember.findMany({
       where: { projectId: projectId },
       include: { user: { select: { id: true, name: true, email: true } } }
     });

     return members.map((member: any) => ({ ...member, ...member.user, role: (member as any).role })); // Formatı ayarla

   } catch (error) {
    console.error("Proje üyelerini getirme hatası:", error);
    if (error instanceof Error) {
      throw new Error(`Proje üyelerini getirme hatası: ${error.message}`);
    }
    throw new Error("Proje üyelerini getirme hatası.");
   }
}
