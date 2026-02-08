
'use client';

import { use, useEffect, useState } from 'react';
import VideoPlayer from '@/components/VideoPlayer';

export default function EmbedPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [manifestUrl, setManifestUrl] = useState<string | null>(null);
    const [isLocked, setIsLocked] = useState(true);
    const [sessionId, setSessionId] = useState<string | null>(null);

    useEffect(() => {
        // Simple IFrame check or just render clean
        const initSession = async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/session/init`, { method: 'POST' });
            const data = await res.json();
            setSessionId(data.session_id);
        };
        initSession();
    }, []);

    const handleUnlock = async () => {
        if (!sessionId) return;

        // Open Adsterra Smartlink
        window.open('https://www.effectivegatecpm.com/hjp0hms3z?key=bfa0fcba6c2ddee9d110e88593485c32', '_blank');

        // Check if unlocked every 3 seconds
        const checkInterval = setInterval(async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/video/manifest/${id}?session_id=${sessionId}`);
            if (res.ok) {
                const data = await res.json();
                setManifestUrl(data.manifest_url);
                setIsLocked(false);
                clearInterval(checkInterval);
            }
        }, 3000);
    };

    return (
        <div className="w-full h-screen bg-black flex items-center justify-center p-0 m-0 overflow-hidden">
            {isLocked ? (
                <div className="text-center p-4">
                    <button
                        onClick={handleUnlock}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-all flex items-center gap-2 mx-auto"
                    >
                        ▶ Watch Ad to Play
                    </button>
                    <p className="text-xs text-gray-500 mt-4">Video is gated for monetization</p>
                </div>
            ) : (
                manifestUrl && <VideoPlayer src={manifestUrl} />
            )}
        </div>
    );
}
