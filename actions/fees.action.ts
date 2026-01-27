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

    const id = formData.get('id') as string | null;
    const country = formData.get('country') as string;
    const amountStr = formData.get('amount') as string;
    const amount = parseInt(amountStr, 10);

    if (!country || isNaN(amount)) {
      return { success: false, error: "Données invalides." };
    }

    const countryName = country.trim();

    // 1. Mise à jour ou Création dans la table de configuration (FeesByCountry)
    if (id) {
      await prisma.feesByCountry.update({
        where: { id },
        data: { country: countryName, amount }
      });
    } else {
      await prisma.feesByCountry.upsert({
        where: { country: countryName },
        update: { amount },
        create: { country: countryName, amount }
      });
    }

    // 2. RÉPARATION DES APPLICATIONS EXISTANTES
    // On met à jour toutes les applications de ce pays qui ont encore le prix fallback
    await prisma.application.updateMany({
      where: {
        country: {
      equals: countryName,
      mode: 'insensitive', // Ignore la différence entre 'Chine' et 'CHINE'
    },
     
      },
      data: {
        applicationFee: amount // On injecte le nouveau prix réel
      }
    });

    revalidatePath('/admin/settings');
    // On revalide aussi la page des applications pour que l'admin voie le changement
    revalidatePath('/admin/applications'); 

    return { success: true };
  } catch (error: any) {
    console.error("Erreur updateFeeAction:", error);
    return { success: false, error: "Erreur lors de la mise à jour." };
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