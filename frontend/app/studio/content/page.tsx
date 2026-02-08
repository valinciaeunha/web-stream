
'use client';

import { useState, useEffect } from 'react';
import {
    Video as VideoIcon,
    ExternalLink,
    Copy,
    Trash2,
    Plus,
    MoreHorizontal,
    Search,
    Filter,
    Download
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface VideoData {
    id: string;
    original_name: string;
    status: string;
    created_at: string;
}

export default function ContentPage() {
    const [videos, setVideos] = useState<VideoData[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

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
            toast.error("Failed to load content");
        } finally {
            setLoading(false);
        }
    };

    const copyEmbed = (id: string) => {
        const urlPart = window.location.origin;
        const code = `<iframe src="${urlPart}/e/${id}" width="640" height="360" frameborder="0" allowfullscreen></iframe>`;
        navigator.clipboard.writeText(code);
        toast.success("Embed Code Copied", { description: "You can now paste it into your website." });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this video?')) return;

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        try {
            const res = await fetch(`${apiUrl}/api/studio/video/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (res.ok) {
                setVideos(videos.filter(v => v.id !== id));
                toast.success("Video Deleted", { description: "The content was removed successfully." });
            }
        } catch (err) {
            toast.error("Deletion failed");
        }
    };

    const filteredVideos = videos.filter(v =>
        v.original_name.toLowerCase().includes(search.toLowerCase()) ||
        v.id.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-10 w-48 bg-white/5" />
                    <Skeleton className="h-10 w-32 bg-white/5" />
                </div>
                <Card className="bg-[#111] border-white/5">
                    <CardContent className="p-0">
                        <div className="space-y-4 p-8">
                            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 w-full bg-white/5 rounded-xl" />)}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        Channel Content
                        <Badge variant="outline" className="text-[10px] font-black uppercase text-blue-500 border-blue-500/20 bg-blue-500/5">
                            {videos.length} Total
                        </Badge>
                    </h1>
                    <p className="text-gray-500 font-medium">Manage and distribute your high-performance video assets.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="bg-white/5 border-white/5 text-gray-400 hover:text-white transition-all h-11 rounded-xl">
                        <Download className="w-4 h-4 mr-2" /> Export
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white font-black h-11 px-6 rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all">
                        <Plus className="w-5 h-5 mr-2" /> Upload New
                    </Button>
                </div>
            </header>

            <Card className="bg-[#111] border-white/5 overflow-hidden rounded-3xl shadow-2xl">
                <CardHeader className="p-6 border-b border-white/5 bg-black/20">
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <div className="relative max-w-sm w-full group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                            <Input
                                placeholder="Search videos..."
                                className="bg-black/40 border-white/5 rounded-xl pl-10 h-11 focus:ring-0 focus:border-blue-500/50"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/5">
                                <Filter className="w-4 h-4 mr-2" /> Filter
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-white/[0.02]">
                                <TableRow className="border-white/5 hover:bg-transparent uppercase text-[10px] font-black tracking-widest text-gray-600">
                                    <TableHead className="w-[400px] h-14 pl-8">Video Details</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date Added</TableHead>
                                    <TableHead className="text-right pr-8">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredVideos.map((video) => (
                                    <TableRow key={video.id} className="border-white/5 hover:bg-white/[0.03] transition-all group">
                                        <TableCell className="pl-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/5 group-hover:bg-blue-600/10 group-hover:border-blue-500/20 transition-all">
                                                    <VideoIcon className="w-6 h-6 text-gray-600 group-hover:text-blue-500" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-white text-sm truncate max-w-[300px]">{video.original_name}</p>
                                                    <p className="text-[10px] text-gray-600 font-black uppercase tracking-tighter mt-1">{video.id}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={`uppercase text-[9px] font-black tracking-widest px-3 py-1 rounded-full ${video.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                        video.status === 'processing' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                                            'bg-red-500/10 text-red-500 border-red-500/20'
                                                    }`}
                                                variant="outline"
                                            >
                                                {video.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs font-bold text-gray-500">
                                            {new Date(video.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right pr-8">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button size="icon" variant="ghost" asChild className="text-gray-500 hover:text-white hover:bg-white/5 rounded-lg active:scale-95">
                                                    <a href={`/f/${video.id}`} target="_blank"><ExternalLink className="w-4 h-4" /></a>
                                                </Button>
                                                <Button size="sm" onClick={() => copyEmbed(video.id)} className="bg-white/5 hover:bg-blue-600 text-gray-400 hover:text-white border border-white/5 rounded-xl active:scale-95 px-4">
                                                    <Copy className="w-3.5 h-3.5 mr-2" /> Embed
                                                </Button>
                                                <Button size="icon" variant="ghost" onClick={() => handleDelete(video.id)} className="text-gray-700 hover:text-red-500 hover:bg-red-500/10 rounded-lg active:scale-95">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    {filteredVideos.length === 0 && (
                        <div className="text-center py-24">
                            <VideoIcon className="w-16 h-16 text-gray-800 mx-auto mb-6" />
                            <p className="text-gray-600 font-bold uppercase tracking-widest text-sm">No videos matching your search</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
