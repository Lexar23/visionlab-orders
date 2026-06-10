
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";

const TaskCreateSchema = z.object({
    description: z.string().trim().min(1).max(500),
    daysToDeliver: z.union([z.number().int().positive(), z.string().trim().min(1)]),
    owner: z.string().trim().min(1).max(128),
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
        const body = TaskCreateSchema.safeParse(await req.json());
        if (!body.success) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        const daysToDeliver =
            typeof body.data.daysToDeliver === "string"
                ? Number.parseInt(body.data.daysToDeliver, 10)
                : body.data.daysToDeliver;

        if (!Number.isFinite(daysToDeliver) || daysToDeliver <= 0) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        const task = await prisma.task.create({
            data: {
                id: randomUUID(),
                description: body.data.description,
                daysToDeliver,
                owner: body.data.owner,
            },
            select: {
                id: true,
                description: true,
                daysToDeliver: true,
                owner: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return NextResponse.json(task);
    } catch (err: unknown) {
        console.error("Task error:", err);
        return NextResponse.json({ error: toErrorMessage(err) }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = parseLimit(searchParams.get("limit"));
        const cursor = searchParams.get("cursor");

        const tasks = await prisma.task.findMany({
            where: cursor
                ? { createdAt: { lt: new Date(cursor) } }
                : undefined,
            orderBy: { createdAt: "desc" },
            take: limit,
            select: {
                id: true,
                description: true,
                daysToDeliver: true,
                owner: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        const hasMore = tasks.length === limit;
        const nextCursor = hasMore
            ? tasks[tasks.length - 1]?.createdAt?.toISOString()
            : undefined;

        return NextResponse.json(tasks, {
            headers: {
                "X-Has-More": hasMore ? "1" : "0",
                ...(nextCursor ? { "X-Next-Cursor": nextCursor } : {}),
            },
        });
    } catch (err: unknown) {
        return NextResponse.json({ error: toErrorMessage(err) }, { status: 500 });
    }
}
