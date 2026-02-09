"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
    Folder,
    ChevronRight,
    Clock,
    Film,
    ArrowLeft,
    Play,
    Loader2,
} from "lucide-react";
import {
    ErrorDisplay,
    ErrorType,
    statusToErrorType,
} from "@/components/errors/ErrorDisplay";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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

interface PageProps {
    params: Promise<{ id: string }>;
}

interface CustomError extends Error {
    response?: Response;
    context?: string;
    details?: string; // Add details property
}

export default function FolderSharePage({ params }: PageProps) {
    const { id } = use(params);

    const [contents, setContents] = useState<FolderContents | null>(null);
    const [folderInfo, setFolderInfo] = useState<FolderData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<CustomError | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    const formatDuration = (seconds: number | null) => {
        if (!seconds) return "";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    // Fetch with timeout
    const fetchWithTimeout = async (
        url: string,
        options: RequestInit = {},
        timeoutMs: number = 10000,
    ): Promise<Response> => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            return response;
        } catch (err) {
            clearTimeout(timeoutId);
            throw err;
        }
    };

    // Fetch folder contents
    const fetchFolderContents = async () => {
        setLoading(true);
        setError(null);

        try {
            // Fetch folder info (using public endpoint)
            const infoRes = await fetchWithTimeout(
                `${API_URL}/api/folders/public/${id}`,
            );

            if (!infoRes.ok) {
                const data = await infoRes.json().catch(() => ({}));
                throw { ...data, response: infoRes };
            }

            const infoData = await infoRes.json();
            setFolderInfo(infoData);

            // Fetch contents (using public endpoint)
            const contentsRes = await fetchWithTimeout(
                `${API_URL}/api/folders/public/${id}/contents`,
            );

            if (!contentsRes.ok) {
                const data = await contentsRes.json().catch(() => ({}));
                throw { ...data, response: contentsRes };
            }

            const contentsData = await contentsRes.json();
            setContents(contentsData);
        } catch (err: unknown) {
            console.error("Fetch folder error:", err);
            setError(err as CustomError);
        } finally {
            setLoading(false);
        }
    };

    // Handle retry
    const handleRetry = () => {
        setRetryCount((prev) => prev + 1);
        setError(null);
        fetchFolderContents();
    };

    // Handle full refresh
    const handleRefresh = () => {
        window.location.reload();
    };

    useEffect(() => {
        fetchFolderContents();
    }, [id, retryCount]); // Add retryCount to dependency array to re-fetch on retry

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                    <p className="text-sm text-zinc-400">Loading folder...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        let errorType: ErrorType = "unknown";
        const errorMessage = error.message;
        const errorDetails = error.details;

        if (error.response?.status) {
            errorType = statusToErrorType(error.response.status);
        }

        return (
            <ErrorDisplay
                type={errorType}
                message={errorMessage}
                details={errorDetails}
                onRetry={handleRetry}
                onRefresh={handleRefresh}
                retryCount={retryCount}
            />
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            {/* Header */}
            <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-500/10 rounded flex items-center justify-center">
                            <Folder className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg">
                                {folderInfo?.name || "Folder"}
                            </h1>
                            <p className="text-xs text-zinc-500">
                                {contents?.folders.length || 0} folders,{" "}
                                {contents?.videos.length || 0} videos
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Breadcrumb */}
            {contents && contents.breadcrumb.length > 0 && (
                <div className="border-b border-zinc-800 bg-zinc-900/30">
                    <div className="max-w-6xl mx-auto px-4 py-2">
                        <div className="flex items-center gap-2 text-sm flex-wrap">
                            {contents.breadcrumb.map((item, index) => (
                                <div key={item.id} className="flex items-center gap-2">
                                    {index > 0 && (
                                        <ChevronRight className="w-4 h-4 text-zinc-600" />
                                    )}
                                    {index === contents.breadcrumb.length - 1 ? (
                                        <span className="text-zinc-300">{item.name}</span>
                                    ) : (
                                        <Link
                                            href={`/f/${item.id.substring(0, 8)}`}
                                            className="text-zinc-500 hover:text-white transition-colors"
                                        >
                                            {item.name}
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Content */}
            <main className="max-w-6xl mx-auto px-4 py-6">
                {/* Back button if in subfolder */}
                {contents && contents.breadcrumb.length > 1 && (
                    <Link
                        href={`/f/${contents.breadcrumb[contents.breadcrumb.length - 2].id.substring(0, 8)}`}
                        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Link>
                )}

                {/* Folders Grid */}
                {contents && contents.folders.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">
                            Folders
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {contents.folders.map((folder) => (
                                <Link
                                    key={folder.id}
                                    href={`/f/${folder.id.substring(0, 8)}`}
                                    className="group bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-lg p-4 transition-all"
                                >
                                    <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <Folder className="w-6 h-6 text-amber-500" />
                                    </div>
                                    <p className="font-medium text-sm truncate">{folder.name}</p>
                                    <p className="text-xs text-zinc-500 mt-1">
                                        {folder.video_count} videos
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Videos Grid */}
                {contents && contents.videos.length > 0 && (
                    <div>
                        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">
                            Videos
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {contents.videos.map((video) => (
                                <Link
                                    key={video.id}
                                    href={`/e/${video.id.substring(0, 8)}.mp4`}
                                    className="group bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-lg overflow-hidden transition-all"
                                >
                                    {/* Thumbnail */}
                                    <div className="aspect-video bg-zinc-800 relative overflow-hidden">
                                        {video.thumbnail_grid ? (
                                            <img
                                                src={video.thumbnail_grid}
                                                alt={video.original_name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : video.thumbnail ? (
                                            <img
                                                src={video.thumbnail}
                                                alt={video.original_name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Film className="w-10 h-10 text-zinc-700" />
                                            </div>
                                        )}

                                        {/* Duration badge */}
                                        {video.duration && (
                                            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                                                {formatDuration(video.duration)}
                                            </div>
                                        )}

                                        {/* Status badge if not completed */}
                                        {video.status !== "completed" && (
                                            <div className="absolute top-2 left-2 bg-amber-500/90 text-black text-xs px-2 py-0.5 rounded font-medium">
                                                {video.status}
                                            </div>
                                        )}

                                        {/* Play overlay */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                                <Play className="w-7 h-7 text-white ml-1" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="p-3">
                                        <p className="font-medium text-sm truncate">
                                            {video.original_name}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                                            <Clock className="w-3 h-3" />
                                            {new Date(video.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty state */}
                {contents &&
                    contents.folders.length === 0 &&
                    contents.videos.length === 0 && (
                        <div className="text-center py-20">
                            <Folder className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">This folder is empty</h3>
                            <p className="text-zinc-500 text-sm">
                                No content has been added yet
                            </p>
                        </div>
                    )}
            </main>

            {/* Footer */}
            <footer className="border-t border-zinc-800 mt-auto py-6">
                <div className="max-w-6xl mx-auto px-4 text-center text-xs text-zinc-600">
                    Powered by Vionix Stream
                </div>
            </footer>
        </div>
    );
}
