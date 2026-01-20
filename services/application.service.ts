// Ce fichier gère la logique des candidatures
import { prisma } from "@/lib/prisma"
// import { ApplicationStatus } from "@prisma/client"

export const applicationService = {
  // Créer une nouvelle candidature
  async createApplication(userId: string, universityId: string) {
    // Vérifier si une candidature existe déjà pour cette université
    const existing = await prisma.application.findFirst({
      where: {
        userId,
        universityId,
      }
    })

    if (existing) {
      throw new Error("Vous avez déjà une candidature en cours pour cette université.")
    }

    return prisma.application.create({
      data: {
        userId,
        universityId,
        status: "DRAFT", // Commence en brouillon
        progress: 10, // 10% car le dossier est ouvert
      }
    })
  },

  // Récupérer les candidatures d'un étudiant
  async getStudentApplications(userId: string) {
    return prisma.application.findMany({
      where: { userId },
      include: {
        university: true,
        documents: true
      },
      orderBy: { updatedAt: 'desc' }
    })
  },

  // Récupérer toutes les candidatures pour l'admin
  async getAllApplications() {
      return prisma.application.findMany({
          include: {
              user: true,
              university: true,
              documents: true // Include documents to show count or details
          },
          orderBy: { createdAt: 'desc' }
      })
  },

  async getApplicationById(id: string) {
    return prisma.application.findUnique({
      where: { id },
      include: {
        user: true,
        university: true,
        documents: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
  }
}
