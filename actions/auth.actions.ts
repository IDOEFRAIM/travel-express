'use server'

import { userService } from "@/services/user.service"
import { authService } from "@/services/auth.service"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Sécurité : Vérifie si l'appelant est réellement un ADMIN
 */
async function checkAdmin() {
  const userId = await authService.requireUser();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });
  if (!user || user.role !== 'ADMIN') {
    throw new Error("Accès non autorisé");
  }
  return userId;
}

// Récupérer tous les admins
export async function getAdminsAction() {
  await checkAdmin(); // Protection renforcée
  return await prisma.user.findMany({
    where: { role: 'ADMIN' },
    orderBy: { fullName: 'asc' }
  });
}

// Récupérer tous les étudiants pour la recherche admin
export async function getAllUsersAction() {
  await checkAdmin(); // Protection renforcée
  return await prisma.user.findMany({
    where: { role: 'STUDENT' },
    select: { id: true, fullName: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: 'desc' }
  });
}

// Changer le rôle d'un utilisateur (Action sensible)
export async function updateUserRoleAction(userId: string, newRole: 'ADMIN' | 'STUDENT') {
  try {
    await checkAdmin(); // Seul un admin peut nommer un autre admin
    
    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole }
    });

    revalidatePath('/admin/settings');
    revalidatePath('/admin/students');
    return { success: true };
  } catch (error) {
    return { error: "Erreur lors du changement de rôle" };
  }
}

export async function registerAction(prevState: any, formData: FormData) {
  const fullName = formData.get('fullName') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const password = formData.get('password') as string
  
  let success = false;
  let userId = "";
  let userRole = "";

  // 1. Validation des entrées
  if (!email || !password || !fullName) {
    return { error: "Veuillez remplir tous les champs obligatoires." }
  }

  if (password.length < 8) {
    return { error: "Le mot de passe doit faire au moins 8 caractères." }
  }

  try {
    // 2. Vérifier l'existence
    const existingUser = await userService.findByEmail(email.toLowerCase().trim())
    if (existingUser) {
      return { error: "Cet email est déjà utilisé." }
    }

    // 3. HACHAGE
    const hashedPassword = await bcrypt.hash(password, 12)

    // 4. Création
    const newUser = await userService.createStudent({ 
      email: email.toLowerCase().trim(), 
      password: hashedPassword, 
      fullName, 
      phone 
    })

    userId = newUser.id;
    userRole = newUser.role;
    success = true;

  } catch (error) {
    console.error("Register Error:", error)
    return { error: "Impossible de créer le compte. Réessayez plus tard." }
  }

  // 5. Création de session et redirection (Hors du try/catch pour éviter d'intercepter le redirect de Next.js)
  if (success) {
    await authService.createSession(userId, userRole as any);
    redirect('/student/');
  }
}