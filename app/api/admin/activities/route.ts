import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  // Get the 5 most recent validated documents
  const activities = await prisma.document.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      name: true,
      applicationId: true,
      createdAt: true,
      status: true,
    },
  });
  return NextResponse.json({ activities });
}
