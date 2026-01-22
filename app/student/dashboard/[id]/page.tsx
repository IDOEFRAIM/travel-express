import Link from 'next/link';
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { Button } from "@/components/ui/Button"
import { FileText, MessageCircle, ChevronRight, LogOut, Check, GraduationCap, Download } from "lucide-react"
import { getFileUrl } from '@/lib/storage';
import { logoutAction } from "@/actions/logout.action";
import { UploadDocumentButton } from "@/components/student/UploadDocumentButton";
import { cn } from "@/lib/utils";

// --- TYPES ---
export interface University {
  name: string;
  id: string;
  city: string;
  imageUrl: string | null;
}

export interface Document {
  id: string;
  name: string;
  url: string;
  status: string;
}

export interface Application {
  id: string;
  status: string;
  university: University;
  documents: Document[];
}

export interface User {
  id: string;
  fullName: string;
  applications: Application[];
}

// --- CONSTANTES ---
const TIMELINE_STEPS = [
  { id: 'DRAFT', title: 'Dossier créé', desc: 'Votre candidature est initialisée.' },
  { id: 'SUBMITTED', title: 'Soumis', desc: 'Documents envoyés pour analyse.' },
  { id: 'REVIEW', title: 'En cours de revue', desc: 'Nos experts vérifient vos pièces.' },
  { id: 'ADMITTED', title: 'Admis', desc: 'Félicitations ! Votre admission est confirmée.' },
  { id: 'VISA_PROCESS', title: 'Visa en cours', desc: 'Préparation de vos documents de voyage.' },
];

