import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic'; // Force la route à être dynamique

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json({ students: [] });
    }

    // Utilisation de findMany avec contains pour la recherche textuelle
    const students = await prisma.user.findMany({
      where: {
        OR: [
          { fullName: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
        // On s'assure de ne pas retourner les admins dans la recherche client
        role: "STUDENT", 
      },
      select: {
        id: true,
        fullName: true,
        email: true,
      },
      take: 5,
    });

    return NextResponse.json({ students });
  } catch (error) {
    console.error("SEARCH_ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}