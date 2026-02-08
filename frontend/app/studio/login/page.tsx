
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label"; // Wait, I didn't add label. I should add it.
import { toast } from "sonner";

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        try {
            const res = await fetch(`${apiUrl}/api/studio/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include'
            });

            if (res.ok) {
                toast.success('Access Granted', { description: 'Welcome back to Vinz Studio' });
                router.push('/studio');
            } else {
                const data = await res.json();
                toast.error('Authentication Failed', { description: data.error || 'Invalid credentials' });
            }
        } catch (err) {
            toast.error('Connection Error', { description: 'Failed to connect to the server' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 text-white font-sans bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0a0a0a] to-[#0a0a0a]">

            <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
                <div className="flex justify-center mb-8">
                    <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center rotate-3 border border-blue-500/20 shadow-lg shadow-blue-600/10">
                        <Shield className="w-8 h-8 text-blue-500" />
                    </div>
                </div>

                <Card className="bg-[#111] border-white/5 shadow-2xl rounded-3xl overflow-hidden">
                    <CardHeader className="space-y-1 text-center pt-8">
                        <CardTitle className="text-3xl font-black tracking-tight text-white">Vinz Studio</CardTitle>
                        <CardDescription className="text-gray-500 font-medium">Secure Administrative Access</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Email Address</Label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="admin@vinzhub.cloud"
                                        className="bg-[#1a1a1a] border-white/10 rounded-xl pl-10 py-6 focus:border-blue-500/50 focus:ring-blue-500/5 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" title="password" className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Secret Password</Label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                                    <Input
                                        id="password"
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="bg-[#1a1a1a] border-white/10 rounded-xl pl-10 py-6 focus:border-blue-500/50 focus:ring-blue-500/5 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 h-14 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] mt-4"
                            >
                                {loading ? 'Verifying Access...' : 'Sign In to Studio'}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="pb-8 flex justify-center border-t border-white/5 pt-6 bg-black/20">
                        <p className="text-[10px] text-gray-600 uppercase tracking-widest font-black">
                            Powered by Vinzhub Cloud
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
