"use client";

import { API_URL } from "@/lib/config";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Video as VideoIcon,
    Settings as SettingsIcon,
    LogOut,
    Shield,
    ChevronRight,
    Search,
    Bell,
    Layers,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import Link from "next/link";
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
    SidebarInset,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function StudioLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const checkSession = async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
            try {
                const res = await fetch(`${apiUrl}/api/studio/videos`, {
                    cache: "no-store",
                    credentials: "include",
                });
                if (!res.ok && res.status === 401) {
                    router.push("/studio/login");
                } else {
                    setIsLoading(false);
                }
            } catch (err) {
                console.error("Auth Guard Error:", err);
                router.push("/studio/login");
            }
        };

        if (pathname !== "/studio/login") {
            checkSession();
        } else {
            setIsLoading(false);
        }
    }, [pathname, router]);

    const handleLogout = async () => {
        try {
            await fetch(`${API_URL}/api/studio/logout`, {
                method: "POST",
                credentials: "include",
            });
            toast.success("Signed out", {
                description: "Session ended safely.",
            });
            router.push("/studio/login");
        } catch (err) {
            toast.error("Logout failed");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground animate-pulse font-medium">
                        Synchronizing...
                    </p>
                </div>
            </div>
        );
    }

    if (pathname === "/studio/login") {
        return (
            <div className="bg-background min-h-screen">
                {children}
                <Toaster richColors position="bottom-right" />
            </div>
        );
    }

    const navItems = [
        { name: "Dashboard", icon: LayoutDashboard, href: "/studio" },
        { name: "Library", icon: VideoIcon, href: "/studio/content" },
        { name: "Settings", icon: SettingsIcon, href: "/studio/settings" },
    ];

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full bg-background text-foreground selection:bg-primary/30 font-sans h-screen overflow-hidden">
                {/* Zed-like Minimalist Sidebar */}
                <Sidebar
                    collapsible="icon"
                    className="border-r border-border/50 bg-sidebar h-screen"
                >
                    <SidebarHeader className="h-12 flex flex-row items-center px-3 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:justify-center border-b border-border/50 transition-all">
                        <div className="flex items-center gap-2 group-data-[collapsible=icon]:gap-0">
                            <div className="flex items-center justify-center shrink-0">
                                <img
                                    src="/logo.png"
                                    alt="Vionix Studio"
                                    className="h-6 w-auto object-contain transition-all group-data-[collapsible=icon]:h-5 opacity-90"
                                />
                            </div>
                            <div className="flex flex-col group-data-[collapsible=icon]:hidden overflow-hidden whitespace-nowrap">
                                <span className="font-heading font-semibold text-sm tracking-tight truncate">
                                    Vionix Studio
                                </span>
                            </div>
                        </div>
                    </SidebarHeader>

                    <SidebarContent className="px-2 pt-2 custom-scrollbar group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:pt-0">
                        <SidebarGroup>
                            <SidebarGroupContent>
                                <SidebarMenu className="gap-0.5">
                                    {navItems.map((item) => {
                                        const isActive = pathname === item.href;
                                        return (
                                            <SidebarMenuItem key={item.name}>
                                                <SidebarMenuButton
                                                    asChild
                                                    isActive={isActive}
                                                    tooltip={item.name}
                                                    className={`h-8 rounded-sm transition-all ${isActive
                                                        ? "bg-primary/15 text-primary font-medium"
                                                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                                        }`}
                                                >
                                                    <Link
                                                        href={item.href}
                                                        className="flex items-center px-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center"
                                                    >
                                                        <item.icon className="w-4 h-4 shrink-0" />
                                                        <span className="ml-2.5 text-sm group-data-[collapsible=icon]:hidden">
                                                            {item.name}
                                                        </span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        );
                                    })}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>

                    <SidebarFooter className="p-2 border-t border-border/50">
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    onClick={handleLogout}
                                    className="h-8 w-full rounded-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors px-2"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="ml-2.5 text-sm group-data-[collapsible=icon]:hidden">
                                        Sign Out
                                    </span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarFooter>
                </Sidebar>

                <SidebarInset className="flex-1 flex flex-col bg-background relative h-full">
                    {/* Zed-like Minimalist Header */}
                    <header className="h-12 flex items-center justify-between px-4 border-b border-border/50 bg-background z-50 shrink-0">
                        <div className="flex items-center gap-3">
                            <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors h-6 w-6" />

                            <div className="hidden md:flex items-center gap-2 relative">
                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                <Input
                                    placeholder="Search..."
                                    className="bg-accent/30 border-border/50 rounded-sm pl-7 h-7 w-[160px] lg:w-[240px] text-xs focus:ring-1 focus:ring-primary/30 transition-all font-sans focus:bg-accent/50"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <ThemeToggle />

                            <Separator orientation="vertical" className="h-4 bg-border/50" />

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-sm hover:bg-accent/50"
                            >
                                <Bell className="w-4 h-4" />
                            </Button>

                            <Separator orientation="vertical" className="h-4 bg-border/50" />

                            <div className="flex items-center gap-2">
                                <div className="hidden sm:flex flex-col items-end">
                                    <p className="text-xs font-medium text-foreground leading-none">
                                        Administrator
                                    </p>
                                    <p className="text-[9px] text-muted-foreground mt-0.5">
                                        Super User
                                    </p>
                                </div>
                                <div className="w-7 h-7 bg-accent/50 rounded-sm border border-border/50 flex items-center justify-center overflow-hidden">
                                    <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Zed-like Content Area */}
                    <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8">
                        <div className="max-w-7xl mx-auto">{children}</div>
                    </main>
                </SidebarInset>
            </div>

            <Toaster richColors position="bottom-right" />
        </SidebarProvider>
    );
}
