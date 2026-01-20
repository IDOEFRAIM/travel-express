import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

export async function GET(request, context) {
  const { id } = await context.params;
  try {
    const university = await prisma.university.findUnique({ where: { id: isNaN(Number(id)) ? id : Number(id) } });
    return NextResponse.json({ university });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors du chargement." }, { status: 500 });
  }
}

export async function PUT(request, context) {
  const { id } = await context.params;
  let name, city, summary, description, costRange, programs, images = [];
  let newImageUrls = [];
  let oldImageUrls = [];
  let isMultipart = request.headers.get("content-type")?.includes("multipart/form-data");
  if (isMultipart) {
    const formData = await request.formData();
    name = formData.get("name");
    city = formData.get("city");
    summary = formData.get("summary");
    description = formData.get("description");
    costRange = formData.get("costRange");
    programs = formData.get("programs");
    // Récupère les anciennes images si présentes (optionnel)
    oldImageUrls = (formData.getAll("oldImages") || []).filter(Boolean);
    // Upload des nouvelles images
    let imagesFiles = formData.getAll("images").filter(Boolean);
    for (const img of imagesFiles) {
      if (typeof img === 'object' && img.type) {
        try {
          const buffer = Buffer.from(await img.arrayBuffer());
          const ext = img.type.split('/')[1];
          const fileName = `univ_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
          const { data, error } = await supabase.storage.from('agence').upload(`universities/${fileName}`, buffer, {
            contentType: img.type,
            upsert: true,
          });
          if (error) throw error;
          const { data: publicUrlData } = supabase.storage.from('agence').getPublicUrl(`universities/${fileName}`);
          if (publicUrlData?.publicUrl) {
            newImageUrls.push(publicUrlData.publicUrl);
          }
        } catch (error) {
          console.error("Erreur upload image update:", error, img);
        }
      }
    }
    // Fusionne anciennes et nouvelles images (max 3)
    images = [...oldImageUrls, ...newImageUrls].slice(0, 3);
  } else {
    // JSON fallback (API classique)
    const body = await request.json();
    name = body.name;
    city = body.city;
    summary = body.summary;
    description = body.description;
    costRange = body.costRange;
    programs = body.programs;
    images = body.images || [];
  }
  try {
    const university = await prisma.university.update({
      where: { id: isNaN(Number(id)) ? id : Number(id) },
      data: {
        name,
        city,
        summary,
        description,
        costRange,
        programs,
        images,
      },
    });
    return NextResponse.json({ university });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la mise à jour." }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  const { id } = await context.params;
  try {
    await prisma.university.delete({ where: { id: isNaN(Number(id)) ? id : Number(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la suppression." }, { status: 500 });
  }
}
