
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const SettingsSchema = z.object({
    branches: z.array(z.string()).default([]),
    workers: z.array(z.string()).default([]),
    taskOwners: z.array(z.string()).default([]),
}).strict();

function normalizeNames(items: string[]) {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const raw of items) {
        const value = String(raw || "").trim();
        if (!value) continue;
        const key = value.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(value);
        if (out.length >= 200) break;
    }
    return out;
}

async function syncNames(
    model: "branch" | "worker" | "taskOwner",
    names: string[]
) {
    // Obtener existentes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing = await (prisma[model] as any).findMany({ select: { name: true } }) as { name: string }[];
    const existingNames = new Set(existing.map((r) => r.name.toLowerCase()));
    const desiredNames = new Set(names.map((n) => n.toLowerCase()));

    const toInsert = names.filter((n) => !existingNames.has(n.toLowerCase()));
    const toDelete = existing
        .map((r) => r.name)
        .filter((n) => !desiredNames.has(n.toLowerCase()));

    if (toDelete.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (prisma[model] as any).deleteMany({ where: { name: { in: toDelete } } });
    }

    if (toInsert.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (prisma[model] as any).createMany({
            data: toInsert.map((name) => ({ name })),
            skipDuplicates: true,
        });
    }
}

export async function GET() {
    try {
        const [branches, workers, taskOwners] = await Promise.all([
            prisma.branch.findMany({ select: { name: true }, orderBy: { name: "asc" } }),
            prisma.worker.findMany({ select: { name: true }, orderBy: { name: "asc" } }),
            prisma.taskOwner.findMany({ select: { name: true }, orderBy: { name: "asc" } }),
        ]);

        return NextResponse.json({
            branches: branches.map((b) => b.name),
            workers: workers.map((w) => w.name),
            taskOwners: taskOwners.map((t) => t.name),
        }, {
            headers: { "Cache-Control": "no-store, max-age=0" },
        });
    } catch (err: unknown) {
        console.error("Error fetching settings:", err);
        return NextResponse.json({ error: "Error fetching settings" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {

        const parsed = SettingsSchema.safeParse(await req.json());
        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        const branches = normalizeNames(parsed.data.branches);
        const workers = normalizeNames(parsed.data.workers);
        const taskOwners = normalizeNames(parsed.data.taskOwners);

        await Promise.all([
            syncNames("branch", branches),
            syncNames("worker", workers),
            syncNames("taskOwner", taskOwners),
        ]);

        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        console.error("Settings error:", err);
        const message = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
