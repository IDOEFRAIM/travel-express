import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// api/universities/route.ts
export async function GET() {
  try {
    const universities = await prisma.university.findMany({
      orderBy: { name: 'asc' } // Petit bonus : tri alphabétique pour l'admin
    });
    return NextResponse.json(universities); // On renvoie directement le tableau
  } catch (error) {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
