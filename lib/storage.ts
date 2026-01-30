'use server'

import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function getFileUrl(filePath: string | null, bucket = "agence") {
  if (!filePath) return null;

  // 1. EXTRACTION DU CHEMIN RELATIF
  let cleanPath = filePath.split('?')[0]; 
  
  if (cleanPath.includes(`/storage/v1/object/public/${bucket}/`)) {
    cleanPath = cleanPath.split(`/public/${bucket}/`)[1];
  } else if (cleanPath.startsWith(`${bucket}/`)) {
    cleanPath = cleanPath.replace(`${bucket}/`, '');
  }

  // Nettoyage final des slashes superflus
  cleanPath = cleanPath.replace(/^\/+/, '');

  try {
    // 2. GÉNÉRATION DE L'URL SIGNÉE
    // On utilise createSignedUrl car c'est la seule méthode fiable pour les fichiers privés
    const { data, error } = await supabaseAdmin
      .storage
      .from(bucket)
      .createSignedUrl(cleanPath, 3600);

    if (error) {
      console.error(`❌ Erreur Supabase [${cleanPath}]:`, error.message);
      
      // Fallback : Si la signature échoue, on tente l'URL publique car ton bucket est "PUBLIC"
      const { data: pub } = supabaseAdmin.storage.from(bucket).getPublicUrl(cleanPath);
      return pub.publicUrl;
    }

    return data.signedUrl;
  } catch (err) {
    console.error(" Erreur critique Storage:", err);
    return null;
  }
}