// --- COMPOSANT PRINCIPAL ---
export default async function ApplicationDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const userId = cookieStore.get('user_id')?.value;

  if (!userId) redirect('/login');

  // Récupération de la candidature avec les relations
  const app = await prisma.application.findUnique({
    where: { id: id, userId: userId },
    include: {
      university: true,
      documents: true,
      user: true,
    }
  });

  if (!app) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
          <h2 className="text-xl font-black text-red-500 mb-4">Candidature introuvable</h2>
          <Link href="/student/dashboard" className="text-[#db9b16] font-bold underline">Retour au dashboard</Link>
        </div>
      </div>
    );
  }

  const currentIndex = TIMELINE_STEPS.findIndex((s) => s.id === app.status);
  const studentName = app.user?.fullName || "Étudiant";

  // Pré-génération des URLs de documents de manière asynchrone
  const documentsWithUrls = await Promise.all(
    app.documents.map(async (doc) => ({
      ...doc,
      fileUrl: await getFileUrl(doc.url)
    }))
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-[#db9b16] selection:text-white">
      {/* HEADER - Redesigned for better back button alignment */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="font-black text-slate-900 tracking-tighter text-lg">Travel Express</div>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-end mr-2">
                <span className="font-black text-slate-900 text-base">{studentName}</span>
                <span className="text-xs text-[#db9b16] font-bold uppercase tracking-widest">DOSSIER ACTIF</span>
              </div>
              <Link href="/student/dashboard" className="flex items-center gap-2 text-[#db9b16] font-bold hover:underline transition">
                <span className="text-lg">&#8592;</span> Retour au dashboard
              </Link>
              <div className="h-10 w-10 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold shadow">
                {studentName.charAt(0)}
              </div>
            </div>
            <form action={logoutAction}>
              <button type="submit" className="p-2.5 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-500 transition-all group">
                <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="p-6 md:p-8 max-w-6xl mx-auto">
        {/* WELCOME AREA */}
        <div className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Bonjour, <span className="text-[#db9b16]">{studentName.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-slate-500 font-medium mt-2 max-w-2xl">
            Suivez en temps réel votre admission pour <span className="text-slate-900 font-bold underline decoration-[#db9b16] decoration-2 underline-offset-4">{app.university.name}</span>.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LIGNE DE TEMPS */}
          <section className="lg:col-span-7 bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
            <div className="flex items-center justify-between mb-10 relative z-10">
              <h2 className="text-2xl font-black text-slate-900">Parcours de réussite</h2>
              <span className="px-4 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                Étape {Math.max(0, currentIndex + 1)} / {TIMELINE_STEPS.length}
              </span>
            </div>

            <div className="relative z-10">
              <div className="absolute left-4 top-4 bottom-10 w-0.5 bg-slate-100"></div>

              <div className="space-y-10 relative">
                {TIMELINE_STEPS.map((step, index) => {
                  const isCompleted = index < currentIndex;
                  const isCurrent = index === currentIndex;
                  const isFuture = index > currentIndex;
                  
                  return (
                    <div key={step.id} className={cn("flex gap-6 md:gap-8 relative group transition-all duration-500", isFuture && "opacity-30")}>
                      <div className={cn(
                        "z-10 h-9 w-9 rounded-2xl border-2 flex items-center justify-center shrink-0 transition-all duration-500 bg-white",
                        isCompleted ? "border-green-500 bg-green-50 text-green-500" : 
                        isCurrent ? "border-[#db9b16] bg-[#db9b16] text-white shadow-xl shadow-[#db9b16]/30 scale-110" : 
                        "border-slate-100 text-slate-300"
                      )}>
                        {isCompleted ? <Check size={18} strokeWidth={3} /> : <GraduationCap size={18} />}
                      </div>

                      <div className={cn("pt-0.5", isCurrent && "scale-[1.02] origin-left transition-transform")}>
                        <h3 className={cn("font-black text-lg transition-colors leading-none", isCurrent ? "text-[#db9b16]" : "text-slate-800")}>
                          {step.title}
                        </h3>
                        <p className="text-sm text-slate-400 font-medium mt-2 leading-relaxed max-w-md">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* DOCUMENTS SIDEPANEL */}
          <section className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-black text-slate-900 flex items-center gap-3 text-xl">
                  <FileText size={24} className="text-[#db9b16]"/> Dossier Digital
                </h3>
                <span className="bg-[#db9b16]/10 text-[#db9b16] text-xs font-black px-3 py-1 rounded-lg">
                  {app.documents.length} PIÈCES
                </span>
              </div>
              
              {documentsWithUrls.length > 0 ? (
                <div className="space-y-4 mb-8">
                  {documentsWithUrls.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-[#db9b16] hover:bg-white transition-all duration-300">
                      <div className="overflow-hidden">
                        <div className="text-sm font-black text-slate-900 truncate">{doc.name}</div>
                        <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1 flex items-center gap-2">
                          <span className={cn("w-2 h-2 rounded-full",
                            doc.status === 'APPROVED' ? "bg-green-500" :
                            doc.status === 'REJECTED' ? "bg-red-500" : "bg-amber-400"
                          )}></span>
                          {doc.status}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 hover:text-[#db9b16] transition-colors">
                          <Download size={18} />
                        </a>
                        {doc.status === 'APPROVED' && <Check size={18} className="text-green-500" />}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 mb-8 rounded-[2rem] border-2 border-dashed border-slate-100 bg-slate-50/50">
                  <FileText size={48} className="mx-auto text-slate-200 mb-4" />
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Aucun document</p>
                </div>
              )}

              <UploadDocumentButton applicationId={app.id} />
            </div>

            {/* Support Widget */}
            <div className="bg-slate-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
              <h3 className="font-black mb-4 text-xl relative z-10">Une question ?</h3>
              <p className="text-slate-400 text-sm mb-8 font-medium relative z-10">
                Nos experts répondent en moins de 2h sur WhatsApp.
              </p>
              <Link href="https://wa.me/22177000000" target="_blank" className="w-full flex items-center justify-between p-5 rounded-2xl bg-white/5 hover:bg-[#db9b16] border border-white/10 transition-all duration-500 text-sm font-black group relative z-10">
                <span className="flex items-center gap-3 uppercase tracking-widest">
                  <MessageCircle size={20} className="text-[#db9b16] group-hover:text-white"/> Support Direct
                </span>
                <ChevronRight size={18} className="text-slate-500 group-hover:text-white"/>
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}