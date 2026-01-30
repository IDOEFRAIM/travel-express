'use server'

import { authService } from "@/services/auth.service"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma";
import { ApplicationStatus } from "@prisma/client";

/**
 * cette function sert a synchroniser la progression avec le statut
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
 * on assigne une université à un application
 */
export async function assignUniversityAction(applicationId: string, universityId: string) {
  try {
    await prisma.application.update({
      where: { id: applicationId },
      data: { 
        universityId,
        status: 'UNDER_REVIEW',
        progress: getProgressFromStatus('UNDER_REVIEW')
      }
    });
    
    revalidatePath(`/admin/applications/${applicationId}`);
    revalidatePath('/student/'); 
    return { success: true };
  } catch (error) {
    console.error("Nous n'arrivons pas a attribuer une universite du a::", error);
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
                progress: progress 
            }
        });

        revalidatePath(`/admin/applications/${id}`);
        revalidatePath('/admin/students');
        revalidatePath('/student/');
        
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

        // On recupere les frais en fonction du pays
        const feeRecord = await prisma.feesByCountry.findUnique({
            where: { country: country }
        });

        // Si y a pas de frais specifiques, on applique 500000 par defaut
        const finalFee = feeRecord ? feeRecord.amount : 500000;
        
        const diseases = formData.getAll("diseases")
            .map(d => d.toString().trim())
            .filter(d => d !== "");

        await prisma.$transaction(async (tx) => {
            //  Mise à jour du profil User
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

            //  Création de l'application
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
        redirect('/student/?success=true');
    }
}


export async function deleteApplicationAction(id: string) {
    try {
        // Suppression du dossier
        await prisma.application.delete({
            where: { id }
        });

        // Rafraîchissement des données pour l'admin
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