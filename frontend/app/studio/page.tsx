
'use client';

import { useState, useEffect } from 'react';
import { Settings, Video, ExternalLink, Copy, Trash2, Shield } from 'lucide-react';

interface VideoData {
    id: string;
    original_name: string;
    status: string;
    created_at: string;
}

export default function StudioPage() {
    const [videos, setVideos] = useState<VideoData[]>([]);
    const [adminKey, setAdminKey] = useState('');
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const savedKey = localStorage.getItem('admin_key');
        if (savedKey) {
            setAdminKey(savedKey);
            checkAuth(savedKey);
        }
    }, []);

    const checkAuth = async (key: string) => {
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/studio/videos`, {
                headers: { 'x-admin-key': key }
            });
            if (res.ok) {
                const data = await res.json();
                setVideos(data);
                setIsAuthorized(true);
                localStorage.setItem('admin_key', key);
            } else {
                setIsAuthorized(false);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const copyEmbed = (id: string) => {
        const code = `<iframe src="${window.location.origin}/e/${id}" width="640" height="360" frameborder="0" allowfullscreen></iframe>`;
        navigator.clipboard.writeText(code);
        alert('Embed Code Copied!');
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this video?')) return;

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/studio/video/${id}`, {
            method: 'DELETE',
            headers: { 'x-admin-key': adminKey }
        });

        if (res.ok) {
            setVideos(videos.filter(v => v.id !== id));
        }
    };

    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 text-white">
                <div className="max-w-md w-full bg-[#111] border border-white/5 rounded-2xl p-8 shadow-2xl">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center">
                            <Shield className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-center mb-2">Vinz Studio</h1>
                    <p className="text-gray-400 text-center mb-8 text-sm">Enter your Admin Key to manage videos</p>

                    <input
                        type="password"
                        value={adminKey}
                        onChange={(e) => setAdminKey(e.target.value)}
                        placeholder="Admin Security Key"
                        className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 mb-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    />

                    <button
                        onClick={() => checkAuth(adminKey)}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all"
                    >
                        {loading ? 'Checking...' : 'Login to Studio'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-6 lg:p-12">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <Video className="text-blue-500" />
                            Creator Studio
                        </h1>
                        <p className="text-gray-400 mt-1">Manage your library and get embed codes</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => { localStorage.removeItem('admin_key'); setIsAuthorized(false); }}
                            className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg text-sm transition-all"
                        >
                            Logout
                        </button>
                    </div>
                </header>

                <div className="grid gap-4">
                    {videos.map(video => (
                        <div key={video.id} className="bg-[#111] border border-white/5 rounded-xl p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-white/10 transition-all">
                            <div className="flex gap-4 items-center">
                                <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center shrink-0">
                                    <Video className="w-6 h-6 text-gray-500" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-semibold truncate">{video.original_name}</h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-xs text-gray-500">{new Date(video.created_at).toLocaleDateString()}</span>
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${video.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                                                video.status === 'processing' ? 'bg-yellow-500/10 text-yellow-500' :
                                                    'bg-red-500/10 text-red-500'
                                            }`}>
                                            {video.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 md:gap-4 shrink-0">
                                <a
                                    href={`/f/${video.id}`}
                                    target="_blank"
                                    className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-all"
                                    title="View Link"
                                >
                                    <ExternalLink className="w-5 h-5" />
                                </a>
                                <button
                                    onClick={() => copyEmbed(video.id)}
                                    className="flex items-center gap-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                                >
                                    <Copy className="w-4 h-4" /> Embed
                                </button>
                                <button
                                    onClick={() => handleDelete(video.id)}
                                    className="p-2 hover:bg-red-500/10 rounded-lg text-gray-500 hover:text-red-500 transition-all"
                                    title="Delete"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {videos.length === 0 && (
                        <div className="text-center py-24 bg-[#111] rounded-2xl border border-dashed border-white/5">
                            <Video className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-500">No videos found. Start uploading!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
