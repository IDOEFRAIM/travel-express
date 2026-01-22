"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { GraduationCap } from "lucide-react";

const DescriptionWithExpand = dynamic(() => import("@/components/student/DescriptionWithExpand"), { ssr: false });

interface University {
  id: string;
  name: string;
  city: string;
  country: string;
  description?: string | null;
  createdAt?: Date;
  summary?: string | null;
  costRange?: string | null;
  programs?: string | null;
  images?: string[];
  imageUrl?: string | null;
  pdfUrl?: string | null;
}

interface Document {
  id: string;
  name: string;
  url: string;
  status: string;
}

interface Application {
  id: string;
  status: string;
  university: University;
  documents: Document[];
}

export default function ApplicationCard({ app }: { app: Application }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <GraduationCap size={28} className="text-[#db9b16]" />
        <div>
          <div className="font-black text-lg text-slate-900">{app.university.name}</div>
          <div className="text-xs text-slate-500">{app.university.city}</div>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs font-bold uppercase text-[#db9b16]">Statut: {app.status}</span>
        <span className="text-xs text-slate-400">{app.documents.length} document(s)</span>
      </div>
      {app.university.summary && (
        <div className="text-xs text-slate-700 bg-slate-50 rounded-lg p-2 mt-1"><span className="font-bold uppercase text-slate-400">Résumé :</span> {app.university.summary}</div>
      )}
      {app.university.description && (
        <div className="text-xs text-slate-700 bg-slate-50 rounded-lg p-2 mt-1">
          <span className="font-bold uppercase text-slate-400">Description :</span> <DescriptionWithExpand description={app.university.description} />
        </div>
      )}
      {app.university.pdfUrl && (
        <a href={app.university.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-700 underline mt-1">Voir le PDF des conditions</a>
      )}
      <Link href={`/student/dashboard/${app.id}`} className="mt-2 bg-[#db9b16] text-white font-bold py-2 px-4 rounded-xl hover:bg-[#b8860b] transition text-center">
        Voir le détail
      </Link>
    </div>
  );
}
