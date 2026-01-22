import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req:any) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  try {
    const where = userId ? { userId } : {};
    const applications = await prisma.application.findMany({
      where,
      include: {
        university: true,
        documents: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ applications });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la récupération des applications" }, { status: 500 });
  }
}
