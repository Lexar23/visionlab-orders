'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Settings,
    MapPin,
    Users,
    Plus,
    Trash2,
    Save,
    ShieldCheck,
    CheckCircle2,
    Lock,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

type SettingsData = {
    branches: string[];
    workers: string[];
    taskOwners: string[];
};

export default function SettingsPage() {
    const router = useRouter();

    const [branches, setBranches] = useState<string[]>([]);
    const [workers, setWorkers] = useState<string[]>([]);
    const [taskOwners, setTaskOwners] = useState<string[]>([]);

    const [newBranch, setNewBranch] = useState('');
    const [newWorker, setNewWorker] = useState('');
    const [newOwner, setNewOwner] = useState('');

    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isSavingAll, setIsSavingAll] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const isAdmin = true;

    // Fetch initial data
    useEffect(() => {

        fetch('/api/settings')
            .then(res => res.json())
            .then((data: SettingsData) => {

                setBranches(data.branches || []);
                setWorkers(data.workers || []);
                setTaskOwners(data.taskOwners || []);

            })
            .catch(err => console.error("Error loading settings:", err))
            .finally(() => setIsLoadingData(false));

    }, [isAdmin]);

    if (isLoadingData) {

        return (
            <div className="flex h-screen items-center justify-center bg-[#fcfcfd]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                    <p className="font-bold text-black animate-pulse">
                        Cargando base de datos...
                    </p>
                </div>
            </div>
        );
    }

    const addItem = (
        list: string[],
        setList: React.Dispatch<React.SetStateAction<string[]>>,
        item: string,
        setItem: React.Dispatch<React.SetStateAction<string>>
    ) => {

        const value = item.trim();

        if (!value) return;

        const exists = list.some(i => i.toLowerCase() === value.toLowerCase());

        if (!exists) {
            setList([...list, value]);
            setItem('');
        }
    };

    const removeItem = (
        list: string[],
        setList: React.Dispatch<React.SetStateAction<string[]>>,
        index: number
    ) => {

        setList(list.filter((_, i) => i !== index));
    };

    const handleSaveAll = async () => {

        setIsSavingAll(true);

        try {

            const response = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    branches,
                    workers,
                    taskOwners
                } as SettingsData)
            });

            const data = await response.json();

            if (!response.ok) {

                alert(data.error || 'No se pudo guardar en la base de datos');
                return;
            }

            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);

        } catch (error) {

            console.error("Save error:", error);
            alert("Error de conexión");

        } finally {

            setIsSavingAll(false);
        }
    };

    return (

        <main className="min-h-screen bg-[#fcfcfd] py-6 md:py-12 px-4 md:px-6 mb-20 md:mb-0">

            <div className="max-w-5xl mx-auto">

                <header className="mb-10 md:mb-14">

                    <div className="flex h-16 w-16 items-center justify-center rounded-[2rem] bg-black text-white mb-6 shadow-xl shadow-gray-200">
                        <Settings className="h-8 w-8 animate-[spin_4s_linear_infinite]" />
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black text-black tracking-tight mb-2">
                        Configuración
                    </h1>

                    <p className="text-lg md:text-xl font-medium text-black">
                        Gestiona los recursos y el personal de VisTracker
                    </p>

                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Sucursales */}

                    <section className="bg-white p-8 md:p-10 rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100 flex flex-col gap-6">

                        <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                <MapPin className="h-6 w-6" />
                            </div>

                            <h2 className="text-2xl font-black text-black">
                                Sucursales
                            </h2>

                        </div>

                        <div className="flex gap-2">

                            <input
                                value={newBranch}
                                onChange={(e) => setNewBranch(e.target.value)}
                                placeholder="Nueva sucursal..."
                                className="flex-1 h-14 px-6 bg-gray-50 border-0 rounded-2xl focus:ring-4 focus:ring-blue-100 transition-all font-bold text-black"
                                onKeyDown={(e) =>
                                    e.key === 'Enter' &&
                                    addItem(branches, setBranches, newBranch, setNewBranch)
                                }
                            />

                            <button
                                onClick={() =>
                                    addItem(branches, setBranches, newBranch, setNewBranch)
                                }
                                className="h-14 w-14 flex items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all"
                            >
                                <Plus className="h-6 w-6 stroke-[3px]" />
                            </button>

                        </div>

                        <div className="space-y-2">

                            {branches.map((branch, i) => (

                                <div
                                    key={`${branch}-${i}`}
                                    className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 border border-gray-100 group"
                                >

                                    <span className="font-bold text-black">
                                        {branch}
                                    </span>

                                    <button
                                        onClick={() =>
                                            removeItem(branches, setBranches, i)
                                        }
                                        className="opacity-0 group-hover:opacity-100 h-8 w-8 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-all"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>

                                </div>

                            ))}

                        </div>

                    </section>

                    {/* Trabajadores */}

                    <section className="bg-white p-8 md:p-10 rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100 flex flex-col gap-6">

                        <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                                <Users className="h-6 w-6" />
                            </div>

                            <h2 className="text-2xl font-black text-black">
                                Trabajadores
                            </h2>

                        </div>

                        <div className="flex gap-2">

                            <input
                                value={newWorker}
                                onChange={(e) => setNewWorker(e.target.value)}
                                placeholder="Nombre del trabajador..."
                                className="flex-1 h-14 px-6 bg-gray-50 border-0 rounded-2xl focus:ring-4 focus:ring-purple-100 transition-all font-bold text-black"
                                onKeyDown={(e) =>
                                    e.key === 'Enter' &&
                                    addItem(workers, setWorkers, newWorker, setNewWorker)
                                }
                            />

                            <button
                                onClick={() =>
                                    addItem(workers, setWorkers, newWorker, setNewWorker)
                                }
                                className="h-14 w-14 flex items-center justify-center rounded-2xl bg-purple-600 text-white shadow-lg shadow-purple-100 hover:bg-purple-700 active:scale-95 transition-all"
                            >
                                <Plus className="h-6 w-6 stroke-[3px]" />
                            </button>

                        </div>

                        <div className="space-y-2">

                            {workers.map((worker, i) => (

                                <div
                                    key={`${worker}-${i}`}
                                    className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 border border-gray-100 group"
                                >

                                    <div className="flex items-center gap-3">

                                        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-[10px] font-black text-purple-600 uppercase">
                                            {worker.charAt(0)}
                                        </div>

                                        <span className="font-bold text-black">
                                            {worker}
                                        </span>

                                    </div>

                                    <button
                                        onClick={() =>
                                            removeItem(workers, setWorkers, i)
                                        }
                                        className="opacity-0 group-hover:opacity-100 h-8 w-8 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-all"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>

                                </div>

                            ))}

                        </div>

                    </section>

                    {/* Dueños */}

                    <section className="bg-white p-8 md:p-10 rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100 flex flex-col gap-6 lg:col-span-2">

                        <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                                <ShieldCheck className="h-6 w-6" />
                            </div>

                            <h2 className="text-2xl font-black text-black">
                                Dueños de Tareas
                            </h2>

                        </div>

                        <div className="flex flex-col md:flex-row gap-4">

                            <div className="flex-1 flex gap-2">

                                <input
                                    value={newOwner}
                                    onChange={(e) => setNewOwner(e.target.value)}
                                    placeholder="Ej. Taller, Administración..."
                                    className="flex-1 h-14 px-6 bg-gray-50 border-0 rounded-2xl focus:ring-4 focus:ring-amber-100 transition-all font-bold text-black"
                                    onKeyDown={(e) =>
                                        e.key === 'Enter' &&
                                        addItem(taskOwners, setTaskOwners, newOwner, setNewOwner)
                                    }
                                />

                                <button
                                    onClick={() =>
                                        addItem(taskOwners, setTaskOwners, newOwner, setNewOwner)
                                    }
                                    className="h-14 w-14 flex items-center justify-center rounded-2xl bg-amber-600 text-white shadow-lg shadow-amber-100 hover:bg-amber-700 active:scale-95 transition-all"
                                >
                                    <Plus className="h-6 w-6 stroke-[3px]" />
                                </button>

                            </div>

                            <div className="flex flex-wrap gap-2 md:max-w-xl">

                                {taskOwners.map((owner, i) => (

                                    <div
                                        key={`${owner}-${i}`}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 font-bold text-sm group"
                                    >

                                        {owner}

                                        <button
                                            onClick={() =>
                                                removeItem(taskOwners, setTaskOwners, i)
                                            }
                                        >
                                            <Trash2 className="h-3 w-3 text-amber-400 hover:text-red-500 transition-colors" />
                                        </button>

                                    </div>

                                ))}

                            </div>

                        </div>

                    </section>

                </div>

                <div className="mt-12 flex flex-col items-end gap-4">

                    {showSuccess && (
                        <div className="flex items-center gap-2 text-green-600 font-black animate-bounce text-lg px-6 py-2 bg-green-50 rounded-2xl border border-green-100">
                            <CheckCircle2 className="h-6 w-6" />
                            ¡Sincronizado con MariaDB!
                        </div>
                    )}

                    <button
                        onClick={handleSaveAll}
                        disabled={isSavingAll}
                        className={cn(
                            "flex items-center gap-3 px-10 py-5 rounded-3xl font-black shadow-2xl transition-all active:scale-95",
                            isSavingAll
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-black text-white hover:scale-105 shadow-gray-300"
                        )}
                    >

                        {isSavingAll ? (
                            <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                            <Save className="h-6 w-6" />
                        )}

                        {isSavingAll
                            ? "Guardando en la base..."
                            : "Guardar Configuración General"}

                    </button>

                </div>

            </div>

        </main>
    );
}