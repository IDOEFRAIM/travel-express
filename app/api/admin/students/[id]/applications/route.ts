import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // On définit params comme une Promise
) {
  try {
    // 1. IL FAUT ATTENDRE LES PARAMS ICI
    const resolvedParams = await params; 
    const studentId = resolvedParams.id;

    if (!studentId) {
      return new NextResponse("ID Étudiant manquant", { status: 400 });
    }

    // 2. Requête filtrée avec le bon ID
    const applications = await prisma.application.findMany({
      where: {
        userId: studentId, 
      },
      include: {
        university: true, 
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`[SUCCESS] ${applications.length} dossiers trouvés pour ${studentId}`);

    return NextResponse.json({ applications });
  } catch (error) {
    console.error("ERREUR_RECUP_DOSSIERS:", error);
    return new NextResponse("Erreur Interne", { status: 500 });
  }
}