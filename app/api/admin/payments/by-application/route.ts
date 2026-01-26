// app/api/admin/payments/by-application/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function GET(req: any) {
  const { searchParams } = new URL(req.url);
  const applicationId = searchParams.get("applicationId");

  try {
    if (!applicationId) return NextResponse.json({ payments: [] });

    // 🎯 LA SEULE LIGNE À CHANGER : On filtre uniquement par l'ID du dossier
    const payments = await prisma.payment.findMany({
      where: {
        applicationId: applicationId 
      },
      include: { 
        university: { select: { name: true } } 
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ payments });
  } catch (error) {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}