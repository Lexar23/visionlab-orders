
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { NAV_LINKS } from '@/constants/status';
import {
    Eye,
    User,
    Home,
    PlusCircle,
    Clock,
    Wrench,
    Droplets,
    ShieldCheck,
    FileText,
    RotateCcw,
    CheckCircle2,
    Settings,
    LogOut,
    LucideIcon
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
    '/': Home,
    '/ingreso': PlusCircle,
    '/status/pendiente': Clock,
    '/status/produccion': Wrench,
    '/status/tenido': Droplets,
    '/status/calidad': ShieldCheck,
    '/status/facturacion': FileText,
    '/status/retrabajos': RotateCcw,
    '/status/entregado': CheckCircle2,
    '/settings': Settings,
};

export const Sidebar = () => {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const userRole = (session?.user as any)?.role || 'PRODUCCION';
    const isAdmin = userRole === 'ADMIN';
    const userName = session?.user?.name || 'Usuario';

    const filteredLinks = (mounted && isAdmin) ? NAV_LINKS : NAV_LINKS.filter(link => link.path !== '/settings');

    if (!mounted) {
        return null;
    }

    if (pathname === '/login' || pathname === '/register') return null;

    return (
        <aside className="hidden lg:flex flex-col w-[280px] h-screen border-r border-gray-100 bg-white/80 backdrop-blur-2xl shrink-0 sticky top-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-40 transition-all duration-300">
            <div className="flex h-24 items-center px-8 shrink-0">
                <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80 group">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform duration-300">
                        <Eye className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-3xl font-black tracking-tight text-gray-900">
                        Vis<span className="text-blue-600">Tracker</span>
                    </span>
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2 custom-scrollbar">
                <div className="px-4 mb-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Menú Principal</p>
                </div>
                {filteredLinks.map((link) => {
                    const isActive = pathname === link.path || (link.path !== '/' && pathname.startsWith(link.path));
                    const Icon = ICON_MAP[link.path] || Eye;

                    return (
                        <Link
                            key={link.path}
                            href={link.path}
                            className={cn(
                                "group relative px-4 py-3.5 text-sm font-semibold transition-all duration-300 rounded-2xl flex items-center gap-4 overflow-hidden",
                                isActive
                                    ? "text-blue-700 bg-blue-50/80 shadow-sm border border-blue-100/50"
                                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-transparent"
                            )}
                        >
                            {isActive && (
                                <span className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-full shadow-[0_0_12px_rgba(37,99,235,0.6)]" />
                            )}
                            
                            <Icon 
                                className={cn(
                                    "h-5 w-5 transition-transform duration-300", 
                                    isActive ? "scale-110 text-blue-600" : "group-hover:scale-110"
                                )} 
                                strokeWidth={isActive ? 2.5 : 2} 
                            />
                            <span className="relative z-10">{link.label}</span>
                        </Link>
                    );
                })}
            </div>

            <div className="p-6 shrink-0 mt-auto space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-3xl bg-gray-50 border border-gray-100 transition-colors group">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center border border-blue-100 shadow-sm">
                        <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-black text-gray-900 truncate uppercase tracking-tight">{userName}</p>
                        <p className="text-[10px] font-black text-blue-600 truncate uppercase tracking-widest">{userRole}</p>
                    </div>
                </div>

                <button 
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-bold text-red-500 bg-red-50/50 hover:bg-red-50 rounded-2xl border border-red-100/50 transition-all active:scale-[0.98]"
                >
                    <LogOut className="h-4 w-4" />
                    Cerrar Sesión
                </button>
            </div>
        </aside>
    );
};
