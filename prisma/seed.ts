import { PrismaClient } from '@prisma/client'

import { ApplicationStatus } from '@prisma/client'

enum Role {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT',
  // Add other roles if needed, matching your Prisma schema
}

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // 1. Créer des Universités
  const uni1 = await prisma.university.create({
    data: {
      name: 'Beijing Language and Culture University (BLCU)',
      city: 'Pékin',
      description: 'La meilleure université pour apprendre le chinois. Campus international.',
      costRange: '3000-4500 USD/an',
      programs: 'Licence Chinois, Master Traduction, Cours de langue (1 an)',
      imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    },
  })

  const uni2 = await prisma.university.create({
    data: {
      name: 'Wuhan University',
      city: 'Wuhan',
      description: 'Une des plus belles universités de Chine. Très forte en médecine et ingénierie.',
      costRange: '2500-4000 USD/an',
      programs: 'Médecine (MBBS), Génie Civil, Informatique',
      imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756defeec?auto=format&fit=crop&w=800&q=80',
    },
  })

  // 2. Créer un Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@agence.com' },
    update: {},
    create: {
      email: 'admin@agence.com',
      password: 'securepassword', // En vrai, il faudrait le hasher (bcrypt)
      fullName: 'Admin Principal',
      role: Role.ADMIN,
    },
  })

  // 3. Créer un Étudiant
  const student = await prisma.user.upsert({
    where: { email: 'etudiant@test.com' },
    update: {},
    create: {
      email: 'etudiant@test.com',
      password: 'password123',
      fullName: 'Ouedraogo Jean',
      phone: '+226 70 00 00 00',
      role: Role.STUDENT,
    },
  })

  // 4. Créer un Dossier de candidature pour l'étudiant
  const app = await prisma.application.create({
    data: {
      userId: student.id,
      universityId: uni1.id,
      desiredProgram: 'Cours de langue (1 an)',
      status: ApplicationStatus.JW202_RECEIVED, // Avancé pour voir la barre de progression
      progress: 60,
    },
  })

  // 5. DATA GENERATION FOR DASHBOARD DEMO
  console.log("Generating extra data for dashboard...");
  
  const statuses = [
    ApplicationStatus.DRAFT, 
    ApplicationStatus.SUBMITTED, 
    ApplicationStatus.UNDER_REVIEW, 
    ApplicationStatus.ACCEPTED, 
    ApplicationStatus.VISA_GRANTED
  ];

  for (let i = 1; i <= 10; i++) {
     const email = `student${i}@test.com`;
     const s = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          email,
          password: 'password123',
          fullName: `Etudiant Test ${i}`,
          role: Role.STUDENT,
        }
     });

     // Create application
     await prisma.application.create({
        data: {
           userId: s.id,
           universityId: i % 2 === 0 ? uni2.id : uni1.id,
           desiredProgram: i % 2 === 0 ? 'Médecine' : 'Licence Chinois',
           status: statuses[i % statuses.length],
           createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000))
        }
     });
  }

  console.log({ uni1, uni2, admin, student, app })
  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
