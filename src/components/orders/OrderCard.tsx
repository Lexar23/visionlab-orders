
'use client';

import React, { useState } from 'react';
import { Order } from '@/types/order';
import { cn } from '@/lib/utils';
import { Save, Calendar, Landmark, ReceiptText, Trash2, ChevronDown, ChevronUp, GripVertical, ArrowRightCircle } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { ALLOWED_TRANSITIONS, OrderStatus, STATUS_LABELS } from '@/constants/status';
import type { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';

interface OrderCardProps {
    order: Order;
    onUpdateObservations?: (id: string, obs: string) => Promise<boolean | void>;
    onDelete?: (id: string) => void;
    onUpdateStatus?: (id: string, newStatus: OrderStatus) => Promise<void>;
    dragHandleProps?: DraggableProvidedDragHandleProps | null;
}

export const OrderCard = ({ order, onUpdateObservations, onDelete, onUpdateStatus, dragHandleProps }: OrderCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [observations, setObservations] = useState(order.observations || '');
    const [isSaving, setIsSaving] = useState(false);

    const isDelivered = order.status === OrderStatus.DELIVERED;

    // Simple day calculation for urgency
    const getDaysRemaining = () => {
        const start = new Date(order.startDate);
        const diff = Math.ceil((new Date().getTime() - start.getTime()) / (1000 * 3600 * 24));
        return 3 - diff;
    };

    const getDaysSinceDelivered = () => {
        if (!order.deliveredAt) return 0;
        const delivered = new Date(order.deliveredAt);
        const diff = Math.floor((new Date().getTime() - delivered.getTime()) / (1000 * 3600 * 24));
        return diff;
    };

    const daysRemaining = getDaysRemaining();
    const daysSinceDelivered = getDaysSinceDelivered();

    const getUrgencyColor = (days: number) => {
        if (isDelivered) return 'bg-emerald-500 text-white border-emerald-600';
        if (days === 0) return 'bg-red-500 text-white border-red-600';
        if (days === 1) return 'bg-amber-400 text-amber-950 border-amber-500';
        if (days === 2) return 'bg-blue-500 text-white border-blue-600';
        return 'bg-white text-gray-900 border-gray-200';
    };

    const statusColor = getUrgencyColor(daysRemaining);

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('¿Estás seguro de que deseas eliminar esta orden?')) {
            onDelete?.(order.id);
        }
    };

    const handleSave = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!onUpdateObservations) return;
        setIsSaving(true);
        await onUpdateObservations(order.id, observations);
        setIsSaving(false);
    };

    return (
        <div
            className={cn(
                "group relative overflow-hidden rounded-2xl border bg-white transition-all duration-300 shadow-sm hover:shadow-md",
                isExpanded ? "ring-2 ring-blue-100" : ""
            )}
        >
            {/* Mini View */}
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-between p-3 md:p-4 cursor-pointer select-none gap-2"
            >
                <div className="flex items-center gap-2 md:gap-3 min-w-0">
                    <div {...dragHandleProps} className="p-1 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing flex-shrink-0">
                        <GripVertical className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-black uppercase tracking-tight text-gray-400 leading-none mb-1">Orden</span>
                        <span className="text-base md:text-lg font-black tracking-tight leading-none text-gray-900 truncate">#{order.orderNumber}</span>
                        {order.patientName && (
                            <span className="text-xs font-bold text-gray-500 truncate mt-0.5">{order.patientName}</span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                    {/* Info Breve */}
                    {!isExpanded && (
                        <div className="hidden sm:flex items-center gap-2 md:gap-3 min-w-0 max-w-[120px] lg:max-w-none">
                            <div className="flex items-center gap-1 text-xs font-bold text-gray-500 truncate">
                                <Landmark className="h-3 w-3 flex-shrink-0 opacity-50" />
                                <span className="truncate">{order.branch}</span>
                            </div>
                            <div className="h-3 w-[1px] bg-gray-100 flex-shrink-0" />
                            <div className="flex items-center gap-1 text-xs font-bold text-gray-500 truncate">
                                <ReceiptText className="h-3 w-3 flex-shrink-0 opacity-50" />
                                <span className="truncate">{order.invoice}</span>
                            </div>
                        </div>
                    )}

                    <div className={cn(
                        "flex h-7 w-12 md:h-8 md:w-14 items-center justify-center rounded-lg font-black text-xs border shadow-sm flex-shrink-0",
                        statusColor
                    )}>
                        {isDelivered ? `+${daysSinceDelivered}d` : `${daysRemaining}d`}
                    </div>

                    <div className="flex-shrink-0">
                        {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                    </div>
                </div>
            </div>

            {/* Expanded View */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="px-5 pb-5 pt-2 border-t border-gray-50 bg-gray-50/30">
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Sucursal</span>
                                    <div className="flex items-center gap-2 font-bold text-gray-700">
                                        <Landmark className="h-4 w-4 text-blue-500/50" />
                                        {order.branch}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Factura</span>
                                    <div className="flex items-center gap-2 font-bold text-gray-700">
                                        <ReceiptText className="h-4 w-4 text-blue-500/50" />
                                        {order.invoice}
                                    </div>
                                </div>
                                <div className="space-y-1 col-span-2">
                                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Fecha de Inicio</span>
                                    <div className="flex items-center gap-2 font-bold text-gray-700">
                                        <Calendar className="h-4 w-4 text-blue-500/50" />
                                        {format(new Date(order.startDate), 'dd MMMM, yyyy')}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Observaciones</span>
                                    <button
                                        onClick={handleDelete}
                                        className="flex items-center gap-1.5 text-[10px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Eliminar Orden
                                    </button>
                                </div>
                                <textarea
                                    value={observations}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => setObservations(e.target.value)}
                                    className="w-full min-h-[100px] rounded-2xl border-0 bg-white p-4 text-sm font-medium shadow-sm ring-1 ring-black/5 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                                    placeholder="Añadir notas internas..."
                                />
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="flex-1 flex items-center justify-center gap-2 h-12 rounded-2xl bg-blue-600 text-white text-sm font-black shadow-lg shadow-blue-100 transition-all hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50"
                                >
                                    <Save className="h-4 w-4" />
                                    {isSaving ? "Guardando..." : "Guardar Observaciones"}
                                </button>
                                {ALLOWED_TRANSITIONS[order.status]?.length > 0 && (
                                    <div className="flex flex-col gap-2 pt-2 border-t border-gray-200/50 mt-4">
                                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Avanzar o retroceder:</span>
                                        <div className="flex flex-wrap gap-2 justify-center">
                                            {ALLOWED_TRANSITIONS[order.status].map(nextStatus => (
                                                <button
                                                    key={nextStatus}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onUpdateStatus?.(order.id, nextStatus);
                                                    }}
                                                    className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-black text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-colors shadow-sm"
                                                >
                                                    <ArrowRightCircle className="h-3.5 w-3.5" />
                                                    {STATUS_LABELS[nextStatus]}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
