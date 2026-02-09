"use client";

import { useState, useEffect, use, useCallback } from "react";
import dynamic from "next/dynamic";
import { Play, Loader2 } from "lucide-react";
import {
  ErrorDisplay,
  ErrorType,
  statusToErrorType,
} from "@/components/errors/ErrorDisplay";
import { useAdBlockDetector } from "@/hooks/useAdBlockDetector";

const VideoPlayer = dynamic(() => import("@/components/VideoPlayer"), {
  ssr: false,
});

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface VideoInfo {
  id: string;
  original_name: string;
  thumbnail: string | null;
  thumbnail_grid: string | null;
  duration: number | null;
  status: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

interface CustomError extends Error {
  response?: Response;
  context?: string;
  details?: string; // Add details property
}

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

export default function EmbedPage({ params }: PageProps) {
  const { id: rawId } = use(params);

  // Remove .mp4 extension if present (for disguised embed URLs)
  const id = rawId.replace(/\.mp4$/i, "");

  // Video info
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(true);

  // Session & Ad states
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Player states
  const [manifestUrl, setManifestUrl] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<CustomError | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };



  // Fetch video info (public - just thumbnail, name, etc)
  const fetchVideoInfo = useCallback(async () => {
    setLoadingInfo(true);
    setError(null);

    try {
      const res = await fetchWithTimeout(`${API_URL}/api/video/${id}/info`);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw { ...data, response: res };
      }

      const data = await res.json();

      // Check video status
      if (data.status === "failed") {
        throw { message: "Video unavailable", response: { status: 404 } };
      }

      if (data.status === "processing") {
        throw {
          message:
            "This video is still being processed. Please check back later.",
          response: { status: 503 },
        };
      }

      setVideoInfo(data);
    } catch (err: unknown) {
      console.error("Fetch video info error:", err);
      setError(err as CustomError);
    } finally {
      setLoadingInfo(false);
    }
  }, [id]);

  // Initialize session
  const initSession = useCallback(async (): Promise<{
    sessionId: string | null;
    alreadyCompleted: boolean;
  }> => {
    try {
      const res = await fetchWithTimeout(`${API_URL}/api/session/init`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw { ...data, response: res, context: "session" };
      }

      const data = await res.json();
      if (data.session_id) {
        setSessionId(data.session_id);
        return {
          sessionId: data.session_id,
          alreadyCompleted: data.ad_status === "completed",
        };
      }
      return { sessionId: null, alreadyCompleted: false };
    } catch (err: unknown) {
      console.error("Session init error:", err);
      throw err;
    }
  }, []);

  // Send ad event
  const sendAdEvent = async (sid: string, event: string) => {
    try {
      const res = await fetchWithTimeout(`${API_URL}/api/ads/event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sid, event }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw { ...data, response: res, context: "ad_event" };
      }

      const data = await res.json();
      return data.current_status;
    } catch (err: unknown) {
      console.error("Ad event error:", err);
      throw err;
    }
  };

  // Get video manifest (protected)
  const getVideoManifest = async (sid: string) => {
    try {
      const res = await fetchWithTimeout(
        `${API_URL}/api/video/${id}/manifest?session_id=${sid}`,
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw { ...data, response: res, context: "manifest" };
      }

      const data = await res.json();
      setManifestUrl(data.manifest_url);
      return true;
    } catch (err: unknown) {
      console.error("Get manifest error:", err);
      throw err;
    }
  };

  // AdBlock detection
  const { isAdBlockEnabled, loading: loadingAdBlock } = useAdBlockDetector();

  // Handle play button click - auto verify and play
  const handlePlayClick = async () => {
    setIsVerifying(true);
    setError(null);

    try {
      // Init session if not already
      let sid = sessionId;
      let alreadyCompleted = false;

      if (!sid) {
        const result = await initSession();
        sid = result.sessionId;
        alreadyCompleted = result.alreadyCompleted;
      }

      if (!sid) {
        throw {
          message: "Failed to initialize session",
          response: { status: 400 },
          context: "session",
        };
      }

      // If already completed, get video directly
      if (alreadyCompleted) {
        await getVideoManifest(sid);
        setIsVerifying(false);
        return;
      }

      // Auto verify: start ad event
      await sendAdEvent(sid, "start");

      // Wait 1 second for "verification"
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Complete ad event
      await sendAdEvent(sid, "complete");

      // Get video manifest
      await getVideoManifest(sid);
    } catch (err: unknown) {
      console.error("Play error:", err);
      setError(err as CustomError);
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle retry
  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    setError(null);
    window.location.reload(); // Force reload on retry for AdBlock
  };

  // Handle full refresh
  const handleRefresh = () => {
    window.location.reload();
  };

  useEffect(() => {
    fetchVideoInfo();
    // Pre-init session
    initSession().catch(() => {
      // Silent fail for pre-init
    });
  }, [id, fetchVideoInfo, initSession, retryCount]); // Added dependencies

  // AdBlock Error
  if (isAdBlockEnabled) {
    return (
      <ErrorDisplay
        type="forbidden"
        message="AdBlock Detected"
        details="Please disable your AdBlocker to watch this video."
        onRetry={handleRefresh}
        onRefresh={handleRefresh}
        retryCount={0}
      />
    );
  }

  // Error state
  if (error && !manifestUrl) {
    let errorType: ErrorType = "unknown";
    let errorMessage = error.message;
    let errorDetails = error.details;

    if (error.response?.status) {
      errorType = statusToErrorType(error.response.status);
    }

    if (error.context === "manifest" && error.response?.status === 403) {
      // Use let for reassignment within conditional blocks
      let verificationMessage = "Verification required to watch this video.";
      errorType = "forbidden"; // More specific than general 403
      errorMessage = verificationMessage;
    }

    if (error.context === "session" && error.response?.status === 400) {
      // Use let for reassignment within conditional blocks
      let sessionMessage =
        "Could not create a viewing session. Please try again.";
      errorType = "bad_request";
      errorMessage = sessionMessage;
    }

    // Specific error messages for processing/unavailable
    if (
      error.response?.status === 503 &&
      error.message.includes("processing")
    ) {
      errorType = "maintenance"; // Use maintenance for "processing" status
      // Use let for reassignment within conditional blocks
      let processingMessage = "Video is still being processed.";
      let processingDetails = "Please check back later.";
      errorMessage = processingMessage;
      errorDetails = processingDetails;
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

  // Loading state
  if (loadingInfo || isVerifying || loadingAdBlock) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-white animate-spin mx-auto mb-3" />
          <p className="text-zinc-500 text-sm">
            {loadingInfo ? "Loading video info..." : "Verifying access..."}
          </p>
        </div>
      </div>
    );
  }

  // Video playing state
  if (manifestUrl) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center overflow-hidden">
        <div className="w-full h-full">
          <VideoPlayer
            src={manifestUrl}
            poster={videoInfo?.thumbnail || undefined}
            thumbnailGrid={videoInfo?.thumbnail_grid || undefined}
          />
        </div>
      </div>
    );
  }

  // Main view - Thumbnail with play button
  return (
    <div className="w-full h-screen bg-black flex items-center justify-center overflow-hidden relative">
      {/* Thumbnail Background */}
      {videoInfo?.thumbnail_grid || videoInfo?.thumbnail ? (
        <img
          src={videoInfo.thumbnail_grid || videoInfo.thumbnail || ""}
          alt={videoInfo.original_name}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black" />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Play Button & Info */}
      <div className="relative z-10 text-center">
        {/* Play Button */}
        <button
          onClick={handlePlayClick}
          className="w-20 h-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 transition-all hover:scale-110 group"
        >
          <Play className="w-10 h-10 text-white ml-1 group-hover:scale-110 transition-transform" />
        </button>

        {/* Video Title */}
        {videoInfo && (
          <div className="max-w-md mx-auto px-4">
            <h1 className="text-white font-bold text-lg truncate">
              {videoInfo.original_name}
            </h1>
            {videoInfo.duration && (
              <p className="text-zinc-400 text-sm mt-1">
                {formatDuration(videoInfo.duration)}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Duration Badge */}
      {videoInfo?.duration && (
        <div className="absolute bottom-4 right-4 bg-black/80 text-white text-xs px-2 py-1 rounded">
          {formatDuration(videoInfo.duration)}
        </div>
      )}

      {/* Branding */}
      <div className="absolute bottom-4 left-4 text-zinc-600 text-xs">
        Vionix Stream
      </div>
    </div>
  );
}
