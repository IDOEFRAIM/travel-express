import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req:any) {
  const { searchParams } = new URL(req.url);
  const applicationId = searchParams.get("applicationId");
  try {
    if (!applicationId) return NextResponse.json({ payments: [] });
    // Récupérer les paiements liés à cette application (via userId)
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      select: { userId: true, universityId: true }
    });
    if (!application) return NextResponse.json({ payments: [] });
    const payments = await prisma.payment.findMany({
      where: {
        userId: application.userId,
        universityId: application.universityId
      },
      include: { university: { select: { name: true, costRange: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ payments });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la récupération des paiements" }, { status: 500 });
  }
}
