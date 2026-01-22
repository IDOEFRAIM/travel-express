"use client";
import { useState, useMemo } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function AddPaymentForm() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    userId: "",
    universityId: "",
    amount: "",
    currency: "XOF",
    method: "CASH",
    reference: ""
  });

  const [userSearch, setUserSearch] = useState("");
  const [showUserResults, setShowUserResults] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Récupère les données
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: async () => (await axios.get("/api/admin/students")).data.users || []
  });
  console.log("users", users); // Debug: affiche les utilisateurs récupérés

  const { data: universities = [] } = useQuery({
    queryKey: ["universities"],
    queryFn: async () => (await axios.get("/api/universities")).data.universities || []
  });

  // Filtrage intelligent des utilisateurs (mémorisé pour la performance)
  const filteredUsers = useMemo(() => {
    if (!userSearch) return [];
    return users.filter(u =>
      u.fullName?.toLowerCase().includes(userSearch.toLowerCase())
    ).slice(0, 8); // On limite à 8 résultats pour la clarté
  }, [users, userSearch]);

  type PaymentFormData = {
    userId: string;
    universityId: string;
    amount: string;
    currency: string;
    method: string;
    reference: string;
  };

  const mutation = useMutation({
    mutationFn: async (data: PaymentFormData) => {
      await axios.post("/api/admin/finances", data);
    },
    onSuccess: () => {
      setSuccess("Paiement enregistré avec succès !");
      setForm({ userId: "", universityId: "", amount: "", currency: "XOF", method: "CASH", reference: "" });
      setUserSearch("");
      setError("");
      queryClient.invalidateQueries({ queryKey: ["adminFinances"] });
      setTimeout(() => setSuccess(""), 3000);
    },
    onError: () => setError("Erreur lors de l'enregistrement du paiement.")
  });

  const handleSelectUser = (user) => {
    setForm(f => ({ ...f, userId: user.id }));
    setUserSearch(user.fullName); // Affiche le nom sélectionné dans l'input
    setShowUserResults(false);
  };

  return (
    <form
      className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 shadow-sm flex flex-col gap-5 max-w-xl mx-auto"
      onSubmit={e => {
        e.preventDefault();
        if (!form.userId || !form.universityId || !form.amount) {
          setError("Veuillez remplir tous les champs obligatoires (*)");
          return;
        }
        mutation.mutate(form);
      }}
    >
      <h2 className="text-xl font-bold text-slate-800">Enregistrer un paiement</h2>
      
      {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm border border-red-100">{error}</div>}
      {success && <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm border border-green-100">{success}</div>}

      {/* RECHERCHE ÉTUDIANT */}
      <div className="flex flex-col gap-2 relative">
        <label className="font-semibold text-slate-700">Étudiant *</label>
        <input
          type="text"
          className="border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#db9b16] outline-none transition"
          placeholder="Taper le nom ou l'email..."
          value={userSearch}
          onChange={e => {
            setUserSearch(e.target.value);
            setShowUserResults(true);
            if (form.userId) setForm(f => ({ ...f, userId: "" })); // Reset ID si on modifie le texte
          }}
          onFocus={() => setShowUserResults(true)}
        />
        
        {/* Liste des résultats suggérés */}
        {showUserResults && userSearch.length > 1 && (
          <div className="absolute top-full left-0 w-full bg-white border border-slate-200 rounded-lg shadow-xl z-50 mt-1 overflow-hidden">
            {filteredUsers.length > 0 ? (
              filteredUsers.map(u => (
                <div
                  key={u.id}
                  className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-none flex flex-col"
                  onClick={() => handleSelectUser(u)}
                >
                  <span className="font-medium text-slate-900">{u.fullName}</span>
                  <span className="text-xs text-slate-500">{u.email}</span>
                </div>
              ))
            ) : (
              <div className="p-3 text-sm text-slate-400">Aucun étudiant trouvé</div>
            )}
          </div>
        )}
          {userSearch && !form.userId && !showUserResults && (
           <span className="text-xs text-red-500 font-medium italic">Sélectionnez un étudiant dans la liste pour valider.</span>
          )}
          {form.userId && !showUserResults && (
            <span className="text-xs text-green-600 font-medium italic">✓ Étudiant sélectionné</span>
          )}
      </div>

      {/* RECHERCHE UNIVERSITÉ */}
      <div className="flex flex-col gap-2">
        <label className="font-semibold text-slate-700">Université *</label>
        <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg bg-slate-50 p-2">
          {universities.map(u => (
            <label key={u.id} className={`flex items-center gap-2 p-2 rounded cursor-pointer transition ${form.universityId === u.id ? 'bg-[#db9b16]/10 border border-[#db9b16]/20' : 'hover:bg-white'}`}>
              <input
                type="radio"
                className="accent-[#db9b16]"
                checked={form.universityId === u.id}
                onChange={() => setForm(f => ({ ...f, universityId: u.id }))}
              />
              <span className="text-sm text-slate-700">{u.name} <span className="text-[10px] text-slate-400 uppercase">({u.city})</span></span>
            </label>
          ))}
          {!form.universityId && (
            <div className="p-2 text-xs text-red-500 font-medium italic">Sélectionnez une université dans la liste pour valider.</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-slate-700">Montant *</label>
          <input
            type="number"
            className="border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#db9b16] outline-none"
            value={form.amount}
            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
            min="0"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-slate-700">Devise</label>
          <select
            className="border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#db9b16] outline-none"
            value={form.currency}
            onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
          >
            <option value="XOF">XOF</option>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-slate-700">Méthode</label>
          <select
            className="border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#db9b16] outline-none"
            value={form.method}
            onChange={e => setForm(f => ({ ...f, method: e.target.value }))}
          >
            <option value="CASH">Cash</option>
            <option value="ORANGE_MONEY">Orange Money</option>
            <option value="MOOV_MONEY">Moov Money</option>
            <option value="TRANSFER">Virement</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-slate-700">Référence</label>
          <input
            type="text"
            className="border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#db9b16] outline-none"
            placeholder="N° de reçu, transaction..."
            value={form.reference}
            onChange={e => setForm(f => ({ ...f, reference: e.target.value }))}
          />
        </div>
      </div>

      <button
        type="submit"
        className="bg-[#db9b16] text-white font-bold py-3 px-4 rounded-xl hover:bg-[#b8860b] transition shadow-lg shadow-[#db9b16]/20 disabled:opacity-50 mt-2"
        disabled={mutation.isPending || !form.userId || !form.universityId || !form.amount}
      >
        {mutation.isPending ? "Enregistrement..." : "Enregistrer le paiement"}
      </button>
    </form>
  );
}
