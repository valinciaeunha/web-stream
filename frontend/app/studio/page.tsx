
'use client';

import { useState, useEffect } from 'react';
import {
    Users,
    Video as VideoIcon,
    Eye,
    TrendingUp,
    PlayCircle,
    BarChart3
} from 'lucide-react';

interface VideoData {
    id: string;
    status: string;
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
            const res = await fetch(`${apiUrl}/api/studio/videos`);
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
        { name: 'Total Videos', value: videos.length, icon: VideoIcon, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { name: 'Total Views', value: '0', icon: Eye, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { name: 'Active Sessions', value: '0', icon: Users, color: 'text-green-500', bg: 'bg-green-500/10' },
        { name: 'Watch Time', value: '0h', icon: PlayCircle, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    ];

    if (loading) return null;

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            <header>
                <h1 className="text-4xl font-black text-white tracking-tight">Dashboard</h1>
                <p className="text-gray-500 mt-2 font-medium">Welcome back to your creator command center.</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.name} className="bg-[#111] border border-white/5 rounded-3xl p-6 hover:border-blue-500/20 transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <BarChart3 className="w-5 h-5 text-gray-800 group-hover:text-gray-600 transition-colors" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">{stat.name}</p>
                            <p className="text-3xl font-black text-white">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-[#111] border border-white/5 rounded-3xl p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <TrendingUp className="text-blue-500" />
                            Analytics Overview
                        </h2>
                        <span className="text-xs font-bold text-gray-500 bg-white/5 px-3 py-1.5 rounded-full uppercase tracking-tighter">Last 7 Days</span>
                    </div>
                    <div className="h-64 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl bg-black/20">
                        <BarChart3 className="w-12 h-12 text-gray-800 mb-4" />
                        <p className="text-gray-600 font-bold uppercase text-[10px] tracking-[0.2em]">Data visualization coming soon</p>
                    </div>
                </div>

                <div className="bg-[#111] border border-white/5 rounded-3xl p-8">
                    <h2 className="text-xl font-bold mb-8">Recent Uploads</h2>
                    <div className="space-y-4">
                        {videos.slice(0, 5).map(v => (
                            <div key={v.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-white/5">
                                <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center shrink-0">
                                    <VideoIcon className="w-5 h-5 text-blue-500" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-bold text-white truncate">Video ID: {v.id.slice(0, 8)}...</p>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">{v.status}</p>
                                </div>
                            </div>
                        ))}
                        {videos.length === 0 && <p className="text-gray-600 text-sm text-center py-10">No videos yet</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
