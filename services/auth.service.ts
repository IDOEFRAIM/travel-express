
// Ce fichier gère la session utilisateur
// Actuellement simple (cookies), mais extensible (JWT, Auth.js) sans casser le reste
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export const authService = {
  async createSession(userId: string, role: string) {
    const cookieStore = await cookies();
    cookieStore.set('user_id', userId, { 
      httpOnly: true, // Invisible en JS côté client (Sécurité XSS)
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 semaine
      path: '/',
    })
    
    // Cookie non-HttpOnly pour l'UI si besoin
    cookieStore.set('user_role', role, { 
       httpOnly: false, 
       path: '/',
    })
  },

  async getSession() {
    const cookieStore = await cookies();
    return cookieStore.get('user_id')?.value;
  },

  async requireUser() {
    const userId = await this.getSession();
    if (!userId) {
      redirect('/login');
    }
    return userId;
  },

  async logout() {
    const cookieStore = await cookies();
    cookieStore.delete('user_id');
    cookieStore.delete('user_role');
  }
}
