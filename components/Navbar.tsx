"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { logoutAction } from "@/actions/logout.action";
import { useRouter } from "next/navigation";
import { User, LogOut, FileText, Globe } from "lucide-react";
import { cn } from "@/lib/utils"; 

interface NavbarProps {
  isConnected: boolean;
  userRole?: string;
  userName?: string;
}

const Navbar = ({ isConnected, userRole, userName }: NavbarProps) => {
  const router = useRouter();

  const handleLogout = async () => {
    await logoutAction();
    router.push("/login");
    router.refresh();
  };

  // Condition : si c'est un admin, on cache complètement la barre
  const isAdmin = userRole === "ADMIN";
console.log("DEBUG LAYOUT - Role:", userRole, "IsAdmin:", isAdmin);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 transition-all",
        isAdmin ? "hidden" : "flex" // Utilisation de cn pour le display
      )}
    >
      <nav className="container mx-auto px-6 h-20 flex items-center justify-between w-full">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center text-[#db9b16] text-sm font-black transition-transform group-hover:scale-110">
            TE
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-lg font-black text-slate-900 tracking-tight">Travel Express</span>
            <span className="text-[10px] font-bold text-[#db9b16] uppercase tracking-widest">Student Portal</span>
          </div>
        </Link>

        {/* NAVIGATION LINKS */}
        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500">
          <Link href="/#destinations" className="hover:text-slate-900 transition-colors flex items-center gap-2">
            <Globe size={16} /> Destinations
          </Link>
          {isConnected && (
            <Link href="/student/" className="hover:text-slate-900 transition-colors flex items-center gap-2">
              <FileText size={16} /> Mes Dossiers
            </Link>
          )}
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-3">
          {!isConnected ? (
            <>
              <Link href="/login" className="hidden sm:block">
                <Button variant="ghost" className="font-bold text-slate-600">Connexion</Button>
              </Link>
              <Link href="/register">
                <Button className="rounded-full px-6 bg-slate-900 hover:bg-[#db9b16] text-white transition-all shadow-lg shadow-slate-200">
                  S'inscrire
                </Button>
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-full border border-slate-100">
              <Link href="/student">
                <div className="flex items-center gap-3 pl-3 pr-1">
                  <span className="hidden lg:block text-xs font-black text-slate-700">
                    {userName || "Mon Profil"}
                  </span>
                  <div className="h-8 w-8 bg-[#db9b16] rounded-full flex items-center justify-center text-white shadow-inner">
                    <User size={16} />
                  </div>
                </div>
              </Link>

              <div className="w-px h-4 bg-slate-200 mx-1" />

              <button 
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                title="Déconnexion"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;