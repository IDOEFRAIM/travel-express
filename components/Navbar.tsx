"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { logoutAction } from "@/actions/logout.action";
import { useRouter } from "next/navigation";
import { User, LogOut, LayoutDashboard, FileText, Globe } from "lucide-react";

interface NavbarProps {
  isConnected: boolean;
  userRole?: string;
  userName?: string; // Ajouté pour personnaliser
}

const Navbar = ({ isConnected, userRole, userName }: NavbarProps) => {
  const router = useRouter();

  const handleLogout = async () => {
    await logoutAction();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <nav className="container mx-auto px-6 h-20 flex items-center justify-between">
        
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

        {/* NAVIGATION LINKS (Desktop) */}
        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500">
          <Link href="/#destinations" className="hover:text-slate-900 transition-colors flex items-center gap-2">
            <Globe size={16} /> Destinations
          </Link>
          {isConnected && (
            <Link href="/student/dashboard" className="hover:text-slate-900 transition-colors flex items-center gap-2">
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
                  Postuler
                </Button>
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-full border border-slate-100">
              {/* Profile Link */}
              <Link href={userRole === 'ADMIN' ? "/admin/dashboard" : "/student/dashboard"}>
                <div className="flex items-center gap-3 pl-3 pr-1">
                  <span className="hidden lg:block text-xs font-black text-slate-700">
                    {userName || "Mon Profil"}
                  </span>
                  <div className="h-8 w-8 bg-[#db9b16] rounded-full flex items-center justify-center text-white shadow-inner">
                    <User size={16} />
                  </div>
                </div>
              </Link>

              {/* Separator */}
              <div className="w-[1px] h-4 bg-slate-200 mx-1" />

              {/* Logout */}
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