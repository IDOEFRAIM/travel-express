import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";

interface PaymentUpdateRequest {
    amount: number;
    currency: string;
    userId: string;
    universityId: string;
    method: string;
    status: string;
    reference?: string;
}

interface Params {
    id: string;
}

export async function PUT(
    req: Request,
    context: { params: Promise<Params> | Params }
): Promise<Response> {
    // Correction : params peut être un Promise
    const params = await (context.params as Promise<Params> | Params);
    const id = params.id;
    const {
        amount,
        currency,
        userId,
        universityId,
        method,
        status,
        reference
    } = await req.json();
    if (!amount || !currency || !userId || !universityId || !method || !status) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    try {
        const payment = await prisma.payment.update({
            where: { id: id },
            data: {
                amount: Number(amount),
                currency,
                userId,
                universityId,
                method,
                status,
                reference
            },
        });
        return NextResponse.json(payment);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
