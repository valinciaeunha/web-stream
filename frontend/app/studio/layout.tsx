
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Video as VideoIcon,
    Settings as SettingsIcon,
    LogOut,
    Shield,
    ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
    SidebarInset
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

export default function StudioLayout({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const checkSession = async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            try {
                const res = await fetch(`${apiUrl}/api/studio/videos`, {
                    cache: 'no-store',
                    credentials: 'include'
                });
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
        try {
            await fetch(`${apiUrl}/api/studio/logout`, {
                method: 'POST',
                credentials: 'include'
            });
            toast.success("Logged out", { description: "Session cleared successfully" });
            router.push('/studio/login');
        } catch (err) {
            toast.error("Logout failed");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (pathname === '/studio/login') {
        return (
            <>
                {children}
                <Toaster richColors theme="dark" position="top-right" />
            </>
        );
    }

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, href: '/studio' },
        { name: 'Content', icon: VideoIcon, href: '/studio/content' },
        { name: 'Settings', icon: SettingsIcon, href: '/studio/settings' },
    ];

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full bg-[#0a0a0a] text-white selection:bg-blue-500/30">
                <Sidebar collapsible="icon" className="border-r border-white/5 bg-[#111]">
                    <SidebarHeader className="h-20 flex flex-row items-center px-6 border-b border-white/5 bg-[#111]">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-600/10 rounded-xl border border-blue-500/20">
                                <Shield className="w-6 h-6 text-blue-500 shrink-0" />
                            </div>
                            <span className="font-black text-xl tracking-tight group-data-[collapsible=icon]:hidden whitespace-nowrap">Vinz Studio</span>
                        </div>
                    </SidebarHeader>

                    <SidebarContent className="px-3 pt-6 bg-[#111]">
                        <SidebarGroup>
                            <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 mb-4 px-3 group-data-[collapsible=icon]:hidden">
                                Main Menu
                            </SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu className="space-y-1">
                                    {navItems.map((item) => {
                                        const isActive = pathname === item.href;
                                        return (
                                            <SidebarMenuItem key={item.name}>
                                                <SidebarMenuButton
                                                    asChild
                                                    isActive={isActive}
                                                    tooltip={item.name}
                                                    className={`h-12 rounded-xl transition-all duration-300 ${isActive
                                                            ? 'bg-blue-600/10 text-white shadow-lg border border-blue-500/30'
                                                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                                        }`}
                                                >
                                                    <Link href={item.href} className="flex items-center w-full">
                                                        <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-blue-500' : ''}`} />
                                                        <span className="ml-3 font-bold text-sm">{item.name}</span>
                                                        {isActive && <ChevronRight className="ml-auto w-4 h-4 opacity-50 group-data-[collapsible=icon]:hidden" />}
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        );
                                    })}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>

                    <SidebarFooter className="p-4 border-t border-white/5 bg-[#111]">
                        <SidebarMenu className="space-y-2">
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    onClick={handleLogout}
                                    tooltip="Sign Out"
                                    className="h-12 w-full flex items-center rounded-xl text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span className="ml-3 font-black text-sm uppercase tracking-widest">Logout</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarFooter>
                </Sidebar>

                <SidebarInset className="flex-1 flex flex-col bg-[#0a0a0a] overflow-hidden">
                    <header className="h-20 flex items-center justify-between px-8 border-b border-white/5 bg-black/20 backdrop-blur-xl shrink-0">
                        <div className="flex items-center gap-4">
                            <SidebarTrigger className="text-gray-400 hover:text-white" />
                            <Separator orientation="vertical" className="h-4 bg-white/10" />
                            <div className="flex items-center gap-1 text-xs font-bold text-gray-500 uppercase tracking-widest">
                                <span className="text-blue-500/50">Admin</span>
                                <ChevronRight className="w-3 h-3 opacity-20" />
                                <span>{pathname.replace('/studio', '') || 'Dashboard'}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex flex-col items-end">
                                <p className="text-xs font-black text-white uppercase">Vinz Studio Admin</p>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">System Administrator</p>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl border border-white/10 shadow-lg" />
                        </div>
                    </header>

                    <main className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="p-8 max-w-7xl mx-auto">
                            {children}
                        </div>
                    </main>
                </SidebarInset>
            </div>
            <Toaster richColors theme="dark" position="top-right" />
        </SidebarProvider>
    );
}
