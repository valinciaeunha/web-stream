"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { API_URL, APP_URL } from "@/lib/config";
import {
    Video as VideoIcon,
    ExternalLink,
    Copy,
    Trash2,
    Plus,
    Search,
    Filter,
    Download,
    Folder,
    FolderPlus,
    Upload,
    ChevronRight,
    Home,
    MoreVertical,
    Share2,
    Edit2,
    ArrowLeft,
    X,
    Clock,
    Film,
} from "lucide-react";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface FolderData {
    id: string;
    name: string;
    parent_id: string | null;
    created_at: string;
    subfolder_count: number;
    video_count: number;
}

interface VideoData {
    id: string;
    original_name: string;
    status: string;
    created_at: string;
    thumbnail: string | null;
    thumbnail_grid: string | null;
    duration: number | null;
    folder_id: string | null;
}

interface Breadcrumb {
    id: string;
    name: string;
}

interface FolderContents {
    folders: FolderData[];
    videos: VideoData[];
    breadcrumb: Breadcrumb[];
}

export default function ContentPage() {
    const [contents, setContents] = useState<FolderContents>({
        folders: [],
        videos: [],
        breadcrumb: [],
    });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

    // Modal states
    const [showNewFolderModal, setShowNewFolderModal] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [creatingFolder, setCreatingFolder] = useState(false);

    // Upload states
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Rename modal
    const [showRenameModal, setShowRenameModal] = useState(false);
    const [renameTarget, setRenameTarget] = useState<{
        type: "folder" | "video";
        id: string;
        name: string;
    } | null>(null);
    const [newName, setNewName] = useState("");



    const fetchContents = useCallback(async () => {
        setLoading(true);
        try {
            const folderId = currentFolderId || "root";
            const res = await fetch(`${API_URL}/api/folders/${folderId}/contents`, {
                credentials: "include",
            });

            if (res.ok) {
                const data = await res.json();
                setContents(data);
            } else {
                toast.error("Failed to fetch contents");
            }
        } catch (err) {
            console.error(err);
            toast.error("Network error");
        } finally {
            setLoading(false);
        }
    }, [currentFolderId]);

    useEffect(() => {
        fetchContents();
    }, [fetchContents]);

    const navigateToFolder = (folderId: string | null) => {
        setCurrentFolderId(folderId);
    };

    const createFolder = async () => {
        if (!newFolderName.trim()) {
            toast.error("Folder name is required");
            return;
        }

        setCreatingFolder(true);
        try {
            const res = await fetch(`${API_URL}/api/folders`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    name: newFolderName.trim(),
                    parent_id: currentFolderId,
                }),
            });

            if (res.ok) {
                toast.success("Folder created successfully");
                setShowNewFolderModal(false);
                setNewFolderName("");
                fetchContents();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to create folder");
            }
        } catch (err) {
            toast.error("Network error");
        } finally {
            setCreatingFolder(false);
        }
    };

    const deleteFolder = async (folderId: string) => {
        if (
            !confirm(
                "Are you sure you want to delete this folder and all its contents?",
            )
        ) {
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/folders/${folderId}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (res.ok) {
                toast.success("Folder deleted");
                fetchContents();
            } else {
                toast.error("Failed to delete folder");
            }
        } catch (err) {
            toast.error("Network error");
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];
        setUploading(true);
        setUploadProgress(0);

        try {
            // 1. Get presigned URL
            const presignRes = await fetch(`${API_URL}/api/video/upload`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    filename: file.name,
                    filetype: file.type,
                    folder_id: currentFolderId,
                }),
            });

            if (!presignRes.ok) {
                throw new Error("Failed to get upload URL");
            }

            const { upload_url, video_id, key } = await presignRes.json();

            // 2. Upload file to S3
            const xhr = new XMLHttpRequest();
            xhr.open("PUT", upload_url, true);
            xhr.setRequestHeader("Content-Type", file.type);

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const progress = Math.round((event.loaded / event.total) * 100);
                    setUploadProgress(progress);
                }
            };

            await new Promise<void>((resolve, reject) => {
                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve();
                    } else {
                        reject(new Error("Upload failed"));
                    }
                };
                xhr.onerror = () => reject(new Error("Upload failed"));
                xhr.send(file);
            });

            // 3. Notify backend upload is complete
            await fetch(`${API_URL}/api/video/complete`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ videoId: video_id, key }),
            });

            toast.success("Video uploaded! Processing will begin shortly.");
            fetchContents();
        } catch (err) {
            console.error(err);
            toast.error("Upload failed");
        } finally {
            setUploading(false);
            setUploadProgress(0);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const copyEmbedCode = (videoId: string) => {
        const urlPart = APP_URL || window.location.origin;
        const shortId = videoId.substring(0, 8);
        const code = `<iframe src="${urlPart}/e/${shortId}.mp4" width="640" height="360" frameborder="0" allowfullscreen></iframe>`;
        navigator.clipboard.writeText(code);
        toast.success("Embed code copied");
    };

    const copyVideoLink = (videoId: string) => {
        const urlPart = APP_URL || window.location.origin;
        const shortId = videoId.substring(0, 8);
        const link = `${urlPart}/e/${shortId}.mp4`;
        navigator.clipboard.writeText(link);
        toast.success("Video link copied");
    };

    const copyFolderLink = (folderId: string) => {
        const urlPart = APP_URL || window.location.origin;
        const shortId = folderId.substring(0, 8);
        const link = `${urlPart}/f/${shortId}`;
        navigator.clipboard.writeText(link);
        toast.success("Folder link copied");
    };

    const deleteVideo = async (videoId: string) => {
        if (!confirm("Are you sure you want to delete this video?")) return;

        try {
            const res = await fetch(`${API_URL}/api/studio/video/${videoId}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (res.ok) {
                toast.success("Video deleted");
                fetchContents();
            } else {
                toast.error("Failed to delete video");
            }
        } catch (err) {
            toast.error("Network error");
        }
    };

    const renameItem = async () => {
        if (!renameTarget || !newName.trim()) return;

        try {
            const endpoint =
                renameTarget.type === "folder"
                    ? `${API_URL}/api/folders/${renameTarget.id}`
                    : `${API_URL}/api/studio/video/${renameTarget.id}`;

            const body =
                renameTarget.type === "folder"
                    ? { name: newName.trim() }
                    : { original_name: newName.trim() };

            const res = await fetch(endpoint, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(body),
            });

            if (res.ok) {
                toast.success("Renamed successfully");
                setShowRenameModal(false);
                setRenameTarget(null);
                setNewName("");
                fetchContents();
            } else {
                toast.error("Failed to rename");
            }
        } catch (err) {
            toast.error("Network error");
        }
    };

    const formatDuration = (seconds: number | null) => {
        if (!seconds) return "--:--";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const filteredFolders = contents.folders.filter((f) =>
        f.name.toLowerCase().includes(search.toLowerCase()),
    );

    const filteredVideos = contents.videos.filter(
        (v) =>
            v.original_name.toLowerCase().includes(search.toLowerCase()) ||
            v.id.toLowerCase().includes(search.toLowerCase()),
    );

    if (loading) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex justify-between items-end gap-3">
                    <div className="space-y-1.5">
                        <Skeleton className="h-9 w-56" />
                        <Skeleton className="h-4 w-80" />
                    </div>
                    <Skeleton className="h-9 w-32 rounded-sm" />
                </div>
                <Card className="border-border/50 rounded-sm shadow-none">
                    <CardContent className="p-4 space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-14 w-full rounded-sm" />
                        ))}
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-heading font-semibold text-foreground tracking-tight">
                        Content Library
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Manage your videos and folders
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        className="h-9 rounded-sm border-border/50 bg-card/50 text-xs font-medium px-3 hover:bg-accent/50"
                    >
                        <Download className="w-3.5 h-3.5 mr-2" /> Export
                    </Button>

                    {/* Upload Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className="h-9 px-4 rounded-sm font-medium shadow-none text-xs">
                                <Plus className="w-3.5 h-3.5 mr-2" /> New
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Video
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setShowNewFolderModal(true)}>
                                <FolderPlus className="w-4 h-4 mr-2" />
                                New Folder
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={handleFileUpload}
                    />
                </div>
            </header>

            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-sm">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 hover:bg-accent/50"
                    onClick={() => navigateToFolder(null)}
                >
                    <Home className="w-4 h-4" />
                </Button>
                {contents.breadcrumb.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-2">
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 hover:bg-accent/50 font-medium"
                            onClick={() => navigateToFolder(item.id)}
                        >
                            {item.name}
                        </Button>
                    </div>
                ))}
            </div>

            {/* Upload Progress */}
            {uploading && (
                <div className="bg-primary/10 border border-primary/20 rounded-sm p-4">
                    <div className="flex items-center gap-3">
                        <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
                        <div className="flex-1">
                            <p className="text-sm font-medium">Uploading video...</p>
                            <div className="w-full bg-accent/50 rounded-full h-2 mt-2">
                                <div
                                    className="bg-primary h-2 rounded-full transition-all"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        </div>
                        <span className="text-sm font-medium">{uploadProgress}%</span>
                    </div>
                </div>
            )}

            {/* Content Card */}
            <Card className="bg-card/50 border-border/50 rounded-sm shadow-none overflow-hidden">
                <CardHeader className="p-4 border-b border-border/50 bg-accent/20">
                    <div className="flex flex-col md:flex-row gap-3 justify-between items-center">
                        <div className="relative max-w-sm w-full">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                            <Input
                                placeholder="Search..."
                                className="bg-accent/30 border-border/50 rounded-sm pl-8 h-9 focus:ring-1 focus:ring-primary/30 transition-all font-sans text-xs focus:bg-accent/50"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-foreground h-8 px-2.5 text-xs hover:bg-accent/50"
                            >
                                <Filter className="w-3.5 h-3.5 mr-2" /> Filter
                            </Button>
                            <div className="w-[1px] h-4 bg-border/50" />
                            <p className="text-[10px] font-medium text-muted-foreground">
                                {filteredFolders.length} folders, {filteredVideos.length} videos
                            </p>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    {/* Back button when in a folder */}
                    {currentFolderId && (
                        <div
                            className="flex items-center gap-3 p-3 border-b border-border/50 hover:bg-accent/20 cursor-pointer transition-colors"
                            onClick={() => {
                                const parentId =
                                    contents.breadcrumb.length > 1
                                        ? contents.breadcrumb[contents.breadcrumb.length - 2].id
                                        : null;
                                navigateToFolder(parentId);
                            }}
                        >
                            <div className="w-9 h-9 bg-accent/50 rounded-sm flex items-center justify-center border border-border/50">
                                <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <span className="text-sm text-muted-foreground">..</span>
                        </div>
                    )}

                    {/* Folders */}
                    {filteredFolders.map((folder) => (
                        <div
                            key={folder.id}
                            className="flex items-center gap-3 p-3 border-b border-border/50 hover:bg-accent/20 transition-colors group"
                        >
                            <div
                                className="flex items-center gap-3 flex-1 cursor-pointer"
                                onClick={() => navigateToFolder(folder.id)}
                            >
                                <div className="w-9 h-9 bg-amber-500/10 rounded-sm flex items-center justify-center border border-amber-500/20">
                                    <Folder className="w-4 h-4 text-amber-500" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-foreground truncate">
                                        {folder.name}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                        {folder.subfolder_count} folders, {folder.video_count}{" "}
                                        videos
                                    </p>
                                </div>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <MoreVertical className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => copyFolderLink(folder.id)}>
                                        <Share2 className="w-4 h-4 mr-2" /> Share Folder
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => {
                                            setRenameTarget({
                                                type: "folder",
                                                id: folder.id,
                                                name: folder.name,
                                            });
                                            setNewName(folder.name);
                                            setShowRenameModal(true);
                                        }}
                                    >
                                        <Edit2 className="w-4 h-4 mr-2" /> Rename
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className="text-destructive"
                                        onClick={() => deleteFolder(folder.id)}
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ))}

                    {/* Videos Table */}
                    {filteredVideos.length > 0 && (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-border/50 hover:bg-transparent text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                                        <TableHead className="w-[400px] h-10 pl-4">Video</TableHead>
                                        <TableHead className="h-10">Status</TableHead>
                                        <TableHead className="h-10">Duration</TableHead>
                                        <TableHead className="h-10">Created</TableHead>
                                        <TableHead className="text-right pr-4 h-10">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredVideos.map((video) => (
                                        <TableRow
                                            key={video.id}
                                            className="border-border/50 hover:bg-accent/30 transition-colors group"
                                        >
                                            <TableCell className="pl-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    {/* Thumbnail */}
                                                    <div className="w-24 h-14 bg-accent/50 rounded-sm flex items-center justify-center border border-border/50 overflow-hidden relative">
                                                        {video.thumbnail_grid ? (
                                                            <img
                                                                src={video.thumbnail_grid}
                                                                alt={video.original_name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : video.thumbnail ? (
                                                            <img
                                                                src={video.thumbnail}
                                                                alt={video.original_name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <Film className="w-6 h-6 text-muted-foreground/50" />
                                                        )}
                                                        {video.duration && (
                                                            <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] px-1 rounded">
                                                                {formatDuration(video.duration)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-foreground truncate max-w-[250px]">
                                                            {video.original_name}
                                                        </p>
                                                        <code className="text-[9px] text-muted-foreground/60 block mt-0.5">
                                                            {video.id.slice(0, 8)}...
                                                        </code>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={`text-[9px] font-medium px-2 py-0.5 rounded-sm border-border/50 ${video.status === "completed"
                                                        ? "text-emerald-400 bg-emerald-400/10"
                                                        : video.status === "processing"
                                                            ? "text-primary bg-primary/10 animate-pulse"
                                                            : video.status === "pending"
                                                                ? "text-amber-400 bg-amber-400/10"
                                                                : "text-rose-400 bg-rose-400/10"
                                                        }`}
                                                    variant="outline"
                                                >
                                                    {video.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDuration(video.duration)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {new Date(video.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right pr-4">
                                                <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        asChild
                                                        className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-sm hover:bg-accent/50"
                                                    >
                                                        <a href={`/e/${video.id}`} target="_blank">
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                        </a>
                                                    </Button>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                            >
                                                                <MoreVertical className="w-4 h-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                onClick={() => copyVideoLink(video.id)}
                                                            >
                                                                <Share2 className="w-4 h-4 mr-2" /> Copy Link
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => copyEmbedCode(video.id)}
                                                            >
                                                                <Copy className="w-4 h-4 mr-2" /> Copy Embed
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    setRenameTarget({
                                                                        type: "video",
                                                                        id: video.id,
                                                                        name: video.original_name,
                                                                    });
                                                                    setNewName(video.original_name);
                                                                    setShowRenameModal(true);
                                                                }}
                                                            >
                                                                <Edit2 className="w-4 h-4 mr-2" /> Rename
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="text-destructive"
                                                                onClick={() => deleteVideo(video.id)}
                                                            >
                                                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {/* Empty State */}
                    {filteredFolders.length === 0 && filteredVideos.length === 0 && (
                        <div className="text-center py-24 border-t border-border/50 bg-accent/20">
                            <Folder className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                            <h3 className="text-muted-foreground font-medium text-sm">
                                This folder is empty
                            </h3>
                            <p className="text-muted-foreground/60 text-xs mt-1">
                                Upload videos or create folders to get started
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* New Folder Modal */}
            <Dialog open={showNewFolderModal} onOpenChange={setShowNewFolderModal}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Create New Folder</DialogTitle>
                        <DialogDescription>
                            Enter a name for your new folder
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="folderName" className="text-sm">
                            Folder Name
                        </Label>
                        <Input
                            id="folderName"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            placeholder="My Folder"
                            className="mt-2"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") createFolder();
                            }}
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowNewFolderModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={createFolder} disabled={creatingFolder}>
                            {creatingFolder ? "Creating..." : "Create"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Rename Modal */}
            <Dialog open={showRenameModal} onOpenChange={setShowRenameModal}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>
                            Rename {renameTarget?.type === "folder" ? "Folder" : "Video"}
                        </DialogTitle>
                        <DialogDescription>Enter a new name</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="newName" className="text-sm">
                            New Name
                        </Label>
                        <Input
                            id="newName"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Enter new name"
                            className="mt-2"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") renameItem();
                            }}
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowRenameModal(false);
                                setRenameTarget(null);
                                setNewName("");
                            }}
                        >
                            Cancel
                        </Button>
                        <Button onClick={renameItem}>Rename</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
