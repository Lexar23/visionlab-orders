
import { OrderStatus } from "@/constants/status";

export interface Order {
    id: string;
    orderNumber: string;
    patientName?: string | null;
    branch: string;
    invoice: string;
    startDate: string; // ISO Date
    status: OrderStatus;
    observations: string;
    deliveredAt?: string; // ISO Date
    createdAt: string;
    updatedAt: string;
}

export interface Task {
    id: string;
    description: string;
    daysToDeliver: number; // For the counter
    owner?: string;
    createdAt: string;
    updatedAt: string;
}
