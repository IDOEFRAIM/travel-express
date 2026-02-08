'use server';

import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { authService } from "@/services/auth.service";
import { requireAdminAction } from "@/lib/permissions";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from 'uuid';

/**
 * Upload d'un document par un étudiant
 */
export async function uploadDocumentAction(formData: FormData) {
  try {
    const userId = await authService.requireUser();

    const applicationId = formData.get('applicationId') as string;
    const type = formData.get('type') as string;
    const file = formData.get('file') as File;

    if (!applicationId || !type || !file) {
      return { error: "Champs manquants" };
    }

    // Vérification taille (5Mo max)
    if (file.size > 5 * 1024 * 1024) {
      return { error: "Fichier trop volumineux. Max 5Mo." };
    }

    // Vérification MIME
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return { error: "Type de fichier non autorisé (PDF, JPG, PNG seulement)." };
    }

    // Vérifier que le dossier appartient à l'utilisateur
    const app = await prisma.application.findFirst({
      where: { id: applicationId, userId },
    });
    if (!app) {
      return { error: "Non autorisé" };
    }

    const extension = file.name.split('.').pop()?.toLowerCase() || 'pdf';
    if (!['pdf', 'jpg', 'jpeg', 'png'].includes(extension)) {
      return { error: "Extension de fichier suspecte." };
    }

    const safeName = `${uuidv4()}.${extension}`;
    const filePath = `documents/${safeName}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from('agence')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return { error: "Echec de l'upload." };
    }

    const { data: urlData } = supabaseAdmin.storage
      .from('agence')
      .getPublicUrl(filePath);

    await prisma.document.create({
      data: {
        applicationId,
        type,
        name: file.name,
        url: urlData.publicUrl,
        status: "PENDING",
      },
    });

    revalidatePath('/student/dashboard');
    return { success: true };
  } catch (error) {
    console.error("Upload failed", error);
    return { error: "Echec de l'upload." };
  }
}

/**
 * Vérification d'un document par un admin qualité
 */
export async function verifyDocumentAction(
  documentId: string,
  status: 'APPROVED' | 'REJECTED',
  comment?: string
) {
  try {
    const admin = await requireAdminAction(["MANAGE_DOCUMENTS", "VALIDATE_DOCUMENTS"]);

    await prisma.document.update({
      where: { id: documentId },
      data: {
        status,
        verifiedById: admin.id,
        comment: comment || null,
      },
    });

    revalidatePath('/admin/documents');
    revalidatePath('/student/dashboard');

    return { success: true };
  } catch (error) {
    console.error("verifyDocumentAction error:", error);
    return { error: "Impossible de vérifier le document." };
  }
}
