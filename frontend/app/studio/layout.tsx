
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
    Search,
    Bell,
    Layers
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
import { Input } from "@/components/ui/input";

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
            toast.success("Signed out", {
                description: "Session ended safely.",
                style: { background: '#111', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
            });
            router.push('/studio/login');
        } catch (err) {
            toast.error("Logout failed");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#070708] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="font-heading text-xs uppercase tracking-[0.3em] text-zinc-600 animate-pulse">Initializing Studio</p>
                </div>
            </div>
        );
    }

    if (pathname === '/studio/login') {
        return (
            <div className="selection:bg-primary/30">
                {children}
                <Toaster richColors theme="dark" position="bottom-right" />
            </div>
        );
    }

    const navItems = [
        { name: 'Overview', icon: LayoutDashboard, href: '/studio' },
        { name: 'Library', icon: VideoIcon, href: '/studio/content' },
        { name: 'Settings', icon: SettingsIcon, href: '/studio/settings' },
    ];

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full bg-[#070708] text-zinc-300 selection:bg-primary/30 font-sans">

                {/* Modern Glass Sidebar */}
                <Sidebar collapsible="icon" className="border-r border-white/5 bg-zinc-950/50 backdrop-blur-xl">
                    <SidebarHeader className="h-20 flex flex-row items-center px-6">
                        <div className="flex items-center gap-3 group">
                            <div className="w-9 h-9 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/20 group-hover:bg-primary/30 transition-all duration-500 shadow-[0_0_20px_rgba(var(--primary),0.1)]">
                                <Shield className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex flex-col group-data-[collapsible=icon]:hidden animate-in fade-in duration-500">
                                <span className="font-heading font-black text-sm text-white tracking-wider uppercase leading-none">Vinz Studio</span>
                                <span className="text-[10px] text-zinc-500 font-bold tracking-tighter mt-1 opacity-60">Creator Platform</span>
                            </div>
                        </div>
                    </SidebarHeader>

                    <SidebarContent className="px-3 pt-4 custom-scrollbar">
                        <SidebarGroup>
                            <SidebarGroupLabel className="text-[10px] font-heading font-bold uppercase tracking-[0.25em] text-zinc-600 mb-4 px-3 group-data-[collapsible=icon]:hidden">
                                Perspective
                            </SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu className="gap-1.5">
                                    {navItems.map((item) => {
                                        const isActive = pathname === item.href;
                                        return (
                                            <SidebarMenuItem key={item.name}>
                                                <SidebarMenuButton
                                                    asChild
                                                    isActive={isActive}
                                                    tooltip={item.name}
                                                    className={`h-11 rounded-xl transition-all duration-500 relative group/btn ${isActive
                                                            ? 'bg-primary/10 text-white border border-primary/20 shadow-lg shadow-primary/5'
                                                            : 'text-zinc-500 hover:bg-white/5 hover:text-white border border-transparent'
                                                        }`}
                                                >
                                                    <Link href={item.href} className="flex items-center px-3">
                                                        <item.icon className={`w-4.5 h-4.5 transition-all duration-300 ${isActive ? 'text-primary' : 'group-hover/btn:text-white'}`} />
                                                        <span className="ml-3.5 font-heading font-semibold text-sm group-data-[collapsible=icon]:hidden">{item.name}</span>
                                                        {isActive && <div className="absolute left-0 w-0.5 h-4 bg-primary rounded-full group-data-[collapsible=icon]:hidden" />}
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        );
                                    })}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>

                    <SidebarFooter className="p-4 border-t border-white/5">
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    onClick={handleLogout}
                                    className="h-11 w-full rounded-xl text-zinc-600 hover:text-red-400 hover:bg-red-400/10 transition-all border border-transparent hover:border-red-400/20 px-3"
                                >
                                    <LogOut className="w-4.5 h-4.5" />
                                    <span className="ml-3.5 font-heading font-bold text-xs uppercase tracking-[0.15em] group-data-[collapsible=icon]:hidden">Sign Out</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarFooter>
                </Sidebar>

                <SidebarInset className="flex-1 flex flex-col bg-transparent overflow-hidden">
                    {/* Modern Header */}
                    <header className="h-20 flex items-center justify-between px-8 border-b border-white/5 bg-zinc-950/20 backdrop-blur-md shrink-0">
                        <div className="flex items-center gap-6">
                            <SidebarTrigger className="text-zinc-500 hover:text-white transition-colors h-9 w-9 border border-white/5 rounded-lg hover:bg-white/5" />

                            <div className="hidden lg:flex items-center gap-3 relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-primary transition-colors" />
                                <Input
                                    placeholder="Global Search..."
                                    className="bg-zinc-900/50 border-white/5 rounded-xl pl-10 h-10 w-[240px] focus:w-[320px] transition-all duration-500 focus:border-primary/30 focus:ring-0 text-xs font-semibold placeholder:text-zinc-700 font-sans"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <Button variant="ghost" size="icon" className="relative h-10 w-10 text-zinc-500 hover:text-white hover:bg-white/5 rounded-xl border border-transparent hover:border-white/5 transition-all">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-[#070708]" />
                            </Button>

                            <Separator orientation="vertical" className="h-6 bg-white/5" />

                            <div className="flex items-center gap-4 group cursor-pointer pl-2">
                                <div className="hidden md:flex flex-col items-end">
                                    <p className="text-xs font-heading font-black text-white uppercase tracking-wider leading-tight">Admin System</p>
                                    <Badge variant="outline" className="text-[10px] font-black uppercase text-primary border-primary/20 bg-primary/5 py-0 px-1.5 h-4 mt-0.5">Verified Account</Badge>
                                </div>
                                <div className="relative">
                                    <div className="w-10 h-10 bg-zinc-900 rounded-xl border border-white/10 group-hover:border-primary/40 transition-all duration-500 overflow-hidden shadow-xl flex items-center justify-center">
                                        <Layers className="w-5 h-5 text-zinc-700 group-hover:text-primary" />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-[3px] border-[#070708]" />
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Content Viewport */}
                    <main className="flex-1 overflow-y-auto custom-scrollbar bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent">
                        <div className="p-8 lg:p-12 max-w-[1600px] mx-auto min-h-full">
                            {children}
                        </div>
                    </main>
                </SidebarInset>
            </div>

            <Toaster
                richColors
                theme="dark"
                position="bottom-right"
                toastOptions={{
                    className: 'glass-toast border-white/10 bg-zinc-950/80 backdrop-blur-xl text-white font-sans rounded-2xl p-4 shadow-2xl',
                }}
            />
        </SidebarProvider>
    );
}
