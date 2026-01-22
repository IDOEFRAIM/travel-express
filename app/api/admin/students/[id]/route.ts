import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req:any, context:any) {
  const params = await context.params;
  const { id } = params;
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        role: true,
      },
    });
    if (!user || user.role !== "STUDENT") {
      return NextResponse.json({ error: "Étudiant non trouvé" }, { status: 404 });
    }
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la récupération de l'étudiant" }, { status: 500 });
  }
}

export async function DELETE(req:any, context:any) {
  const params = await context.params;
  const { id } = params;
  try {
    // Supprimer d'abord les documents liés aux applications de l'étudiant
    const applications = await prisma.application.findMany({ where: { userId: id }, select: { id: true } });
    const applicationIds = applications.map(app => app.id);
    if (applicationIds.length > 0) {
      await prisma.document.deleteMany({ where: { applicationId: { in: applicationIds } } });
    }
    // Supprimer ensuite les applications
    await prisma.application.deleteMany({ where: { userId: id } });
    // Supprimer les paiements liés à l'étudiant
    await prisma.payment.deleteMany({ where: { userId: id } });
    // Supprimer enfin l'étudiant
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la suppression de l'étudiant" }, { status: 500 });
  }
}
