'use client';
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { applicationService } from "@/services/application.service";
import Link from "next/link";
import { Eye, FileText, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/Button";
// import { DeleteStudentButton } from "@/components/admin/DeleteStudentButton";
import { DeleteStudentButton } from "@/components/admin/DeleteStudentButton";

export default function AdminStudentsPage() {
  const { data: students = [], isLoading, error } = useQuery({
    queryKey: ["adminStudents"],
    queryFn: async () => {
      const res = await axios.get("/api/admin/students");
      // Correction : la clé de retour de l'API est 'users', pas 'students'
      return res.data.users || [];
    }
  });

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur lors du chargement des étudiants.</div>;

  return (
    <main className="p-8 md:p-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Gestion des Étudiants</h1>
          <p className="text-slate-500 font-medium mt-1">Liste complète des dossiers reçus</p>
        </div>
        
        <div className="flex gap-3">
             <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input 
                   type="text" 
                   placeholder="Rechercher..." 
                   className="pl-10 pr-4 h-12 rounded-xl border-none shadow-sm bg-white text-sm font-medium focus:ring-2 focus:ring-blue-500 w-64 outline-none"
                />
             </div>
             <Button variant="outline" className="h-12 w-12 rounded-xl bg-white border-none shadow-sm text-slate-500 p-0 flex items-center justify-center">
                <Filter size={20} />
             </Button>
        </div>
      </header>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100/50 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 text-slate-400 text-xs font-bold uppercase tracking-wider">
            <tr>
              <th className="py-5 px-6">Étudiant</th>
              <th className="py-5 px-6">Université</th>
              <th className="py-5 px-6">Pièces</th>
              <th className="py-5 px-6">Statut</th>
              <th className="py-5 px-6">Date</th>
              <th className="py-5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {students.map((app: any) => (
              <tr key={app.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                     <div className="h-10 w-10 rounded-full bg-linear-to-tr from-blue-100 to-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                        {(app.fullName || app.email || "?").substring(0,2).toUpperCase()}
                     </div>
                     <div>
                        <div className="font-bold text-slate-800">
                          <Link href={`/admin/students/${app.id}`} className="hover:underline">
                            {app.fullName || app.email || "Étudiant"}
                          </Link>
                        </div>
                        <div className="text-slate-400 text-xs font-medium">{app.email || "-"}</div>
                     </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                   <div className="font-bold text-slate-700 text-sm">{app.university?.name || "-"}</div>
                   <div className="text-slate-400 text-xs">{app.desiredProgram || "-"}</div>
                </td>
                <td className="py-4 px-6">
                    <div className="flex items-center gap-1 text-slate-500 text-sm font-bold">
                        <FileText size={16} /> {Array.isArray(app.documents) ? app.documents.length : 0}
                    </div>
                </td>
                <td className="py-4 px-6">
                   <StatusBadge status={app.status || "-"} />
                </td>
                <td className="py-4 px-6 text-slate-500 text-sm font-medium">
                   {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "-"}
                </td>
                <td className="py-4 px-6 text-right">
                   <div className="flex items-center justify-end gap-2">
                     <Link href={`/admin/students/${app.id}`}>
                        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                           <Eye size={18} />
                        </Button>
                     </Link>
                     <DeleteStudentButton studentId={app.id} studentName={app.fullName || app.email || "Étudiant"} />
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {students.length === 0 && (
           <div className="p-12 text-center text-slate-400">Aucune demande trouvée.</div>
        )}
      </div>
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
   const styles: any = {
      'DRAFT': "bg-slate-100 text-slate-500",
      'SUBMITTED': "bg-blue-100 text-blue-600",
      'UNDER_REVIEW': "bg-amber-100 text-amber-600",
      'ACCEPTED': "bg-emerald-100 text-emerald-600",
      'REJECTED': "bg-red-100 text-red-600",
      'VISA_GRANTED': "bg-purple-100 text-purple-600",
      'JW202_RECEIVED': "bg-cyan-100 text-cyan-600",
   }
   
   return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${styles[status] || styles['DRAFT']}`}>
         {status.replace(/_/g, ' ')}
      </span>
   )
}
