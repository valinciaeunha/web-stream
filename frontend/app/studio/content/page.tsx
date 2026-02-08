
'use client';

import { useState, useEffect } from 'react';
import { Video, ExternalLink, Copy, Trash2, Clock, CheckCircle2, AlertCircle, Plus } from 'lucide-react';

interface VideoData {
    id: string;
    original_name: string;
    status: string;
    created_at: string;
}

export default function ContentPage() {
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

    const copyEmbed = (id: string) => {
        const urlPart = window.location.origin;
        const code = `<iframe src="${urlPart}/e/${id}" width="640" height="360" frameborder="0" allowfullscreen></iframe>`;
        navigator.clipboard.writeText(code);
        alert('Embed Code Copied!');
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this video?')) return;

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiUrl}/api/studio/video/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (res.ok) {
            setVideos(videos.filter(v => v.id !== id));
        }
    };

    if (loading) return null;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Channel Content</h1>
                    <p className="text-gray-500 mt-2 font-medium">Upload, manage, and distribute your video library</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95 transition-all">
                    <Plus className="w-5 h-5" /> Upload Video
                </button>
            </header>

            <div className="grid gap-4">
                {videos.map(video => (
                    <div key={video.id} className="bg-[#111] border border-white/5 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-[#141414] transition-all group border-l-4 border-l-transparent hover:border-l-blue-600 shadow-xl shadow-black/20">
                        <div className="flex gap-5 items-center">
                            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-blue-600/10 transition-colors border border-white/5">
                                <Video className="w-8 h-8 text-gray-500 group-hover:text-blue-500 transition-colors" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-black text-lg text-white truncate group-hover:text-blue-400 transition-colors">
                                    {video.original_name}
                                </h3>
                                <div className="flex items-center gap-4 mt-2">
                                    <span className="text-[10px] text-gray-500 flex items-center gap-1.5 font-black uppercase tracking-widest">
                                        <Clock className="w-3.5 h-3.5" />
                                        {new Date(video.created_at).toLocaleDateString()}
                                    </span>
                                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${video.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                                        video.status === 'processing' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                                            'bg-red-500/20 text-red-500'
                                        }`}>
                                        {video.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                                        {video.status === 'processing' && <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />}
                                        {video.status === 'failed' && <AlertCircle className="w-3 h-3" />}
                                        {video.status}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                            <a
                                href={`/f/${video.id}`}
                                target="_blank"
                                className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-400 hover:text-white transition-all border border-white/5"
                                title="Open Link"
                            >
                                <ExternalLink className="w-5 h-5" />
                            </a>
                            <button
                                onClick={() => copyEmbed(video.id)}
                                className="flex items-center gap-2.5 bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/5 active:scale-95 border border-blue-600/20"
                            >
                                <Copy className="w-4 h-4" /> Embed
                            </button>
                            <button
                                onClick={() => handleDelete(video.id)}
                                className="p-3 bg-white/5 hover:bg-red-500/10 rounded-2xl text-gray-500 hover:text-red-500 transition-all border border-white/5"
                                title="Delete Forever"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}

                {videos.length === 0 && (
                    <div className="text-center py-32 bg-[#111] rounded-[3rem] border border-dashed border-white/10 shadow-inner shadow-black/40">
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                            <Video className="w-12 h-12 text-gray-600" />
                        </div>
                        <p className="text-gray-500 font-black uppercase tracking-widest">Your library is currently empty</p>
                        <button className="mt-8 text-blue-500 font-black hover:text-blue-400 transition-colors uppercase text-sm tracking-tighter">Start your first upload</button>
                    </div>
                )}
            </div>
        </div>
    );
}
