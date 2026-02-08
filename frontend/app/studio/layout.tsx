
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Video,
    Settings,
    LogOut,
    Shield,
    Menu,
    X,
    ChevronRight
} from 'lucide-react';
import Link from 'next/link';

export default function StudioLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // High Security: Check session on every mount
        const checkSession = async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            try {
                // We use GET /api/studio/videos as a challenge to check if the cookie works
                const res = await fetch(`${apiUrl}/api/studio/videos`, { cache: 'no-store' });
                if (!res.ok && res.status === 401) {
                    router.push('/studio/login');
                } else {
                    setIsLoading(false);
                }
            } catch (err) {
                console.error("Auth Guard Error:", err);
                router.push('/studio/login');
            }
        };

        if (pathname !== '/studio/login') {
            checkSession();
        } else {
            setIsLoading(false);
        }
    }, [pathname, router]);

    const handleLogout = async () => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        await fetch(`${apiUrl}/api/studio/logout`, { method: 'POST' });
        router.push('/studio/login');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // Don't show sidebar on login page
    if (pathname === '/studio/login') return <>{children}</>;

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, href: '/studio' },
        { name: 'Content', icon: Video, href: '/studio/content' },
        { name: 'Settings', icon: Settings, href: '/studio/settings' },
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex overflow-hidden font-sans">
            {/* Sidebar */}
            <aside
                className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-[#111] border-r border-white/5 transition-all duration-300 flex flex-col z-50`}
            >
                {/* Logo Area */}
                <div className="h-20 flex items-center px-6 border-b border-white/5 mb-6">
                    <Shield className="w-8 h-8 text-blue-500 shrink-0" />
                    {isSidebarOpen && (
                        <span className="ml-3 font-bold text-xl tracking-tight truncate">Vinz Studio</span>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center p-3 rounded-xl transition-all group ${isActive
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 shrink-0 ${isActive ? '' : 'group-hover:text-blue-500'}`} />
                                {isSidebarOpen && (
                                    <div className="ml-3 flex-1 flex items-center justify-between">
                                        <span className="text-sm font-medium">{item.name}</span>
                                        {isActive && <ChevronRight className="w-4 h-4 opacity-50" />}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Sidebar Toggle & Logout */}
                <div className="p-4 border-t border-white/5 space-y-2">
                    <button
                        onClick={() => setSidebarOpen(!isSidebarOpen)}
                        className="w-full flex items-center p-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                    >
                        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        {isSidebarOpen && <span className="ml-3 text-sm">Collapse Menu</span>}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        {isSidebarOpen && <span className="ml-3 text-sm font-semibold">Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-[#0a0a0a]">
                <div className="p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
