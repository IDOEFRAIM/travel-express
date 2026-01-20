'use client';
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

export default function AdminFinancesPage() {
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
    <main>
      {/* Affichage des finances */}
      {/* ... */}
    </main>
  );
}
