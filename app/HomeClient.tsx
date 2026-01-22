"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MapPin, Heart, Star, GraduationCap, Zap, Globe, ShieldCheck, Flag } from "lucide-react";
import { ApplyButton } from "@/components/catalog/ApplyButton";
import { Button } from "@/components/ui/Button";
import { SearchBar } from "@/components/catalog/SearchBar";
import { CategoryFilters } from "@/components/catalog/CategoryFilters";

// --- Types ---
interface University {
  id: string | number;
  name: string;
  location: string;
  image?: string;
  rating?: number;
  category?: string;
  country?: string;
}

interface HomeClientProps {
  universities: University[];
  isConnected: boolean;
}

export default function HomeClient({ universities, isConnected }: HomeClientProps) {
  // --- Refs pour le Parallaxe ---
  const goldBlobRef = useRef<HTMLDivElement>(null);
  const pinkBlobRef = useRef<HTMLDivElement>(null);
  const yellowBlobRef = useRef<HTMLDivElement>(null);

  // --- Effet Parallaxe Optimisé (60 FPS) ---
  useEffect(() => {
    let ticking = false;

    const updateParallax = () => {
      const scrollY = window.scrollY;

      // Utilisation de translate3d pour forcer l'accélération matérielle (GPU)
      if (goldBlobRef.current) {
        goldBlobRef.current.style.transform = `translate3d(-50%, ${scrollY * 0.15}px, 0)`;
      }
      if (pinkBlobRef.current) {
        pinkBlobRef.current.style.transform = `translate3d(0, ${scrollY * 0.25}px, 0)`;
      }
      if (yellowBlobRef.current) {
        yellowBlobRef.current.style.transform = `translate3d(0, ${scrollY * 0.35}px, 0)`;
      }

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-[#db9b16] selection:text-white">
      
      {/* 🏮 SECTION 1 : HERO DYNAMIQUE */}
      <section className="relative overflow-hidden bg-white pb-20 border-b border-slate-100">
        <div className="absolute inset-0 -z-20" aria-hidden="true">
          <div className="w-full h-full" style={{ background: 'radial-gradient(ellipse at top right, #fef3c7 0%, #fff 100%)' }} />
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            {/* Blobs animés par le scroll */}
            <div 
              ref={goldBlobRef} 
              className="absolute left-1/2 top-0 w-150 h-75 bg-[#db9b16]/20 rounded-full blur-[100px]"
              style={{ zIndex: 1, transform: 'translateX(-50%)' }} // Initial state
            />
            <div ref={pinkBlobRef} className="absolute right-0 top-20 w-80 h-80 bg-pink-400/10 rounded-full blur-3xl" />
            <div ref={yellowBlobRef} className="absolute left-0 bottom-0 w-96 h-96 bg-yellow-300/10 rounded-full blur-3xl" />
          </div>
        </div>

        <header className="container mx-auto px-6 pt-6 relative z-10">
          <nav className="flex items-center justify-between mb-20">
            <Link href="/" className="text-2xl font-black tracking-tighter text-slate-900 flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="h-8 w-8 bg-[#db9b16] rounded-lg flex items-center justify-center text-white text-xs animate-bounce">TE</div>
              Travel Express
            </Link>
            
            <div className="flex gap-4 items-center">
              {!isConnected ? (
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="font-semibold text-slate-600">Connexion</Button>
                </Link>
              ) : (
                <>
                  <form action={require('@/actions/logout.action').logoutAction}>
                  <Button type="submit" variant="ghost" size="sm" className="font-semibold text-slate-600 hover:text-slate-900">
                    Déconnexion
                  </Button>
                </form>
                  <Link href="/student/dashboard">
                    <Button variant="glow" size="sm" className="rounded-full px-6 bg-[#db9b16] text-white hover:bg-[#b88212]">Suivre mes candidatures</Button>
                  </Link>
                </>
              )}
              <Link href="#catalogue">
                <Button variant="glow" size="sm" className="rounded-full px-6 bg-[#db9b16] text-white hover:bg-[#b88212]">Catalogue</Button>
              </Link>
            </div>
          </nav>

          <div className="max-w-3xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm text-slate-600 text-xs font-bold uppercase mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Admissions 2026 Ouvertes
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 leading-[1.1]">
              Explorez la Chine, la France et l'Allemagne <br/>
              <span className="text-[#db9b16]">comme jamais avant.</span>
            </h1>
            <p className="text-xl text-slate-500 max-w-xl mx-auto mb-12">
              La première plateforme qui connecte les talents africains aux meilleures universités en Chine, France et Allemagne. Simple. Transparent. Digital.
            </p>
            <SearchBar />
          </div>
        </header>
      </section>

      {/* 🏷️ SECTION 2 : CATALOGUE */}
      <main id="catalogue" className="container mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div>
            <img src="/images/logo.png" alt="Travel Express Logo" className="h-14 w-auto mb-2" />
            <p className="text-slate-500 mt-2 font-medium">{universities.length} établissements disponibles</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {universities.map((uni: University) => (
            <div 
              key={uni.id} 
              className="group bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-[#db9b16]/10 transition-all duration-500 hover:-translate-y-2"
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={uni.image || "https://images.unsplash.com/photo-1541339907198-e08756defeec?auto=format&fit=crop&w=800&q=80"} 
                  alt={uni.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 right-4">
                  <button className="p-2 rounded-full bg-white/90 backdrop-blur-md text-slate-400 hover:text-red-500 transition-colors shadow-sm">
                    <Heart className="w-5 h-5" />
                  </button>
                </div>
                <div className="absolute bottom-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-[#db9b16] text-white text-xs font-bold uppercase tracking-wider">
                    {uni.category || "Premium"}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-1 text-yellow-500 mb-3">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-bold text-slate-900">{uni.rating || "4.8"}</span>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#db9b16] transition-colors mb-2">
                  {uni.name}
                </h3>
                
                <div className="flex items-center gap-2 text-slate-500 mb-6">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{uni.location}</span>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                  <ApplyButton isConnected={isConnected} universityId={uni.id.toString()} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {universities.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <GraduationCap className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900">Aucune université trouvée</h3>
            <p className="text-slate-500">Essayez de modifier vos critères de recherche.</p>
          </div>
        )}
      </main>

      {/* ⭐ SECTION 3 : AMBITION (Sombre / Premium) */}
      <section className="bg-[#020617] py-24 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#db9b16]/10 rounded-full blur-[120px] -translate-x-1/2" />
        
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                Plus qu'une agence,<br />
                <span className="text-[#db9b16]">votre partenaire de réussite.</span>
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed max-w-xl">
                Chez <strong className="text-white">Travel Express</strong>, nous ne croyons pas à la chance. Nous croyons à la préparation, à la stratégie et à l'ambition.
              </p>
            </div>

            <div className="space-y-6">
              <p className="text-slate-300 font-medium italic border-l-4 border-[#db9b16] pl-6 py-2">
                "Nous ne vendons pas des admissions, nous construisons des carrières internationales."
              </p>
              <p className="text-slate-400">
                Notre philosophie est simple : <strong className="text-white">L'excellence n'est pas une option.</strong> Nous sélectionnons les profils les plus déterminés.
              </p>
            </div>

            <Button variant="glow" size="lg" className="rounded-full bg-[#db9b16] hover:bg-[#b88212] text-white shadow-lg shadow-[#db9b16]/20">
              Rejoindre l'élite chinoise
            </Button>
          </div>

          <div className="relative group flex justify-center lg:justify-end">
            <div className="absolute -inset-1 bg-linear-to-tr from-[#db9b16] to-[#020617] rounded-4xl blur opacity-20 transition duration-1000 group-hover:opacity-40"></div>
            <div className="relative bg-[#0f172a] rounded-[2.5rem] w-full max-w-md aspect-square flex items-center justify-center border border-white/10 overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756defeec?q=80&w=800')] bg-cover bg-center opacity-10 grayscale" />
              <div className="relative z-10 bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-3xl text-center">
                <div className="text-7xl font-black text-white mb-2 tracking-tighter">98%</div>
                <div className="text-[#db9b16] font-bold uppercase tracking-[0.2em] text-xs mb-4">Taux de réussite</div>
                <div className="text-slate-500 text-sm">Sur plus de 500 dossiers traités</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🧠 SECTION 4 : MINDSET */}
      <section className="bg-white py-24 px-6 relative overflow-hidden">
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
              Le Mindset Travel Express
            </h2>
            <p className="text-lg text-slate-500 font-medium">
              Ce qui nous différencie des autres ? Absolument tout.
            </p>
          </div>


          {/* Classement par pays */}
          {Object.entries(
            universities.reduce((acc, uni) => {
              const country = uni.country || 'Autre';
              (acc[country] = acc[country] || []).push(uni);
              return acc;
            }, {} as Record<string, University[]>)
          ).map(([country, unis]) => (
            <section key={country} className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <Flag className="text-[#db9b16]" size={28} />
                <h2 className="text-2xl font-extrabold text-[#db9b16] tracking-tight uppercase drop-shadow-sm">{country}</h2>
                <span className="bg-[#db9b16]/10 text-[#db9b16] text-xs font-bold px-3 py-1 rounded-full ml-2">{unis.length} université{unis.length > 1 ? 's' : ''}</span>
              </div>
              {/* Catalogue groupé par pays, format simple */}
              <section className="mb-12">
                <h2 className="text-2xl font-extrabold text-[#db9b16] tracking-tight uppercase mb-4">{country}</h2>
                <ul className="space-y-2">
                  {unis.map((uni: University) => (
                    <li key={uni.id} className="bg-white rounded-xl border border-slate-100 p-4 flex flex-col md:flex-row md:items-center md:gap-6 shadow-sm">
                      <div className="flex-1">
                        <div className="font-bold text-lg text-slate-900">{uni.name}</div>
                        <div className="text-xs text-slate-500 mb-1">{uni.location}</div>
                        <div className="flex items-center gap-2 text-yellow-500 mb-1">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm font-bold text-slate-900">{uni.rating || "4.8"}</span>
                        </div>
                        <span className="inline-block px-2 py-0.5 rounded bg-[#db9b16]/10 text-[#db9b16] text-xs font-bold uppercase tracking-wider mr-2">{uni.category || "Premium"}</span>
                      </div>
                      <div className="mt-2 md:mt-0">
                        <ApplyButton isConnected={isConnected} universityId={uni.id.toString()} />
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            </section>
          ))}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-10 rounded-[2.5rem] bg-white border border-slate-100 transition-all duration-500 hover:-translate-y-4 hover:border-[#db9b16] hover:shadow-2xl hover:shadow-[#db9b16]/10 group cursor-default">
              <div className="mb-8 group-hover:scale-110 transition-transform duration-500">
                 <ShieldCheck className="w-10 h-10 text-[#db9b16]" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Review IA</h3>
              <p className="text-slate-500 leading-relaxed font-medium">
                Analyse auto de vos documents pour éviter les rejets.
              </p>
            </div>

            <div className="p-10 rounded-[2.5rem] bg-white border border-slate-100 transition-all duration-500 hover:-translate-y-4 hover:border-[#db9b16] hover:shadow-2xl hover:shadow-[#db9b16]/10 group cursor-default">
              <div className="mb-8 group-hover:scale-110 transition-transform duration-500">
                <Zap className="w-10 h-10 text-[#db9b16]" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Visa Express</h3>
              <p className="text-slate-500 leading-relaxed font-medium">
                Formulaire JW202 obtenu en un temps record.
              </p>
            </div>

            <div className="p-10 rounded-[2.5rem] bg-white border border-slate-100 transition-all duration-500 hover:-translate-y-4 hover:border-[#db9b16] hover:shadow-2xl hover:shadow-[#db9b16]/10 group cursor-default">
              <div className="mb-8 group-hover:scale-110 transition-transform duration-500">
                <Globe className="w-10 h-10 text-[#db9b16]" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Communauté</h3>
              <p className="text-slate-500 leading-relaxed font-medium">
                Rejoignez 500+ étudiants déjà sur place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-100 py-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="text-4xl font-black text-[#db9b16] tracking-tighter">
              Travel Express
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
              L'excellence à votre portée
            </p>
          </div>
          
          <div className="flex gap-8 text-xs font-bold text-slate-500 uppercase tracking-widest">
            <Link href="#" className="hover:text-[#db9b16] transition-colors">Politique</Link>
            <Link href="#" className="hover:text-[#db9b16] transition-colors">Conditions</Link>
            <Link href="#" className="hover:text-[#db9b16] transition-colors">Contact</Link>
          </div>

          <p className="text-slate-400 text-sm font-medium italic">
            © {new Date().getFullYear()} Travel Express. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}