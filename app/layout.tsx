import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cookies } from "next/headers";
import ReactQueryProvider from "./ReactQueryProvider";
import Navbar from "@/components/Navbar";
import { prisma } from "@/lib/prisma"; // Assure-toi d'avoir cet import

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Agence Études Chine | Votre Avenir Commence Ici 🚀",
  description: "La plateforme n°1 pour les étudiants souhaitant étudier en Chine.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('user_id')?.value;
  
  let userData = null;



if (userId) {
  userData = await prisma.user.findUnique({
    where: { id: userId.trim() },
    select: { 
      role: true,
      fullName: true 
    }
   
  })
}
const isAdmin = userData?.role?.toUpperCase() == 'ADMIN';

console.log('userfata',userData,"userid",userId)
  return (
    <html lang="fr">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Navbar 
isConnected={!!userId} 
  userRole={userData?.role} 
  userName={userData?.fullName || undefined}
        />
        <ReactQueryProvider>
          <main className={isAdmin ? "" : "pt-20"}> {/* Ajout d'un padding pour compenser la Navbar fixed */}
            {children}
          </main>
        </ReactQueryProvider>
      </body>
    </html>
  );
}