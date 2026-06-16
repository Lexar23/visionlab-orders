
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { OrderStatus } from "@/constants/status";

const OrderPatchSchema = z.object({
    status: z.nativeEnum(OrderStatus).optional(),
    observations: z.string().trim().max(2000).optional(),
    isUrgent: z.boolean().optional(),
}).strict();

function toErrorMessage(err: unknown) {
    if (err instanceof Error) return err.message;
    return "Unknown error";
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prisma.order.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        return NextResponse.json({ error: toErrorMessage(err) }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = OrderPatchSchema.safeParse(await req.json());
        if (!body.success) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        const updateData: Record<string, unknown> = {};

        if (body.data.status) {
            updateData.status = body.data.status;
            if (body.data.status === OrderStatus.DELIVERED) {
                updateData.deliveredAt = new Date();
            }
        }

        if (typeof body.data.observations === "string") {
            updateData.observations = body.data.observations;
        }

        if (typeof body.data.isUrgent === "boolean") {
            updateData.isUrgent = body.data.isUrgent;
        }

        const updated = await prisma.order.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                orderNumber: true,
                patientName: true,
                branch: true,
                invoice: true,
                startDate: true,
                status: true,
                observations: true,
                deliveredAt: true,
                isUrgent: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return NextResponse.json(updated);
    } catch (err: unknown) {
        return NextResponse.json({ error: toErrorMessage(err) }, { status: 500 });
    }
}
