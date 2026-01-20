'use client';

import { updateApplicationStatusAction, rejectApplicationAction } from "@/actions/application.actions";
import { useState, useTransition } from "react";
import { Check, ChevronDown, Loader2, AlertTriangle, X } from "lucide-react";

const STATUSES = [
    { value: 'DRAFT', label: 'Brouillon' },
    { value: 'SUBMITTED', label: 'Soumis' },
    { value: 'UNDER_REVIEW', label: 'En Analyse' },
    { value: 'ACCEPTED', label: 'Admis' },
    { value: 'JW202_RECEIVED', label: 'JW202 Reçu' },
    { value: 'VISA_GRANTED', label: 'Visa Obtenu' },
    { value: 'FLIGHT_BOOKED', label: 'Vol Réservé' },
    { value: 'COMPLETED', label: 'Terminé' },
    { value: 'REJECTED', label: 'Rejeté' },
];

export function ApplicationStatusControl({ id, currentStatus }: { id: string, currentStatus: string }) {
    const [isPending, startTransition] = useTransition();
    const [isOpen, setIsOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");

    const handleSelect = (status: string) => {
        if (status === currentStatus) return;
        
        if (status === 'REJECTED') {
            setIsOpen(false);
            setIsRejectModalOpen(true);
            return;
        }

        startTransition(async () => {
            try {
                await updateApplicationStatusAction(id, status);
                setIsOpen(false);
            } catch (e) {
                alert("Erreur lors de la mise à jour");
            }
        });
    };

    const handleConfirmRejection = () => {
        if (!rejectionReason.trim()) {
            alert("Veuillez indiquer une raison.");
            return;
        }
        
        startTransition(async () => {
            try {
                await rejectApplicationAction(id, rejectionReason);
                setIsRejectModalOpen(false);
            } catch (e) {
                alert("Erreur lors du rejet");
            }
        });
    };

    const currentLabel = STATUSES.find(s => s.value === currentStatus)?.label || currentStatus;

    return (
        <>
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                disabled={isPending}
                className={`flex items-center gap-3 border shadow-sm px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors w-56 justify-between ${
                    currentStatus === 'REJECTED' ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'
                }`}
            >
                <div className="text-left">
                    <div className={
                        `text-[10px] font-bold uppercase tracking-widest ${currentStatus === 'REJECTED' ? 'text-red-400' : 'text-slate-400'}`
                    }>Statut Actuel</div>
                    <div className={`font-bold text-sm flex items-center gap-2 ${currentStatus === 'REJECTED' ? 'text-red-700' : 'text-blue-600'}`}>
                        {isPending && <Loader2 size={12} className="animate-spin" />}
                        {currentLabel}
                    </div>
                </div>
                <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''} ${currentStatus === 'REJECTED' ? 'text-red-400' : 'text-slate-400'}`} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-100 shadow-xl rounded-xl overflow-hidden z-20 py-1 animate-in fade-in zoom-in-95 duration-200">
                        {STATUSES.map((status) => (
                            <button
                                key={status.value}
                                onClick={() => handleSelect(status.value)}
                                className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-slate-50 flex items-center justify-between ${
                                    status.value === currentStatus ? 'text-blue-600 bg-blue-50' : 
                                    status.value === 'REJECTED' ? 'text-red-600 hover:bg-red-50' : 'text-slate-600'
                                }`}
                            >
                                {status.label}
                                {status.value === currentStatus && <Check size={14} />}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>

        {/* Modal Rejet */}
        {isRejectModalOpen && (
             <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
                <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl scale-100 animate-in zoom-in-95">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <AlertTriangle className="text-red-500" size={20}/>
                            Rejeter le dossier
                        </h3>
                        <button onClick={() => setIsRejectModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                            <X size={20} />
                        </button>
                    </div>
                    
                    <p className="text-slate-500 text-sm mb-4">
                        Cette action informera l'étudiant que son dossier est refusé. Veuillez indiquer la raison ci-dessous.
                    </p>

                    <textarea 
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Ex: Documents illisibles, manque le diplôme du Bac..."
                        className="w-full h-32 p-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-red-500/20 outline-none text-slate-700 mb-6 resize-none"
                    ></textarea>

                    <div className="flex justify-end gap-3">
                        <button 
                            onClick={() => setIsRejectModalOpen(false)}
                            className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                            Annuler
                        </button>
                        <button 
                            onClick={handleConfirmRejection}
                            disabled={isPending}
                            className="px-4 py-2 font-bold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                        >
                            {isPending && <Loader2 size={16} className="animate-spin" />}
                            Confirmer le rejet
                        </button>
                    </div>
                </div>
             </div>
        )}
        </>
    );
}