'use client';

import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import AddPaymentForm from "@/components/admin/AddPaymentForm";
import { useState } from "react";

export default function AdminFinancesPage() {
  const [showForm, setShowForm] = useState(false);
  const { data: finances = [], isLoading, error } = useQuery({
    queryKey: ["adminFinances"],
    queryFn: async () => {
      const res = await axios.get("/api/admin/finances");
      return res.data.finances || [];
    }
  });

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur lors du chargement des finances.</div>;
  return (
    <main className="p-8 md:p-12 max-w-4xl mx-auto">
      <header className="mb-12 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Finances</h1>
          <p className="text-slate-500 font-medium mt-1">Historique des paiements enregistrés sur la plateforme.</p>
        </div>
        <button
          className="bg-[#db9b16] text-white font-bold py-2 px-4 rounded hover:bg-[#b8860b] transition"
          onClick={() => setShowForm(f => !f)}
        >
          {showForm ? 'Fermer' : 'Nouveau paiement'}
        </button>
      </header>

      {showForm && <AddPaymentForm />}

      <div className="overflow-x-auto bg-white rounded-2xl shadow border border-slate-100">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Montant</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Devise</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Méthode</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Référence</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {finances.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-12 text-slate-400 font-medium">Aucun paiement trouvé.</td>
              </tr>
            )}
            {finances.map((f) => (
              <tr key={f.id} className="hover:bg-slate-50 transition-all">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{new Date(f.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{f.user?.fullName || 'Inconnu'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{f.user?.email || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-bold">{f.amount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{f.currency}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{f.method}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {f.status === 'COMPLETED' ? (
                    <span className="text-green-600 font-bold">Payé</span>
                  ) : f.status === 'FAILED' ? (
                    <span className="text-red-500 font-bold">Échoué</span>
                  ) : (
                    <span className="text-yellow-500 font-bold">En attente</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">{f.reference || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
