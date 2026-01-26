"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { logoutAction } from "@/actions/logout.action"; // À créer
import { useRouter } from "next/navigation";

interface NavbarProps {
  isConnected: boolean;
  userRole?: string;
}

const Navbar = ({ isConnected, userRole }: NavbarProps) => {
  const router = useRouter();

  const handleLogout = async () => {
    await logoutAction();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="container mx-auto px-6 pt-6 relative z-10">
      <nav className="flex items-center justify-between mb-20">
        <Link href="/" className="text-2xl font-black tracking-tighter text-slate-900 flex items-center gap-2">
          <div className="h-8 w-8 bg-slate-900 rounded-lg flex items-center justify-center text-[#db9b16] text-xs font-bold animate-bounce">
            TE
          </div>
          <span className="hidden sm:inline">Travel Express</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="#destinations" className="hidden md:block">
            <Button variant="ghost" size="sm" className="text-slate-600">Destinations</Button>
          </Link>

          {!isConnected ? (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-semibold text-slate-600">Connexion</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="rounded-full px-6 bg-[#db9b16] hover:bg-[#c48a14] text-white">
                  S'inscrire
                </Button>
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link href={userRole === 'ADMIN' ? "/admin/dashboard" : "/student/dashboard"}>
                <Button variant="outline" size="sm" className="rounded-full border-[#db9b16] text-[#db9b16]">
                  Mon Espace
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                Déconnexion
              </Button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;