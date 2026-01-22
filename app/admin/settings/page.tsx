"use client";
import { SettingsView } from "@/components/admin/SettingsView";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

export default function SettingsPage() {
  const { data: settings = {}, isLoading, error } = useQuery({
    queryKey: ["adminSettings"],
    queryFn: async () => {
      const res = await axios.get("/api/admin/settings");
      return res.data.settings || {};
    },
  });

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur lors du chargement des paramètres.</div>;

  return (
    <main className="p-8 md:p-12 max-w-5xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-slate-800">Paramètres</h1>
        <p className="text-slate-500 font-medium mt-1">
          Gérez votre compte et les configurations de l'agence
        </p>
      </header>

      <SettingsView user={settings} />
    </main>
  );
}