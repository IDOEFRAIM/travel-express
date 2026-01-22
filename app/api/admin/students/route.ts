import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
      where: {
        role: 'STUDENT',
      },
    });
    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la récupération des étudiants" }, { status: 500 });
  }
}
