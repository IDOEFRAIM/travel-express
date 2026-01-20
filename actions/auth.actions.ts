'use server'

import { userService } from "@/services/user.service"
import { authService } from "@/services/auth.service"
import { redirect } from "next/navigation"

export async function registerAction(prevState: any, formData: FormData) {
  const fullName = formData.get('fullName') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const password = formData.get('password') as string

  // Validation
  if (!email || !password || !fullName) {
    return { error: "Veuillez remplir tous les champs obligatoires." }
  }

  if (password.length < 6) {
    return { error: "Le mot de passe doit faire au moins 6 caractères." }
  }

  try {
    // 1. Vérifier existence (via Service)
    const existingUser = await userService.findByEmail(email)
    if (existingUser) {
      return { error: "Cet email est déjà utilisé." }
    }

    // 2. Créer utilisateur (via Service)
    // Note: Le hashage de mot de passe devrait être fait ici ou dans le service
    const newUser = await userService.createStudent({ email, password, fullName, phone })

    // 3. Créer session (via Auth Service)
    await authService.createSession(newUser.id, newUser.role)

    // 4. Redirection
    redirect('/student/dashboard')

  } catch (error) {
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
        throw error;
    }
    console.error("Register Error:", error)
    return { error: "Impossible de créer le compte. Réessayez." }
  }
}
