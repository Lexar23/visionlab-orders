
'use client';

import React, { useState, useEffect } from 'react';
import { Order } from '@/types/order';
import { OrderCard } from '@/components/orders/OrderCard';
import { OrderStatus, STATUS_LABELS } from '@/constants/status';
import { cn } from '@/lib/utils';
import { Search, Filter, PackageOpen, LayoutGrid, List } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface StatusPageProps {
    status: OrderStatus;
    initialOrders: Order[];
}

export const StatusPageFeature = ({ status, initialOrders }: StatusPageProps) => {
    const isDelivered = status === OrderStatus.DELIVERED;
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const [searchQuery, setSearchQuery] = useState('');

    // Update if props change
    useEffect(() => {
        setOrders(initialOrders);
    }, [initialOrders]);

    const handleUpdateStatus = async (id: string, newStatus: OrderStatus) => {
        const previousOrders = [...orders];
        // Optimistic update: remove it from current list since it changed status
        setOrders(prev => prev.filter(o => o.id !== id));

        try {
            const response = await fetch(`/api/orders/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                setOrders(previousOrders);
                alert("Error al actualizar el estado");
            }
        } catch (error) {
            setOrders(previousOrders);
            alert("Error de conexión");
        }
    };

    const filteredOrders = orders.filter(order => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            order.orderNumber.toLowerCase().includes(query) ||
            order.branch.toLowerCase().includes(query) ||
            order.patientName?.toLowerCase().includes(query) ||
            order.invoice.toLowerCase().includes(query)
        );
    });

    return (
        <main className="min-h-screen bg-[#fcfcfd] pb-20">
            <div className="mx-auto max-w-[1400px] px-6 lg:px-12 py-10">

                {/* Header Section */}
                <header className="mb-12 flex flex-col md:flex-row items-center justify-between gap-8 border-b border-gray-100 pb-10">
                    <div className="flex flex-col items-center md:items-start gap-3">
                        <div className={cn(
                            "flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg shadow-gray-200",
                            isDelivered ? "bg-gray-100/80 text-gray-500" : "bg-blue-600 shadow-blue-200 text-white"
                        )}>
                            <PackageOpen className="h-8 w-8" />
                        </div>
                        <div className="text-center md:text-left">
                            <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-gray-900">{STATUS_LABELS[status]}</h1>
                            <p className="text-lg font-medium text-gray-400 mt-1">
                                Visualizando {orders.length} {orders.length === 1 ? 'orden' : 'órdenes'} en este estado
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-white/50 p-2 rounded-2xl ring-1 ring-black/5 shadow-sm">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por orden..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-12 w-64 pl-12 pr-4 bg-transparent border-0 rounded-xl focus:ring-2 focus:ring-blue-100 font-medium transition-all"
                            />
                        </div>
                        <button className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-black/5 hover:bg-gray-50 transition-colors">
                            <Filter className="h-5 w-5 text-gray-600" />
                        </button>
                    </div>
                </header>

                {/* Grid Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                    {filteredOrders.length > 0 ? (
                        filteredOrders.map(order => (
                            <div key={order.id} className="relative group">
                                {isDelivered && (
                                    <div className="absolute -top-2.5 left-4 z-10 px-2.5 py-0.5 rounded-md bg-green-100 border border-green-200 text-green-700 text-[9px] font-black uppercase tracking-widest shadow-sm">
                                        Hace {formatDistanceToNow(new Date(order.deliveredAt || order.updatedAt), { locale: es })}
                                    </div>
                                )}
                                <OrderCard order={order} onUpdateStatus={handleUpdateStatus} />
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full flex flex-col items-center justify-center py-40 border-2 border-dashed border-gray-100 rounded-[3rem]">
                            <div className="h-20 w-20 flex items-center justify-center rounded-full bg-gray-50 mb-6 group-hover:scale-110 transition-transform">
                                <PackageOpen className="h-10 w-10 text-gray-200" />
                            </div>
                            <h3 className="text-xl font-black text-gray-400 italic">No hay órdenes para mostrar aquí</h3>
                            <p className="text-gray-300 font-medium mt-1">El flujo de trabajo está despejado</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};
