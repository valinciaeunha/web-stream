
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Shield, Mail, Key, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

        try {
            const res = await fetch(`${apiUrl}/api/studio/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include'
            });

            if (res.ok) {
                toast.success("Identity Verified", { description: "Access granted to the core network." });
                router.push('/studio');
            } else {
                toast.error("Access Denied", { description: "Invalid administrative credentials." });
            }
        } catch (err) {
            toast.error("Network Error", { description: "Could not reach the authentication layer." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-foreground font-sans selection:bg-primary/20 relative overflow-hidden dark">
            {/* Subtle Gradient Glows */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-40" />

            <div className="w-full max-w-[420px] z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col items-center mb-10 text-center">
                    <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground shadow-2xl shadow-primary/20 mb-6">
                        <Shield className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-heading font-bold tracking-tight">Vinz Studio</h1>
                    <p className="text-muted-foreground text-sm mt-2 uppercase tracking-[0.2em] font-medium">Administrative Gateway</p>
                </div>

                <Card className="bg-card border-border shadow-2xl rounded-2xl overflow-hidden">
                    <CardHeader className="p-10 pb-4 text-center">
                        <CardTitle className="text-xl font-heading font-bold">Authentication</CardTitle>
                        <CardDescription className="text-xs pt-1">Enter your master credentials to initialize.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-10 pt-6">
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <div className="relative group">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                    <Input
                                        type="email"
                                        placeholder="Admin Email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="bg-accent/40 border-border rounded-lg pl-10 h-12 focus:ring-1 focus:ring-primary/20 transition-all font-sans"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="relative group">
                                    <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                    <Input
                                        type="password"
                                        placeholder="Cipher Key"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="bg-accent/40 border-border rounded-lg pl-10 h-12 focus:ring-1 focus:ring-primary/20 transition-all font-sans"
                                    />
                                </div>
                            </div>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Verify Identity <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="bg-muted/5 border-t border-border p-6 justify-center">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest text-center">
                            Authorized Access Only • Protocol 2.1
                        </p>
                    </CardFooter>
                </Card>

                <p className="text-center mt-10 text-[10px] text-muted-foreground/40 font-bold uppercase tracking-[0.3em]">
                    &copy; {new Date().getFullYear()} Vinz Hub Architecture
                </p>
            </div>
        </div>
    );
}
