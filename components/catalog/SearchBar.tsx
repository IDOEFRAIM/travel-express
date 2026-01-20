'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('search') || '');

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set('search', query);
    } else {
      params.delete('search');
    }
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    /* Changement de l'ombre de blue-900 à #db9b16/10 et ajout d'un ring au focus */
    <div className="bg-white p-2 rounded-full shadow-2xl shadow-[#db9b16]/10 max-w-2xl mx-auto flex items-center border border-slate-100 relative z-20 hover:shadow-[#db9b16]/20 transition-all duration-300 focus-within:border-[#db9b16]/50 focus-within:ring-4 focus-within:ring-[#db9b16]/5">
      <div className="pl-6 pr-4 text-slate-400">
        {/* L'icône peut rester neutre ou passer en doré au focus */}
        <Search size={22} className="group-focus-within:text-[#db9b16] transition-colors" />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Quelle ville ou université cherchez-vous ?"
        className="flex-1 h-12 outline-none text-slate-900 placeholder:text-slate-400 font-medium bg-transparent"
      />
      <div className="h-8 w-px bg-slate-200 mx-2"></div>
      
      <button className="hidden md:flex items-center gap-2 px-6 py-3 hover:bg-[#db9b16]/5 rounded-full text-slate-600 hover:text-[#db9b16] font-bold text-sm transition-colors">
        <SlidersHorizontal size={16} />
        Filtres
      </button>

      <button 
        onClick={handleSearch}
        /* Remplacement du bleu par #db9b16 */
        className="bg-[#db9b16] hover:bg-[#c48a14] text-white h-12 w-12 md:w-auto md:px-8 rounded-full font-bold shadow-lg shadow-[#db9b16]/20 transition-all flex items-center justify-center gap-2 active:scale-95"
      >
        <span className="hidden md:inline">Explorer</span>
        <div className="md:hidden"><Search size={20} /></div>
      </button>
    </div>
  );
}