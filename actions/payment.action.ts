'use server'

import { prisma } from "@/lib/prisma";
import { authService } from "@/services/auth.service";
import { revalidatePath } from "next/cache";
import { ApplicationStatus, PaymentStatus } from "@prisma/client"; 

/**
 * Met à jour le statut de PAIEMENT d'une candidature
 */
export async function updatePaymentAction(applicationId: string, newStatus: PaymentStatus) {
  try {
    const session = await authService.getSession();
    
    // 1. Vérification de sécurité (Admin uniquement)
    if (!session || session.role !== 'ADMIN') {
      return { error: "Accès non autorisé." };
    }

    // 2. Exécution de la mise à jour
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: { 
        // On met à jour le statut financier réel
        paymentStatus: newStatus, 

        // Si le paiement est complété, on fait progresser le dossier automatiquement
        status: newStatus === PaymentStatus.COMPLETED ? ApplicationStatus.UNDER_REVIEW : undefined,
        
        // On met à jour le pourcentage de progression si nécessaire
        progress: newStatus === PaymentStatus.COMPLETED ? 20 : undefined
      }
    });

    // 3. Purge du cache pour mettre à jour l'UI partout
    revalidatePath('/admin/finances');
    revalidatePath(`/admin/applications/${applicationId}`);
    revalidatePath(`/admin/students/${updatedApplication.userId}`); 
    revalidatePath('/student/dashboard');

    return { 
      success: true, 
      data: updatedApplication 
    };

  } catch (error) {
    console.error("Payment Update Error:", error);
    return { error: "Erreur lors de la mise à jour du paiement." };
  }
}