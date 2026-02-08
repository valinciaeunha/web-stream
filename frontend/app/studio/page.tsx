
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
    Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress"; // I need to add progress

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
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            trend: '+12%',
            trendUp: true
        },
        {
            name: 'Impressions',
            value: '4.2k',
            icon: Eye,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10',
            trend: '+5%',
            trendUp: true
        },
        {
            name: 'Conversions',
            value: '842',
            icon: Users,
            color: 'text-green-500',
            bg: 'bg-green-500/10',
            trend: '-2%',
            trendUp: false
        },
        {
            name: 'Engagement',
            value: '18h',
            icon: PlayCircle,
            color: 'text-orange-500',
            bg: 'bg-orange-500/10',
            trend: '+18%',
            trendUp: true
        },
    ];

    if (loading) return (
        <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40 w-full bg-[#111] rounded-3xl" />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Skeleton className="lg:col-span-2 h-96 bg-[#111] rounded-3xl" />
                <Skeleton className="h-96 bg-[#111] rounded-3xl" />
            </div>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-1000">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-white tracking-tight">Executive Overview</h1>
                    <p className="text-gray-500 font-medium">Real-time performance metrics for your streaming channel.</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                    <Clock className="w-3 h-3" />
                    Last update: {new Date().toLocaleTimeString()}
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <Card key={stat.name} className="bg-[#111] border-white/5 rounded-3xl overflow-hidden hover:border-blue-500/20 transition-all group shadow-xl">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} border border-white/5`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <div className={`flex items-center text-[10px] font-black px-2 py-1 rounded-lg ${stat.trendUp ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'}`}>
                                {stat.trendUp ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                                {stat.trend}
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{stat.name}</p>
                            <h2 className="text-3xl font-black text-white tracking-tight">{stat.value}</h2>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 bg-[#111] border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <TrendingUp className="w-48 h-48 text-blue-500 -mr-16 -mt-16" />
                    </div>

                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <TrendingUp className="text-blue-500 w-5 h-5" />
                                Analytics Performance
                            </CardTitle>
                            <CardDescription className="font-medium text-gray-500 mt-1">Video engagement and reach trends</CardDescription>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-black text-gray-400 bg-white/5 border-white/10 uppercase tracking-widest px-4 py-1.5 rounded-xl">7 Days</Badge>
                    </div>

                    <div className="h-64 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl bg-black/40 shadow-inner">
                        <BarChart3 className="w-12 h-12 text-gray-800 mb-4 animate-pulse" />
                        <p className="text-gray-600 font-black uppercase text-[10px] tracking-[0.3em]">Processing Visual Data...</p>
                    </div>
                </Card>

                <Card className="bg-[#111] border-white/5 rounded-3xl shadow-2xl overflow-hidden">
                    <CardHeader className="border-b border-white/5 bg-black/20 p-8">
                        <CardTitle className="text-xl font-bold">Recent Uploads</CardTitle>
                        <CardDescription className="text-gray-500 font-medium tracking-tight">Your latest content activity</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 bg-black/5">
                        <div className="space-y-2">
                            {videos.slice(0, 5).map(v => (
                                <div key={v.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-white/5 group">
                                    <div className="w-11 h-11 bg-blue-600/10 rounded-xl flex items-center justify-center shrink-0 border border-blue-500/10 group-hover:border-blue-500/30 transition-all">
                                        <VideoIcon className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[13px] font-bold text-white truncate group-hover:text-blue-400 transition-colors uppercase tracking-tight">{v.original_name || 'System Asset'}</p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">{v.status}</p>
                                            <div className="w-1 h-1 rounded-full bg-gray-800" />
                                            <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">{new Date(v.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <ArrowUpRight className="w-4 h-4 text-gray-800 group-hover:text-white transition-all" />
                                </div>
                            ))}
                            {videos.length === 0 && (
                                <div className="text-center py-20 px-4">
                                    <VideoIcon className="w-10 h-10 text-gray-800 mx-auto mb-4" />
                                    <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">Awaiting Content Upload</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
