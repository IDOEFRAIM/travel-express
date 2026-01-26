"use server";

import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { authService } from "@/services/auth.service";
import { revalidatePath } from "next/cache";

/**
 * Action Serveur pour l'upload de documents
 * Gère la sécurité, l'upload physique (Supabase) et la base de données (Prisma)
 */
export async function uploadDocumentAction(formData: FormData) {
  let uploadedPath: string | null = null; // Pour le rollback en cas d'erreur

  try {
    // 0. SÉCURITÉ : Vérification de la session
    const userId = await authService.requireUser();
    
    const applicationId = formData.get('applicationId') as string;
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file || file.size === 0) return { error: "Fichier vide ou absent." };

    // 1. VALIDATION : Taille max 5 Mo
    const MAX_SIZE = 5 * 1024 * 1024; 
    if (file.size > MAX_SIZE) return { error: "Le fichier est trop lourd (max 5 Mo)." };

    // 2. VÉRIFICATION DE PROPRIÉTÉ 
    // On s'assure que l'étudiant possède bien cette candidature
    const application = await prisma.application.findFirst({
      where: { id: applicationId, userId: userId }
    });
    if (!application) return { error: "Dossier introuvable ou accès non autorisé." };

    // 3. VÉRIFICATION DES DOUBLONS (Optionnel selon ton besoin)
    const existingDoc = await prisma.document.findFirst({
      where: { applicationId, name: file.name }
    });
    if (existingDoc) return { error: "Un document avec ce nom existe déjà." };

    // 4. PRÉPARATION DU FICHIER
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileExtension = file.name.split('.').pop();
    
    // Chemin : applications/[ID_DOSSIER]/[TYPE]_[TIMESTAMP].[EXT]
    const safeFileName = `${type.toLowerCase()}_${Date.now()}.${fileExtension}`;
    const filePath = `applications/${applicationId}/${safeFileName}`;
    uploadedPath = filePath;

    // 5. UPLOAD SUPABASE (via Service Role pour bypasser la RLS)
    const { error: uploadError } = await supabaseAdmin.storage
      .from('agence')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true
      });

    if (uploadError) throw uploadError;

    // 6. ENREGISTREMENT PRISMA
    // On récupère l'URL publique générée
    const { data: publicUrlData } = supabaseAdmin.storage
      .from('agence')
      .getPublicUrl(filePath);

    try {
      await prisma.document.create({
        data: {
          applicationId,
          name: file.name,
          type: type || "AUTRE",
          url: publicUrlData.publicUrl, // Ou stocke 'filePath' si tu préfères générer l'URL au runtime
          status: "PENDING"
        }
      });
    } catch (prismaError) {
      // ROLLBACK : Si Prisma échoue, on supprime le fichier uploader pour ne pas polluer le storage
      await supabaseAdmin.storage.from('agence').remove([filePath]);
      throw prismaError;
    }

    // 7. RAFRAÎCHISSEMENT DE L'INTERFACE
    revalidatePath(`/student/dashboard/${applicationId}`);
    
    return { success: true };

  } catch (error: any) {
    console.error("❌ Erreur détaillée UploadAction:", error);
    
    // Gestion spécifique des erreurs Supabase connues
    if (error.message?.includes('storage/quota-exceeded')) {
      return { error: "Espace de stockage saturé." };
    }

    return { error: "Échec de l'envoi. Veuillez réessayer." };
  }
}