'use client';
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { ActivityList, ActivityItem } from "@/components/admin/ActivityList";

export default function AdminActivityPage() {
  const { data: activities = [], isLoading, error } = useQuery({
    queryKey: ["adminActivities"],
    queryFn: async () => {
      const res = await axios.get("/api/admin/activities");
      return res.data.activities || [];
    }
  });

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur lors du chargement des activités.Essayez de raffraichir,nous travaillons presentement sur ce probleme</div>;

  return (
    <main className="p-8 md:p-12 max-w-4xl mx-auto">
      <header className="mb-12">
          <h1 className="text-3xl font-bold text-slate-800">Fil d'Activité</h1>
          <p className="text-slate-500 font-medium mt-1">Historique des actions récentes sur la plateforme.</p>
      </header>

      <ActivityList initialActivities={activities} />
    </main>
  );
}
