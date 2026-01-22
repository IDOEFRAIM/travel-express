'use server'

import { authService } from "@/services/auth.service"

import { prisma } from "@/lib/prisma"
import { ApplicationStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// Vérifier que l'user est bien admin
async function requireAdmin() {
  const userId = await authService.requireUser();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  if (user?.role !== 'ADMIN') {
    redirect('/student/dashboard');
  }
  return user;
}

// Action pour changer le statut d'un dossier
export async function updateApplicationStatus(applicationId: string, newStatus: ApplicationStatus) {
  await requireAdmin();

  // Logique métier : mettre à jour la progression en % selon le statut
  let progress = 0;
  switch (newStatus) {
    case 'DRAFT': progress = 10; break;
    case 'SUBMITTED': progress = 20; break;
    case 'UNDER_REVIEW': progress = 40; break;
    case 'ACCEPTED': progress = 60; break;
    case 'JW202_RECEIVED': progress = 70; break;
    case 'VISA_GRANTED': progress = 90; break;
    case 'FLIGHT_BOOKED': progress = 95; break;
    case 'COMPLETED': progress = 100; break;
  }

  const updatedApp = await prisma.application.update({
    where: { id: applicationId },
    data: { 
      status: newStatus,
      progress: progress 
    },
    include: { user: true, university: true }
  });

  // Ajout d'une activité si terminé
  if (newStatus === 'COMPLETED') {
    await prisma.activity.create({
      data: {
        type: 'APP_COMPLETED',
        title: 'Candidature terminée',
        description: `Le dossier de ${updatedApp.user?.fullName || 'étudiant'} pour ${updatedApp.university?.name || ''} est terminé.`,
        user: updatedApp.user?.fullName || '',
        color: 'bg-green-700',
        refId: applicationId
      }
    });
  }

  revalidatePath('/admin/dashboard');
}

// Action pour supprimer un dossier (au cas où)
export async function deleteApplication(applicationId: string) {
  await requireAdmin();
  await prisma.application.delete({ where: { id: applicationId } });
  revalidatePath('/admin/dashboard');
}
