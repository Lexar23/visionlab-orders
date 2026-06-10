
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { Home, Plus, BarChart3, Settings, Search } from 'lucide-react';

const NAV_ITEMS = [
    { label: 'Inicio', icon: Home, path: '/' },
    { label: 'Buscar', icon: Search, path: '/search' },
    { label: 'Nuevo', icon: Plus, path: '/ingreso', primary: true },
    { label: 'Estados', icon: BarChart3, path: '/status/pendiente' },
    { label: 'Ajustes', icon: Settings, path: '/settings' },
];

export const BottomNav = () => {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // No role filtering
    const filteredItems = mounted ? NAV_ITEMS : [];

    if (!mounted) {
        return null;
    }

    // Hide on login or register pages
    if (pathname === '/login' || pathname === '/register') return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 block lg:hidden">
            <div className="mx-4 mb-6 relative">
                <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/20" />
                <nav className="relative flex items-center justify-around h-20 px-4">
                    {filteredItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.path;

                        if (item.primary) {
                            return (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    className="relative -top-8 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-200/50 transition-transform active:scale-90 hover:scale-105"
                                >
                                    <Icon className="h-8 w-8 stroke-[3px]" />
                                </Link>
                            );
                        }

                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-1 transition-all duration-300",
                                    isActive ? "text-blue-600 scale-110" : "text-gray-400 hover:text-gray-600"
                                )}
                            >
                                <Icon className={cn("h-6 w-6", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
                                <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
};
