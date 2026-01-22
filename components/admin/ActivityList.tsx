'use client';

import { useState } from "react";
import { Bell, FileText, CheckCircle, UserPlus, FileCheck, XCircle, ArrowUpCircle, Filter } from "lucide-react";
import { Button } from "@/components/ui/Button";

export type ActivityItem = {
  id: string;
  type: 'APP_NEW' | 'APP_UPDATE' | 'DOC_NEW' | 'DOC_VERIFIED' | 'DOC_REJECTED';
  title: string;
  description: string;
  date: Date;
  user: string;
  icon?: any;
  color: string;
};

// Map types back to icons since functions/components cant be passed from server easily
const ICONS = {
    'APP_NEW': UserPlus,
    'APP_UPDATE': ArrowUpCircle,
    'DOC_NEW': FileText,
    'DOC_VERIFIED': FileCheck,
    'DOC_REJECTED': XCircle
};


// Couleurs par type d'activité
const TYPE_COLORS: Record<string, string> = {
  'APP_NEW': 'bg-blue-500',
  'APP_UPDATE': 'bg-blue-400',
  'DOC_NEW': 'bg-purple-500',
  'DOC_VERIFIED': 'bg-green-500',
  'DOC_REJECTED': 'bg-red-500',
};

export function ActivityList({ initialActivities }: { initialActivities: ActivityItem[] }) {
  const [filter, setFilter] = useState<'ALL' | 'APP' | 'DOC'>('ALL');
  const [dateFilter, setDateFilter] = useState('');

  // Ajoute une couleur par défaut selon le type si absente
  const activitiesWithColor = initialActivities.map(item => ({
    ...item,
    color: item.color || TYPE_COLORS[item.type] || 'bg-slate-300',
  }));

  const filteredItems = activitiesWithColor.filter(item => {
    // Type Filter
    const matchType = 
       filter === 'ALL' ? true :
       filter === 'APP' ? (item.type && item.type.startsWith('APP')) :
       filter === 'DOC' ? (item.type && item.type.startsWith('DOC')) : true;

    if (!matchType) return false;

    // Date Filter
    if (dateFilter) {
       const itemDate = new Date(item.date).toISOString().split('T')[0];
       return itemDate === dateFilter;
    }

    return true;
  });

  // Group by Day
  const grouped = filteredItems.reduce((acc, item) => {
     const dateKey = new Date(item.date).toLocaleDateString();
     if (!acc[dateKey]) acc[dateKey] = [];
     acc[dateKey].push(item);
     return acc;
  }, {} as Record<string, ActivityItem[]>);

  return (
    <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            {/* FILTER TABS */}
            <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit">
            <button 
                onClick={() => setFilter('ALL')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'ALL' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Tout
            </button>
            <button 
                onClick={() => setFilter('APP')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'APP' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Dossiers
            </button>
            <button 
                onClick={() => setFilter('DOC')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'DOC' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Documents
            </button>
            </div>

            {/* DATE FILTER */}
            <div className="flex items-center gap-3 bg-white border border-slate-200 p-2 pl-4 rounded-xl shadow-sm">
                <span className="text-slate-400 text-sm font-bold">Le:</span>
                <input 
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="outline-none text-slate-600 font-medium bg-transparent text-sm active:bg-transparent"
                />
                {dateFilter && (
                    <button 
                        onClick={() => setDateFilter('')}
                        className="text-slate-300 hover:text-red-500 transition-colors"
                        title="Effacer la date"
                    >
                        <XCircle size={18} />
                    </button>
                )}
            </div>
        </div>

      <div className="space-y-12">
         {Object.entries(grouped).map(([date, items]) => (
            <div key={date} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <h3 className="font-bold text-slate-400 text-sm uppercase tracking-wider mb-6 pl-14">{date}</h3>
               
               <div className="space-y-0 text-slate-500 border-l-2 border-slate-100 ml-4">
                  {items.map((item) => {
                      const Icon = ICONS[item.type] || Bell;
                      return (
                      <div key={item.id} className="relative pl-10 py-4 first:pt-0 last:pb-0 group">
                         {/* Timeline Dot */}
                         <div className={`absolute -left-2.25 top-4 h-4.5 w-4.5 rounded-full border-4 border-white ${item.color} shadow-sm group-hover:scale-110 transition-transform`}></div>
                         
                         <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100/50 hover:shadow-md transition-all duration-300 flex items-start gap-4">
                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${item.color || 'bg-slate-300'} bg-opacity-10`}>
                               <Icon size={24} className={(item.color ? item.color.replace('bg-', 'text-') : 'text-slate-400')} />
                            </div>
                            <div className="flex-1">
                               <div className="flex justify-between items-start">
                                  <h4 className="font-bold text-slate-800 text-sm">{item.title}</h4>
                                  <span className="text-xs font-medium text-slate-400 font-mono">
                                     {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                               </div>
                               <p className="text-sm text-slate-500 mt-1 leading-relaxed">{item.description}</p>
                               <div className="flex items-center gap-2 mt-3">
                                  <div className="h-5 w-5 rounded-full bg-slate-100 overflow-hidden">
                                     <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.user}`} alt="User" />
                                  </div>
                                  <span className="text-xs font-bold text-slate-400">{item.user}</span>
                               </div>
                            </div>
                         </div>
                      </div>
                  )})}
               </div>
            </div>
         ))}
         
         {filteredItems.length === 0 && (
             <div className="text-center py-20 text-slate-400 font-medium bg-white rounded-3xl border border-slate-100/50">
                Aucune activité trouvée pour ce filtre.
             </div>
         )}
      </div>
    </div>
  );
}
