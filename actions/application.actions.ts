'use server'

import { authService } from "@/services/auth.service"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma";
import { ApplicationStatus } from "@prisma/client";

/**
 * Utilitaire pour synchroniser la progression avec le statut
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
    return mapping[status] || 0;
}

/**
 * Assigner une université à un dossier
 */
export async function assignUniversityAction(applicationId: string, universityId: string) {
  try {
    await prisma.application.update({
      where: { id: applicationId },
      data: { 
        universityId,
        // Optionnel: Passer automatiquement en UNDER_REVIEW quand une univ est assignée
        status: 'UNDER_REVIEW',
        progress: getProgressFromStatus('UNDER_REVIEW')
      }
    });
    
    revalidatePath(`/admin/applications/${applicationId}`);
    revalidatePath('/student/dashboard'); // Pour que l'étudiant voie l'université
    return { success: true };
  } catch (error) {
    console.error("Assign University Error:", error);
    return { error: "Impossible d'assigner l'université" };
  }
}

/**
 * Mise à jour du statut par l'Admin
 */
export async function updateApplicationStatusAction(id: string, status: string) {
    try {
        const newStatus = status as ApplicationStatus;
        const progress = getProgressFromStatus(newStatus);

        await prisma.application.update({
            where: { id },
            data: { 
                status: newStatus,
                progress: progress // On garde la barre de progression synchro
            }
        });

        revalidatePath(`/admin/applications/${id}`);
        revalidatePath('/admin/students');
        revalidatePath('/student/dashboard');
        
        return { success: true };
    } catch (error) {
        console.error("Update Status Error:", error);
        return { error: "Erreur lors de la mise à jour du statut" };
    }
}

/**
 * Rejet d'un dossier
 */
export async function rejectApplicationAction(id: string, reason: string) {
    if (!reason || reason.trim().length < 5) {
        return { error: "Un motif de rejet valide est requis (min. 5 caractères)." };
    }

    try {
        await prisma.application.update({
            where: { id },
            data: { 
                status: 'REJECTED' as ApplicationStatus,
                progress: 0,
                rejectionReason: reason 
            }
        });

        revalidatePath(`/admin/applications/${id}`);
        revalidatePath('/student/dashboard');
        
        return { success: true };
    } catch (error) {
        console.error("Reject Action Error:", error);
        return { error: "Erreur lors du rejet du dossier" };
    }
}

/**
 * Création d'un dossier par l'étudiant
 */
export async function createApplicationAction(formData: FormData) {
    let successId = null;

    try {
        const userId = await authService.requireUser();
        
        const country = formData.get("country") as string;
        const fullName = formData.get("fullName") as string;
        const passportNumber = formData.get("passportNumber") as string;

        // Récupération des frais
        const feeRecord = await prisma.feesByCountry.findUnique({
            where: { country: country }
        });

        // Valeur par défaut si pays non trouvé (1 million par sécurité/test)
        const finalFee = feeRecord ? feeRecord.amount : 1000000;
        
        const diseases = formData.getAll("diseases")
            .map(d => d.toString().trim())
            .filter(d => d !== "");

        await prisma.$transaction(async (tx) => {
            // 1. Mise à jour du profil User
            await tx.user.update({
                where: { id: userId },
                data: {
                    fullName: fullName || undefined,
                    passportNumber: passportNumber || undefined,
                    specificDiseases: {
                        set: diseases 
                    },
                }
            });

            // 2. Création de l'application
            await tx.application.create({
                data: {
                    userId,
                    country, 
                    status: 'SUBMITTED', 
                    progress: getProgressFromStatus('SUBMITTED'), 
                    applicationFee: finalFee
                }
            });
        });

        successId = userId;
        revalidatePath('/student/dashboard');

    } catch (error: any) {
        if (error.message?.includes('NEXT_REDIRECT')) throw error;
        console.error("Application Error:", error);
        return { error: "Une erreur est survenue lors de l'enregistrement." };
    }

    if (successId) {
        redirect('/student/dashboard?success=true');
    }
}


export async function deleteApplicationAction(id: string) {
    try {
        // 1. Suppression du dossier
        // Note: Si tu as des relations (paiements, docs), 
        // assure-toi que ton schéma Prisma a "onDelete: Cascade"
        await prisma.application.delete({
            where: { id }
        });

        // 2. Rafraîchissement des données pour l'admin
        revalidatePath("/admin/applications");
        revalidatePath(`/admin/students`);

        return { success: true };
    } catch (error) {
        console.error("[DELETE_APPLICATION_ERROR]", error);
        return { 
            success: false, 
            error: "Impossible de supprimer le dossier. Vérifiez les dépendances (paiements liés, etc)." 
        };
    }
}