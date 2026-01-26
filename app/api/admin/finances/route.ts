import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// --- CETTE FONCTION MANQUE OU EST MAL ÉCRITE ---
export async function GET() {
  try {
    const finances = await prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 50, // On en prend un peu plus pour la visibilité
      include: {
        // On inclut l'utilisateur pour ne plus avoir de doutes sur qui paie quoi
        user: { 
          select: { 
            id: true,
            fullName: true, 
            email: true 
          } 
        },
        // On inclut l'application pour savoir quel dossier est concerné
        application: {
          select: {
            id: true,
            country: true
          }
        }
      }
    });

    return NextResponse.json({ finances });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la récupération" }, { status: 500 });
  }
}

// --- TON POST QUI MARCHE DÉJÀ ---
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, applicationId, amount, currency, method, reference } = body;

    const payment = await prisma.payment.create({
      data: {
        userId,
        applicationId,
        amount: parseFloat(amount),
        currency: currency || "XOF",
        method,
        reference,
      },
    });
    return NextResponse.json({ payment });
  } catch (error) {
    return NextResponse.json({ error: "Erreur enregistrement" }, { status: 500 });
  }
}