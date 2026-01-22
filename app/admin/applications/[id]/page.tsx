import { applicationService } from "@/services/application.service";
import { DocumentActions } from "@/components/admin/DocumentActions";
import { ApplicationStatusControl } from "@/components/admin/ApplicationStatusControl";
import { FileText, User as UserIcon, MapPin, Calendar, Download } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getFileUrl } from "@/lib/storage";
import { convertToXOF, formatCurrency } from "@/services/currency.service";

export default async function ApplicationDetailsPage(props: { params: Promise<{ id: string }> }) {
   const params = await props.params;
   const applicationRaw = await applicationService.getApplicationById(params.id);

   if (!applicationRaw) {
      redirect('/admin/students');
   }

   // Resolve S3 URLs for documents
   const documentsWithUrls = await Promise.all(applicationRaw.documents.map(async (doc:any) => {
         let url = doc.url;
         if (!doc.url.startsWith('/')) {
            url = await getFileUrl(doc.url) || '#';
         }
         return { ...doc, url };
   }));

   const application = { ...applicationRaw, documents: documentsWithUrls };

   // Paiements liés à cette application
   let payments = [];
   let paymentsError: string | null = null;
   const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
   const paymentsRes = await fetch(`${baseUrl}/api/admin/payments/by-application?applicationId=${application.id}`);
   if (paymentsRes.ok) {
      try {
         const paymentsData = await paymentsRes.json();
         payments = paymentsData.payments || [];
      } catch (e) {
         paymentsError = "Erreur de parsing JSON pour les paiements.";
         console.error("Erreur de parsing JSON pour les paiements:", e);
      }
   } else {
      if (paymentsRes.status === 401) {
         console.log("Non authentifié pour voir les paiements."); 
        // paymentsError = "Vous n'êtes pas authentifié pour voir ces paiements.";
      } else {
         const text = await paymentsRes.text();
         paymentsError = `Erreur API paiements: ${paymentsRes.status}`;
         console.error(`Erreur API paiements: ${paymentsRes.status} - ${text}`);
      }
   }

   // Calculs avec conversion en XOF
   const totalPayeXOF = payments.reduce(
      (sum: number, p: { amount: string, currency: string }) =>
         sum + convertToXOF(parseFloat(p.amount) || 0, (p.currency as "XOF" | "EUR" | "USD") || "XOF"),
      0
   );
   // Récupère le costRange de l'université liée à l'application (supposé en XOF/FCFA)
   const costRangeXOF = application.university?.costRange ? parseFloat(application.university.costRange) : 0;
   const resteXOF = costRangeXOF > 0 ? costRangeXOF - totalPayeXOF : null;

   return (
      <main className="p-8 max-w-5xl mx-auto">
         <Link href="/admin/students" className="text-slate-500 hover:text-slate-900 text-sm mb-6 inline-block font-medium">← Retour à la liste</Link>
         {paymentsError && (
            <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
               {paymentsError}
            </div>
         )}
         <header className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{application.user.fullName}</h1>
            <div className="flex items-center gap-4 text-slate-500">
               <span className="flex items-center gap-1"><UserIcon size={16} /> Dossier #{application.id.substring(0,8)}</span>
               <span className="flex items-center gap-1"><Calendar size={16} /> {new Date(application.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="text-right">
             <ApplicationStatusControl id={application.id} currentStatus={application.status} />
          </div>
       </header>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* ℹ️ INFO CARD */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
             <h2 className="font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">Informations</h2>
             
             <div className="space-y-4">
                <div>
                   <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email</label>
                   <div className="font-medium text-slate-800">{application.user.email}</div>
                </div>
                <div>
                   <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Téléphone</label>
                   <div className="font-medium text-slate-800">{application.user.phone || 'Non renseigné'}</div>
                </div>
                
                <div className="pt-4 border-t border-slate-100">
                   <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Université</label>
                   <div className="font-bold text-blue-600 text-lg mt-1">{application.university.name}</div>
                   <div className="text-slate-500 text-sm flex items-center gap-1 mt-1">
                      <MapPin size={14}/> {application.university.city}
                   </div>
                </div>
                        {/* Paiements avec conversion multi-devise */}
                        <div className="pt-4 border-t border-slate-100">
                           <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Paiements</label>
                           <div className="font-medium text-slate-800">
                              Total payé : {totalPayeXOF} FCFA (XOF)
                              {payments.length > 0 && (
                                 <span className="block text-xs text-slate-500 mt-1">
                                    ({payments.map((p: any) => `${p.amount} ${p.currency}`).join(" + ")})
                                 </span>
                              )}
                           </div>
                           {costRangeXOF > 0 && (
                              <div className="text-slate-700">Montant attendu : {costRangeXOF} FCFA (XOF)</div>
                           )}
                           {resteXOF !== null && (
                              <div>Reste à payer : <span className={resteXOF > 0 ? 'text-red-500' : 'text-green-600'}>{resteXOF} FCFA (XOF)</span></div>
                           )}
                        </div>
             </div>
          </div>

          {/* 📄 DOCUMENTS */}
          <div className="md:col-span-2">
             <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="text-blue-500"/>
                Pièces justificatives ({application.documents.length})
             </h2>
             {/* Affichage intuitif du payeur */}
             <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-6">
               <UserIcon size={32} className="text-blue-500" />
               <div>
                 <div className="font-bold text-blue-700 text-lg">{application.user.fullName}</div>
                 <div className="text-slate-700 text-sm">{application.user.phone || 'Téléphone non renseigné'}</div>
               </div>
             </div>
             <div className="space-y-3">
                {application.documents.map((doc:any) => (
                   <div key={doc.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-blue-300 transition-colors">
                      <div className="flex items-center gap-4">
                         <div className="h-12 w-12 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                            <FileText size={24} />
                         </div>
                         <div>
                            <div className="font-bold text-slate-800">{doc.name}</div>
                            <div className="text-xs text-slate-400 uppercase font-bold tracking-wide mt-0.5">{doc.type} • {new Date(doc.createdAt).toLocaleDateString()}</div>
                         </div>
                      </div>
                      <div className="flex items-center gap-4">
                         {/* View Link */}
                         <Link href={doc.url} target="_blank" className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-full transition-colors" title="Télécharger / Voir">
                            <Download size={20} />
                         </Link>
                         <div className="w-px h-8 bg-slate-100 mx-2"></div>
                         {/* Actions Component */}
                         <DocumentActions id={doc.id} currentStatus={doc.status} />
                      </div>
                   </div>
                ))}
                {application.documents.length === 0 && (
                   <div className="p-12 border-2 border-dashed border-slate-200 rounded-xl text-center text-slate-400">
                      Aucun document reçu pour le moment.
                   </div>
                )}
             </div>
          </div>

       </div>
    </main>
  );
}
