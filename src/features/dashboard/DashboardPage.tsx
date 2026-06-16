
'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Order, Task } from '@/types/order';
import { OrderCard } from '@/components/orders/OrderCard';
import { OrderStatus, STATUS_LABELS, STATUS_ORDER, ALLOWED_TRANSITIONS } from '@/constants/status';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
    Plus, ListTodo, Layers, Timer, Trash2,
    AlertCircle, TrendingUp, Loader2, ChevronDown, ChevronUp
} from 'lucide-react';
import {
    DragDropContext,
    Droppable,
    Draggable,
    DropResult
} from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';

const StatusSection = ({ 
    status, 
    orders, 
    onDeleteOrder, 
    onUpdateObservations, 
    onUpdateStatus,
    onToggleUrgent
}: { 
    status: OrderStatus, 
    orders: Order[], 
    onDeleteOrder: (id: string) => void,
    onUpdateObservations: (id: string, obs: string) => Promise<boolean | void>,
    onUpdateStatus: (id: string, newStatus: OrderStatus) => Promise<void>,
    onToggleUrgent: (id: string, currentUrgency: boolean) => Promise<void>
}) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="space-y-4">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-6 py-4 rounded-3xl bg-white shadow-sm ring-1 ring-black/5 hover:bg-gray-50 transition-all group"
            >
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "h-3 w-3 rounded-full transition-all group-hover:scale-125",
                        status === OrderStatus.PENDING ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" :
                        status === OrderStatus.REWORKS ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" : 
                        "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]"
                    )} />
                    <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">{STATUS_LABELS[status]}</h2>
                    <span className="bg-gray-100 text-gray-500 text-[11px] font-black px-3 py-1 rounded-full">{orders.length}</span>
                </div>
                {isOpen ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <Droppable droppableId={`droppable-${status}`}>
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="flex flex-col gap-3 p-2 rounded-[2.5rem] bg-gray-50/30 border-2 border-dashed border-gray-100 min-h-[100px]"
                                >
                                    {orders.map((order, index) => (
                                        <Draggable key={order.id} draggableId={order.id} index={index}>
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    style={{ ...provided.draggableProps.style }}
                                                >
                                                    <OrderCard
                                                        order={order}
                                                        onDelete={onDeleteOrder}
                                                        onUpdateObservations={onUpdateObservations}
                                                        onUpdateStatus={onUpdateStatus}
                                                        onToggleUrgent={onToggleUrgent}
                                                        dragHandleProps={provided.dragHandleProps}
                                                    />
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const DashboardPage = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const ordersByStatus = useMemo(() => {
        const grouped: Partial<Record<OrderStatus, Order[]>> = {};
        const sortedOrders = [...orders].sort((a, b) => {
            if (a.isUrgent && !b.isUrgent) return -1;
            if (!a.isUrgent && b.isUrgent) return 1;
            return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        });
        
        for (const order of sortedOrders) {
            (grouped[order.status] ||= []).push(order);
        }
        return grouped;
    }, [orders]);

    const fetchData = async () => {
        try {
            const [ordersRes, tasksRes] = await Promise.all([
                fetch('/api/orders'),
                fetch('/api/tasks')
            ]);
            const ordersData = await ordersRes.json();
            const tasksData = await tasksRes.json();

            if (!ordersData.error) setOrders(ordersData);
            if (!tasksData.error) setTasks(tasksData);
        } catch (error) {
            console.error("Error loading dashboard data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onDragEnd = async (result: DropResult) => {
        const { source, destination, draggableId } = result;
        if (!destination) return;

        const sourceStatus = source.droppableId.replace('droppable-', '') as OrderStatus;
        const destStatus = destination.droppableId.replace('droppable-', '') as OrderStatus;

        if (source.droppableId === destination.droppableId) {
            if (source.index === destination.index) return;
            // Local reorder within the same status
            const newOrders = [...orders];
            const statusOrders = newOrders.filter(o => o.status === sourceStatus);
            const otherOrders = newOrders.filter(o => o.status !== sourceStatus);

            const [moved] = statusOrders.splice(source.index, 1);
            statusOrders.splice(destination.index, 0, moved);

            setOrders([...otherOrders, ...statusOrders]);
            return;
        }

        // Change status across lists
        const allowed = ALLOWED_TRANSITIONS[sourceStatus]?.includes(destStatus);

        if (allowed) {
            handleUpdateStatus(draggableId, destStatus);
        } else {
            alert(`No puedes pasar una orden de ${STATUS_LABELS[sourceStatus]} a ${STATUS_LABELS[destStatus]}`);
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: OrderStatus) => {
        const previousOrders = [...orders];
        // Optimistic update
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));

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

    const handleDeleteOrder = async (id: string) => {
        if (window.confirm('¿Eliminar esta orden?')) {
            try {
                const response = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
                if (response.ok) {
                    setOrders(prev => prev.filter(o => o.id !== id));
                } else {
                    alert("Error al eliminar la orden");
                }
            } catch (error) {
                alert("Error de conexión");
            }
        }
    };

    const handleDeleteTask = async (id: string) => {
        if (window.confirm('¿Eliminar esta tarea?')) {
            try {
                const response = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
                if (response.ok) {
                    setTasks(prev => prev.filter(t => t.id !== id));
                } else {
                    alert("Error al eliminar la tarea");
                }
            } catch (error) {
                alert("Error de conexión");
            }
        }
    };

    const handleToggleUrgent = async (id: string, currentUrgency: boolean) => {
        const previousOrders = [...orders];
        setOrders(prev => prev.map(o => o.id === id ? { ...o, isUrgent: !currentUrgency } : o));

        try {
            const response = await fetch(`/api/orders/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isUrgent: !currentUrgency })
            });

            if (!response.ok) {
                setOrders(previousOrders);
                alert("Error al actualizar urgencia");
            }
        } catch (error) {
            setOrders(previousOrders);
            alert("Error de conexión");
        }
    };

    const handleUpdateObservations = async (id: string, observations: string) => {
        try {
            const response = await fetch(`/api/orders/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ observations })
            });

            if (response.ok) {
                const updatedOrder = await response.json();
                setOrders(prev => prev.map(o => o.id === id ? updatedOrder : o));
                return true;
            } else {
                alert("Error al guardar observaciones");
                return false;
            }
        } catch (error) {
            alert("Error de conexión");
            return false;
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
        );
    }

    const stats = [
        { label: 'Total Activas', value: orders.filter(o => o.status !== OrderStatus.DELIVERED).length, icon: Layers, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'En Producción', value: orders.filter(o => o.status === OrderStatus.PRODUCTION).length, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Retrabajos', value: orders.filter(o => o.status === OrderStatus.REWORKS).length, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
        { label: 'Tareas', value: tasks.length, icon: ListTodo, color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    return (
        <main className="min-h-screen bg-[#fcfcfd] pb-20">
            <div className="mx-auto max-w-[1600px] px-4 md:px-12 py-6 md:py-10">
                <header className="mb-8 md:mb-12 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black tracking-tight text-gray-900 lg:text-5xl">Panel de Control</h1>
                        <p className="text-base md:text-lg font-medium text-gray-400">Prioriza y gestiona el flujo de trabajo</p>
                    </div>
                    <Link href="/ingreso" className="hidden md:flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 font-black text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-xl active:scale-95">
                        <Plus className="h-5 w-5 stroke-[3px]" />
                        Nueva Orden / Tarea
                    </Link>
                </header>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10 md:mb-14">
                    {stats.map((stat) => (
                        <div key={stat.label} className="group flex flex-col gap-3 rounded-[2rem] bg-white p-6 md:p-8 shadow-sm ring-1 ring-black/5 transition-all hover:shadow-xl hover:-translate-y-1">
                            <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm", stat.bg)}>
                                <stat.icon className={cn("h-6 w-6", stat.color)} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-3xl font-black text-gray-900">{stat.value}</span>
                                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">{stat.label}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                        {/* Columna 1: Órdenes agrupadas */}
                        <section className="lg:col-span-8 space-y-6">
                            {STATUS_ORDER.filter(s => s !== OrderStatus.DELIVERED).map(status => (
                                <StatusSection 
                                    key={status}
                                    status={status}
                                    orders={ordersByStatus[status] || []}
                                    onDeleteOrder={handleDeleteOrder}
                                    onUpdateObservations={handleUpdateObservations}
                                    onUpdateStatus={handleUpdateStatus}
                                    onToggleUrgent={handleToggleUrgent}
                                />
                            ))}
                        </section>

                        {/* Columna 2: Tareas */}
                        <aside className="lg:col-span-4 lg:sticky lg:top-28">
                            <div className="flex items-center gap-3 mb-6 px-2">
                                <ListTodo className="h-6 w-6 text-purple-500 opacity-60" />
                                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Tareas</h2>
                            </div>
                            <div className="flex flex-col gap-4 rounded-[2.5rem] bg-gray-50/50 border-2 border-dashed border-gray-100 p-6">
                                {tasks.map(task => (
                                    <div key={task.id} className="group flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 transition-all hover:shadow-md">
                                        <div className="flex items-center gap-4 pr-4">
                                            <button
                                                onClick={() => handleDeleteTask(task.id)}
                                                className="opacity-0 group-hover:opacity-100 h-8 w-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 transition-all hover:bg-red-100"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-black uppercase tracking-wider text-purple-600">{task.owner || 'Tarea'}</span>
                                                <span className="font-bold text-gray-800 line-clamp-2">{task.description}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center justify-center min-w-[70px] rounded-xl bg-purple-50 p-2 text-purple-700 ring-1 ring-purple-100">
                                            <Timer className="h-4 w-4 mb-0.5" />
                                            <span className="text-xs font-black">{task.daysToDeliver}d</span>
                                        </div>
                                    </div>
                                ))}

                                <Link href="/ingreso" className="flex items-center justify-center gap-2 rounded-2xl py-6 border-2 border-dashed border-gray-100 text-gray-400 font-bold hover:border-blue-200 hover:text-blue-500 hover:bg-blue-50/10 transition-all group">
                                    <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
                                    Nueva tarea
                                </Link>
                            </div>
                        </aside>
                    </div>
                </DragDropContext>
            </div>
        </main>
    );
};
