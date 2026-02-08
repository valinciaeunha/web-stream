
'use client';

import { useState, useEffect } from 'react';
import {
    Video as VideoIcon,
    ExternalLink,
    Copy,
    Trash2,
    Plus,
    Search,
    Filter,
    Download,
    Play,
    Info,
    ArrowUpRight,
    Sparkles
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
            toast.error("Network synchronization failed", { description: "Could not retrieve asset data." });
        } finally {
            setLoading(false);
        }
    };

    const copyEmbed = (id: string) => {
        const urlPart = window.location.origin;
        const code = `<iframe src="${urlPart}/e/${id}" width="640" height="360" frameborder="0" allowfullscreen></iframe>`;
        navigator.clipboard.writeText(code);
        toast.success("Code Captured", {
            description: "Embed snippet copied to clipboard.",
            style: { background: '#111', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Permanent Deletion: Are you sure you want to remove this asset?')) return;

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        try {
            const res = await fetch(`${apiUrl}/api/studio/video/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (res.ok) {
                setVideos(videos.filter(v => v.id !== id));
                toast.success("Asset Purged", { description: "The content was successfully removed from the network." });
            }
        } catch (err) {
            toast.error("Operation failed");
        }
    };

    const filteredVideos = videos.filter(v =>
        v.original_name.toLowerCase().includes(search.toLowerCase()) ||
        v.id.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="space-y-12 animate-in fade-in duration-700">
                <div className="flex justify-between items-end px-2">
                    <div className="space-y-3">
                        <Skeleton className="h-12 w-64 bg-white/5 rounded-2xl" />
                        <Skeleton className="h-5 w-80 bg-white/5 rounded-xl" />
                    </div>
                    <Skeleton className="h-12 w-40 bg-white/5 rounded-2xl" />
                </div>
                <Card className="bg-zinc-950/40 backdrop-blur-3xl border-white/5 rounded-[2.5rem] overflow-hidden">
                    <CardContent className="p-0">
                        <div className="space-y-6 p-10">
                            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-20 w-full bg-white/5 rounded-2xl" />)}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-16 animate-in fade-in duration-1000 slide-in-from-bottom-6">

            {/* Mesh Surface Decoration */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full -z-10 pointer-events-none" />

            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-2">
                <div className="space-y-4">
                    <Badge variant="outline" className="text-[10px] font-heading font-black uppercase text-primary border-primary/20 bg-primary/5 px-3 py-1 rounded-full">
                        <Layers size={12} className="mr-2" /> Asset Library
                    </Badge>
                    <h1 className="text-5xl font-heading font-black text-white tracking-tighter leading-none italic uppercase">Creative Ingestion</h1>
                    <p className="text-zinc-500 font-medium text-lg leading-relaxed max-w-2xl">Manage your digital distribution pipeline with high-precision control and real-time status tracking.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" className="bg-zinc-900/50 border-white/5 text-zinc-400 hover:text-white transition-all h-14 rounded-2xl px-6 group">
                        <Download className="w-5 h-5 mr-3 group-hover:translate-y-0.5 transition-transform" /> Export Data
                    </Button>
                    <Button className="bg-primary hover:bg-primary/90 text-white font-heading font-black h-14 px-8 rounded-2xl shadow-[0_12px_24px_-8px_rgba(var(--primary),0.3)] hover:shadow-primary/40 active:scale-95 transition-all text-xs uppercase tracking-[0.2em] group">
                        <Plus className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform duration-500" /> Ingest New Asset
                    </Button>
                </div>
            </header>

            <Card className="bg-zinc-950/40 backdrop-blur-3xl border-white/5 overflow-hidden rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)] border-t-white/10 group">
                <CardHeader className="p-10 border-b border-white/5 bg-black/40">
                    <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
                        <div className="relative max-w-md w-full group/search">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-700 group-focus-within/search:text-primary transition-colors duration-500" />
                            <Input
                                placeholder="Search inventory..."
                                className="bg-black/40 border-white/5 rounded-2xl pl-12 h-14 focus:ring-0 focus:border-primary/40 focus:bg-black/60 transition-all duration-500 text-sm font-semibold placeholder:text-zinc-800"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" className="text-zinc-500 hover:text-white hover:bg-white/5 rounded-xl px-5 h-12 font-heading font-bold uppercase tracking-widest text-[10px]">
                                <Filter className="w-4 h-4 mr-3" /> Advanced Filters
                            </Button>
                            <div className="w-[1px] h-6 bg-white/5 mx-2" />
                            <p className="text-[10px] font-heading font-black text-zinc-600 uppercase tracking-[0.3em]">
                                Showing <span className="text-white">{filteredVideos.length}</span> Assets
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto custom-scrollbar">
                        <Table>
                            <TableHeader className="bg-white/[0.01]">
                                <TableRow className="border-white/5 hover:bg-transparent uppercase text-[10px] font-heading font-black tracking-[0.25em] text-zinc-600">
                                    <TableHead className="w-[450px] h-16 pl-10">Primary Descriptor</TableHead>
                                    <TableHead>Deployment Status</TableHead>
                                    <TableHead>Ingestion Date</TableHead>
                                    <TableHead className="text-right pr-10">Control Layer</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredVideos.map((video, idx) => (
                                    <TableRow key={video.id} className="border-white/5 hover:bg-white/[0.03] transition-all duration-500 group/row animate-in slide-in-from-left-8" style={{ animationDelay: `${idx * 50}ms` }}>
                                        <TableCell className="pl-10 py-7">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 bg-zinc-900 rounded-[1.25rem] flex items-center justify-center border border-white/5 group-hover/row:bg-primary/5 group-hover/row:border-primary/30 transition-all duration-700 shadow-2xl relative">
                                                    <VideoIcon className="w-6 h-6 text-zinc-700 group-hover/row:text-primary transition-colors" />
                                                    <div className="absolute inset-0 bg-primary/5 blur-lg opacity-0 group-hover/row:opacity-100 transition-opacity" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-heading font-bold text-white text-base truncate max-w-[320px] group-hover/row:text-primary transition-colors italic">{video.original_name}</p>
                                                    <code className="text-[9px] text-zinc-600 font-bold uppercase tracking-tight mt-1.5 block group-hover/row:text-zinc-500 transition-colors">OSV-ID: {video.id}</code>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={`uppercase text-[9px] font-heading font-black tracking-[0.15em] px-4 py-1.5 rounded-full border border-current bg-transparent ${video.status === 'completed' ? 'text-emerald-500' :
                                                        video.status === 'processing' ? 'text-amber-500 animate-pulse' :
                                                            'text-rose-500'
                                                    }`}
                                                variant="outline"
                                            >
                                                <div className={`w-1.5 h-1.5 rounded-full mr-2 ${video.status === 'completed' ? 'bg-emerald-500' :
                                                        video.status === 'processing' ? 'bg-amber-500' :
                                                            'bg-rose-500'
                                                    }`} />
                                                {video.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs font-heading font-bold text-zinc-500 italic">
                                            {new Date(video.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </TableCell>
                                        <TableCell className="text-right pr-10">
                                            <div className="flex items-center justify-end gap-3 opacity-40 group-hover/row:opacity-100 transition-opacity duration-500">
                                                <Button size="icon" variant="ghost" asChild className="h-10 w-10 text-zinc-500 hover:text-white hover:bg-white/5 rounded-xl border border-transparent hover:border-white/5 active:scale-95 transition-all">
                                                    <a href={`/f/${video.id}`} target="_blank"><ExternalLink className="w-4.5 h-4.5" /></a>
                                                </Button>
                                                <Button size="sm" onClick={() => copyEmbed(video.id)} className="bg-white/5 hover:bg-primary text-zinc-400 hover:text-white border border-white/5 rounded-xl h-10 px-5 font-heading font-bold text-[10px] uppercase tracking-widest active:scale-95 transition-all">
                                                    <Copy className="w-3.5 h-3.5 mr-2.5" /> Deploy Code
                                                </Button>
                                                <Button size="icon" variant="ghost" onClick={() => handleDelete(video.id)} className="h-10 w-10 text-zinc-700 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl border border-transparent hover:border-rose-500/10 active:scale-95 transition-all">
                                                    <Trash2 className="w-4.5 h-4.5" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    {filteredVideos.length === 0 && (
                        <div className="text-center py-40 bg-black/5 animate-in fade-in zoom-in duration-1000">
                            <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-white/5">
                                <VideoIcon className="w-10 h-10 text-zinc-900" />
                            </div>
                            <h3 className="text-zinc-600 font-heading font-black uppercase tracking-[0.5em] text-xs">No assets detected</h3>
                            <p className="text-zinc-700 text-[10px] mt-4 font-bold uppercase tracking-widest">Awaiting central synchronization...</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <footer className="flex items-center justify-center py-6 opacity-30">
                <div className="flex items-center gap-4 text-[10px] font-heading font-black text-zinc-600 uppercase tracking-[0.4em]">
                    <Sparkles size={14} className="text-primary/60" />
                    End of Library
                    <div className="w-12 h-[1px] bg-zinc-800" />
                </div>
            </footer>
        </div>
    );
}
