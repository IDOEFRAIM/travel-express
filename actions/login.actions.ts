'use server'

import { userService } from "@/services/user.service"
import { authService } from "@/services/auth.service"
import { redirect } from "next/navigation"

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: "Email et mot de passe requis" }
  }

  try {
    // 1. Chercher utilisateur
    const user = await userService.findByEmail(email)

    // 2. Vérifier password (simple compare pour l'instant)
    if (!user || user.password !== password) {
      return { error: "Identifiants invalides" }
    }

    // 3. Créer session
    await authService.createSession(user.id, user.role)

    // 4. Redirection selon rôle
    if (user.role === 'ADMIN') {
      redirect('/admin/dashboard')
    } else {
      redirect('/student/dashboard')
    }

  } catch (error) {
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
        throw error;
    }
    console.error("Login Error:", error)
    return { error: "Une erreur est survenue" }
  }
}
