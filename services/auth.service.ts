import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";

// Clé secrète pour signer les jetons (à mettre dans ton .env)
const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "ma_cle_secrete_super_longue_pour_le_dev"
);

export const authService = {
  /**
   * Crée un jeton signé et le stocke dans un cookie HttpOnly
   */
  async createSession(userId: string, role: string) {
    const token = await new SignJWT({ userId, role })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(SECRET_KEY);

    const cookieStore = await cookies();
    
    // On stocke TOUT dans un seul cookie chiffré et protégé
    cookieStore.set('session', token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 semaine
      path: '/',
      sameSite: 'lax'
    });
  },

  /**
   * Récupère et vérifie la session
   */
  async getSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    
    if (!token) return null;

    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      return payload as { userId: string, role: string };
    } catch (error) {
      // Si le jeton est invalide ou expiré
      return null;
    }
  },

  /**
   * Protection de route : retourne l'ID ou redirige
   */
  async requireUser() {
    const session = await this.getSession();
    if (!session) {
      redirect('/login');
    }
    return session.userId;
  },

  /**
   * Vérifie si l'utilisateur est admin
   */
  async requireAdmin() {
    const session = await this.getSession();
    if (!session || session.role !== 'ADMIN') {
      redirect('/student/dashboard');
    }
    return session.userId;
  },

  /**
   * Déconnexion
   */
  async logout() {
    const cookieStore = await cookies();
    cookieStore.delete('user_id');

    cookieStore.delete('session');
  }
}