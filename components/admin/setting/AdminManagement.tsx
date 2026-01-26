'use client';

import { useEffect, useState, useTransition } from 'react';
import { getAdminsAction, getAllUsersAction, updateUserRoleAction } from '@/actions/auth.actions';
import { Search, UserPlus, X, Trash2, Loader2, ShieldCheck, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useDebounce } from "@/hooks/use-deboubce";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const AdminManagement = () => {
  const [admins, setAdmins] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  
  const debouncedSearch = useDebounce(searchTerm, 300);

  const loadData = async () => {
    setLoading(true);
    try {
      const [adminList, userList] = await Promise.all([
        getAdminsAction(),
        getAllUsersAction()
      ]);
      setAdmins(adminList);
      setAllUsers(userList);
    } catch (error) {
      toast.error("Erreur de synchronisation des comptes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleUpdateRole = (userId: string, role: 'ADMIN' | 'STUDENT', name: string) => {
    startTransition(async () => {
      const res = await updateUserRoleAction(userId, role);
      if (res.success) {
        toast.success(`${name} est maintenant ${role === 'ADMIN' ? 'Administrateur' : 'Utilisateur'}`);
        setShowPicker(false);
        loadData();
      } else {
        toast.error(res.error || "Action impossible");
      }
    });
  };

  const filteredUsers = allUsers.filter(u => 
    (u.fullName?.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
     u.email?.toLowerCase().includes(debouncedSearch.toLowerCase())) &&
    u.role !== 'ADMIN' // On ne montre que ceux qui ne sont pas déjà admins
  );

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center">
              <ShieldCheck className="text-[#db9b16]" size={22} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">Équipe Admin</h2>
          </div>
          <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest ml-1">
            Contrôle des privilèges et accès système
          </p>
        </div>
        
        <Button 
          onClick={() => setShowPicker(true)}
          className="bg-[#db9b16] hover:bg-slate-900 text-white rounded-[1.25rem] font-black uppercase tracking-widest text-[10px] h-14 px-8 transition-all shadow-lg shadow-[#db9b16]/20 active:scale-95"
        >
          <UserPlus size={18} className="mr-3" strokeWidth={3} /> Promouvoir Admin
        </Button>
      </header>

      {/* ADMINS TABLE / LIST */}
      <div className="grid gap-4">
        <div className="flex items-center gap-2 px-4 mb-2">
            <div className="h-1.5 w-1.5 rounded-full bg-[#db9b16] animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Administrateurs Actifs ({admins.length})</span>
        </div>

        {loading ? (
          <div className="bg-white rounded-[2rem] p-20 flex flex-col items-center justify-center border border-slate-100">
             <Loader2 className="animate-spin text-[#db9b16] mb-4" size={40} strokeWidth={2.5} />
             <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sécurisation de la liste...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {admins.map(admin => (
              <div key={admin.id} className="group flex items-center justify-between p-6 bg-white rounded-[2rem] border border-slate-100 hover:border-[#db9b16]/30 transition-all shadow-sm">
                <div className="flex items-center gap-5">
                  <div className="h-14 w-14 rounded-2xl bg-slate-900 text-[#db9b16] flex items-center justify-center font-black text-xl shadow-inner group-hover:scale-110 transition-transform">
                    {admin.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-black text-slate-900 text-base uppercase italic leading-tight">{admin.fullName}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1">{admin.email}</p>
                  </div>
                </div>
                
                <button 
                  disabled={isPending}
                  onClick={() => handleUpdateRole(admin.id, 'STUDENT', admin.fullName)}
                  className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all disabled:opacity-50"
                  title="Révoquer l'accès"
                >
                  <Trash2 size={18} strokeWidth={2.5} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL PICKER */}
      {showPicker && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
            <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-black text-xl uppercase italic tracking-tighter">Nouveau Privilège</h3>
                <p className="text-[#db9b16] text-[10px] font-bold uppercase tracking-widest opacity-80 mt-1">Élévation de rôle utilisateur</p>
              </div>
              <button 
                onClick={() => setShowPicker(false)}
                className="h-12 w-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-red-500 hover:text-white transition-all"
              >
                <X size={24} strokeWidth={3} />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#db9b16] transition-colors" size={20} />
                <input 
                  autoFocus
                  placeholder="Chercher par nom ou email..."
                  className="w-full pl-14 pr-6 py-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-[#db9b16]/20 focus:bg-white outline-none transition-all font-bold text-sm"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="max-h-[350px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                {filteredUsers.length > 0 ? filteredUsers.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-[1.5rem] transition-all group border border-transparent hover:border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-[#db9b16] transition-colors">
                            <UserIcon size={18} />
                        </div>
                        <div>
                            <p className="font-black text-slate-800 text-sm uppercase tracking-tight">{user.fullName}</p>
                            <p className="text-[10px] text-slate-400 font-bold tracking-tighter uppercase">{user.email}</p>
                        </div>
                    </div>
                    <button 
                      disabled={isPending}
                      onClick={() => handleUpdateRole(user.id, 'ADMIN', user.fullName)}
                      className="bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest px-5 py-3 rounded-xl hover:bg-[#db9b16] transition-all transform active:scale-95 disabled:opacity-50"
                    >
                      {isPending ? <Loader2 className="animate-spin" size={14} /> : "Nommer Admin"}
                    </button>
                  </div>
                )) : debouncedSearch.length >= 2 ? (
                  <div className="py-12 text-center opacity-40 italic font-bold text-slate-400 text-sm">
                    Aucun utilisateur ne correspond à votre recherche.
                  </div>
                ) : (
                    <div className="py-12 text-center opacity-20">
                        <UserPlus size={48} className="mx-auto mb-2" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">En attente de saisie...</p>
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminManagement;