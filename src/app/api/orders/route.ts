
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { OrderStatus } from "@/constants/status";

const OrderCreateSchema = z.object({
    orderNumber: z.string().trim().min(1).max(64),
    patientName: z.string().trim().max(128).optional(),
    branch: z.string().trim().min(1).max(128),
    invoice: z.string().trim().min(1).max(128),
    startDate: z.string().trim().min(1),
    status: z.nativeEnum(OrderStatus).optional(),
});

function parseLimit(value: string | null) {
    const parsed = Number.parseInt(value || "", 10);
    if (!Number.isFinite(parsed) || parsed <= 0) return 2000;
    return Math.min(parsed, 5000);
}

function toErrorMessage(err: unknown) {
    if (err instanceof Error) return err.message;
    return "Unknown error";
}

export async function POST(req: Request) {
    try {
        const body = OrderCreateSchema.safeParse(await req.json());
        if (!body.success) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        const order = await prisma.order.create({
            data: {
                id: randomUUID(),
                orderNumber: body.data.orderNumber,
                patientName: body.data.patientName || null,
                branch: body.data.branch,
                invoice: body.data.invoice,
                startDate: new Date(body.data.startDate),
                status: body.data.status || "PENDIENTE",
            },
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
                createdAt: true,
                updatedAt: true,
            },
        });

        return NextResponse.json(order);
    } catch (err: unknown) {
        console.error("Order error:", err);
        return NextResponse.json({ error: toErrorMessage(err) }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = parseLimit(searchParams.get("limit"));
        const cursor = searchParams.get("cursor");

        const orders = await prisma.order.findMany({
            where: cursor
                ? { createdAt: { lt: new Date(cursor) } }
                : undefined,
            orderBy: { createdAt: "desc" },
            take: limit,
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
                createdAt: true,
                updatedAt: true,
            },
        });

        const hasMore = orders.length === limit;
        const nextCursor = hasMore
            ? orders[orders.length - 1]?.createdAt?.toISOString()
            : undefined;

        return NextResponse.json(orders, {
            headers: {
                "X-Has-More": hasMore ? "1" : "0",
                ...(nextCursor ? { "X-Next-Cursor": nextCursor } : {}),
            },
        });
    } catch (err: unknown) {
        return NextResponse.json({ error: toErrorMessage(err) }, { status: 500 });
    }
}
