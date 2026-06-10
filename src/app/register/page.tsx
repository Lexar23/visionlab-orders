
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, Mail, Lock, Loader2, AlertCircle, Shield } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('PRODUCCION');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, role }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Ocurrió un error al registrar el usuario.");
            } else {
                router.push('/login?registered=true');
            }
        } catch (err) {
            setError("Error de conexión con el servidor.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#fcfcfd] flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-purple-600 shadow-2xl shadow-indigo-200 mb-6">
                        <UserPlus className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-gray-900">
                        Crear <span className="text-indigo-600">Cuenta</span>
                    </h1>
                    <p className="text-gray-400 font-medium mt-2">Únete al sistema VisTracker</p>
                </div>

                <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold animate-in fade-in slide-in-from-top-2">
                                <AlertCircle className="h-5 w-5 shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Email Corporativo</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="ejemplo@vistracker.com"
                                    className="w-full h-14 pl-12 pr-4 bg-gray-50 border-0 rounded-2xl focus:ring-4 focus:ring-indigo-100 transition-all font-bold text-gray-900 placeholder:text-gray-300"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full h-14 pl-12 pr-4 bg-gray-50 border-0 rounded-2xl focus:ring-4 focus:ring-indigo-100 transition-all font-bold text-gray-900 placeholder:text-gray-300"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Rol de Usuario</label>
                            <div className="relative">
                                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full h-14 pl-12 pr-4 bg-gray-50 border-0 rounded-2xl focus:ring-4 focus:ring-indigo-100 transition-all font-bold text-gray-900 appearance-none cursor-pointer"
                                >
                                    <option value="ADMIN">Administrador</option>
                                    <option value="CALIDAD">Calidad</option>
                                    <option value="PRODUCCION">Producción</option>
                                    <option value="GERENCIA">Gerencia</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-16 rounded-2xl bg-indigo-600 text-white font-black shadow-xl shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {isLoading ? (
                                <Loader2 className="h-6 w-6 animate-spin" />
                            ) : (
                                "Registrar Usuario"
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm font-medium text-gray-400">
                            ¿Ya tienes una cuenta?{' '}
                            <Link href="/login" className="text-indigo-600 font-black hover:underline">
                                Iniciar Sesión
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
