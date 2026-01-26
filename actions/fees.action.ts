'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { authService } from "@/services/auth.service";

/**
 * Sécurité : Seul un admin peut gérer les frais
 */
async function checkAdmin() {
  const userId = await authService.requireUser();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });
  if (!user || user.role !== 'ADMIN') throw new Error("Non autorisé");
}

export async function getFeesAction() {
  // On autorise la lecture pour que l'étudiant puisse voir les tarifs
  return await prisma.feesByCountry.findMany({
    orderBy: { country: 'asc' }
  });
}

export async function updateFeeAction(formData: FormData) {
  try {
    await checkAdmin();

    const country = formData.get('country') as string;
    const amountStr = formData.get('amount') as string;
    const amount = parseInt(amountStr, 10); // Utilise parseInt si tes montants sont des entiers (ex: FCFA)

    if (!country || isNaN(amount)) {
      return { success: false, error: "Données invalides (Le montant doit être un nombre)" };
    }

    await prisma.feesByCountry.upsert({
      where: { country: country.trim() },
      update: { amount },
      create: { country: country.trim(), amount }
    });

    revalidatePath('/admin/settings');
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erreur lors de la mise à jour des frais." };
  }
}

export async function deleteFeeAction(id: string) {
  try {
    await checkAdmin();

    await prisma.feesByCountry.delete({ 
      where: { id } 
    });

    revalidatePath('/admin/settings');
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erreur lors de la suppression." };
  }
}