import Link from 'next/link';
import ApplicationCard from '@/components/student/ApplicationCard';
import { Flag } from 'lucide-react';
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { Button } from "@/components/ui/Button"
import { FileText, Plane, MessageCircle, ChevronRight, LogOut, Check, GraduationCap, Download } from "lucide-react"
import { getFileUrl } from '@/lib/storage';
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

   return (
      <div className="min-h-screen bg-slate-50 font-sans selection:bg-[#db9b16] selection:text-white">
         {/* 🔮 NAVBAR ÉTUDIANT (Redesigned) */}
         <header className="bg-white/90 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-6 py-3 flex flex-col md:flex-row md:justify-between md:items-center gap-2">
              <nav className="flex items-center gap-4 md:gap-6">
                <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <div className="h-9 w-9 bg-[#db9b16] rounded-xl flex items-center justify-center text-white font-black text-xs shadow-lg shadow-[#db9b16]/20">TE</div>
                  <span className="font-black text-slate-900 tracking-tighter hidden md:block text-sm">Accueil</span>
                </Link>
                <Link href="/student/dashboard" className="font-black text-slate-900 text-sm px-3 py-2 rounded-lg hover:bg-[#db9b16]/10 transition-all bg-[#db9b16]/10">
                  Candidature
                </Link>
                <Link href="/#catalogue" className="bg-[#db9b16] text-white font-bold px-5 py-2 rounded-full shadow hover:bg-[#b8860b] transition">
                  Catalogue
                </Link>
              </nav>
              <div className="flex items-center gap-3 md:gap-4 mt-2 md:mt-0">
                <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-xl">
                  <div className="h-8 w-8 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold border-2 border-slate-100 shadow-sm">
                    {student.fullName?.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-900 leading-none">{student.fullName}</span>
                    <span className="text-[10px] text-[#db9b16] font-bold uppercase tracking-widest">Candidatures</span>
                  </div>
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
            <div className="mb-12">
               <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                  Bonjour, <span className="text-[#db9b16]">{student.fullName?.split(' ')[0]}</span> 👋
               </h1>
               <p className="text-slate-500 font-medium mt-2 max-w-2xl">
                  Retrouvez toutes vos candidatures ci-dessous. Cliquez sur "Voir le détail" pour suivre la progression et gérer chaque dossier.
               </p>
            </div>

            {/* Grouper les candidatures par pays */}
            {student.applications.length > 0 ? (
              Object.entries(
                student.applications.reduce<Record<string, typeof student.applications>>(function(acc, app) {
                  const country = app.university.country || 'Autre';
                  if (!acc[country]) acc[country] = [];
                  acc[country].push(app);
                  return acc;
                }, {})
              ).map(([country, apps]) => (
                <section key={country} className="mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    <Flag className="text-[#db9b16]" size={28} />
                    <h2 className="text-2xl font-extrabold text-[#db9b16] tracking-tight uppercase drop-shadow-sm">{country}</h2>
                    <span className="bg-[#db9b16]/10 text-[#db9b16] text-xs font-bold px-3 py-1 rounded-full ml-2">{(apps as typeof student.applications).length} université{(apps as typeof student.applications).length > 1 ? 's' : ''}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {(apps as typeof student.applications).map(app => (
                      <ApplicationCard key={app.id} app={app} />
                    ))}
                  </div>
                </section>
              ))
            ) : (
              <div className="col-span-full text-center py-12 rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50/50">
                <div className="mx-auto h-16 w-16 text-slate-200 mb-4">
                  <GraduationCap size={64} strokeWidth={1} />
                </div>
                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Aucune candidature trouvée</p>
              </div>
            )}
         </main>
      </div>
   );
}