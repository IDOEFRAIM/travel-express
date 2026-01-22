

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getSupabasePublicUrl } from '@/lib/storage';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UniversityDetailPage({ params }: PageProps) {
  const { id } = await params;
  if (!id) return notFound();
  const university = await prisma.university.findUnique({ where: { id } });
  if (!university) return notFound();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{university.name}</h1>
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">{university.city}</span>
        </div>
        <Link href="/admin/universities" className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 font-medium">Retour</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="space-y-6">
          <div className="bg-white shadow rounded-xl p-6 border">
            <h2 className="text-xs font-bold uppercase text-gray-500 mb-2">Description</h2>
            <p className="text-gray-800 text-base">{university.description || "Aucune description disponible."}</p>
          </div>
          <div className="bg-white shadow rounded-xl p-6 border">
            <h2 className="text-xs font-bold uppercase text-gray-500 mb-2">Résumé</h2>
            <p className="text-gray-800 text-base">{university.summary || "Non renseigné."}</p>
          </div>
          <div className="bg-blue-50 shadow rounded-xl p-6 border">
            <p className="text-blue-900 text-lg font-semibold">
              Coût estimé : <span className="font-bold">{university.costRange || "Contacter l'établissement"}</span>
            </p>
          </div>
        </section>
        <section className="flex items-center justify-center">
          {university.imageUrl ? (
            <div className="relative h-72 w-full max-w-md overflow-hidden rounded-xl shadow-lg border-2 border-blue-100 flex items-center justify-center">
              <img 
                src={
                  university.imageUrl.startsWith('http')
                    ? university.imageUrl
                    : getSupabasePublicUrl(university.imageUrl)
                }
                alt={university.name}
                className="object-cover w-full h-full"
              />
            </div>
          ) : university.images && university.images.length > 0 ? (
            <div className="relative h-72 w-full max-w-md overflow-hidden rounded-xl shadow-lg border-2 border-blue-100 flex items-center justify-center">
              <img 
                src={
                  university.images[0].startsWith('http')
                    ? university.images[0]
                    : getSupabasePublicUrl(university.images[0])
                }
                alt={university.name}
                className="object-cover w-full h-full"
              />
            </div>
          ) : (
            <div className="h-72 w-full max-w-md bg-gray-100 flex items-center justify-center rounded-xl border-2 border-dashed border-gray-300">
              <p className="text-gray-400">Aucune image disponible</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}