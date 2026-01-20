import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const universities = await prisma.university.findMany();
    return NextResponse.json({ universities });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors du chargement." }, { status: 500 });
  }
}
