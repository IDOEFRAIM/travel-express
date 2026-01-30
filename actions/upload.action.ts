// @/lib/storage.ts
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const DEFAULT_BUCKET = "agence";

/**
 * Upload un fichier vers Supabase Storage avec une structure organisée
 * @param folder : Le dossier racine (ex: "applications" ou "universities")
 * @param subFolder : L'ID de l'entité (ex: applicationId)
 */
export async function uploadFileAction(
  file: File, 
  folder: "applications" | "universities" | "documents", 
  subFolder?: string // ID de la candidature ou de l'université
) {
  try {
    const fileExt = file.name.split('.').pop();
    // Nom de fichier unique pour éviter les collisions
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    
    // CONSTRUCTION DU CHEMIN : applications/ID/file.pdf ou documents/file.pdf
    const filePath = subFolder 
      ? `${folder}/${subFolder}/${fileName}` 
      : `${folder}/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();

    const { data, error } = await supabaseAdmin.storage
      .from(DEFAULT_BUCKET)
      .upload(filePath, arrayBuffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (error) throw error;

    //  On retourne le path complet (filePath) car c'est lui qu'on stockera en DB
    return { success: true, path: filePath };
  } catch (error: any) {
    console.error("Upload Error:", error);
    return { success: false, error: error.message || "Erreur lors de l'envoi." };
  }
}