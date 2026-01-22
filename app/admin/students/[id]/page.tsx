"use client";
import { useParams } from "next/navigation";
import axios from "axios";
import React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { convertToXOF } from "@/services/currency.service";

type Student = {
  fullName?: string;
  email?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
};

export default function StudentDetailPage() {
  const { id } = useParams();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [applications, setApplications] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    async function fetchStudent() {
      try {
        const res = await axios.get(`/api/admin/students/${id}`);
        setStudent(res.data.user);
      } catch {
        setError("Erreur lors du chargement de l'étudiant");
      }
    }
    async function fetchApplications() {
      try {
        const res = await axios.get(`/api/admin/applications?userId=${id}`);
        setApplications(res.data.applications || []);
      } catch {}
    }
    async function fetchPayments() {
      try {
        const res = await axios.get(`/api/admin/payments?userId=${id}`);
        setPayments(res.data.payments || []);
      } catch {}
    }
    if (id) {
      fetchStudent();
      fetchApplications();
      fetchPayments();
      setLoading(false);
    }
  }, [id]);

  if (loading) return <div className="p-8">Chargement...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!student) return <div className="p-8">Aucun étudiant trouvé.</div>;

  return (
    <main className="p-8 max-w-xl mx-auto">
      <Link href="/admin/students" className="text-blue-600 hover:underline">← Retour à la liste</Link>
      <h1 className="text-3xl font-extrabold text-slate-800 mt-6 mb-6 text-center">Fiche Étudiant</h1>
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 mb-8 flex flex-col md:flex-row gap-8 items-center animate-fadein">
        <div className="flex-shrink-0 flex items-center justify-center w-24 h-24 rounded-full bg-blue-50 border-2 border-blue-100 shadow">
          <span className="text-4xl font-black text-blue-400">{student.fullName?.charAt(0).toUpperCase() || '?'}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 w-full">
          <div><span className="font-bold text-slate-700">Nom :</span> <span className="text-lg font-black text-slate-900">{student.fullName || "-"}</span></div>
          <div><span className="font-bold text-slate-700">Email :</span> <span className="text-blue-700 font-bold">{student.email}</span></div>
          <div><span className="font-bold text-slate-700">Téléphone :</span> <span className="text-slate-800">{student.phone || "-"}</span></div>
          <div><span className="font-bold text-slate-700">Créé le :</span> <span className="text-slate-500">{student.createdAt ? new Date(student.createdAt).toLocaleString() : "-"}</span></div>
          <div><span className="font-bold text-slate-700">Mis à jour le :</span> <span className="text-slate-500">{student.updatedAt ? new Date(student.updatedAt).toLocaleString() : "-"}</span></div>
        </div>
      </div>
      <h2 className="text-xl font-bold text-slate-800 mb-4">Applications de l'étudiant</h2>
      <div className="space-y-8 mb-8">
        {applications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow border border-slate-100 p-8 text-slate-400 text-center">Aucune application trouvée.</div>
        ) : (
          applications.map(app => {
            // Paiements liés à cette application (si structure adaptée, sinon filtrer par universityId)
            const appPayments = payments.filter(p => p.applicationId === app.id || p.universityId === app.university?.id);
            // Regroupement par devise
            const paymentsByCurrency = appPayments.reduce((acc, p) => {
              if (!p.currency) return acc;
              acc[p.currency] = (acc[p.currency] || 0) + (parseFloat(p.amount) || 0);
              return acc;
            }, {} as Record<string, number>);
            const costRange = app.university?.costRange ? parseFloat(app.university.costRange) : 0;
            // Conversion de tous les paiements en XOF
            const totalPaidXOF = Object.entries(paymentsByCurrency).reduce(
              (sum, [cur, val]) => sum + convertToXOF(val as number, cur as "XOF" | "EUR" | "USD"),
              0
            );
            const resteXOF = costRange > 0 ? costRange - totalPaidXOF : null;
            return (
              <React.Fragment key={app.id}>
                <div className="bg-white rounded-2xl shadow border border-slate-100 p-6 flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className="font-black text-lg text-slate-900 truncate max-w-xs">{app.university?.name || "-"}</span>
                        <span className="text-xs px-2 py-1 rounded-full font-bold bg-slate-100 text-slate-500">{app.desiredProgram || "-"}</span>
                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${app.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-700' : app.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' : app.status === 'UNDER_REVIEW' ? 'bg-yellow-100 text-yellow-700' : app.status === 'REJECTED' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>{app.status || "-"}</span>
                        <span className="text-xs text-slate-400 ml-2">{app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "-"}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 text-sm">
                        <div>
                          Total payé : <span className="font-bold text-green-700">
                            {totalPaidXOF} XOF
                            <span className="text-xs text-slate-400 block">(
                              {Object.entries(paymentsByCurrency).map(([cur, val], i) => (
                                <span key={cur}>{i > 0 && ' + '}{val as number} {cur}</span>
                              ))}
                            )</span>
                          </span>
                        </div>
                        <div>Montant attendu : <span className="font-bold text-slate-800">{costRange} XOF</span></div>
                        <div>
                          Reste à payer : <span className={`font-bold ${resteXOF !== null && resteXOF > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {resteXOF !== null ? (resteXOF > 0 ? resteXOF : 0) + ' XOF' : 'N/A'}
                          </span>
                        </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-end md:justify-center mt-4 md:mt-0">
                    <Link href={`/admin/applications/${app.id}`}>
                      <button className="flex items-center gap-1 text-blue-600 hover:underline font-bold px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition">
                        <Eye size={18} /> Voir
                      </button>
                    </Link>
                  </div>
                </div>
              </React.Fragment>
            );
          })
        )}
      </div>
    </main>
  );
}
