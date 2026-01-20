'use client';
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import {prisma} from "@/lib/prisma";
import { DocumentActions } from "@/components/admin/DocumentActions"; 
import Link from "next/link";
import { FileText, Search, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getFileUrl } from "@/lib/storage";
import { useEffect, useState } from "react";

export default function AdminDocumentsPage() {
  const { data: documents = [], isLoading, error } = useQuery({
    queryKey: ["adminDocuments"],
    queryFn: async () => {
      const res = await axios.get("/api/admin/documents");
      return res.data.documents || [];
    }
  });

  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchUrls() {
      if (!documents || documents.length === 0) return;
      const urlMap: Record<string, string> = {};
      await Promise.all(documents.map(async (doc: any) => {
        urlMap[doc.id] = (await getFileUrl(doc.url)) ?? "";
      }));
      setSignedUrls(urlMap);
    }
    fetchUrls();
  }, [documents]);

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur lors du chargement des documents.</div>;

  return (
    <main className="p-8 md:p-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Gestion des Documents</h1>
          <p className="text-slate-500 font-medium mt-1">Tous les fichiers téléversés</p>
        </div>
        
        <div className="flex gap-3">
             <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input 
                   type="text" 
                   placeholder="Rechercher un document..." 
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
              <th className="py-5 px-6">Document</th>
              <th className="py-5 px-6">Étudiant</th>
              <th className="py-5 px-6">Type</th>
              <th className="py-5 px-6">Date</th>
              <th className="py-5 px-6">Statut</th>
              <th className="py-5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {documents.map((doc: any) => (
              <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="py-4 px-6">
                  {signedUrls[doc.id] ? (
                    <Link href={signedUrls[doc.id]} target="_blank" className="flex items-center gap-3 group/link">
                       <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover/link:bg-blue-600 group-hover/link:text-white transition-colors">
                          <FileText size={20} />
                       </div>
                       <div>
                          <div className="font-bold text-slate-800 group-hover/link:text-blue-600 transition-colors">{doc.name}</div>
                          <div className="text-slate-400 text-xs font-medium uppercase">{doc.url.split('.').pop()}</div>
                       </div>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                      <span className="animate-pulse">Lien en cours…</span>
                    </div>
                  )}
                </td>
                <td className="py-4 px-6">
                   <div className="font-bold text-slate-700 text-sm">{doc.application.user.fullName}</div>
                   <div className="text-slate-400 text-xs">{doc.application.user.email}</div>
                </td>
                <td className="py-4 px-6">
                   <span className="text-sm font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                      {doc.type}
                   </span>
                </td>
                <td className="py-4 px-6 text-slate-500 text-sm font-medium">
                   {new Date(doc.createdAt).toLocaleDateString()}
                </td>
                <td className="py-4 px-6">
                   <StatusBadge status={doc.status} />
                </td>
                <td className="py-4 px-6 text-right flex justify-end items-center gap-2">
                   {signedUrls[doc.id] ? (
                     <Link href={signedUrls[doc.id]} target="_blank">
                        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                           <Download size={18} />
                        </Button>
                     </Link>
                   ) : (
                     <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg text-slate-400 opacity-50 cursor-not-allowed" disabled>
                       <Download size={18} />
                     </Button>
                   )}
                   <div className="scale-90 origin-right">
                      <DocumentActions id={doc.id} currentStatus={doc.status} />
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {documents.length === 0 && (
           <div className="p-12 text-center text-slate-400">Aucun document téléversé.</div>
        )}
      </div>
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
   const styles: any = {
      'PENDING': "bg-amber-100 text-amber-600",
      'APPROVED': "bg-emerald-100 text-emerald-600",
      'REJECTED': "bg-red-100 text-red-600"
   }
   
   return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border border-transparent ${styles[status]}`}>
         {status}
      </span>
   )
}
