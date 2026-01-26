import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: any, context: any) {
  try {
    const params = await context.params;
    const { id } = params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        role: true,
        passportNumber: true,    // Info indispensable
        specificDiseases: true,  // Info médicale
        // On récupère ses dossiers avec les paiements associés à chaque dossier
        applications: {
          include: {
            university: {
              select: { name: true, city: true }
            },
            payments: true, // Liste des paiements pour ce dossier spécifique
            _count: {
              select: { documents: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        // Paiements globaux (au cas où certains ne sont pas encore liés à un dossier)
        payments: {
          where: { applicationId: null },
          orderBy: { createdAt: 'desc' }
        }
      },
    });

    if (!user || user.role !== "STUDENT") {
      return NextResponse.json({ error: "Étudiant non trouvé" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("[GET_STUDENT_DETAIL_ERROR]", error);
    return NextResponse.json({ error: "Erreur lors de la récupération de l'étudiant" }, { status: 500 });
  }
}

export async function DELETE(req: any, context: any) {
  try {
    const params = await context.params;
    const { id } = params;

    // Suppression en cascade manuelle (pour éviter les erreurs de clés étrangères)
    await prisma.$transaction(async (tx) => {
      // 1. Récupérer les IDs des applications
      const apps = await tx.application.findMany({ 
        where: { userId: id }, 
        select: { id: true } 
      });
      const appIds = apps.map(app => app.id);

      // 2. Supprimer les documents
      if (appIds.length > 0) {
        await tx.document.deleteMany({ where: { applicationId: { in: appIds } } });
      }

      // 3. Supprimer les paiements (liés à l'user)
      await tx.payment.deleteMany({ where: { userId: id } });

      // 4. Supprimer les logs d'activité
      await tx.activityLog.deleteMany({ where: { adminId: id } }); // Si c'est un admin (sécurité)

      // 5. Supprimer les applications
      await tx.application.deleteMany({ where: { userId: id } });

      // 6. Supprimer l'utilisateur
      await tx.user.delete({ where: { id } });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[DELETE_STUDENT_ERROR]", error);
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}