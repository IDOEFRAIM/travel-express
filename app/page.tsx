import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import HomeClient from "./HomeClient";

/**
 * Interface pour les paramètres de recherche
 */
interface SearchParams {
  category?: string;
  search?: string;
}

export default async function Home(props: { 
  searchParams: Promise<SearchParams> 
}) {
  
  /**
   * Logique de récupération des universités avec filtres Prisma
   */
  async function getUniversities(category?: string, search?: string) {
    const andConditions: any[] = [];

    // Recherche textuelle multi-champs
    if (search) {
      andConditions.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ]
      });
    }

    // Filtres de catégories spécifiques
    if (category && category !== 'all') {
      if (category === 'engineering') {
        andConditions.push({ programs: { contains: 'Ingénierie', mode: 'insensitive' } });
      } else if (category === 'medicine') {
        andConditions.push({ programs: { contains: 'Médecine', mode: 'insensitive' } });
      } else if (category === 'scholarship') {
        andConditions.push({
          OR: [
            { description: { contains: 'Bourse', mode: 'insensitive' } },
            { costRange: { contains: 'Gratuit', mode: 'insensitive' } }
          ]
        });
      } else if (category === 'big_city') {
        andConditions.push({ city: { in: ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen'] } });
      }
    }

    const where = andConditions.length > 0 ? { AND: andConditions } : {};

    return await prisma.university.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  // Next.js 15: On attend la résolution des searchParams et des cookies
  const searchParams = await props.searchParams;
  const universitiesRaw = await getUniversities(searchParams.category, searchParams.search);
  // Adapter les champs pour correspondre à l'interface University attendue par HomeClient
  const universities = universitiesRaw.map((u: any) => ({
    id: u.id,
    name: u.name,
    location: u.city, // city -> location
    image:
      Array.isArray(u.images) && u.images.length > 0
        ? u.images[0]
        : "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80",
    rating: 4.8, // valeur par défaut ou à calculer si disponible
    category: u.programs ?? undefined,
  }));
  const cookieStore = await cookies();
  const isConnected = !!cookieStore.get('user_id');

  return <HomeClient universities={universities} isConnected={isConnected} />;
}