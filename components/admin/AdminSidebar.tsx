'use client';

import { useState } from 'react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Users, Globe, LogOut, FileText, ChevronLeft, ChevronRight, GraduationCap, Archive, ActivitySquare, CreditCard } from "lucide-react";
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
  { label: 'Archive', href: '/admin/archive', icon: Archive },
  { label: 'Activités', href: '/admin/activity', icon: ActivitySquare },
  { label: 'Finances', href: '/admin/finances', icon: CreditCard },
  { label: 'Ajouter Univ.', href: '/admin/universities/new', icon: Globe },
];

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
      <aside className={cn(
          "bg-white hidden md:flex flex-col sticky top-0 h-screen shrink-0 border-r border-slate-100 shadow-sm z-50 transition-all duration-300",
          isCollapsed ? "w-24" : "w-80"
      )}>
          <button 
             onClick={() => setIsCollapsed(!isCollapsed)}
             className="absolute -right-3 top-12 bg-white border border-slate-100 shadow-md rounded-full p-1.5 text-slate-400 hover:text-[#db9b16] z-50 transition-all"
          >
             {isCollapsed ? <ChevronRight size={14}/> : <ChevronLeft size={14}/>}
          </button>

          <div className={cn("flex flex-col h-full", isCollapsed ? "p-4" : "p-8")}>
            <div className={cn("flex flex-col items-center mb-12 text-center transition-all duration-300", isCollapsed && "mb-10")}>
                <div className={cn(
                  "rounded-3xl bg-[#db9b16] p-0.5 shadow-xl shadow-[#db9b16]/20 transition-all duration-500",
                  isCollapsed ? "h-12 w-12 mb-2" : "h-24 w-24 mb-6"
                )}>
                   <div className="h-full w-full rounded-[22px] bg-white p-1.5">
                      <img 
                         src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.fullName || 'Admin'}`} 
                         alt="Avatar" 
                         className="h-full w-full rounded-[18px] bg-slate-50 object-cover"
                      />
                   </div>
                </div>
                {!isCollapsed && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                      <h3 className="font-black text-slate-800 text-xl tracking-tight leading-none mb-1">
                        {user?.fullName?.split(' ')[0] || 'Admin'}
                      </h3>
                      <p className="text-[#db9b16] text-[10px] font-black uppercase tracking-[0.2em]">{user?.role || 'Admin'}</p>
                  </div>
                )}
            </div>

            <nav className="space-y-2 flex-1">
                {MENU_ITEMS.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link 
                      key={item.href}
                      href={item.href} 
                      className={cn(
                        "flex items-center gap-4 py-4 rounded-2xl cursor-pointer transition-all duration-300 font-black text-[11px] uppercase tracking-widest group relative",
                        isCollapsed ? "justify-center px-0 w-full" : "px-6",
                        isActive ? "text-[#db9b16] bg-[#db9b16]/5 shadow-sm" : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                      )}
                    >
                      <item.icon size={isCollapsed ? 24 : 20} className={cn("shrink-0 transition-all duration-300", isActive && "text-[#db9b16]")}/>
                      <span className={cn("whitespace-nowrap transition-all duration-300 origin-left", isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100")}>
                         {item.label}
                      </span>
                      {isActive && !isCollapsed && <div className="absolute left-0 h-6 w-1.5 bg-[#db9b16] rounded-r-full top-1/2 -translate-y-1/2"></div>}
                    </Link>
                  )
                })}
            </nav>

             <div className="pt-6 border-t border-slate-100 mt-auto">
                <form action={logoutAction}>
                   <button type="submit" className={cn("w-full flex items-center gap-4 py-4 rounded-2xl cursor-pointer transition-all font-black text-[11px] uppercase tracking-widest text-red-500 hover:bg-red-50", isCollapsed ? "justify-center px-0" : "px-6")}>
                        <LogOut size={20} className="shrink-0"/>
                        {!isCollapsed && <span className="whitespace-nowrap">Déconnexion</span>}
                   </button>
                </form>
             </div>
          </div>
      </aside>
  );
}