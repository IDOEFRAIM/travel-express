import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  // Récupère les 15 dernières activités (documents, candidatures, paiements...)
  const [docs, apps, timeline] = await Promise.all([
    prisma.document.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        application: { include: { user: true } }
      }
    }),
    prisma.application.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { user: true, university: true }
    }),
    prisma.activity.findMany({
      orderBy: { date: "desc" },
      take: 15
    })
  ]);

  // Mappe les documents en activités
  const docActivities = docs.map(doc => ({
    id: doc.id,
    type:
      doc.status === "APPROVED" ? "DOC_VERIFIED" :
      doc.status === "REJECTED" ? "DOC_REJECTED" :
      "DOC_NEW",
    title: doc.name,
    description:
      doc.status === "APPROVED"
        ? `Document validé pour ${doc.application?.user?.fullName || 'un étudiant'}`
        : doc.status === "REJECTED"
        ? `Document rejeté pour ${doc.application?.user?.fullName || 'un étudiant'}`
        : `Nouveau document soumis par ${doc.application?.user?.fullName || 'un étudiant'}`,
    date: doc.createdAt,
    user: doc.application?.user?.fullName || 'Inconnu',
    color:
      doc.status === "APPROVED" ? "bg-green-500" :
      doc.status === "REJECTED" ? "bg-red-500" :
      "bg-purple-500",
  }));

  // Mappe les candidatures en activités
  const appActivities = apps.map(app => ({
    id: app.id,
    type: app.status === "SUBMITTED" ? "APP_NEW" : "APP_UPDATE",
    title: app.university?.name ? `Candidature - ${app.university.name}` : "Nouvelle candidature",
    description:
      app.status === "SUBMITTED"
        ? `${app.user?.fullName || 'Un étudiant'} a soumis une nouvelle candidature.`
        : `${app.user?.fullName || 'Un étudiant'} a mis à jour sa candidature.`,
    date: app.createdAt,
    user: app.user?.fullName || 'Inconnu',
    color: app.status === "SUBMITTED" ? "bg-blue-500" : "bg-blue-400",
  }));

  // Mappe les activités de la timeline (paiements, suppressions...)
  const timelineActivities = timeline.map(act => ({
    id: act.id,
    type: act.type,
    title: act.title,
    description: act.description,
    date: act.date,
    user: act.user,
    color: act.color,
    refId: act.refId,
  }));

  // Fusionne et trie toutes les activités par date décroissante
  const activities = [...docActivities, ...appActivities, ...timelineActivities].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return NextResponse.json({ activities });
}
