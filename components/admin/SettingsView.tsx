'use client';

import { useState } from 'react';
import { User, Shield, Bell, Building2, Save, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { updateProfileAction } from '@/actions/user.actions';

export function SettingsView({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <aside className="w-full md:w-64 shrink-0 space-y-2">
            <TabButton 
                active={activeTab === 'profile'} 
                onClick={() => setActiveTab('profile')} 
                icon={User} 
                label="Mon Profil" 
            />
            <TabButton 
                active={activeTab === 'admins'} 
                onClick={() => setActiveTab('admins')} 
                icon={Shield} 
                label="Administrateurs" 
            />
            <TabButton 
                active={activeTab === 'notifications'} 
                onClick={() => setActiveTab('notifications')} 
                icon={Bell} 
                label="Notifications" 
            />
        </aside>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 p-8 min-h-125">
            {activeTab === 'profile' && <ProfileSettings user={user} />}
            {activeTab === 'universities' && <UniversitySettings />}
            {activeTab === 'admins' && <AdminSettings />}
            {activeTab === 'notifications' && <NotificationSettings />}
        </div>
      </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: any) {
    return (
        <button 
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                active 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                : 'bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
        >
            <Icon size={18} />
            {label}
        </button>
    )
}

function ProfileSettings({ user }: { user: any }) {
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        setSuccess(false);
        const res = await updateProfileAction(formData);
        setIsLoading(false);
        if (res.success) {
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        }
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-slate-800">Mon Profil</h2>
                <p className="text-sm text-slate-400">Mettez à jour vos informations personnelles.</p>
            </div>
            <div className="h-px bg-slate-100" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Nom Complet</label>
                    <input 
                        name="fullName" 
                        type="text" 
                        defaultValue={user?.fullName || ''} 
                        className="w-full p-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 font-medium" 
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Email</label>
                    <input 
                        name="email" 
                        type="email" 
                        defaultValue={user?.email || ''} 
                        className="w-full p-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 font-medium" 
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Téléphone</label>
                    <input 
                        name="phone" 
                        type="tel" 
                        defaultValue={user?.phone || ''}
                        placeholder="+221 ..." 
                        className="w-full p-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 font-medium" 
                    />
                </div>
            </div>

            <div className="pt-4 flex items-center gap-4">
                <Button disabled={isLoading} className="flex items-center gap-2">
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </Button>
                {success && (
                    <span className="text-emerald-600 text-sm font-bold flex items-center gap-2 animate-in fade-in">
                        <CheckCircle size={16} /> Modifié avec succès
                    </span>
                )}
            </div>
        </form>
    )
}

import dynamic from 'next/dynamic';
const AddNewUniversity = dynamic(() => import('@/components/admin/AddNewUniversity'), { ssr: false });

function UniversitySettings() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-slate-800">Gestion des Universités</h2>
                <p className="text-sm text-slate-400">Ajoutez ou modifiez les universités partenaires.</p>
            </div>
            <div className="h-px bg-slate-100" />
            <div>
                {/* Formulaire dynamique d'ajout d'université */}
                <AddNewUniversity />
            </div>
        </div>
    )
}

function AdminSettings() {
    return (
        <div className="space-y-6">
             <div>
                <h2 className="text-xl font-bold text-slate-800">Administrateurs</h2>
                <p className="text-sm text-slate-400">Gérez les accès à la plateforme.</p>
            </div>
            <div className="h-px bg-slate-100" />

            <button type="button" className="flex items-center justify-center h-16 w-full border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-bold text-sm hover:border-blue-400 hover:text-blue-500 transition-all">
                + Ajouter un nouvel administrateur
            </button>
        </div>
    )
}

function NotificationSettings() {
     return (
        <div className="space-y-6">
             <div>
                <h2 className="text-xl font-bold text-slate-800">Notifications</h2>
                <p className="text-sm text-slate-400">Configurez les alertes emails.</p>
            </div>
            <div className="h-px bg-slate-100" />
            
            <div className="space-y-4">
                {['Nouveau dossier étudiant', 'Nouveau document reçu', 'Paiement effectué'].map((label, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <span className="font-bold text-slate-700 text-sm">{label}</span>
                        <div className="w-11 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                            <div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full shadow-sm"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}