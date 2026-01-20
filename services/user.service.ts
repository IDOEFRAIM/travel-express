// Ce fichier gère uniquement les appels BDD pour les utilisateurs
import { prisma } from "@/lib/prisma"
import { Role, User } from "@prisma/client"

export const userService = {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    })
  },

  async createStudent(data: Pick<User, 'email' | 'password' | 'fullName' | 'phone'>) {
    return prisma.user.create({
      data: {
        ...data,
        role: Role.STUDENT,
      },
    })
  },
  
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        applications: {
          include: { university: true }
        }
      }
    })
  }
}
