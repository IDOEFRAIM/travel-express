import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        passportNumber: true,    // Inclus pour l'admin
        specificDiseases: true,  // Inclus pour l'admin
        createdAt: true,
        // On inclut les applications pour que l'admin puisse 
        // voir les dossiers créés par cet étudiant
        applications: {
          select: {
            id: true,
            country: true,
            status: true,
            applicationFee: true, // Pour voir combien il doit payer
          }
        },
        // Optionnel : on peut aussi compter les paiements
        _count: {
          select: {
            payments: true,
            applications: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("[GET_STUDENTS_ERROR]", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des étudiants" }, 
      { status: 500 }
    );
  }
}