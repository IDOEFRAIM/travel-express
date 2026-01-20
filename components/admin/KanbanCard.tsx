'use client';

import { updateApplicationStatus, deleteApplication } from "@/actions/admin.actions";
import { ApplicationStatus } from "@prisma/client";
import { useTransition } from "react";
import { Button } from "@/components/ui/Button";

interface KanbanCardProps {
  application: any; // On typerait mieux dans un vrai projet
}

export function KanbanCard({ application }: KanbanCardProps) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as ApplicationStatus;
    startTransition(async () => {
      await updateApplicationStatus(application.id, newStatus);
    });
  };

  const handleDelete = () => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce dossier ?")) {
        startTransition(async () => {
            await deleteApplication(application.id);
        });
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-3 hover:shadow-md transition">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-slate-800">{application.user.fullName}</h3>
        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-medium">
          {application.progress}%
        </span>
      </div>
      
      <p className="text-sm text-slate-500 mb-1">{application.university.name}</p>
      <p className="text-xs text-slate-400 mb-3">{new Date(application.createdAt).toLocaleDateString()}</p>

      <div className="flex gap-2 items-center">
        <select 
            disabled={isPending}
            value={application.status} 
            onChange={handleStatusChange}
            className="text-xs border border-slate-300 rounded px-2 py-1 bg-slate-50 w-full outline-none focus:border-blue-500"
        >
            <option value="DRAFT">Brouillon</option>
            <option value="SUBMITTED">Soumis</option>
            <option value="UNDER_REVIEW">Analyse Univ.</option>
            <option value="ACCEPTED">Accepté ✅</option>
            <option value="JW202_RECEIVED">Visa (JW202)</option>
            <option value="VISA_GRANTED">Visa OK ✈️</option>
            <option value="COMPLETED">Terminé</option>
        </select>
        
        <button 
            onClick={handleDelete}
            className="text-slate-400 hover:text-red-500 transition px-1"
            title="Supprimer"
        >
            ×
        </button>
      </div>
    </div>
  );
}
