import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 1. Agrégation des statistiques clés
    const [universityCount, studentCount, applicationCount, documentCount] = await Promise.all([
      prisma.university.count(),
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.application.count(),
      prisma.document.count(),
    ]);

    // 2. Récupération des candidatures avec les nouveaux champs pour le filtrage admin
    const applications = await prisma.application.findMany({
      select: {
        id: true,
        userId: true,
        universityId: true,
        status: true,
        updatedAt: true,
        // --- NOUVEAUX CHAMPS PHILOSOPHIE "PAYS" ---
        country: true,          // Destination choisie
        passportNumber: true,   // Identifiant rapide
        medicalHistory: true,   // Pour alertes santé rapides
        // On inclut aussi le nom de l'étudiant pour l'affichage dans le tableau
        user: {
          select: {
            fullName: true,
          }
        },
        // Et le nom de l'université si elle est déjà assignée
        university: {
          select: {
            name: true,
          }
        }
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({
      universityCount,
      studentCount,
      applicationCount,
      documentCount,
      applications,
    });
  } catch (error) {
    console.error("[ADMIN_STATS_GET]", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des statistiques" },
      { status: 500 }
    );
  }
}