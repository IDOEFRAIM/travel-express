import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const applications = await prisma.application.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            phone: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        university: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
        documents: true,
      },
    });
    return NextResponse.json({ students: applications });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la récupération des dossiers étudiants" }, { status: 500 });
  }
}
