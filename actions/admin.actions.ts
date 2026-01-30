'use server'

import { authService } from "@/services/auth.service"
import { prisma } from "@/lib/prisma"
import { ApplicationStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

/**
 * Pour verifier que l'user est un admin
 */
async function requireAdmin() {
  const userId = await authService.requireUser();
  const user = await prisma.user.findUnique({ 
    where: { id: userId },
    select: { role: true } 
  });
  
  if (!user || user.role !== 'ADMIN') {
    // Si ce n'est pas un admin,on le redirige vers la page student
    redirect('/student/');
  }
  return userId;
}

/**
 *Cette fonction nous permet de calculer le pourcentage de progression selon le statut
 */
function getProgressFromStatus(status: ApplicationStatus): number {
  const mapping: Record<ApplicationStatus, number> = {
    'DRAFT': 10,
    'SUBMITTED': 20,
    'UNDER_REVIEW': 40,
    'ACCEPTED': 60,
    'JW202_RECEIVED': 70,
    'VISA_GRANTED': 90,
    'FLIGHT_BOOKED': 95,
    'COMPLETED': 100,
    'REJECTED': 0 
  };
  return mapping[status] ?? 0;
}

/**
 * Mettre a jour le statut d une application
 */
export async function updateApplicationStatus(applicationId: string, newStatus: ApplicationStatus) {
  try {
    await requireAdmin();

    const progress = getProgressFromStatus(newStatus);

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: { 
        status: newStatus,
        progress: progress 
      }
    });

    // On s'assure de revalider les paths concernés ,cela permet de rafraichir les données côté client
    revalidatePath('/admin/dashboard');
    revalidatePath(`/admin/applications/${applicationId}`);
    revalidatePath(`/student/${applicationId}`);
    
    return { success: true, data: updated };
  } catch (error) {
    console.error("Status Update Error:", error);
    return { success: false, error: "Impossible de mettre à jour le statut." };
  }
}

/**
 * Action pour supprimer une application
 */
export async function deleteApplication(applicationId: string) {
  try {
    await requireAdmin();

    // On utilise une transaction pour nettoyer les relations si nécessaire
    await prisma.$transaction([
      // On s'assure de supprimer les documents liés
      prisma.document.deleteMany({ where: { applicationId } }),
      // Puis on supprime l'application elle-même
      prisma.application.delete({ 
        where: { id: applicationId } 
      })
    ]);

    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (error) {
    console.error("Delete Application Error:", error);
    return { success: false, error: "Erreur lors de la suppression. Ce dossier contient peut-être des données liées (paiements)." };
  }
}

/**
 * Assigner une université à une application
 */
export async function assignUniversity(applicationId: string, universityId: string) {
    try {
        await requireAdmin();

        await prisma.application.update({
            where: { id: applicationId },
            data: { universityId: universityId }
        });

        revalidatePath(`/admin/applications/${applicationId}`);
        revalidatePath(`/student/dashboard`);
        return { success: true };
    } catch (error) {
        return { success: false, error: "Erreur lors de l'assignation de l'université." };
    }
}