'use client';

import { deleteApplicationAction } from "@/actions/application.actions";
import { Loader2, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";

interface DeleteApplicationButtonProps {
    applicationId: string;
    studentName?: string | null;
}

export function DeleteApplicationButton({ applicationId, studentName }: DeleteApplicationButtonProps) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        const name = studentName ? `de ${studentName}` : "ce dossier";
        if (!confirm(`Êtes-vous sûr de vouloir supprimer le dossier ${name} ? Cette action est irréversible (documents inclus).`)) return;

        startTransition(async () => {
            await deleteApplicationAction(applicationId);
        });
    }

    return (
        <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDelete}
            isLoading={isPending}
            className="h-9 w-9 p-0 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
            title="Supprimer le dossier"
        >
            {isPending ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={18} />}
        </Button>
    )
}