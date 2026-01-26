'use server'

import { authService } from "@/services/auth.service"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"

export async function loginAction(prevState: any, formData: FormData) {
  const emailInput = formData.get('email') as string
  const passwordInput = formData.get('password') as string
  let targetPath = ""

  if (!emailInput || !passwordInput) {
    return { error: "Email et mot de passe requis" }
  }

  // Normalisation pour éviter les erreurs de doublons
  const email = emailInput.toLowerCase().trim();

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return { error: "Identifiants invalides" }
    }

    // Gestion du mot de passe (Compatibilité Ancien -> Bcrypt)
    const isBcrypt = user.password.startsWith('$2');
    let isValid = false;

    if (isBcrypt) {
      isValid = await bcrypt.compare(passwordInput, user.password);
    } else {
      isValid = passwordInput === user.password;
      if (isValid) {
        // Migration automatique vers un hash sécurisé
        const hashedPassword = await bcrypt.hash(passwordInput, 12);
        await prisma.user.update({
          where: { id: user.id },
          data: { password: hashedPassword }
        });
      }
    }

    if (!isValid) {
      return { error: "Identifiants invalides" }
    }

    // ✅ SOLUTION : Utiliser l'ID réel de la BDD (ex: user.id) 
    // et non un identifiant manuel qui pourrait être obsolète.
    await authService.createSession(user.id, user.role);

    targetPath = user.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard';

  } catch (error: any) {
    // Indispensable pour que Next.js puisse gérer la redirection
    if (error.message === 'NEXT_REDIRECT' || error.digest?.includes('NEXT_REDIRECT')) {
      throw error;
    }
    
    console.error("Login Error:", error)
    return { error: "Une erreur technique est survenue" }
  }

  // Redirection sécurisée
  if (targetPath) {
    redirect(targetPath);
  }
}