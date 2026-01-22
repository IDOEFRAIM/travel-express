import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req:any, { params }:any) {
  const { id } = params;
  try {
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        user: true,
        university: true,
        documents: true,
      },
    });
    if (!application) {
      return NextResponse.json({ error: "Application non trouvée" }, { status: 404 });
    }
    return NextResponse.json({ application });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la récupération de l'application" }, { status: 500 });
  }
}
