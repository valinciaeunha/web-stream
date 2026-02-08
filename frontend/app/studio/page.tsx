
'use client';

import { useState, useEffect } from 'react';
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
    ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface VideoData {
    id: string;
    status: string;
    original_name: string;
    created_at: string;
}

export default function DashboardPage() {
    const [videos, setVideos] = useState<VideoData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        try {
            const res = await fetch(`${apiUrl}/api/studio/videos`, {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setVideos(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        {
            name: 'Total Assets',
            value: videos.length,
            icon: VideoIcon,
            color: 'text-primary',
            trend: '+12%',
            trendUp: true
        },
        {
            name: 'Impressions',
            value: '4.2k',
            icon: Eye,
            color: 'text-sky-500',
            trend: '+5%',
            trendUp: true
        },
        {
            name: 'Conversions',
            value: '842',
            icon: Zap,
            color: 'text-emerald-500',
            trend: '-2%',
            trendUp: false
        },
        {
            name: 'Engagement',
            value: '18h',
            icon: Activity,
            color: 'text-orange-500',
            trend: '+18%',
            trendUp: true
        },
    ];

    if (loading) return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="space-y-2">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-4 w-72" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Skeleton className="lg:col-span-2 h-96 rounded-xl" />
                <Skeleton className="h-96 rounded-xl" />
            </div>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-700">

            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-heading font-bold text-foreground tracking-tight">Executive Overview</h1>
                    <p className="text-muted-foreground text-sm">Real-time performance metrics for your streaming channel.</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-accent/40 px-4 py-2 rounded-lg border border-border">
                    <Clock className="w-3.5 h-3.5" />
                    Last update: {new Date().toLocaleTimeString()}
                </div>
            </header>

            {/* Clean Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <Card key={stat.name} className="bg-card border-border hover:border-primary/50 transition-colors rounded-xl shadow-sm group">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 px-6 pt-6">
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{stat.name}</p>
                            <stat.icon className={`w-4 h-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent className="px-6 pb-6">
                            <div className="flex items-baseline justify-between">
                                <h2 className="text-3xl font-heading font-bold text-foreground">{stat.value}</h2>
                                <div className={`flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${stat.trendUp ? 'text-emerald-500 border-emerald-500/10 bg-emerald-500/5' : 'text-rose-500 border-rose-500/10 bg-rose-500/5'}`}>
                                    {stat.trendUp ? <ArrowUpRight className="w-2.5 h-2.5 mr-0.5" /> : <ArrowDownRight className="w-2.5 h-2.5 mr-0.5" />}
                                    {stat.trend}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 bg-card border-border rounded-2xl shadow-sm overflow-hidden p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <CardTitle className="text-xl font-heading font-bold">Analytics Performance</CardTitle>
                            <CardDescription className="text-sm mt-1">Video engagement and reach trends</CardDescription>
                        </div>
                        <Badge variant="outline" className="rounded-md font-bold text-[10px] uppercase tracking-wider text-muted-foreground h-7 px-3">7 Days</Badge>
                    </div>

                    <div className="h-64 flex flex-col items-center justify-center border border-dashed border-border rounded-xl bg-accent/20">
                        <BarChart3 className="w-12 h-12 text-muted/30 mb-4 animate-pulse" />
                        <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.3em]">Processing Visual Data...</p>
                    </div>
                </Card>

                <Card className="bg-card border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
                    <CardHeader className="p-8 border-b border-border bg-accent/10">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl font-heading font-bold">Recent Uploads</CardTitle>
                            <Button variant="ghost" size="sm" asChild className="h-8 text-xs font-bold px-3">
                                <Link href="/studio/content">View All <ArrowRight className="w-3.5 h-3.5 ml-2" /></Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 p-3">
                        <div className="space-y-1">
                            {videos.slice(0, 5).map((v) => (
                                <div key={v.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/40 transition-all group cursor-pointer border border-transparent hover:border-border">
                                    <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center shrink-0 border border-border group-hover:border-primary/20 transition-colors">
                                        <VideoIcon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-bold text-foreground truncate uppercase tracking-tight">{v.original_name || 'Asset Unit'}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="outline" className={`text-[8px] font-bold uppercase tracking-widest px-1.5 h-4 ${v.status === 'completed' ? 'text-emerald-500 border-emerald-500/20' : 'text-primary border-primary/20'}`}>
                                                {v.status}
                                            </Badge>
                                            <span className="text-[9px] text-muted-foreground">{new Date(v.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <ArrowUpRight className="w-4 h-4 text-muted/20 group-hover:text-foreground transition-colors" />
                                </div>
                            ))}
                            {videos.length === 0 && (
                                <div className="text-center py-20">
                                    <VideoIcon className="w-10 h-10 text-muted/20 mx-auto mb-4" />
                                    <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Awaiting Content Upload</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
