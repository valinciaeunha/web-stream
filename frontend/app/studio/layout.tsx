
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
import { Badge } from "@/components/ui/badge";

export default function StudioLayout({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Enforce dark mode on the html element for Studio
        document.documentElement.classList.add('dark');

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
            });
            router.push('/studio/login');
        } catch (err) {
            toast.error("Logout failed");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background text-foreground flex items-center justify-center dark">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground animate-pulse font-medium">Synchronizing...</p>
                </div>
            </div>
        );
    }

    if (pathname === '/studio/login') {
        return (
            <div className="dark bg-background min-h-screen">
                {children}
                <Toaster richColors theme="dark" position="bottom-right" />
            </div>
        );
    }

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, href: '/studio' },
        { name: 'Library', icon: VideoIcon, href: '/studio/content' },
        { name: 'Settings', icon: SettingsIcon, href: '/studio/settings' },
    ];

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full bg-background text-foreground selection:bg-primary/30 font-sans dark h-screen overflow-hidden">

                {/* Simplified Professional Sidebar */}
                <Sidebar collapsible="icon" className="border-r border-border bg-sidebar h-screen">
                    <SidebarHeader className="h-16 flex flex-row items-center px-4 border-b border-border">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground shadow-sm">
                                <Shield className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                                <span className="font-heading font-bold text-sm tracking-tight">Vinz Studio</span>
                                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Management</span>
                            </div>
                        </div>
                    </SidebarHeader>

                    <SidebarContent className="px-3 pt-4 custom-scrollbar">
                        <SidebarGroup>
                            <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground px-2 group-data-[collapsible=icon]:hidden mb-2">
                                Main
                            </SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu className="gap-1">
                                    {navItems.map((item) => {
                                        const isActive = pathname === item.href;
                                        return (
                                            <SidebarMenuItem key={item.name}>
                                                <SidebarMenuButton
                                                    asChild
                                                    isActive={isActive}
                                                    tooltip={item.name}
                                                    className={`h-10 rounded-md transition-colors ${isActive
                                                            ? 'bg-primary/10 text-primary font-semibold'
                                                            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                                                        }`}
                                                >
                                                    <Link href={item.href} className="flex items-center px-3">
                                                        <item.icon className="w-4.5 h-4.5 shrink-0" />
                                                        <span className="ml-3 text-sm group-data-[collapsible=icon]:hidden">{item.name}</span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        );
                                    })}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>

                    <SidebarFooter className="p-3 border-t border-border">
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    onClick={handleLogout}
                                    className="h-10 w-full rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors px-3"
                                >
                                    <LogOut className="w-4.5 h-4.5" />
                                    <span className="ml-3 font-medium text-sm group-data-[collapsible=icon]:hidden">Sign Out</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarFooter>
                </Sidebar>

                <SidebarInset className="flex-1 flex flex-col bg-background relative h-full">
                    {/* Professional Header */}
                    <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-background/80 backdrop-blur-sm z-50 shrink-0">
                        <div className="flex items-center gap-4">
                            <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors h-8 w-8" />

                            <div className="hidden md:flex items-center gap-2 relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search Studio..."
                                    className="bg-accent/50 border-border rounded-lg pl-9 h-9 w-[200px] lg:w-[300px] text-xs focus:ring-1 focus:ring-primary/20 transition-all font-sans"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground rounded-lg">
                                <Bell className="w-5 h-5" />
                            </Button>

                            <Separator orientation="vertical" className="h-4 bg-border" />

                            <div className="flex items-center gap-3 pl-1">
                                <div className="hidden sm:flex flex-col items-end">
                                    <p className="text-xs font-bold text-foreground leading-none">Administrator</p>
                                    <p className="text-[10px] text-muted-foreground mt-1">Super User</p>
                                </div>
                                <div className="w-8 h-8 bg-accent rounded-full border border-border flex items-center justify-center overflow-hidden">
                                    <Layers className="w-4 h-4 text-muted-foreground" />
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Clean Content Area */}
                    <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10">
                        <div className="max-w-7xl mx-auto">
                            {children}
                        </div>
                    </main>
                </SidebarInset>
            </div>

            <Toaster richColors theme="dark" position="bottom-right" />
        </SidebarProvider>
    );
}
