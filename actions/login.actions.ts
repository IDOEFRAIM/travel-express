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

  const email = emailInput.toLowerCase().trim();

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return { error: "Identifiants invalides" }
    }

    const isBcrypt = user.password.startsWith('$2');
    let isValid = false;

    if (isBcrypt) {
      isValid = await bcrypt.compare(passwordInput, user.password);
    } else {
      isValid = passwordInput === user.password;
      if (isValid) {
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

    // CRUCIAL: Attendre que le cookie soit écrit
    await authService.createSession(user.id, user.role);

    // Préparer le chemin sans rediriger tout de suite
    targetPath = user.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard';

  } catch (error: any) {
    // Si l'erreur vient d'un redirect lancé par requireUser ou autre dans le try
    if (error.digest?.includes('NEXT_REDIRECT')) throw error;
    
    console.error("Login Error:", error)
    return { error: "Une erreur technique est survenue" }
  }

  // REDIRECTION À L'EXTÉRIEUR DU TRY/CATCH
  if (targetPath) {
    redirect(targetPath);
  }
}