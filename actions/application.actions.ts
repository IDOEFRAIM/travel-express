'use server'

import { applicationService } from "@/services/application.service"
import { authService } from "@/services/auth.service"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

import { prisma } from "@/lib/prisma";

export async function createApplicationAction(universityId: string) {
  try {
    // 1. Appliquer une protection stricte (seul un connecté peut postuler)
    const userId = await authService.requireUser();

    // 2. Créer le dossier via le service
    await applicationService.createApplication(userId, universityId);

    // 3. Rafraîchir le dashboard et rediriger
    revalidatePath('/student/dashboard');
    redirect('/student/dashboard');

  } catch (error) {
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
        throw error;
    }
    // En cas d'erreur (ex: déjà postulé), on redirige quand même vers le dashboard
    // Idéalement on passerait un message d'erreur via un toast/flash message
    console.error("Application Error:", error);
    redirect('/student/dashboard'); 
  }
}

export async function updateApplicationStatusAction(applicationId: string, newStatus: string) {
    const userId = await authService.requireUser();
    
    // Check Admin
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.role !== 'ADMIN') throw new Error("Unauthorized");

    // Optional: If REJECTED, logic is handled in a separate action or here but we need args.
    // Simplifying: we'll create a dedicated one for rejection with reason or overload this one.
    // Let's modify this one to take a reason if provided.
    
    await prisma.application.update({
        where: { id: applicationId },
        data: {
            status: newStatus as any,
        }
    });

    revalidatePath(`/admin/applications/${applicationId}`);
    revalidatePath('/admin/students');
    revalidatePath('/student/dashboard'); 
}

export async function rejectApplicationAction(applicationId: string, reason: string) {
    const userId = await authService.requireUser();
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.role !== 'ADMIN') throw new Error("Unauthorized");

    // 'REJECTED' is not a valid ApplicationStatus. Use a valid status, e.g., 'UNDER_REVIEW', and store the reason.
    await prisma.application.update({
        where: { id: applicationId },
        data: {
            status: 'UNDER_REVIEW', // or another valid status
            rejectionReason: reason
        }
    });

    revalidatePath(`/admin/applications/${applicationId}`);
    revalidatePath('/admin/students');
    revalidatePath('/student/dashboard'); 
}

export async function deleteApplicationAction(applicationId: string) {
    if (!applicationId) {
        throw new Error("Application ID is required");
    }

    const userId = await authService.requireUser();
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.role !== 'ADMIN') throw new Error("Unauthorized");

    // Delete documents first (cascade usually handles this but good to be safe/explicit if needed, implies cascade)
    // Prisma relation usually requires manual deletion unless Cascade is set.
    // We didn't set OnDelete Cascade in schema explicitly for documents relation?
    // Documents relation is: `documents Document[]`
    // Document model: `application Application @relation(fields: [applicationId], references: [id])`
    // Default is usually restricted. Let's delete docs first.

    await prisma.document.deleteMany({
        where: { applicationId }
    });

    await prisma.application.delete({
        where: { id: applicationId }
    });

    revalidatePath('/admin/students');
}
