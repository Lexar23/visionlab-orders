
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const TaskPatchSchema = z.object({
    description: z.string().trim().min(1).max(500).optional(),
    owner: z.string().trim().min(1).max(128).optional(),
    daysToDeliver: z.union([z.number().int().positive(), z.string().trim().min(1)]).optional(),
}).strict();

function toErrorMessage(err: unknown) {
    if (err instanceof Error) return err.message;
    return "Unknown error";
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prisma.task.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        return NextResponse.json({ error: toErrorMessage(err) }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = TaskPatchSchema.safeParse(await req.json());
        if (!body.success) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        const updateData: Record<string, unknown> = {};

        if (typeof body.data.description === "string") updateData.description = body.data.description;
        if (typeof body.data.owner === "string") updateData.owner = body.data.owner;
        if (body.data.daysToDeliver !== undefined) {
            const parsedDays =
                typeof body.data.daysToDeliver === "string"
                    ? Number.parseInt(body.data.daysToDeliver, 10)
                    : body.data.daysToDeliver;
            if (!Number.isFinite(parsedDays) || parsedDays <= 0) {
                return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
            }
            updateData.daysToDeliver = parsedDays;
        }

        const updated = await prisma.task.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                description: true,
                daysToDeliver: true,
                owner: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return NextResponse.json(updated);
    } catch (err: unknown) {
        return NextResponse.json({ error: toErrorMessage(err) }, { status: 500 });
    }
}
