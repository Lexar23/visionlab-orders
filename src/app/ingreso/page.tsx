
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Package, ClipboardList, Send, Calendar,
    Landmark, ReceiptText, ArrowLeft, Clock,
    Loader2, ShieldCheck, Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { OrderStatus, STATUS_LABELS } from '@/constants/status';

export default function EntryPage() {
    const router = useRouter();
    const [formType, setFormType] = useState<'order' | 'task'>('order');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Dynamic settings
    const [branches, setBranches] = useState<string[]>([]);
    const [taskOwners, setTaskOwners] = useState<string[]>([]);
    const [isLoadingSettings, setIsLoadingSettings] = useState(true);

    // Form states
    const [orderData, setOrderData] = useState({
        orderNumber: '',
        patientName: '',
        branch: '',
        invoice: '',
        startDate: new Date().toISOString().split('T')[0],
        status: OrderStatus.PRODUCTION,
    });

    const [taskData, setTaskData] = useState({
        description: '',
        daysToDeliver: 1,
        owner: '',
    });

    // Fetch dynamic options
    useEffect(() => {
        fetch('/api/settings', { cache: 'no-store' })
            .then(res => res.json())
            .then(data => {
                if (!data.error) {
                    setBranches(data.branches || []);
                    setTaskOwners(data.taskOwners || []);

                    // Set defaults if data exists
                    if (data.branches?.length > 0) setOrderData(prev => ({ ...prev, branch: data.branches[0] }));
                    if (data.taskOwners?.length > 0) setTaskData(prev => ({ ...prev, owner: data.taskOwners[0] }));
                }
            })
            .catch(err => console.error("Error loading settings:", err))
            .finally(() => setIsLoadingSettings(false));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const endpoint = formType === 'order' ? '/api/orders' : '/api/tasks';
            const payload = formType === 'order' ? orderData : taskData;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                router.push('/');
            } else {
                const err = await response.json();
                alert(`Error: ${err.error || 'No se pudo guardar'}`);
            }
        } catch (error) {
            alert("Error de conexión");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#fcfcfd] py-6 md:py-12 px-4 md:px-6 mb-20 md:mb-0">
            <div className="max-w-4xl mx-auto">

                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-black font-black hover:text-blue-600 transition-colors mb-6 md:mb-8 group"
                >
                    <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                    Volver
                </button>

                <header className="mb-8 md:mb-12">
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight text-black mb-2">Nuevo Registro</h1>
                    <p className="text-base md:text-xl font-medium text-black">Ingresa una nueva orden o tarea</p>
                </header>

                {/* Type Toggle */}
                <div className="flex p-2 bg-gray-100/50 backdrop-blur rounded-[2rem] mb-6 md:mb-10 max-w-md shadow-inner border border-black/5">
                    <button
                        onClick={() => setFormType('order')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-3 md:py-4 rounded-2xl font-black transition-all text-sm md:text-base",
                            formType === 'order' ? "bg-white text-blue-600 shadow-md ring-1 ring-black/5" : "text-black/60 hover:text-black"
                        )}
                    >
                        <Package className="h-5 w-5" />
                        Orden
                    </button>
                    <button
                        onClick={() => setFormType('task')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-3 md:py-4 rounded-2xl font-black transition-all text-sm md:text-base",
                            formType === 'task' ? "bg-white text-purple-600 shadow-md ring-1 ring-black/5" : "text-black/60 hover:text-black"
                        )}
                    >
                        <ClipboardList className="h-5 w-5" />
                        Tarea
                    </button>
                </div>

                <div className="bg-white p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl shadow-gray-200 border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-8">

                        {formType === 'order' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-sm font-black text-black ml-1">
                                        <Package className="h-4 w-4 opacity-40 text-black" />
                                        Número de Orden
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={orderData.orderNumber}
                                        onChange={(e) => setOrderData({ ...orderData, orderNumber: e.target.value })}
                                        placeholder="Ej. 25489"
                                        className="w-full h-14 md:h-16 px-6 bg-gray-50 border-0 rounded-2xl focus:ring-4 focus:ring-blue-100 transition-all text-base md:text-lg font-bold text-black placeholder:text-black/30"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-sm font-black text-black ml-1">
                                        <Package className="h-4 w-4 opacity-40 text-black" />
                                        Nombre del Paciente
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={orderData.patientName}
                                        onChange={(e) => setOrderData({ ...orderData, patientName: e.target.value })}
                                        placeholder="Ej. Juan Pérez"
                                        className="w-full h-14 md:h-16 px-6 bg-gray-50 border-0 rounded-2xl focus:ring-4 focus:ring-blue-100 transition-all text-base md:text-lg font-bold text-black placeholder:text-black/30"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-sm font-black text-black ml-1">
                                        <Activity className="h-4 w-4 opacity-40 text-black" />
                                        Estado Inicial
                                    </label>
                                    <select
                                        required
                                        value={orderData.status}
                                        onChange={(e) => setOrderData({ ...orderData, status: e.target.value as OrderStatus })}
                                        className="w-full h-14 md:h-16 px-6 bg-gray-50 border-0 rounded-2xl focus:ring-4 focus:ring-blue-100 transition-all text-base md:text-lg font-bold text-black"
                                    >
                                        <option value={OrderStatus.PRODUCTION}>{STATUS_LABELS[OrderStatus.PRODUCTION]}</option>
                                        <option value={OrderStatus.PENDING}>{STATUS_LABELS[OrderStatus.PENDING]} (Problema con la orden)</option>
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-sm font-black text-black ml-1">
                                        <Landmark className="h-4 w-4 opacity-40 text-black" />
                                        Sucursal
                                    </label>
                                    <select
                                        required
                                        value={orderData.branch}
                                        onChange={(e) => setOrderData({ ...orderData, branch: e.target.value })}
                                        className="w-full h-14 md:h-16 px-6 bg-gray-50 border-0 rounded-2xl focus:ring-4 focus:ring-blue-100 transition-all text-base md:text-lg font-bold text-black"
                                    >
                                        <option value="">Selecciona sucursal</option>
                                        {branches.map(b => (
                                            <option key={b} value={b}>{b}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-sm font-black text-black ml-1">
                                        <ReceiptText className="h-4 w-4 opacity-40 text-black" />
                                        Factura
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={orderData.invoice}
                                        onChange={(e) => setOrderData({ ...orderData, invoice: e.target.value })}
                                        placeholder="Ej. FAC-001"
                                        className="w-full h-14 md:h-16 px-6 bg-gray-50 border-0 rounded-2xl focus:ring-4 focus:ring-blue-100 transition-all text-base md:text-lg font-bold text-black placeholder:text-black/30"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-sm font-black text-black ml-1">
                                        <Calendar className="h-4 w-4 opacity-40 text-black" />
                                        Fecha de Inicio
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={orderData.startDate}
                                        onChange={(e) => setOrderData({ ...orderData, startDate: e.target.value })}
                                        className="w-full h-14 md:h-16 px-6 bg-gray-50 border-0 rounded-2xl focus:ring-4 focus:ring-blue-100 transition-all text-base md:text-lg font-bold text-black"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-sm font-black text-black ml-1">
                                        <ClipboardList className="h-4 w-4 opacity-40 text-black" />
                                        Descripción de la Tarea
                                    </label>
                                    <textarea
                                        required
                                        value={taskData.description}
                                        onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                                        placeholder="¿Qué necesitas hacer?"
                                        className="w-full h-32 p-6 bg-gray-50 border-0 rounded-[2rem] focus:ring-4 focus:ring-purple-100 transition-all text-lg font-bold text-black placeholder:text-black/30 resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-2 text-sm font-black text-black ml-1">
                                            <Clock className="h-4 w-4 opacity-40 text-black" />
                                            Días para completar
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            required
                                            value={taskData.daysToDeliver}
                                            onChange={(e) => setTaskData({ ...taskData, daysToDeliver: parseInt(e.target.value) })}
                                            className="w-full h-14 md:h-16 px-6 bg-gray-50 border-0 rounded-2xl focus:ring-4 focus:ring-purple-100 transition-all text-base md:text-lg font-bold text-black"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="flex items-center gap-2 text-sm font-black text-black ml-1">
                                            <ShieldCheck className="h-4 w-4 opacity-40 text-black" />
                                            Responsable
                                        </label>
                                        <select
                                            required
                                            value={taskData.owner}
                                            onChange={(e) => setTaskData({ ...taskData, owner: e.target.value })}
                                            className="w-full h-14 md:h-16 px-6 bg-gray-50 border-0 rounded-2xl focus:ring-4 focus:ring-purple-100 transition-all text-base md:text-lg font-bold text-black"
                                        >
                                            <option value="">Selecciona departamento</option>
                                            {taskOwners.map(o => (
                                                <option key={o} value={o}>{o}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={isSubmitting || isLoadingSettings}
                                className={cn(
                                    "w-full h-20 rounded-[2rem] text-xl font-black text-white shadow-2xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3",
                                    formType === 'order'
                                        ? "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
                                        : "bg-purple-600 hover:bg-purple-700 shadow-purple-200"
                                )}
                            >
                                {isSubmitting ? (
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                ) : (
                                    <Send className="h-6 w-6" />
                                )}
                                {isSubmitting ? "Guardando..." : "Finalizar y Guardar"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}
