'use client';
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { Bell, Users, FileText, Briefcase, Building2, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
   const { data, isLoading, error } = useQuery({
      queryKey: ["adminDashboard"],
      queryFn: async () => {
         const res = await axios.get("/api/admin/dashboard");
         return res.data;
      }
   });

   const applications = data?.applications || [];
   const pendingApps = applications.filter((a: any) => ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW'].includes(a.status));

   const { data: activitiesData, isLoading: activitiesLoading } = useQuery({
      queryKey: ["recentActivities"],
      queryFn: async () => {
         const res = await axios.get("/api/admin/activities");
         return res.data.activities || [];
      }
   });

   if (isLoading) return <div className="p-8 font-black text-[#db9b16]">Chargement...</div>;
   if (error) return <div className="p-8 text-red-500 font-bold">Erreur dashboard.</div>;

  return (
    <>
      <main className="flex-1 p-8 md:p-12 overflow-y-auto h-screen bg-[#F4F7FE] font-sans">
          {/* HEADER */}
          <header className="flex justify-between items-center mb-12">
            <div>
              <h1 className="text-4xl font-black text-slate-800 tracking-tight">Dashboard</h1>
              <p className="text-slate-400 font-bold mt-1 uppercase text-[10px] tracking-widest">Vue d'ensemble <span className="text-[#db9b16]">Travel Express</span></p>
            </div>
          </header>

          {/* 📊 STATS CARDS */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {[
                  { label: "Utilisateurs", val: data?.studentCount ?? 0, icon: Users, color: "bg-purple-100 text-purple-600" },
                  { label: "Universités", val: data?.universityCount ?? 0, icon: Building2, color: "bg-cyan-100 text-cyan-600" },
                  { label: "Dossiers", val: applications.length, icon: Briefcase, color: "bg-blue-100 text-blue-600" },
                  { label: "Documents", val: data?.documentCount ?? 0, icon: FileText, color: "bg-emerald-100 text-emerald-600" }
              ].map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-[25px] shadow-sm border border-slate-100/50 flex items-center gap-5 hover:-translate-y-1 transition-all duration-300">
                      <div className={`h-16 w-16 rounded-[20px] flex items-center justify-center ${stat.color}`}>
                         <stat.icon size={28} />
                      </div>
                      <div>
                         <div className="text-slate-400 font-black text-[10px] uppercase tracking-wider mb-1">{stat.label}</div>
                         <div className="text-2xl font-black text-slate-800">{stat.val}</div>
                      </div>
                  </div>
              ))}
           </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
             
             {/* 📋 LEFT COLUMN - PENDING APPLICATIONS */}
             <div className="xl:col-span-2 space-y-8">
                <div className="bg-white p-8 rounded-[30px] shadow-sm border border-slate-100/50">
                   <div className="flex justify-between items-center mb-8">
                      <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight border-b-4 border-[#db9b16] pb-1">Pending Applications</h2>
                      <Link href="/admin/students" className="text-[#db9b16] font-black text-xs uppercase tracking-widest hover:underline">View All</Link>
                   </div>
                   
                   <div className="overflow-x-auto">
                     <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                           <tr>
                              <th className="py-4 px-4 rounded-l-xl">File Name</th>
                              <th className="py-4 px-4">Type</th>
                              <th className="py-4 px-4">Date</th>
                              <th className="py-4 px-4 rounded-r-xl text-right">Action</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                           {pendingApps.slice(0, 5).map((app: any, i: number) => (
                              <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                                 <td className="py-5 px-4">
                                    <div className="font-black text-slate-700">#{app.userId.substring(0,8)}...</div>
                                    <div className="text-[10px] text-[#db9b16] font-bold">Admission en cours</div>
                                 </td>
                                 <td className="py-5 px-4 text-slate-500 font-bold text-sm">Dossier</td>
                                 <td className="py-5 px-4 text-slate-500 text-sm">
                                    {new Date(app.updatedAt).toLocaleDateString()}
                                 </td>
                                 <td className="py-5 px-4 text-right">
                                    <Link href={`/admin/applications/${app.id}`} className="text-blue-600 font-black text-sm hover:underline">Review</Link>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                   </div>
                </div>

                {/* RECENT ACTIVITIES */}
                <div className="bg-white p-8 rounded-[30px] shadow-sm border border-slate-100/50">
                    <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-8">Recent Activities</h2>
                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:h-full before:w-0.5 before:bg-slate-100">
                        {activitiesData?.map((activity: any) => (
                        <div key={activity.id} className="relative flex items-center gap-6 group">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full border-4 border-white bg-emerald-500 text-white shadow shrink-0 z-10">
                                <FileText size={12} />
                            </div>
                            <div className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="font-black text-slate-800 text-xs">Document Validé</div>
                                    <time className="font-black text-[#db9b16] text-[10px]">
                                        {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </time>
                                </div>
                                <div className="text-slate-500 text-[11px] font-medium tracking-tight">Fichier "{activity.name}" validé pour le dossier {activity.applicationId.substring(0,8)}...</div>
                            </div>
                        </div>
                        ))}
                    </div>
                </div>
             </div>

             {/* 📈 RIGHT COLUMN - SUMMARY */}
             <div className="space-y-8">
                <div className="bg-white p-8 rounded-[30px] shadow-sm border border-slate-100/50 h-fit">
                   <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight border-b-4 border-[#db9b16] pb-1 w-fit mb-8">Summary</h2>
                   
                   <div className="relative flex items-center justify-center w-full h-40 mb-8">
                      <svg viewBox="0 0 36 36" className="w-36 h-36 transform -rotate-90">
                         <path className="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                         <path className="text-blue-500"
                               strokeDasharray={`${Math.max(0, (pendingApps.length / (applications.length || 1)) * 100 - 4)}, 100`}
                               d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                               fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-800">
                         <span className="text-5xl font-black tracking-tighter">{pendingApps.length}</span>
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending</span>
                      </div>
                   </div>

                   <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs font-bold">
                         <span className="flex items-center gap-2 text-slate-500"><span className="h-2 w-2 rounded-full bg-blue-500"></span> En attente</span>
                         <span className="text-slate-800">{pendingApps.length}</span>
                      </div>
                   </div>
                </div>

                {/* ANALYSIS BAR CHART */}
                <div className="bg-slate-900 p-8 rounded-[30px] shadow-lg border border-slate-800">
                   <h2 className="text-sm font-black text-white uppercase tracking-widest mb-6">Analysis</h2>
                   <div className="h-40 flex items-end justify-between gap-2">
                      {[40, 70, 45, 90, 60, 80].map((h, i) => (
                         <div key={i} className="flex-1 flex gap-1 items-end h-full">
                            <div style={{height: `${h}%`}} className="w-full bg-blue-500 rounded-t-sm opacity-90 hover:bg-[#db9b16] transition-all"></div>
                         </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
      </main>
    </>
  );
}