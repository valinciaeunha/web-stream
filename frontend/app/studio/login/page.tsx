
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
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
                toast.success('Access Granted', {
                    description: 'Directing to your command center.',
                    style: { background: '#111', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
                });
                router.push('/studio');
            } else {
                const data = await res.json();
                toast.error('Authentication Failed', { description: data.error || 'Invalid credentials' });
            }
        } catch (err) {
            toast.error('Connection Error', { description: 'Failed to synchronize with central server.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#070708] flex items-center justify-center p-6 text-zinc-300 font-sans selection:bg-primary/30 relative overflow-hidden">

            {/* Mesh Gradients for Premium Look */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse delay-700" />

            <div className="w-full max-w-[440px] z-10 animate-in fade-in zoom-in duration-1000 slide-in-from-bottom-8">
                <div className="flex flex-col items-center mb-10 space-y-4">
                    <div className="w-16 h-16 bg-zinc-950/50 backdrop-blur-2xl rounded-2xl flex items-center justify-center border border-white/10 shadow-2xl relative group">
                        <div className="absolute inset-0 bg-primary/20 blur-xl group-hover:bg-primary/40 transition-all duration-500 rounded-full" />
                        <Shield className="w-8 h-8 text-primary relative z-10" />
                    </div>
                    <div className="text-center">
                        <h1 className="font-heading font-black text-4xl text-white tracking-tight uppercase leading-none">Vinz Studio</h1>
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.4em] mt-3 flex items-center justify-center gap-2">
                            <Sparkles className="w-3 h-3 text-primary/60" /> Central Command
                        </p>
                    </div>
                </div>

                <Card className="bg-zinc-950/40 backdrop-blur-3xl border-white/5 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="space-y-2 text-center pt-10 pb-6 px-10">
                        <CardTitle className="text-2xl font-heading font-black text-white tracking-tight italic">Welcome Back</CardTitle>
                        <CardDescription className="text-zinc-500 font-medium">Verify your credentials to unlock the administrative layer.</CardDescription>
                    </CardHeader>

                    <CardContent className="px-10 pb-8">
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2.5">
                                <Label htmlFor="email" className="text-[10px] font-heading font-black uppercase tracking-[0.25em] text-zinc-600 ml-1">Access Email</Label>
                                <div className="relative group/field">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-700 group-focus-within/field:text-primary transition-colors duration-500" />
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="admin@vinzhub.xyz"
                                        className="bg-black/40 border-white/5 rounded-2xl pl-12 py-7 focus:border-primary/40 focus:ring-0 focus:bg-black/60 transition-all duration-500 text-sm font-semibold placeholder:text-zinc-800"
                                    />
                                    <div className="absolute inset-0 rounded-2xl border border-primary/0 group-focus-within/field:border-primary/20 transition-all duration-700 pointer-events-none" />
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <Label htmlFor="password" title="password" className="text-[10px] font-heading font-black uppercase tracking-[0.25em] text-zinc-600 ml-1">Security Key</Label>
                                <div className="relative group/field">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-700 group-focus-within/field:text-primary transition-colors duration-500" />
                                    <Input
                                        id="password"
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="bg-black/40 border-white/5 rounded-2xl pl-12 py-7 focus:border-primary/40 focus:ring-0 focus:bg-black/60 transition-all duration-500 text-sm font-semibold placeholder:text-zinc-800"
                                    />
                                    <div className="absolute inset-0 rounded-2xl border border-primary/0 group-focus-within/field:border-primary/20 transition-all duration-700 pointer-events-none" />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary hover:bg-primary/90 text-white h-16 rounded-2xl font-heading font-black text-sm uppercase tracking-[0.25em] shadow-[0_12px_24px_-8px_rgba(var(--primary),0.3)] hover:shadow-primary/40 transition-all active:scale-[0.97] mt-2 group"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        Verifying...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        Authorize Access <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                )}
                            </Button>
                        </form>
                    </CardContent>

                    <CardFooter className="py-8 flex flex-col gap-4 border-t border-white/5 bg-black/40 px-10">
                        <div className="flex items-center justify-between w-full opacity-40">
                            <div className="h-[1px] bg-white/10 flex-1" />
                            <span className="mx-4 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500">Security Node 01</span>
                            <div className="h-[1px] bg-white/10 flex-1" />
                        </div>
                    </CardFooter>
                </Card>

                <p className="text-center mt-8 text-[10px] text-zinc-600 font-bold uppercase tracking-[0.4em] opacity-50">
                    &copy; 2026 Vinzhub Infrastructure
                </p>
            </div>
        </div>
    );
}
