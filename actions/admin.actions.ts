'use server'

import { authService } from "@/services/auth.service"
import { prisma } from "@/lib/prisma"
import { ApplicationStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

/**
 * Vérifie si l'utilisateur est admin
 */
async function requireAdmin() {
  const userId = await authService.requireUser();
  const user = await prisma.user.findUnique({ 
    where: { id: userId },
    select: { role: true } 
  });
  
  if (!user || user.role !== 'ADMIN') {
    // Note: redirect() lève une erreur interne de Next.js pour fonctionner.
    // Il est préférable de l'appeler en dehors d'un bloc try/catch si possible.
    redirect('/student/dashboard');
  }
  return userId;
}

/**
 * Calcule le pourcentage de progression selon le statut
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
 * Action pour mettre à jour le statut
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

    // Revalidation précise
    revalidatePath('/admin/dashboard');
    revalidatePath(`/admin/applications/${applicationId}`);
    revalidatePath(`/student/dashboard`); // Pour que l'étudiant voie son nouveau statut
    
    return { success: true, data: updated };
  } catch (error) {
    console.error("Status Update Error:", error);
    return { success: false, error: "Impossible de mettre à jour le statut." };
  }
}

/**
 * Action pour supprimer un dossier (Sécurisée)
 */
export async function deleteApplication(applicationId: string) {
  try {
    await requireAdmin();

    // 1. On utilise une transaction pour nettoyer les relations si nécessaire
    // (Selon ton schéma, si ON DELETE CASCADE n'est pas activé sur les documents/paiements)
    await prisma.$transaction([
      // Optionnel : nettoyer les documents si tu ne veux pas d'orphelins
      prisma.document.deleteMany({ where: { applicationId } }),
      // Supprimer l'application
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
 * NOUVELLE ACTION : Assigner une université à une application
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