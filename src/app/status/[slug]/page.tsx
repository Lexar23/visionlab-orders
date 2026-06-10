import { StatusPageFeature } from "@/features/status/StatusPageFeature";
import { OrderStatus } from "@/constants/status";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Order } from "@/types/order";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const status = Object.values(OrderStatus).find(
        (s) => s.toLowerCase() === slug.toLowerCase()
    );

    if (!status) {
        return notFound();
    }

    // Fetch orders by status using Prisma
    const whereClause: any = {
        status: status
    };

    // If delivered, only show for 1 week
    if (status === OrderStatus.DELIVERED) {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        whereClause.deliveredAt = {
            gte: oneWeekAgo
        };
    }

    const dbOrders = await prisma.order.findMany({
        where: whereClause,
        orderBy: {
            createdAt: 'desc'
        }
    });

    return <StatusPageFeature status={status} initialOrders={dbOrders as Order[]} />;
}
