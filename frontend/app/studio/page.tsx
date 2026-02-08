
'use client';

import { useState, useEffect } from 'react';
import {
    Users,
    Video as VideoIcon,
    Eye,
    TrendingUp,
    PlayCircle,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    Sparkles,
    Zap,
    Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

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
            name: 'Digital Assets',
            value: videos.length,
            icon: VideoIcon,
            color: 'text-primary',
            bg: 'bg-primary/10',
            trend: '+12%',
            trendUp: true
        },
        {
            name: 'Audience Reach',
            value: '4.2k',
            icon: Eye,
            color: 'text-sky-500',
            bg: 'bg-sky-500/10',
            trend: '+5%',
            trendUp: true
        },
        {
            name: 'Conversions',
            value: '842',
            icon: Zap,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
            trend: '-2%',
            trendUp: false
        },
        {
            name: 'Playback Time',
            value: '18h',
            icon: Activity,
            color: 'text-orange-500',
            bg: 'bg-orange-500/10',
            trend: '+18%',
            trendUp: true
        },
    ];

    if (loading) return (
        <div className="space-y-12 animate-in fade-in duration-700">
            <div className="space-y-3">
                <Skeleton className="h-12 w-64 bg-white/5 rounded-2xl" />
                <Skeleton className="h-5 w-96 bg-white/5 rounded-xl" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-44 w-full bg-white/5 rounded-[2rem]" />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Skeleton className="lg:col-span-2 h-[500px] bg-white/5 rounded-[2.5rem]" />
                <Skeleton className="h-[500px] bg-white/5 rounded-[2.5rem]" />
            </div>
        </div>
    );

    return (
        <div className="space-y-16 animate-in fade-in duration-1000 slide-in-from-bottom-6">

            {/* Mesh Surface Decoration */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full -z-10 pointer-events-none" />

            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div className="space-y-3">
                    <Badge variant="outline" className="text-[10px] font-heading font-black uppercase text-primary border-primary/20 bg-primary/5 px-3 py-1 rounded-full animate-pulse">
                        <Sparkles className="w-3 h-3 mr-2" /> Live Performance
                    </Badge>
                    <h1 className="text-5xl font-heading font-black text-white tracking-tighter leading-none italic uppercase">Studio Core</h1>
                    <p className="text-zinc-500 font-medium text-lg leading-relaxed max-w-xl">Intelligent insights and unified control for your creative distribution pipeline.</p>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-heading font-black text-zinc-500 bg-white/5 px-5 py-3 rounded-2xl border border-white/5 uppercase tracking-[0.2em] shadow-2xl">
                    <Clock className="w-3.5 h-3.5 mr-1 text-primary opacity-60" />
                    Sync: {new Date().toLocaleTimeString()}
                </div>
            </header>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat, idx) => (
                    <Card key={stat.name} className={`bg-zinc-950/40 backdrop-blur-3xl border-white/5 rounded-[2rem] overflow-hidden hover:border-primary/30 transition-all duration-700 group shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)] border-t-white/10 animate-in slide-in-from-bottom-8 delay-${idx * 150}`}>
                        <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0 px-8 pt-8">
                            <div className={`p-3.5 rounded-2xl ${stat.bg} ${stat.color} border border-white/5 group-hover:scale-110 transition-transform duration-500 shadow-xl`}>
                                <stat.icon className="w-5 h-5 shadow-inner" />
                            </div>
                            <div className={`flex items-center text-[10px] font-heading font-black px-2.5 py-1.5 rounded-xl border border-white/5 ${stat.trendUp ? 'text-emerald-400 bg-emerald-400/5' : 'text-rose-400 bg-rose-400/5'}`}>
                                {stat.trendUp ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                                {stat.trend}
                            </div>
                        </CardHeader>
                        <CardContent className="px-8 pb-8 pt-2">
                            <p className="text-zinc-600 text-[10px] font-heading font-bold uppercase tracking-[0.3em] mb-1.5 opacity-80">{stat.name}</p>
                            <h2 className="text-4xl font-heading font-black text-white tracking-tighter italic">{stat.value}</h2>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <Card className="lg:col-span-2 bg-zinc-950/40 backdrop-blur-3xl border-white/5 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group border-t-white/10">
                    <div className="absolute top-[-20%] right-[-10%] p-12 opacity-5 group-hover:opacity-10 transition-opacity duration-1000 rotate-12">
                        <TrendingUp className="w-[400px] h-[400px] text-primary" />
                    </div>

                    <div className="flex items-center justify-between mb-12 relative z-10">
                        <div>
                            <CardTitle className="text-2xl font-heading font-black text-white italic tracking-tight">Distribution Velocity</CardTitle>
                            <CardDescription className="font-medium text-zinc-500 mt-2 text-sm">Aggregated engagement and network throughput analysis.</CardDescription>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-heading font-black text-zinc-400 bg-white/5 border-white/10 uppercase tracking-[0.25em] px-5 py-2 rounded-2xl">Rolling 168h</Badge>
                    </div>

                    <div className="h-80 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-[2rem] bg-black/40 shadow-inner relative z-10">
                        <BarChart3 className="w-16 h-16 text-zinc-800 mb-6 animate-pulse" />
                        <p className="text-zinc-600 font-heading font-black uppercase text-[10px] tracking-[0.5em] opacity-40">Synthesizing Network Data...</p>
                    </div>
                </Card>

                <Card className="bg-zinc-950/40 backdrop-blur-3xl border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden border-t-white/10 group">
                    <CardHeader className="border-b border-white/5 bg-black/40 p-10">
                        <CardTitle className="text-2xl font-heading font-black text-white italic tracking-tight">Latest Assets</CardTitle>
                        <CardDescription className="text-zinc-500 font-medium tracking-tight mt-1">Real-time update on creative ingestion.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 bg-black/10 h-full">
                        <div className="space-y-3 p-4">
                            {videos.slice(0, 5).map((v, i) => (
                                <div key={v.id} className={`flex items-center gap-4 p-5 rounded-[1.5rem] hover:bg-white/[0.03] transition-all duration-500 cursor-pointer border border-transparent hover:border-white/5 group/item animate-in slide-in-from-right-8 delay-${i * 100}`}>
                                    <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center shrink-0 border border-white/5 group-hover/item:border-primary/30 group-hover/item:bg-primary/5 transition-all duration-500 shadow-xl">
                                        <VideoIcon className="w-5 h-5 text-zinc-700 group-hover/item:text-primary" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-heading font-bold text-white truncate group-hover/item:text-primary transition-colors uppercase tracking-tight italic">{v.original_name || 'System Asset'}</p>
                                        <div className="flex items-center gap-3 mt-1.5 opacity-60">
                                            <Badge variant="outline" className={`text-[8px] font-heading font-black uppercase tracking-widest px-2 ${v.status === 'completed' ? 'text-emerald-400 border-emerald-400/20' : 'text-primary border-primary/20'}`}>
                                                {v.status}
                                            </Badge>
                                            <div className="w-1 h-1 rounded-full bg-zinc-800" />
                                            <p className="text-[9px] text-zinc-600 font-heading font-bold uppercase tracking-widest">{new Date(v.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <ArrowUpRight className="w-5 h-5 text-zinc-800 group-hover/item:text-white transition-all transform group-hover/item:translate-x-1 group-hover/item:-translate-y-1" />
                                </div>
                            ))}
                            {videos.length === 0 && (
                                <div className="text-center py-28 px-4">
                                    <VideoIcon className="w-14 h-14 text-zinc-900 mx-auto mb-6 opacity-40" />
                                    <p className="text-zinc-600 text-[10px] font-heading font-black uppercase tracking-[0.4em]">Listening for Incoming Assets</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
