interface DeletePaymentRequest extends Request {
    url: string;
}

interface DeletePaymentResponse {
    success?: boolean;
    error?: string;
}

export async function DELETE(req: DeletePaymentRequest): Promise<Response> {
    try {
        const { searchParams } = new URL(req.url);
        const paymentId: string | null = searchParams.get("id");
        if (!paymentId) return NextResponse.json({ error: "ID manquant" } as DeletePaymentResponse, { status: 400 });

        // Récupère le paiement avant suppression pour les infos
        const payment: Payment | null = await prisma.payment.findUnique({ where: { id: paymentId } });

        // Supprime l'activité liée au paiement si elle existe
        await prisma.activity.deleteMany({ where: { refId: paymentId, type: 'PAYMENT_NEW' } });

        // Supprime le paiement
        await prisma.payment.delete({ where: { id: paymentId } });

        // Trace la suppression dans les activités
        if (payment) {
            await prisma.activity.create({
                data: {
                    type: 'PAYMENT_DELETE',
                    title: `Suppression paiement ${payment.amount} ${payment.currency}`,
                    description: `Un paiement de ${payment.amount} ${payment.currency} a été supprimé.`,
                    date: new Date(),
                    user: payment.userId || 'Inconnu',
                    color: 'bg-red-500',
                    refId: paymentId,
                }
            });
        }

        return NextResponse.json({ success: true } as DeletePaymentResponse);
    } catch (error) {
        return NextResponse.json({ error: "Erreur lors de la suppression du paiement" } as DeletePaymentResponse, { status: 500 });
    }
}
interface PaymentBody {
    userId: string;
    universityId: string;
    amount: number;
    currency: string;
    method: string;
    status: string;
    reference?: string;
    fullName?: string;
}

interface University {
    costRange?: string | null;
}

interface Payment {
    amount: number | string;
    userId?: string;
    currency?: string;
}

export async function POST(req: Request): Promise<Response> {
    try {
        const body: PaymentBody = await req.json();

        // Récupère le montant total attendu (costRange) pour cette université
        const university: University | null = await prisma.university.findUnique({
            where: { id: body.universityId },
            select: { costRange: true }
        });
        const costRange: number = university?.costRange ? parseFloat(university.costRange) : 0;

        // Calcule le total déjà payé par l'utilisateur pour cette université
        const payments: Payment[] = await prisma.payment.findMany({
            where: {
                userId: body.userId,
                universityId: body.universityId
            }
        });
        const totalPaid: number = payments.reduce((sum, p) => sum + (typeof p.amount === 'string' ? parseFloat(p.amount) : p.amount), 0);
        const reste: number = costRange - totalPaid;

        // Vérifie que le paiement proposé est <= au reste à payer
        if (body.amount > reste) {
            return NextResponse.json({ error: `Le montant saisi (${body.amount}) dépasse le reste à payer (${reste}).` }, { status: 400 });
        }

        const payment = await prisma.payment.create({
            data: {
                userId: body.userId,
                universityId: body.universityId,
                amount: body.amount,
                currency: body.currency,
                method: body.method as any, // Cast to PaymentMethod if you have the enum imported, e.g. as PaymentMethod
                status: body.status as any, // Cast to PaymentStatus if you have the enum imported, e.g. as PaymentStatus
                reference: body.reference,
            }
        });

        // Crée une activité liée au paiement
        await prisma.activity.create({
            data: {
                type: 'PAYMENT_NEW',
                title: `Paiement de ${payment.amount} ${payment.currency}`,
                description: `${body.fullName || 'Un utilisateur'} a enregistré un paiement de ${payment.amount} ${payment.currency}.`,
                date: payment.createdAt,
                user: body.fullName || 'Inconnu',
                color: 'bg-yellow-500',
                refId: payment.id,
            }
        });

        return NextResponse.json({ payment });
    } catch (error) {
        return NextResponse.json({ error: 'Erreur lors de la création du paiement' }, { status: 500 });
    }
}
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface GetPaymentsRequest extends Request {
    url: string;
}

interface UniversityInfo {
    name: string;
    costRange?: string | null;
}

interface PaymentWithUniversity {
    id: string;
    userId: string;
    universityId: string;
    amount: number | string;
    currency: string;
    method: string;
    status: string;
    reference?: string;
    createdAt: Date;
    university: UniversityInfo;
}

interface PaymentsResponse {
    payments: PaymentWithUniversity[];
}

interface ErrorResponse {
    error: string;
}

export async function GET(req: GetPaymentsRequest): Promise<Response> {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    try {
        if (!userId) return NextResponse.json({ payments: [] } as PaymentsResponse);
        // Récupérer aussi le costRange de chaque université liée à un paiement
        const rawPayments = await prisma.payment.findMany({
            where: { userId },
            include: { university: { select: { name: true, costRange: true } } },
            orderBy: { createdAt: "desc" },
        });
        const payments: PaymentWithUniversity[] = rawPayments.map((p) => ({
            ...p,
            reference: p.reference === null ? undefined : p.reference,
        }));
        return NextResponse.json({ payments } as PaymentsResponse);
    } catch (error) {
        return NextResponse.json({ error: "Erreur lors de la récupération des paiements" } as ErrorResponse, { status: 500 });
    }
}
                                                                                                                                                                       