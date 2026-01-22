import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  // Récupère les 20 derniers paiements
  const finances = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      user: { select: { fullName: true, email: true } }
    }
  });
  return NextResponse.json({ finances });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, universityId, amount, currency, method, reference } = body;
    if (!userId || !universityId || !amount) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }
    const payment = await prisma.payment.create({
      data: {
        userId,
        universityId,
        amount: parseFloat(amount),
        currency,
        method,
        reference,
      },
    });
    return NextResponse.json({ payment });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de l'enregistrement du paiement" }, { status: 500 });
  }
}
