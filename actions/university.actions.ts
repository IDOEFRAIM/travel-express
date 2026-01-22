"use server";

import {prisma} from "@/lib/prisma";
import { supabase } from '@/lib/supabase';

export async function createUniversityAction(formData: FormData) {
 
 console.log("We start processing data")  
  const name = formData.get("name") as string;
  const city = formData.get("city") as string;
  const country = formData.get("country") as string;
  const summary = formData.get("summary") as string;
  const description = formData.get("description") as string;
  const costRange = formData.get("costRange") as string;
  const programs = formData.get("programs") as string;
console.log('yup we get em')
  // Images
  let images = formData.getAll("images").filter(Boolean);
  // Filter out empty files (size 0, no name, or type octet-stream)
  images = images.filter(img =>
    typeof img === "object" &&
    "size" in img &&
    img.size > 0 &&
    "type" in img &&
    img.type !== "application/octet-stream" &&
    img.name && img.name !== ""
  );
  if (images.length > 3) {
    return { success: false, error: `Maximum 3 images.` };
  }
  for (const img of images) {
    if (typeof img === "object" && "type" in img) {
      console.log('Image entry:', img, typeof img, img.type);
    } else {
      console.log('Image entry:', img, typeof img, 'no type');
    }
    if (
      typeof img !== "object" ||
      !("type" in img) ||
      !["image/jpeg", "image/png", "image/webp"].includes(img.type)
    ) {
      return { success: false, error: "Seules les images JPG, PNG, WEBP sont autorisées." };
    }
  }

  // PDF
  let pdf = formData.get("pdf");
  if (
    pdf &&
    (typeof pdf !== "object" ||
      !("type" in pdf) ||
      pdf.type !== "application/pdf" ||
      !("size" in pdf) ||
      pdf.size === 0 ||
      !pdf.name ||
      pdf.name === "")
  ) {
    return { success: false, error: "Le document doit être un PDF." };
  }

  // Save images to Supabase Storage
  let imageUrls: string[] = [];
  let imageUploadError = false;
  for (const img of images) {
    if (typeof img === 'object' && img.type) {
      console.log(`Tentative upload image: nom=${img.name}, type=${img.type}, taille=${img.size}`);
      try {
        const buffer = Buffer.from(await img.arrayBuffer());
        const ext = img.type.split('/')[1];
        const fileName = `univ_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        const { data, error } = await supabase.storage.from('agence').upload(`universities/${fileName}`, buffer, {
          contentType: img.type,
          upsert: true,
        });
        if (error) {
          console.error(`Erreur Supabase upload image: nom=${img.name}, type=${img.type}, taille=${img.size}, message=${error.message}`);
          throw error;
        }
        const { data: publicUrlData } = supabase.storage.from('agence').getPublicUrl(`universities/${fileName}`);
        if (publicUrlData?.publicUrl) {
          imageUrls.push(publicUrlData.publicUrl);
        } else {
          console.error(`Erreur récupération publicUrl: nom=${img.name}, type=${img.type}, taille=${img.size}`);
          imageUploadError = true;
        }
      } catch (error) {
        let errorMsg = '';
        if (error && typeof error === 'object' && 'message' in error) {
          errorMsg = (error as any).message;
        } else {
          errorMsg = String(error);
        }
        console.error(`Erreur upload image: nom=${img.name}, type=${img.type}, taille=${img.size}, message=${errorMsg}`);
        imageUploadError = true;
      }
    }
  }
  // Si aucune image uploadée, ou erreur, on bloque la création
  if (imageUrls.length === 0 || imageUploadError) {
    return { success: false, error: "Erreur lors de l'upload des images. Vérifiez le format et la taille." };
  }

  // Save PDF to Supabase Storage
  let pdfUrl = null;
  if (pdf && typeof pdf === 'object' && pdf.type) {
    try {
      const buffer = Buffer.from(await pdf.arrayBuffer());
      const fileName = `bourse_${Date.now()}_${Math.random().toString(36).slice(2)}.pdf`;
      const { data, error } = await supabase.storage.from('agence').upload(`universities/${fileName}`, buffer, {
        contentType: pdf.type,
        upsert: true,
      });
      if (error) throw error;
      const { data: publicUrlData } = supabase.storage.from('agence').getPublicUrl(`universities/${fileName}`);
      pdfUrl = publicUrlData.publicUrl;
    } catch (error) {
      console.error("Error saving PDF to Supabase:", error);
      return { success: false, error: "Failed to save PDF to storage." };
    }
  }

  // Save to database
  try {
    const university = await prisma.university.create({
      data: {
        name,
        city,
        country,
        summary,
        description,
        costRange,
        programs,
        images: imageUrls,
        pdfUrl,
      },
    });
    return { success: true, university };
  } catch (error) {
    console.error("Error saving university to database:", error);
    return { success: false, error: "Failed to save university." };
  }
  console.log("we get the end")
}

export default createUniversityAction;
