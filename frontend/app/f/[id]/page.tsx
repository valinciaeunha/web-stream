'use client';

import { useState, useEffect, use } from 'react';
import dynamic from 'next/dynamic';

const VideoPlayer = dynamic(() => import('../../../components/VideoPlayer'), { ssr: false });

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function VideoPage({ params }: PageProps) {
    // Ungwrap params using React.use()
    const { id } = use(params);

    const [sessionId, setSessionId] = useState<string | null>(null);
    const [adStatus, setAdStatus] = useState<string>('init');
    const [manifestUrl, setManifestUrl] = useState<string | null>(null);
    const [isAdBlocked, setIsAdBlocked] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);

    const handleAdBlockDetected = () => {
        setIsAdBlocked(true);
    };

    const initSession = async () => {
        try {
            addLog("Initializing Session...");
            const res = await fetch('http://localhost:5000/api/session/init', { method: 'POST' });
            const data = await res.json();
            if (data.session_id) {
                setSessionId(data.session_id);
                addLog(`Session Created: ${data.session_id}`);
            } else {
                addLog("Session Init Failed");
            }
        } catch (e) {
            addLog(`Error: ${e.message}`);
        }
    };

    const simulateAd = async (event) => {
        if (!sessionId) return addLog("No Session ID");
        try {
            addLog(`Sending Ad Event: ${event}...`);
            const res = await fetch('http://localhost:5000/api/ads/event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: sessionId, event })
            });
            const data = await res.json();
            setAdStatus(data.current_status || 'error');
            addLog(`Ad Status: ${data.current_status}`);
        } catch (e) {
            addLog(`Error: ${e.message}`);
        }
    };

    const tryGetVideo = async () => {
        if (!sessionId) return addLog("No Session ID");
        try {
            addLog("Requesting Video Manifest...");
            const res = await fetch(`http://localhost:5000/api/video/${id}/manifest?session_id=${sessionId}`);

            if (res.status === 403) {
                const data = await res.json();
                addLog(`BLOCKED: ${data.error}`);
            } else if (res.ok) {
                const data = await res.json();
                setManifestUrl(data.manifest_url);
                addLog(`SUCCESS: URL Received -> ${data.manifest_url}`);
            } else {
                addLog(`Error: ${res.statusText}`);
            }
        } catch (e) {
            addLog(`Error: ${e.message}`);
        }
    };

    useEffect(() => {
        initSession();
    }, []);

    return (
        <div className="p-10 font-mono">
            <h1 className="text-2xl font-bold mb-4">Phase 4: Real Player Integration</h1>
            <div className="mb-4">Video ID: {id}</div>

            <div className="grid grid-cols-2 gap-10">
                <div className="space-y-4">
                    <div className="p-4 border rounded bg-gray-50">
                        <h2 className="font-bold">1. Session Status</h2>
                        <div>ID: {sessionId || 'Loading...'}</div>
                        <div>Ad Status: <span className={adStatus === 'completed' ? 'text-green-600 font-bold' : 'text-red-600'}>{adStatus}</span></div>
                    </div>

                    {!manifestUrl && (
                        <div className="p-4 border rounded bg-yellow-50 space-y-4">
                            <h2 className="font-bold text-lg">🔒 Video Locked</h2>
                            <p className="text-sm text-gray-600">
                                Please watch the advertisement to unlock this content.
                            </p>

                            {adStatus === 'init' && (
                                <button
                                    onClick={() => {
                                        // 1. Open Ad in New Tab
                                        window.open('https://www.effectivegatecpm.com/hjp0hms3z?key=bfa0fcba6c2ddee9d110e88593485c32', '_blank');
                                        // 2. Start "Verification" (Timer)
                                        setAdStatus('started');
                                        simulateAd('start');
                                        // 3. Auto-complete after 5 seconds (Simulating user watching)
                                        setTimeout(() => {
                                            simulateAd('complete');
                                        }, 5000);
                                    }}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded shadow-lg transition-all"
                                >
                                    ▶️ Watch Ad to Unlock
                                </button>
                            )}

                            {adStatus === 'started' && (
                                <div className="text-center p-4 bg-white rounded border animate-pulse">
                                    <div className="text-blue-600 font-bold mb-2">Verifying Ad...</div>
                                    <div className="text-xs text-gray-500">Please wait 5 seconds</div>
                                </div>
                            )}

                            {adStatus === 'completed' && (
                                <button onClick={tryGetVideo} className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded shadow-lg animate-bounce">
                                    🔓 Unlock Video Now
                                </button>
                            )}
                        </div>
                    )}

                    {manifestUrl && (
                        <div className="p-4 border rounded bg-green-50">
                            <h2 className="font-bold mb-2">3. Video Player (Unlocked)</h2>
                            <div className="aspect-video bg-black">
                                <VideoPlayer
                                    src={manifestUrl}
                                    onAdBlockDetected={handleAdBlockDetected}
                                />
                            </div>
                            <div className="mt-2 text-xs text-gray-500 break-all">
                                Source: {manifestUrl}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border rounded bg-black text-green-400 h-96 overflow-y-auto text-sm">
                    <h2 className="text-white font-bold mb-2 border-b border-gray-700 pb-2">System Logs</h2>
                    {logs.map((log, i) => (
                        <div key={i}>{log}</div>
                    ))}
                </div>
            </div>
        </div>
    );
}
