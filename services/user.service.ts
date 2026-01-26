import { prisma } from "@/lib/prisma"
import { Role, User, Prisma } from "@prisma/client"

export const userService = {
  /**
   * Trouve un utilisateur par email avec normalisation
   */
  async findByEmail(email: string) {
    if (!email) return null;
    return prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
  },

  /**
   * Crée un étudiant avec gestion des types Prisma
   * Utilisation de Prisma.UserCreateInput pour plus de flexibilité
   */
  async createStudent(data: { email: string; password: string; fullName: string; phone?: string | null }) {
    return prisma.user.create({
      data: {
        email: data.email.toLowerCase().trim(),
        password: data.password, // Le hashage doit être fait avant d'appeler ce service
        fullName: data.fullName.trim(),
        phone: data.phone,
        role: Role.STUDENT,
      },
    });
  },
  
  /**
   * Récupère un profil complet avec une sélection précise
   * (On évite de charger le mot de passe ici par sécurité)
   */
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        createdAt: true,
        applications: {
          include: { 
            university: {
                select: {
                    id: true,
                    name: true,
                    country: true,
                    city: true
                }
            } 
          },
          orderBy: { updatedAt: 'desc' }
        }
      }
    });
  },

  /**
   * Dashboard Admin : Liste des étudiants avec compteurs
   */
  async getAllStudents() {
    return prisma.user.findMany({
      where: { role: Role.STUDENT },
      select: {
        id: true,
        fullName: true,
        email: true,
        _count: { select: { applications: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}