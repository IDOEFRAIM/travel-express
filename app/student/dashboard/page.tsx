import Link from 'next/link';
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { Button } from "@/components/ui/Button"
import { FileText, Plane, MessageCircle, ChevronRight, LogOut, Check, GraduationCap } from "lucide-react"
import { logoutAction } from "@/actions/logout.action";
import { UploadDocumentButton } from "@/components/student/UploadDocumentButton";
import { cn } from "@/lib/utils";

async function getStudentData() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('user_id')?.value;

  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      applications: {
        include: {
          university: true,
          documents: true
        }
      }
    }
  });
  return user;
}

const TIMELINE_STEPS = [
    { id: 'DRAFT', title: "Constitution du dossier", desc: "Création du compte et téléversement des pièces justificatives." },
    { id: 'SUBMITTED', title: "Vérification Agence", desc: "Nos experts vérifient la conformité de vos documents." },
    { id: 'UNDER_REVIEW', title: "Instruction Université", desc: "Votre dossier est envoyé à l'université pour étude." },
    { id: 'ACCEPTED', title: "Admission Validée", desc: "Bravo ! L'université a accepté votre candidature." },
    { id: 'JW202_RECEIVED', title: "Formulaire Visa (JW202)", desc: "Réception du document officiel nécessaire pour le visa." },
    { id: 'VISA_GRANTED', title: "Obtention du Visa", desc: "Visa étudiant accordé par l'ambassade." },
    { id: 'FLIGHT_BOOKED', title: "Réservation Vol", desc: "Billet d'avion pris, préparatifs de départ." },
    { id: 'COMPLETED', title: "Arrivée en Chine", desc: "Installation, inscription finale et début des cours !" }
];

