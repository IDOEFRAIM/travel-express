'use server';

import { prisma } from "@/lib/prisma";
import { authService } from "@/services/auth.service";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

/**
 * Mise à jour des informations de base du profil
 */
export async function updateProfileAction(formData: FormData) {
  try {
    const userId = await authService.requireUser();
    
    const fullName = (formData.get('fullName') as string)?.trim();
    const email = (formData.get('email') as string)?.toLowerCase().trim();
    const phone = (formData.get('phone') as string)?.trim();

    if (!fullName || !email) {
      return { success: false, error: "Le nom et l'email sont requis." };
    }

    // Vérifier si l'email est déjà pris par un autre utilisateur
    const emailExists = await prisma.user.findFirst({
      where: { email, NOT: { id: userId } }
    });

    if (emailExists) {
      return { success: false, error: "Cet email est déjà utilisé par un autre compte." };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { fullName, email, phone }
    });

    // On rafraîchit les layouts et les dashboards
    revalidatePath('/', 'layout'); 
    revalidatePath('/student/dashboard');
    revalidatePath('/admin/settings');
    
    return { success: true };
  } catch (error) {
    console.error("Update Profile Error:", error);
    return { success: false, error: "Impossible de mettre à jour le profil." };
  }
}

/**
 * Changement de mot de passe avec support hybride
 */
export async function updatePasswordAction(formData: FormData) {
  try {
    const userId = await authService.requireUser();
    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return { success: false, error: "Tous les champs sont requis." };
    }

    if (newPassword !== confirmPassword) {
      return { success: false, error: "La confirmation ne correspond pas au nouveau mot de passe." };
    }

    if (newPassword.length < 8) {
      return { success: false, error: "Le nouveau mot de passe doit contenir au moins 8 caractères." };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true }
    });

    if (!user || !user.password) return { success: false, error: "Utilisateur non trouvé." };

    // Logique hybride (Bcrypt ou Texte clair)
    const isBcrypt = user.password.startsWith('$2');
    const isCorrect = isBcrypt 
      ? await bcrypt.compare(currentPassword, user.password)
      : currentPassword === user.password;

    if (!isCorrect) {
      return { success: false, error: "Le mot de passe actuel est incorrect." };
    }

    // On hache systématiquement le nouveau mot de passe
    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed }
    });

    return { success: true };
  } catch (error) {
    console.error("Password Update Error:", error);
    return { success: false, error: "Une erreur technique est survenue." };
  }
}

/**
 * Récupération de l'utilisateur actuel
 */
export async function getCurrentUserAction() {
  try {
    const userId = await authService.requireUser();
    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true
      }
    });
  } catch (error) {
    return null;
  }
}