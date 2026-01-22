"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function AdminUniversitiesPage() {
  const queryClient = useQueryClient();

  const { data: universities = [], isLoading, error } = useQuery({
    queryKey: ["universities"],
    queryFn: async () => {
      const res = await axios.get("/api/universities");
      return res.data.universities || [];
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await axios.delete(`/api/universities/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["universities"]);
    }
  });

  function handleDelete(id) {
    if (!confirm("Supprimer cette université ?")) return;
    deleteMutation.mutate(id);
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-blue-50 to-slate-100 py-12 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-slate-100 p-10">
        <h1 className="text-3xl font-extrabold text-blue-700 mb-8 text-center tracking-tight">Toutes les universités proposées</h1>
        {isLoading ? (
          <div>Chargement...</div>
        ) : error ? (
          <div className="text-red-500">{error.message}</div>
        ) : (
          // Regroupement par pays
          Object.entries(
            universities.reduce((acc, u) => {
              const country = u.country || "Autre";
              if (!acc[country]) acc[country] = [];
              acc[country].push(u);
              return acc;
            }, {})
          ).map(([country, unis]) => (
            <div key={country} className="mb-10">
              <h2 className="text-xl font-bold text-blue-700 mb-4 mt-8 uppercase tracking-wide">{country}</h2>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-blue-100">
                    <th className="py-3 px-4 text-left font-bold text-slate-700">Image</th>
                    <th className="py-3 px-4 text-left font-bold text-slate-700">Nom</th>
                    <th className="py-3 px-4 text-left font-bold text-slate-700">Ville</th>
                    <th className="py-3 px-4 text-left font-bold text-slate-700">Détails</th>
                    <th className="py-3 px-4 text-left font-bold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {unis.map((u, idx) => {
                    const imgSrc = u.images && u.images.length > 0 ? u.images[0] : "/images/university-default.png";
                    return (
                      <tr key={u.id} className={idx % 2 === 0 ? "bg-slate-50" : "bg-white"}>
                        <td className="py-3 px-4">
                          <img
                            src={imgSrc}
                            alt={u.name}
                            className="w-16 h-16 object-cover rounded-xl border bg-slate-100"
                            onError={e => { e.currentTarget.src = "/images/university-default.png"; }}
                          />
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800">{u.name}</td>
                        <td className="py-3 px-4 text-slate-600">{u.city}</td>
                        <td className="py-3 px-4">
                          <Link href={`/admin/universities/${u.id}`} className="text-blue-600 hover:underline font-semibold transition-colors">Voir</Link>
                        </td>
                        <td className="py-3 px-4">
                          <Link href={`/admin/universities/${u.id}/edit`} className="mr-4 text-blue-600 hover:underline hover:text-blue-800 font-semibold transition-colors">Modifier</Link>
                          <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:text-red-800 font-semibold hover:underline transition-colors">Supprimer</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
