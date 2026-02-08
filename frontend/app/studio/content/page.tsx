
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
    Layers,
    ArrowRight
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
            toast.error("Network sync failed");
        } finally {
            setLoading(false);
        }
    };

    const copyEmbed = (id: string) => {
        const urlPart = window.location.origin;
        const code = `<iframe src="${urlPart}/e/${id}" width="640" height="360" frameborder="0" allowfullscreen></iframe>`;
        navigator.clipboard.writeText(code);
        toast.success("Embed Code Copied");
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
                toast.success("Asset Purged");
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
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex justify-between items-end gap-4">
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-64" />
                        <Skeleton className="h-4 w-96" />
                    </div>
                    <Skeleton className="h-10 w-40 rounded-lg" />
                </div>
                <Card className="border-border">
                    <CardContent className="p-8 space-y-4">
                        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-700">

            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-heading font-bold text-foreground tracking-tight">Content Library</h1>
                    <p className="text-muted-foreground text-sm">Manage and distribute your uploaded video assets.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-11 rounded-lg border-border bg-card">
                        <Download className="w-4 h-4 mr-2" /> Export
                    </Button>
                    <Button className="h-11 px-6 rounded-lg font-bold shadow-lg shadow-primary/20">
                        <Plus className="w-4 h-4 mr-2" /> Upload Asset
                    </Button>
                </div>
            </header>

            <Card className="bg-card border-border rounded-xl shadow-sm overflow-hidden border-t-background">
                <CardHeader className="p-6 border-b border-border bg-muted/5">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="relative max-w-sm w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Filter content..."
                                className="bg-accent/40 border-border rounded-lg pl-10 h-11 focus:ring-1 focus:ring-primary/20 transition-all font-sans"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground h-9 px-3">
                                <Filter className="w-4 h-4 mr-2" /> Filter
                            </Button>
                            <div className="w-[1px] h-4 bg-border" />
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                Assets: <span className="text-foreground">{filteredVideos.length}</span>
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto custom-scrollbar">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border hover:bg-transparent uppercase text-[10px] font-bold tracking-widest text-muted-foreground">
                                    <TableHead className="w-[400px] h-12 pl-6">Unit Name</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Ingestion Date</TableHead>
                                    <TableHead className="text-right pr-6">Operations</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredVideos.map((video) => (
                                    <TableRow key={video.id} className="border-border hover:bg-accent/20 transition-colors group/row">
                                        <TableCell className="pl-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center border border-border group-hover/row:border-primary/20 transition-colors">
                                                    <VideoIcon className="w-4.5 h-4.5 text-muted-foreground group-hover/row:text-primary transition-colors" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-foreground text-sm truncate max-w-[280px] uppercase tracking-tight">{video.original_name}</p>
                                                    <code className="text-[9px] text-muted-foreground/60 block mt-1">ID: {video.id}</code>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={`uppercase text-[9px] font-bold tracking-widest px-2 py-0.5 rounded-md border h-5 ${video.status === 'completed' ? 'text-emerald-500 border-emerald-500/10 bg-emerald-500/5' :
                                                    video.status === 'processing' ? 'text-primary border-primary/10 bg-primary/5 animate-pulse' :
                                                        'text-rose-500 border-rose-500/10 bg-rose-500/5'
                                                    }`}
                                                variant="outline"
                                            >
                                                {video.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs font-medium text-muted-foreground">
                                            {new Date(video.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                                                <Button size="icon" variant="ghost" asChild className="h-9 w-9 text-muted-foreground hover:text-foreground rounded-lg">
                                                    <a href={`/f/${video.id}`} target="_blank"><ExternalLink className="w-4 h-4" /></a>
                                                </Button>
                                                <Button size="sm" onClick={() => copyEmbed(video.id)} className="bg-accent/60 hover:bg-primary text-foreground hover:text-white border-border rounded-lg h-8 px-3 font-bold text-[10px] uppercase tracking-widest transition-colors">
                                                    <Copy className="w-3 h-3 mr-2" /> Code
                                                </Button>
                                                <Button size="icon" variant="ghost" onClick={() => handleDelete(video.id)} className="h-9 w-9 text-muted-foreground hover:text-destructive rounded-lg">
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
                        <div className="text-center py-32 border-t border-border bg-muted/5">
                            <VideoIcon className="w-12 h-12 text-muted/10 mx-auto mb-4" />
                            <h3 className="text-muted-foreground font-bold uppercase tracking-widest text-xs">No assets found</h3>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
