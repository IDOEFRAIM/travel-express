'use server'

import { authService } from "@/services/auth.service";
import { redirect } from "next/navigation";

/**
 * Action de déconnexion globale
 */
export async function logoutAction() {
  try {
    // On appelle la destruction des cookies de session
    await authService.logout(); 
  } catch (error) {
    console.error("Logout error:", error);
  }

  // Redirection vers l'accueil ou la page de login
  redirect('/');
}