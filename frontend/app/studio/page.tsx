"use client";

import { useState, useEffect } from "react";
import { API_URL } from "@/lib/config";
import {
    Video as VideoIcon,
    Eye,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    Zap,
    Activity,
    BarChart3,
    ArrowRight,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface VideoData {
    id: string;
    status: string;
    original_name: string;
    created_at: string;
}

export default function DashboardPage() {
    const [videos, setVideos] = useState<VideoData[]>([]);
    const [loading, setLoading] = useState(true);

    const [statsData, setStatsData] = useState<any>(null);

    useEffect(() => {
        Promise.all([fetchVideos(), fetchStats()]);
    }, []);

    const fetchVideos = async () => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        try {
            const res = await fetch(`${API_URL}/api/studio/videos`, {
                credentials: "include",
            });
            if (res.ok) {
                const data = await res.json();
                setVideos(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchStats = async () => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        try {
            const res = await fetch(`${API_URL}/api/studio/stats`, {
                credentials: "include",
            });
            if (res.ok) {
                const data = await res.json();
                setStatsData(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${mins}m`;
    };

    const stats = [
        {
            name: "Total Assets",
            value: statsData?.total_videos || "0",
            icon: VideoIcon,
            color: "text-primary",
            trend: `${statsData?.processing_videos || 0} processing`,
            trendUp: true,
        },
        {
            name: "Total Duration",
            value: formatDuration(statsData?.total_duration || 0),
            icon: Clock,
            color: "text-sky-500",
            trend: "lifetime",
            trendUp: true,
        },
        {
            name: "Folders",
            value: statsData?.total_folders || "0",
            icon: TrendingUp, // Changed icon
            color: "text-emerald-500",
            trend: "organized",
            trendUp: true,
        },
        {
            name: "Storage Used",
            value: "N/A", // Backend doesn't provide this yet
            icon: Activity,
            color: "text-orange-500",
            trend: "estimated",
            trendUp: true,
        },
    ];

    if (loading)
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-4 w-72" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-xl" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Skeleton className="lg:col-span-2 h-96 rounded-xl" />
                    <Skeleton className="h-96 rounded-xl" />
                </div>
            </div>
        );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-heading font-semibold text-foreground tracking-tight">
                        Overview
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Performance metrics for your streaming channel
                    </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-accent/30 px-2.5 py-1.5 rounded-sm border border-border/50">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date().toLocaleTimeString()}
                </div>
            </header>

            {/* Zed-like Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {stats.map((stat) => (
                    <Card
                        key={stat.name}
                        className="bg-card/50 border-border/50 hover:border-border transition-colors rounded-sm shadow-none group"
                    >
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 px-4 pt-4">
                            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                                {stat.name}
                            </p>
                            <stat.icon className={`w-4 h-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                            <div className="flex items-baseline justify-between">
                                <h2 className="text-2xl font-heading font-semibold text-foreground">
                                    {stat.value}
                                </h2>
                                <div
                                    className={`flex items-center text-[9px] font-medium px-1.5 py-0.5 rounded-sm ${stat.trendUp ? "text-emerald-400" : "text-rose-400"}`}
                                >
                                    {stat.trendUp ? (
                                        <ArrowUpRight className="w-2.5 h-2.5 mr-0.5" />
                                    ) : (
                                        <ArrowDownRight className="w-2.5 h-2.5 mr-0.5" />
                                    )}
                                    {stat.trend}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="lg:col-span-2 bg-card/50 border-border/50 rounded-sm shadow-none overflow-hidden p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <CardTitle className="text-base font-heading font-semibold">
                                Analytics
                            </CardTitle>
                            <CardDescription className="text-xs mt-1">
                                Engagement and reach trends
                            </CardDescription>
                        </div>
                        <Badge
                            variant="outline"
                            className="rounded-sm font-medium text-[9px] text-muted-foreground h-5 px-2 border-border/50"
                        >
                            7 Days
                        </Badge>
                    </div>

                    <div className="h-48 flex flex-col items-center justify-center border border-dashed border-border/50 rounded-sm bg-accent/30">
                        <BarChart3 className="w-8 h-8 text-muted-foreground/30 mb-2 animate-pulse" />
                        <p className="text-muted-foreground text-[10px] font-medium">
                            Processing data...
                        </p>
                    </div>
                </Card>

                <Card className="bg-card/50 border-border/50 rounded-sm shadow-none overflow-hidden flex flex-col">
                    <CardHeader className="p-4 border-b border-border/50 bg-accent/20">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-heading font-semibold">
                                Recent
                            </CardTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className="h-7 text-[10px] font-medium px-2 hover:bg-accent/50"
                            >
                                <Link href="/studio/content">
                                    View All <ArrowRight className="w-3 h-3 ml-1" />
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 p-2">
                        <div className="space-y-1">
                            {videos.slice(0, 5).map((v) => (
                                <div
                                    key={v.id}
                                    className="flex items-center gap-2.5 p-2 rounded-sm hover:bg-accent/30 transition-all group cursor-pointer"
                                >
                                    <div className="w-8 h-8 bg-accent/50 rounded-sm flex items-center justify-center shrink-0 border border-border/50">
                                        <VideoIcon className="w-3.5 h-3.5 text-muted-foreground" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-medium text-foreground truncate">
                                            {v.original_name || "Asset Unit"}
                                        </p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <Badge
                                                variant="outline"
                                                className={`text-[8px] font-medium px-1.5 h-4 rounded-sm border-border/50 ${v.status === "completed" ? "text-emerald-400" : "text-primary"}`}
                                            >
                                                {v.status}
                                            </Badge>
                                            <span className="text-[9px] text-muted-foreground">
                                                {new Date(v.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
                                </div>
                            ))}
                            {videos.length === 0 && (
                                <div className="text-center py-12">
                                    <VideoIcon className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
                                    <p className="text-muted-foreground text-xs font-medium">
                                        No uploads yet
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