export default async function StudentDashboard() {
  const student = await getStudentData();

  if (!student) {
    redirect('/login');
  }

  const currentApp = student.applications[0];
  const currentStatus = currentApp?.status || 'DRAFT';
  const currentIndex = TIMELINE_STEPS.findIndex((s: any) => s.id === currentStatus);

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-[#db9b16] selection:text-white">
      
      {/* 🔮 TOP BAR (Style Travel Express) */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
             <div className="h-9 w-9 bg-[#db9b16] rounded-xl flex items-center justify-center text-white font-black text-xs shadow-lg shadow-[#db9b16]/20">TE</div>
             <span className="font-black text-slate-900 tracking-tighter hidden md:block text-sm">Travel Express</span>
          </Link>
          
          <div className="flex items-center gap-4">
             <div className="text-right hidden md:block">
                <div className="text-sm font-black text-slate-900 leading-none">{student.fullName}</div>
                <div className="text-[10px] text-[#db9b16] font-bold uppercase tracking-widest mt-1">Dossier Actif</div>
             </div>
             <div className="h-10 w-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-bold border-2 border-slate-100 shadow-sm transition-transform hover:rotate-3">
              {student.fullName?.charAt(0)}
            </div>
            
             <form action={logoutAction}>
                <button type="submit" className="p-2.5 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-500 transition-all group" title="Se déconnecter">
                  <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                </button>
             </form>
          </div>
        </div>
      </header>

      <main className="p-6 md:p-8 max-w-6xl mx-auto">
        
        {/* WELCOME AREA (Typography Ambition) */}
        <div className="mb-12">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Bonjour, <span className="text-[#db9b16]">{student.fullName?.split(' ')[0]}</span> 👋
            </h1>
            <p className="text-slate-500 font-medium mt-2 max-w-2xl">
                Suivez en temps réel la progression de votre admission pour <span className="text-slate-900 font-bold underline decoration-[#db9b16] decoration-2 underline-offset-4">{currentApp?.university.name || "votre future université"}</span>.
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LIGNE DE TEMPS (Inspiré du Mindset) */}
          <section className="lg:col-span-7 bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
             <div className="flex items-center justify-between mb-10 relative z-10">
                 <h2 className="text-2xl font-black text-slate-900">Parcours de réussite</h2>
                 <span className="px-4 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                    Étape {currentIndex + 1} / {TIMELINE_STEPS.length}
                 </span>
             </div>

             <div className="relative z-10">
                 <div className="absolute left-3.25 md:left-4 top-4 bottom-10 w-0.5 bg-slate-100"></div>

                 <div className="space-y-10 relative">
                    {TIMELINE_STEPS.map((step, index) => {
                       const isCompleted = index < currentIndex;
                       const isCurrent = index === currentIndex;
                       const isFuture = index > currentIndex;
                       
                       return (
                          <div key={step.id} className={cn("flex gap-6 md:gap-8 relative group transition-all duration-500", isFuture && "opacity-30 grayscale")}>
                              {/* INDICATEUR DYNAMIQUE */}
                              <div className={cn(
                                 "z-10 h-8 w-8 md:h-9 md:w-9 rounded-2xl border-2 flex items-center justify-center shrink-0 transition-all duration-500 bg-white",
                                 isCompleted ? "border-green-500 bg-green-50 text-green-500" : 
                                 isCurrent ? "border-[#db9b16] bg-[#db9b16] text-white shadow-xl shadow-[#db9b16]/30 scale-110" : 
                                 "border-slate-100"
                              )}>
                                 {isCompleted && <Check size={18} strokeWidth={3} />}
                                 {isCurrent && <GraduationCap size={18} className="animate-bounce" />}
                                 {isFuture && <div className="h-2 w-2 rounded-full bg-slate-200" />}
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
                       )
                    })}
                 </div>
             </div>
          </section>

          {/* DOCUMENTS SIDEPANEL (Style Innovation) */}
          <section className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
            
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="font-black text-slate-900 flex items-center gap-3 text-xl">
                     <FileText size={24} className="text-[#db9b16]"/> Dossier Digital
                  </h3>
                  <span className="bg-[#db9b16]/10 text-[#db9b16] text-xs font-black px-3 py-1 rounded-lg">
                      {currentApp?.documents.length || 0} PIÈCES
                  </span>
               </div>
               
               {currentApp?.documents.length > 0 ? (
                  <div className="space-y-4 mb-8">
                     {currentApp.documents.map((doc: any) => (
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
                           <Check size={18} className={cn("shrink-0", doc.status === 'APPROVED' ? "text-green-500" : "text-slate-200")} />
                        </div>
                     ))}
                  </div>
               ) : (
                  <div className="text-center py-12 mb-8 rounded-[2rem] border-2 border-dashed border-slate-100 bg-slate-50/50 group hover:border-[#db9b16]/30 transition-colors">
                      <div className="mx-auto h-16 w-16 text-slate-200 mb-4 group-hover:text-[#db9b16]/20 transition-colors">
                          <FileText size={64} strokeWidth={1} />
                      </div>
                      <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">En attente de documents</p>
                  </div>
               )}

               <div className="pt-2">
                  {currentApp ? (
                      <UploadDocumentButton applicationId={currentApp.id} />
                  ) : (
                      <div className="text-center space-y-4">
                        <div className="p-4 text-xs text-amber-700 bg-amber-50 rounded-2xl font-black uppercase tracking-wider border border-amber-100">
                          ⚠️ Candidature non initiée
                        </div>
                        <Link href="/#catalogue" className="inline-flex items-center gap-2 text-[#db9b16] font-black uppercase text-[10px] tracking-[0.2em] hover:gap-4 transition-all">
                          Explorer le catalogue <ChevronRight size={14} />
                        </Link>
                      </div>
                  )}
               </div>
            </div>

            {/* Help Widget (Style Ambition Dark) */}
            <div className="bg-slate-950 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-[#db9b16]/10 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#db9b16] rounded-full blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity"></div>
               <h3 className="font-black mb-4 text-xl relative z-10">Une question ?</h3>
               <p className="text-slate-400 text-sm mb-8 leading-relaxed font-medium relative z-10">
                   Nos experts en mobilité internationale vous répondent en moins de 2h sur WhatsApp.
               </p>
               <Link href="https://wa.me/22177000000" target="_blank" className="w-full flex items-center justify-between p-5 rounded-2xl bg-white/5 hover:bg-[#db9b16] border border-white/10 hover:border-[#db9b16] transition-all duration-500 text-sm font-black group relative z-10">
                     <span className="flex items-center gap-3 uppercase tracking-widest">
                        <MessageCircle size={20} className="text-[#db9b16] group-hover:text-white transition-colors"/> Support Direct
                     </span>
                     <ChevronRight size={18} className="text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all"/>
               </Link>
            </div>

          </section>
        </div>
      </main>
    </div>
  );
}