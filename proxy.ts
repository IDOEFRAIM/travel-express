import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Renomme la fonction middleware en proxy pour correspondre à la convention Next.js
export function proxy(request: NextRequest) {
	const path = request.nextUrl.pathname;
  
	// Simulation de vérification de session (à remplacer par Supabase/NextAuth plus tard)
	// const isAuthenticated = false; 
	// const role = 'student'; // ou 'admin'

	// Logique de protection :
	// 1. Si l'utilisateur veut aller sur /admin ou /student sans être connecté -> redirection /login
  
	// if ((path.startsWith('/admin') || path.startsWith('/student')) && !isAuthenticated) {
	//   return NextResponse.redirect(new URL('/login', request.url))
	// }

	// 2. Protection des rôles : Si un étudiant essaie d'aller sur /admin -> redirection /student
	// if (path.startsWith('/admin') && role !== 'admin') {
	//    return NextResponse.redirect(new URL('/student/dashboard', request.url))
	// }

	return NextResponse.next();
}

// Configuration des routes sur lesquelles le proxy s'active
export const config = {
	matcher: [
		'/student/:path*',
		'/admin/:path*',
		'/login',
		'/register',
	],
};

// Ajout d'un export par défaut pour la fonction proxy
export default proxy;
