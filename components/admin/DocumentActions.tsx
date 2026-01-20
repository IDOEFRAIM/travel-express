'use client';

import { verifyDocumentAction } from "@/actions/document.actions";
import { Button } from "@/components/ui/Button";
import { Check, X } from "lucide-react";
import { useTransition } from "react";

export function DocumentActions({ id, currentStatus }: { id: string, currentStatus: string }) {
  const [isPending, startTransition] = useTransition();

  const handleVerify = (status: 'APPROVED' | 'REJECTED') => {
    startTransition(async () => {
        try {
            await verifyDocumentAction(id, status);
        } catch(e) {
            alert("Erreur");
        }
    });
  };

  if (currentStatus === 'APPROVED') {
      return <span className="text-green-600 text-xs font-bold px-2 py-1 bg-green-100 rounded-full flex items-center gap-1"><Check size={12}/> Validé</span>;
  }
  
  if (currentStatus === 'REJECTED') {
      return <span className="text-red-600 text-xs font-bold px-2 py-1 bg-red-100 rounded-full flex items-center gap-1"><X size={12}/> Rejeté</span>;
  }

  return (
    <div className="flex gap-2">
      <Button 
        onClick={() => handleVerify('APPROVED')} 
        size="sm" 
        className="h-8 w-8 p-0 bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-900 border-none rounded-full"
        isLoading={isPending}
        title="Valider"
      >
        <Check size={16} />
      </Button>
      <Button 
        onClick={() => handleVerify('REJECTED')} 
        size="sm" 
        className="h-8 w-8 p-0 bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-900 border-none rounded-full"
        isLoading={isPending}
        title="Rejeter"
      >
        <X size={16} />
      </Button>
    </div>
  );
}
