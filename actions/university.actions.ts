'use server'

import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { revalidatePath } from "next/cache";
import { authService } from "@/services/auth.service";

/**
 * Vérifie les privilèges administrateur
 */
async function checkAdmin() {
  const userId = await authService.requireUser();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });
  if (!user || user.role !== 'ADMIN') {
    throw new Error("Accès non autorisé : Administration requise.");
  }
}

/**
 * Sauvegarde ou met à jour une institution (Université)
 */
export async function saveUniversityAction(formData: FormData) {
  try {
    // 1. Sécurité : Vérification Admin
    await checkAdmin();

    // 2. Extraction des données textuelles
    const id = formData.get('id') as string; 
    const name = formData.get('name') as string;
    const city = formData.get('city') as string;
    const country = formData.get('country') as string; // ✅ Fix: Ne doit pas être nul
    const description = formData.get('description') as string;
    const summary = (formData.get('summary') as string) || description?.substring(0, 160) + "...";
    
    // Mapping des champs spécifiques du formulaire vers le schéma Prisma
    const costRange = formData.get('tuitionFee') as string;
    const programs = formData.get('levels') as string;

    // 3. Extraction des fichiers
    const imageFiles = formData.getAll('images') as File[];
    const pdfFile = formData.get('pdf') as File;

    // 4. Gestion des images existantes (pour le mode édition)
    let finalImageUrls: string[] = [];
    const existingImagesRaw = formData.get('existingImages');
    if (existingImagesRaw) {
      finalImageUrls = JSON.parse(existingImagesRaw as string);
    }

    // 5. Initialisation du PDF existant
    let finalPdfUrl = "";
    if (id) {
      const existing = await prisma.university.findUnique({ where: { id } });
      finalPdfUrl = existing?.pdfUrl || "";
    }

    // 6. Traitement et Upload des NOUVELLES Images vers Supabase
    const newImageUrls: string[] = [];
    for (const file of imageFiles) {
      if (file && file.size > 0 && file.name !== 'undefined') {
        const buffer = Buffer.from(await file.arrayBuffer());
        const cleanFileName = `univ_${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
        
        const { data, error: uploadError } = await supabaseAdmin.storage
          .from('agence')
          .upload(`universities/images/${cleanFileName}`, buffer, { 
            contentType: file.type,
            upsert: true 
          });
        
        if (uploadError) {
          console.error("Erreur Upload Image:", uploadError.message);
          continue;
        }

        if (data) {
          const { data: pub } = supabaseAdmin.storage.from('agence').getPublicUrl(data.path);
          newImageUrls.push(pub.publicUrl);
        }
      }
    }
    
    // Fusionner anciennes et nouvelles images
    finalImageUrls = [...finalImageUrls, ...newImageUrls];

    // 7. Traitement et Upload du PDF vers Supabase
    if (pdfFile && pdfFile.size > 0 && pdfFile.name !== 'undefined') {
      const buffer = Buffer.from(await pdfFile.arrayBuffer());
      const cleanPdfName = `guide_${Date.now()}_${pdfFile.name.replace(/\s+/g, '_')}`;
      
      const { data, error: pdfError } = await supabaseAdmin.storage
        .from('agence')
        .upload(`universities/guides/${cleanPdfName}`, buffer, { 
          contentType: 'application/pdf',
          upsert: true 
        });

      if (!pdfError && data) {
        const { data: pub } = supabaseAdmin.storage.from('agence').getPublicUrl(data.path);
        finalPdfUrl = pub.publicUrl;
      }
    }

    // 8. Préparation des données pour Prisma (Strict Mapping)
    const universityPayload = {
      name,
      city,
      country, // ✅ Requis par Prisma
      summary,
      description,
      costRange,
      programs,
      images: finalImageUrls,
      pdfUrl: finalPdfUrl,
      imageUrl: finalImageUrls.length > 0 ? finalImageUrls[0] : null,
    };

    // 9. Opération de base de données
    let result;
    if (id && id !== "undefined") {
      result = await prisma.university.update({ 
        where: { id }, 
        data: universityPayload 
      });
    } else {
      result = await prisma.university.create({ 
        data: universityPayload 
      });
    }

    // 10. Invalidation du cache
    revalidatePath('/admin/universities');
    revalidatePath('/student/dashboard');
    if (id) revalidatePath(`/universities/${id}`);

    return { success: true, id: result.id };

  } catch (error: any) {
    console.error("Save University Action Error:", error);
    return { 
      success: false, 
      error: error.message || "Erreur lors de l'enregistrement de l'institution." 
    };
  }
}