'use server'

import { authService } from "@/services/auth.service";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/**
 * ACTION : Uploader un document
 * Gère l'upload vers Supabase et l'enregistrement du chemin en BDD
 */
export async function uploadDocumentAction(formData: FormData) {
  try {
    const userId = await authService.requireUser();
    
    const applicationId = formData.get('applicationId') as string;
    const type = formData.get('type') as string; // ex: 'PASSPORT', 'DIPLOMA'
    const file = formData.get('file') as File;

    if (!applicationId || !type || !file || file.size === 0) {
      return { error: "Veuillez sélectionner un fichier valide." };
    }

    // 1. Validations de sécurité
    // Limite de taille : 5Mo
    if (file.size > 5 * 1024 * 1024) return { error: "Fichier trop lourd (Max 5Mo)." };

    // Validation du type MIME
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { error: "Format non autorisé (PDF, JPG, PNG uniquement)." };
    }

    // 2. Vérification des droits d'accès
    const app = await prisma.application.findFirst({
      where: { id: applicationId, userId },
    });
    if (!app) return { error: "Accès refusé à ce dossier." };

    // 3. Préparation du stockage
    const buffer = Buffer.from(await file.arrayBuffer());
    const extension = file.name.split('.').pop() || 'dat';
    const safeName = `${uuidv4()}.${extension}`;
    
    // Chemin hiérarchique : applications/ID_DOSSIER/TYPE_DOCUMENT_UUID.ext
    const filePath = `applications/${applicationId}/${safeName}`;

    // 4. Upload vers le bucket Supabase "agence"
    const { error: uploadError } = await supabaseAdmin.storage
      .from('agence')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true
      });

    if (uploadError) {
      console.error("Supabase Upload Error:", uploadError.message);
      throw new Error("Erreur lors du transfert vers le stockage.");
    }

    // 5. Enregistrement en Base de Données
    // On stocke le chemin relatif (filePath) pour permettre la génération d'URL signées
    await prisma.document.create({
      data: {
        applicationId,
        type,
        name: file.name, 
        url: filePath, 
        status: "PENDING",
      }
    });

    // 6. Rafraîchissement du cache Next.js
    revalidatePath('/student/dashboard');
    revalidatePath(`/student/dashboard/${applicationId}`);
    revalidatePath(`/admin/applications/${applicationId}`);
    
    return { success: true };

  } catch (error: any) {
    console.error("Upload Action failed:", error);
    return { error: "Échec de l'envoi du document. Veuillez réessayer." };
  }
}

/**
 * ACTION : Vérifier un document (Admin uniquement)
 * Approuve ou rejette un document soumis
 */
export async function verifyDocumentAction(documentId: string, status: 'APPROVED' | 'REJECTED') {
  try {
    const userId = await authService.requireUser();
    
    // Vérification du rôle admin
    const admin = await prisma.user.findUnique({ 
      where: { id: userId }, 
      select: { role: true } 
    });
    
    if (admin?.role !== 'ADMIN') {
      return { error: "Action non autorisée." };
    }

    // Mise à jour du statut
    const updatedDoc = await prisma.document.update({
      where: { id: documentId },
      data: { status },
      include: { application: true }
    });

    // Rafraîchissement des interfaces
    revalidatePath('/admin/dashboard');
    revalidatePath(`/admin/applications/${updatedDoc.applicationId}`);
    revalidatePath('/student/dashboard');

    return { success: true };
  } catch (error) {
    console.error("Verification Action failed:", error);
    return { error: "Erreur lors de la mise à jour du statut." };
  }
}