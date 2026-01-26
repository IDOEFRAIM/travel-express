'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutGrid, Users, Globe, LogOut, FileText, 
  ChevronLeft, ChevronRight, GraduationCap, 
  Archive, ActivitySquare, CreditCard, Menu, X, Settings 
} from "lucide-react";
import { logoutAction } from "@/actions/logout.action";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  user: {
    role: any;
    email: string;
    fullName: string | null;
  } | null;
}

const MENU_ITEMS = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutGrid },
  { label: 'Etudiants', href: '/admin/students', icon: Users },
  { label: 'Documents', href: '/admin/documents', icon: FileText },
  { label: 'Universités', href: '/admin/universities', icon: GraduationCap },
  { label: 'Finances', href: '/admin/finances', icon: CreditCard },
  { label: 'Activités', href: '/admin/activity', icon: ActivitySquare },
  { label: 'Archive', href: '/admin/archive', icon: Archive },
  { label: 'Paramètres', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  // Fermer la sidebar mobile lors d'un changement de route
  useEffect(() => {
    setIsOpenMobile(false);
  }, [pathname]);

  const showFull = !isCollapsed || isOpenMobile;

  return (
    <>
      {/* TRIGGER MOBILE */}
      <button 
        onClick={() => setIsOpenMobile(true)}
        className="md:hidden fixed top-4 left-4 z-[60] p-3 bg-white border border-slate-100 shadow-2xl rounded-2xl text-slate-900 active:scale-95 transition-all"
      >
        <Menu size={24} />
      </button>

      {/* OVERLAY MOBILE */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[55] md:hidden animate-in fade-in duration-300"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      <aside className={cn(
        "bg-white fixed md:sticky top-0 h-screen shrink-0 border-r border-slate-100 z-[60] transition-all duration-500 ease-in-out",
        isOpenMobile ? "left-0 w-[280px]" : "-left-full md:left-0", 
        isCollapsed ? "md:w-[88px]" : "md:w-[280px]"
      )}>
        
        {/* BOUTON COLLAPSE (DESKTOP) */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute -right-3.5 top-10 bg-white border border-slate-100 shadow-xl rounded-full p-1.5 text-slate-400 hover:text-[#db9b16] hover:scale-110 z-50 transition-all"
        >
          {isCollapsed ? <ChevronRight size={14} strokeWidth={3}/> : <ChevronLeft size={14} strokeWidth={3}/>}
        </button>

        <div className="flex flex-col h-full overflow-hidden">
          
          {/* USER PROFILE HEADER */}
          <div className={cn(
            "p-6 mb-2 transition-all duration-300",
            !showFull && "px-4 flex justify-center"
          )}>
            <div className={cn(
              "flex items-center gap-4 p-3 rounded-[1.25rem] bg-slate-50 border border-slate-100 transition-all",
              !showFull && "p-1.5 bg-transparent border-none"
            )}>
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border-2 border-white shadow-sm">
                <img 
                  src="https://flagcdn.com/bf.svg" 
                  alt="Burkina Faso Admin" 
                  className="h-full w-full object-cover"
                />
              </div>

              {showFull && (
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-900 text-[10px] uppercase tracking-tighter truncate">
                    {user?.fullName || 'Admin Panel'}
                  </p>
                  <form action={logoutAction}>
                    <button type="submit" className="group text-red-500 font-bold text-[9px] uppercase flex items-center gap-1.5 hover:opacity-80 transition-all">
                      <LogOut size={10} className="group-hover:-translate-x-0.5 transition-transform" /> 
                      Déconnexion
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* NAVIGATION MENU */}
          <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar pb-6">
            {MENU_ITEMS.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link 
                  key={item.href}
                  href={item.href} 
                  className={cn(
                    "flex items-center gap-4 py-3.5 rounded-2xl transition-all duration-300 group relative",
                    showFull ? "px-5" : "justify-center px-0 w-full",
                    isActive 
                      ? "text-[#db9b16] bg-[#db9b16]/5 shadow-sm" 
                      : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <item.icon 
                    size={showFull ? 18 : 24} 
                    className={cn(
                      "shrink-0 transition-transform duration-300 group-hover:scale-110", 
                      isActive && "text-[#db9b16] drop-shadow-[0_0_8px_rgba(219,155,22,0.3)]"
                    )}
                  />
                  
                  {showFull && (
                    <span className="font-black text-[10px] uppercase tracking-[0.1em] whitespace-nowrap">
                      {item.label}
                    </span>
                  )}

                  {/* INDICATEUR ACTIF */}
                  {isActive && (
                    <div className="absolute left-0 h-5 w-1 bg-[#db9b16] rounded-r-full shadow-[2px_0_8px_rgba(219,155,22,0.4)]" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* FOOTER DISCRET (Version repliée) */}
          {!showFull && (
            <div className="p-4 border-t border-slate-50 flex justify-center">
               <form action={logoutAction}>
                  <button type="submit" className="text-slate-300 hover:text-red-500 transition-colors">
                    <LogOut size={20} />
                  </button>
               </form>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}