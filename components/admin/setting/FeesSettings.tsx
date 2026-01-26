'use client';

import { useState, useEffect, useTransition } from 'react';
import { 
  Plus, Loader2, Trash2, Globe, Banknote, Coins, ArrowRight, Wallet 
} from 'lucide-react';
import { getFeesAction, updateFeeAction, deleteFeeAction } from '@/actions/fees.action';
import { Button } from '@/components/ui/Button';
import { toast } from "sonner";

export function FeesSettings() {
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const refreshData = async () => {
    setLoading(true);
    try {
      const data = await getFeesAction();
      setFees(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refreshData(); }, []);

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await updateFeeAction(formData);
      if (res.success) {
        toast.success("Tarification enregistrée");
        (document.getElementById('fee-form') as HTMLFormElement).reset();
        await refreshData();
      } else {
        toast.error("Échec de l'enregistrement");
      }
    });
  }

  return (
    <div className="space-y-10">
      {/* HEADER ÉLÉGANT */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#db9b16]/10 rounded-lg">
              <Coins className="text-[#db9b16]" size={20} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">Tarification</h2>
          </div>
          <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.15em]">Gestion des honoraires par zone géographique</p>
        </div>
        
        <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
          <Wallet size={16} className="text-slate-400" />
          <span className="text-xs font-black text-slate-600 uppercase tracking-widest">{fees.length} Destinations</span>
        </div>
      </header>

      {/* FORMULAIRE D'AJOUT "GLASSMORPHISM" ÉLÉGANT */}
      <form 
        id="fee-form" 
        action={handleSubmit} 
        className="relative group p-1 rounded-[2.5rem] bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 shadow-sm"
      >
        <div className="bg-white rounded-[2.3rem] p-6 flex flex-wrap gap-6 items-end">
          <div className="flex-1 min-w-[240px] space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Destination</label>
            <div className="relative">
              <Globe size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#db9b16]" />
              <input 
                name="country" 
                placeholder="Ex: Canada, France..." 
                className="w-full bg-slate-50 border-none focus:ring-2 focus:ring-[#db9b16]/20 rounded-2xl p-4 pl-14 font-bold text-slate-700 placeholder:text-slate-300 transition-all"
                required
              />
            </div>
          </div>

          <div className="w-full md:w-64 space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Frais (FCFA)</label>
            <div className="relative">
              <Banknote size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#db9b16]" />
              <input 
                name="amount" 
                type="number" 
                placeholder="0.00" 
                className="w-full bg-slate-50 border-none focus:ring-2 focus:ring-[#db9b16]/20 rounded-2xl p-4 pl-14 font-bold text-slate-700 placeholder:text-slate-300 transition-all"
                required
              />
            </div>
          </div>

          <Button 
            disabled={isPending} 
            className="h-[60px] px-8 bg-slate-900 hover:bg-[#db9b16] text-white rounded-2xl font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-slate-200 active:scale-95"
          >
            {isPending ? <Loader2 className="animate-spin" /> : <Plus className="mr-2" size={20} strokeWidth={3} />}
            Ajouter
          </Button>
        </div>
      </form>

      {/* LISTE DES FRAIS - CARTES ÉPURÉES */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex flex-col items-center py-20 bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
            <Loader2 className="animate-spin text-[#db9b16] mb-4" size={32} />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chargement des données...</p>
          </div>
        ) : fees.length > 0 ? (
          fees.map((fee) => (
            <div 
              key={fee.id} 
              className="group flex items-center justify-between p-4 bg-white border border-slate-100 rounded-[2rem] hover:shadow-2xl hover:shadow-slate-200/50 hover:border-[#db9b16]/20 transition-all duration-500"
            >
              <div className="flex items-center gap-5">
                <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 font-black text-xl group-hover:bg-[#db9b16]/10 group-hover:text-[#db9b16] transition-all duration-500">
                  {fee.country.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-black text-slate-900 uppercase tracking-tight group-hover:translate-x-1 transition-transform">{fee.country}</h4>
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-1 h-1 bg-emerald-500 rounded-full" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Tarification active</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-[10px] font-black text-[#db9b16] uppercase tracking-[0.2em] mb-0.5">Montant</p>
                  <p className="font-black text-slate-900 text-2xl tracking-tighter">
                    {Number(fee.amount).toLocaleString()} 
                    <span className="text-[11px] ml-1 text-slate-400">FCFA</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 pr-2">
                  <button 
                    onClick={async () => {
                      if(confirm('Supprimer ce tarif ?')) {
                        startTransition(async () => {
                          await deleteFeeAction(fee.id);
                          await refreshData();
                          toast.success("Destination supprimée");
                        });
                      }
                    }}
                    className="h-12 w-12 flex items-center justify-center rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                  <div className="p-2 bg-slate-50 rounded-xl text-slate-300 group-hover:text-[#db9b16] transition-colors">
                    <ArrowRight size={18} />
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-24 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <Globe size={40} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">Aucune destination configurée</p>
          </div>
        )}
      </div>
    </div>
  );
}