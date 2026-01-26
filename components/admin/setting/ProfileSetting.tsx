'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, Mail, Phone, Save, Loader2, 
  CheckCircle, AlertCircle, Camera 
} from 'lucide-react';
import { updateProfileAction } from '@/actions/user.actions';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { toast } from "sonner";

export function ProfileSettings({ user }: { user: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  async function handleSubmit(formData: FormData) {
    setFeedback(null);
    
    startTransition(async () => {
        try {
            const res = await updateProfileAction(formData);
            if (res?.success) {
                setFeedback({ type: 'success', msg: 'Profil mis à jour' });
                toast.success("Modifications enregistrées");
                router.refresh(); 
            } else {
                setFeedback({ type: 'error', msg: res?.error || 'Une erreur est survenue' });
            }
        } catch (error) {
            setFeedback({ type: 'error', msg: 'Erreur de connexion' });
        }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* HEADER AVEC AVATAR PLACEHOLDER PRESTIGE */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-50 pb-8">
        <div className="flex items-center gap-6">
            <div className="relative group">
                <div className="h-24 w-24 rounded-[2rem] bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-400 border-4 border-white shadow-xl overflow-hidden">
                    <User size={40} strokeWidth={1.5} />
                </div>
                <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-white rounded-xl shadow-lg border border-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#db9b16] transition-colors cursor-pointer">
                    <Camera size={14} />
                </div>
            </div>
            <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Mon Profil</h2>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Édition des informations de compte</p>
            </div>
        </div>

        <div className="hidden lg:block p-4 bg-emerald-50 rounded-2xl border border-emerald-100/50">
            <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Compte Vérifié</span>
            </div>
        </div>
      </header>
      
      {/* GRILLE DE SAISIE ÉPURÉE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
        <div className="space-y-8">
            <ProfileInputGroup 
                label="Identité complète" 
                name="fullName" 
                defaultValue={user?.fullName} 
                icon={User} 
                placeholder="Ex: Jean Dupont"
                required 
            />
            <ProfileInputGroup 
                label="Adresse Email" 
                name="email" 
                type="email"
                defaultValue={user?.email} 
                icon={Mail} 
                placeholder="contact@exemple.com"
                required 
            />
        </div>

        <div className="space-y-8">
            <ProfileInputGroup 
                label="Ligne Directe" 
                name="phone" 
                type="tel"
                defaultValue={user?.phone} 
                icon={Phone} 
                placeholder="+221 ..." 
            />
            
            <div className="p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 border-dashed">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                    Vos informations sont utilisées uniquement pour la gestion de vos dossiers et les notifications de suivi.
                </p>
            </div>
        </div>
      </div>

      {/* FOOTER D'ACTION */}
      <div className="pt-8 flex flex-col sm:flex-row items-center gap-6 border-t border-slate-50">
        <Button 
          type="submit"
          disabled={isPending} 
          className={cn(
            "h-16 px-12 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center shadow-2xl active:scale-95",
            isPending 
              ? "bg-slate-100 text-slate-400 shadow-none" 
              : "bg-slate-900 hover:bg-[#db9b16] text-white shadow-slate-200"
          )}
        >
          {isPending ? (
            <Loader2 className="animate-spin mr-3" size={18} />
          ) : (
            <Save className="mr-3 text-[#db9b16]" size={18} strokeWidth={3} />
          )}
          {isPending ? "Traitement..." : "Enregistrer"}
        </Button>

        {feedback && (
          <div className={cn(
            "flex items-center gap-3 px-6 py-4 rounded-2xl animate-in slide-in-from-left-4 duration-300",
            feedback.type === 'success' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
          )}>
            {feedback.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span className="text-[10px] font-black uppercase tracking-widest">{feedback.msg}</span>
          </div>
        )}
      </div>
    </form>
  );
}

// Sous-composant spécifique pour un look "Elite"
function ProfileInputGroup({ label, name, type = "text", defaultValue, placeholder, icon: Icon, required }: any) {
    return (
      <div className="group space-y-3">
        <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 ml-1 group-focus-within:text-[#db9b16] transition-colors">
          {label}
        </label>
        <div className="relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-px bg-slate-100 group-focus-within:bg-[#db9b16]/30 transition-colors ml-14" />
          <Icon size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#db9b16] transition-colors" />
          <input 
            name={name}
            type={type}
            required={required}
            defaultValue={defaultValue}
            placeholder={placeholder}
            className="w-full py-5 pl-20 pr-6 rounded-2xl bg-white border-b-2 border-slate-50 hover:bg-slate-50/50 focus:bg-white focus:border-[#db9b16] outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300 shadow-sm"
          />
        </div>
      </div>
    );
}