"use client";

import { useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

// Ensure videojs is global for plugins
if (typeof window !== "undefined") {
  (window as any).videojs = videojs;
}

interface VideoPlayerProps {
  src: string;
  poster?: string;
  thumbnailGrid?: string;
  onReady?: (player: any) => void;
}

export const VideoPlayer = ({
  src,
  poster,
  thumbnailGrid,
  onReady,
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return;

    if (!playerRef.current) {
      // The Video.js player needs to be _inside_ the component el for React 18 Strict Mode.
      const videoElement = document.createElement("video-js");

      videoElement.classList.add("vjs-big-play-centered", "vjs-fluid");
      videoRef.current?.appendChild(videoElement);

      const player = (playerRef.current = videojs(videoElement, {
        autoplay: true,
        controls: true,
        responsive: true,
        fluid: true,
        preload: "auto",
        poster: poster,
        sources: [
          {
            src: src,
            type: "application/x-mpegURL",
          },
        ],
        controlBar: {
          children: [
            "playToggle",
            "volumePanel",
            "currentTimeDisplay",
            "timeDivider",
            "durationDisplay",
            "progressControl", // The scrubber
            "pictureInPictureToggle",
            "fullscreenToggle",
          ],
        },
      }));

      player.ready(() => {
        videojs.log("Player is ready");
        onReady && onReady(player);

        // Setup Thumbnail Tooltip if grid is available
        if (thumbnailGrid) {
          setupThumbnailTooltip(player, thumbnailGrid);
        }
      });

      // Handle errors
      player.on("error", () => {
        const error = player.error();
        console.error("Video.js Error:", error);
      });
    } else {
      const player = playerRef.current;

      player.autoplay(true);
      player.src({ src: src, type: "application/x-mpegURL" });
      if (poster) {
        player.poster(poster);
      }
    }
  }, [src, poster, thumbnailGrid, onReady]);

  // Dispose the player on unmount
  useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
      // Clean up tooltip if it exists
      if (tooltipRef.current && tooltipRef.current.parentNode) {
        tooltipRef.current.parentNode.removeChild(tooltipRef.current);
        tooltipRef.current = null;
      }
    };
  }, []);

  // Custom function to handle 2x2 grid tooltip
  const setupThumbnailTooltip = (player: any, gridUrl: string) => {
    // Ensure tooltip is created only once
    if (tooltipRef.current) return;

    const progressControl = player.controlBar.progressControl;
    const progressControlEl = progressControl.el();

    // Create tooltip element
    const tooltip = document.createElement("div");
    tooltip.className = "vjs-custom-thumbnail-tooltip";
    tooltip.style.backgroundImage = `url(${gridUrl})`;
    tooltip.style.display = "none"; // Default hide

    // Append to the player's main element
    player.el().appendChild(tooltip);
    tooltipRef.current = tooltip;

    progressControlEl.addEventListener("mousemove", (e: MouseEvent) => {
      const progressRect = progressControlEl.getBoundingClientRect();
      const playerRect = player.el().getBoundingClientRect();

      // Calculate hover position relative to progress bar
      const offsetX = e.clientX - progressRect.left;
      const percentage = Math.max(0, Math.min(1, offsetX / progressRect.width));
      const time = percentage * player.duration();

      // Calculate tooltip position relative to the PLAYER container
      let tooltipLeft = e.clientX - playerRect.left;

      // Clamp to prevent going off-screen
      const tooltipWidth = 160; // matches CSS
      const minLeft = tooltipWidth / 2;
      const maxLeft = playerRect.width - tooltipWidth / 2;

      if (tooltipLeft < minLeft) tooltipLeft = minLeft;
      if (tooltipLeft > maxLeft) tooltipLeft = maxLeft;

      tooltip.style.display = "block";
      tooltip.style.left = `${tooltipLeft}px`;
      // Position it above the control bar (approx 60px height + 16px bottom margin)
      tooltip.style.bottom = "80px"; // Adjusted from 85px

      // Logic for 2x2 grid (assuming 2x2 grid, so 4 states)
      let bgPosX = "0%";
      let bgPosY = "0%";

      if (percentage < 0.25) {
        bgPosX = "0%";
        bgPosY = "0%";
      } else if (percentage < 0.5) {
        bgPosX = "100%";
        bgPosY = "0%";
      } else if (percentage < 0.75) {
        bgPosX = "0%";
        bgPosY = "100%";
      } else {
        bgPosX = "100%";
        bgPosY = "100%";
      }

      tooltip.style.backgroundPosition = `${bgPosX} ${bgPosY}`;
      tooltip.innerText = formatTime(time);
    });

    progressControlEl.addEventListener("mouseleave", () => {
      tooltip.style.display = "none";
    });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div data-vjs-player className="w-full h-full bg-black relative group">
      <div ref={videoRef} className="w-full h-full" />
    </div>
  );
};

export default VideoPlayer;
