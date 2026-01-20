import AdminSidebar from "@/components/admin/AdminSidebar";
import { prisma } from "@/lib/prisma";
import { authService } from "@/services/auth.service";
import { redirect } from "next/navigation";
import React from "react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Protection et récupération des données
  const userId = await authService.requireUser();
  const user = await prisma.user.findUnique({ 
    where: { id: userId },
    select: { role: true, fullName: true, email: true } 
  });

  // 2. Vérification sécurité
  if (!user || user.role !== 'ADMIN') {
    redirect('/student/dashboard');
  }

  return (
    <div className="flex min-h-screen bg-[#F4F7FE]">
      {/* On affiche la Sidebar à gauche */}
      <AdminSidebar user={user} />
      
      {/* On affiche le contenu de la page à droite */}
      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}