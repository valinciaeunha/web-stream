
'use client';

import { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import 'videojs-contrib-ads';
import 'videojs-ima';
import 'videojs-ima/dist/videojs.ima.css';

interface VideoPlayerProps {
    src: string;
    adTagUrl?: string; // Optional VAST URL
    onReady?: (player: any) => void;
    onAdBlockDetected?: () => void;
}


export const VideoPlayer = ({ src, adTagUrl, onReady, onAdBlockDetected }: VideoPlayerProps) => {
    const videoRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<any>(null);

    useEffect(() => {
        // 1. Manually Load IMA SDK
        const loadImaSdk = () => {
            if ((window as any).google && (window as any).google.ima) {
                return Promise.resolve();
            }
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = '//imasdk.googleapis.com/js/sdkloader/ima3.js';
                script.async = true;
                script.onload = resolve;
                script.onerror = () => reject(new Error("Failed to load IMA SDK. Ad Blocker?"));
                document.body.appendChild(script);
            });
        };

        // 2. Init Player after SDK Loaded
        loadImaSdk().then(() => {
            if (!playerRef.current && videoRef.current) {
                const videoElement = document.createElement("video-js");
                videoElement.classList.add('vjs-big-play-centered');
                videoRef.current.appendChild(videoElement);

                const player = playerRef.current = videojs(videoElement, {
                    autoplay: true,
                    controls: true,
                    responsive: true,
                    fluid: true,
                    sources: [{
                        src: src,
                        type: 'application/x-mpegURL'
                    }],
                    // @ts-ignore
                    ima: {
                        adTagUrl: adTagUrl || 'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_ad_samples&sz=640x480&cust_params=sample_ct%3Dlinear&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator=',
                        showControlsForAds: true,
                        debug: true
                    }
                });

                player.ready(() => {
                    videojs.log('player is ready');
                    const playerAny = player as any;

                    if (playerAny.ima) {
                        try {
                            playerAny.ima.initializeAdDisplayContainer();
                            playerAny.ima.requestAds();
                        } catch (e) {
                            console.error("IMA Init Error:", e);
                        }
                    }
                    onReady && onReady(player);
                });
            }
        }).catch(err => {
            console.error("IMA SDK Load Error:", err);
            // Strict Mode: Notify parent about AdBlock
            onAdBlockDetected && onAdBlockDetected();
        });

    }, [src, adTagUrl, onReady, onAdBlockDetected]);

    useEffect(() => {
        const player = playerRef.current;
        return () => {
            if (player && !player.isDisposed()) {
                player.dispose();
                playerRef.current = null;
            }
        };
    }, []);

    return (
        <div data-vjs-player>
            <div ref={videoRef} />
        </div>
    );
}

export default VideoPlayer;
