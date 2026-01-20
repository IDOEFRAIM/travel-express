import {prisma} from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  // Aggregate key dashboard stats
  const universityCount = await prisma.university.count();
  const studentCount = await prisma.user.count({ where: { role: "STUDENT" } });
  const applicationCount = await prisma.application.count();
  const documentCount = await prisma.document.count();

  // Get all applications for dashboard filtering
  const applications = await prisma.application.findMany({
    select: {
      id: true,
      userId: true,
      universityId: true,
      status: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({
    universityCount,
    studentCount,
    applicationCount,
    documentCount,
    applications,
  });
}
