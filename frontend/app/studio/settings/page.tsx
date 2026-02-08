
'use client';

import {
    Shield,
    Mail,
    Key,
    Save,
    Bell,
    Globe,
    Smartphone,
    Database,
    Cloud,
    ExternalLink,
    Cpu,
    Zap,
    Sparkles
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function SettingsPage() {
    const handleSave = () => {
        toast.info("Read-only Layer", {
            description: "System configurations are managed via secure environment variables.",
            style: { background: '#111', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
        });
    };

    return (
        <div className="animate-in fade-in duration-1000 slide-in-from-bottom-6 space-y-16">

            {/* Mesh Surface Decoration */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full -z-10 pointer-events-none" />

            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-2">
                <div className="space-y-4">
                    <Badge variant="outline" className="text-[10px] font-heading font-black uppercase text-primary border-primary/20 bg-primary/5 px-3 py-1 rounded-full">
                        <Cpu size={12} className="mr-2" /> System Architecture
                    </Badge>
                    <h1 className="text-5xl font-heading font-black text-white tracking-tighter leading-none italic uppercase">Core Configuration</h1>
                    <p className="text-zinc-500 font-medium text-lg leading-relaxed max-w-2xl">Refine your administrative identity and monitor the health of your global streaming infrastructure.</p>
                </div>
                <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-white font-heading font-black h-14 px-10 rounded-2xl shadow-[0_12px_24px_-8px_rgba(var(--primary),0.3)] hover:shadow-primary/40 active:scale-95 transition-all text-xs uppercase tracking-[0.2em] group">
                    <Save className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" /> Commit Changes
                </Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-10">
                    {/* Profile Section */}
                    <Card className="bg-zinc-950/40 backdrop-blur-3xl border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl border-t-white/10">
                        <CardHeader className="bg-black/40 p-10 border-b border-white/5">
                            <CardTitle className="flex items-center gap-4 text-2xl font-heading font-black text-white italic tracking-tight">
                                <Shield className="w-7 h-7 text-primary" />
                                Admin Identity
                            </CardTitle>
                            <CardDescription className="font-medium text-zinc-500 text-sm mt-2">Manage your master access credentials for the Vinz Studio network.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-10 space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-heading font-black text-zinc-600 uppercase tracking-[0.3em] ml-1">Universal Email</Label>
                                    <div className="relative group/field">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-700 group-focus-within/field:text-primary transition-colors duration-500" />
                                        <Input
                                            readOnly
                                            value="admin@vinzhub.xyz"
                                            className="bg-black/40 border-white/5 rounded-2xl pl-12 h-14 text-zinc-400 outline-none cursor-not-allowed font-heading font-bold italic border-t-white/5"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-heading font-black text-zinc-600 uppercase tracking-[0.3em] ml-1">Cipher Key</Label>
                                    <div className="relative group/field">
                                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-700 group-focus-within/field:text-primary transition-colors duration-500" />
                                        <Input
                                            type="password"
                                            readOnly
                                            value="••••••••••••••••"
                                            className="bg-black/40 border-white/5 rounded-2xl pl-12 h-14 text-zinc-400 outline-none cursor-not-allowed border-t-white/5"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-primary/5 border border-primary/10 p-6 rounded-3xl flex items-start gap-4">
                                <div className="p-2 bg-primary/20 rounded-xl">
                                    <Sparkles className="w-5 h-5 text-primary" />
                                </div>
                                <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                                    <span className="text-primary font-heading font-black uppercase tracking-widest mr-2">Secure Update:</span>
                                    To rotate these master credentials, update the <code className="text-white px-2 py-0.5 bg-white/5 rounded-lg border border-white/5 font-mono">ADMIN_EMAIL</code> and <code className="text-white px-2 py-0.5 bg-white/5 rounded-lg border border-white/5 font-mono">ADMIN_PASSWORD</code> constants within your server's root environment configuration.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Preferences */}
                    <Card className="bg-zinc-950/40 backdrop-blur-3xl border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl border-t-white/10 group">
                        <CardHeader className="p-10 border-b border-white/5 bg-black/40">
                            <CardTitle className="flex items-center gap-4 text-xl font-heading font-black text-white italic tracking-tight">
                                <Bell className="w-6 h-6 text-orange-500 group-hover:rotate-12 transition-transform duration-500" />
                                Operational Protocols
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-10 space-y-8">
                            <div className="flex items-center justify-between group/opt">
                                <div className="space-y-1.5">
                                    <p className="text-sm font-heading font-black text-white uppercase tracking-tight italic group-hover/opt:text-primary transition-colors">Real-time Node Alerts</p>
                                    <p className="text-xs text-zinc-500 font-medium">Get instant notifications about encoding pipeline status.</p>
                                </div>
                                <Switch disabled className="data-[state=checked]:bg-primary" />
                            </div>
                            <Separator className="bg-white/5" />
                            <div className="flex items-center justify-between group/opt">
                                <div className="space-y-1.5">
                                    <p className="text-sm font-heading font-black text-white uppercase tracking-tight italic group-hover/opt:text-primary transition-colors">Public Discovery Layer</p>
                                    <p className="text-xs text-zinc-500 font-medium">Broadcast your assets to the global search infrastructure.</p>
                                </div>
                                <Switch disabled />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-10">
                    <Card className="bg-zinc-950/40 backdrop-blur-3xl border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden border-t-white/10 group">
                        <CardHeader className="p-8 border-b border-white/5 bg-black/40">
                            <CardTitle className="text-[10px] font-heading font-black uppercase tracking-[0.4em] text-zinc-600 px-1">Network Health</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-5">
                            {[
                                { name: 'PostgreSQL Core', icon: Database, color: 'text-emerald-500', pulse: 'bg-emerald-500' },
                                { name: 'S3 Ingestion Storage', icon: Cloud, color: 'text-sky-500', pulse: 'bg-sky-500' },
                                { name: 'Edge Delivery Network', icon: Globe, color: 'text-indigo-500', pulse: 'bg-indigo-500' },
                                { name: 'Transcoding Cluster', icon: Zap, color: 'text-amber-500', pulse: 'bg-amber-500' }
                            ].map((sys) => (
                                <div key={sys.name} className="flex items-center justify-between p-5 bg-black/40 rounded-2xl border border-white/5 group/sys hover:bg-white/[0.02] transition-all duration-500">
                                    <div className="flex items-center gap-4">
                                        <sys.icon className={`w-4.5 h-4.5 ${sys.color} group-hover/sys:scale-110 transition-transform`} />
                                        <span className="text-xs font-heading font-bold uppercase text-zinc-400 group-hover/sys:text-white transition-colors">{sys.name}</span>
                                    </div>
                                    <div className="relative flex items-center justify-center">
                                        <div className={`absolute w-3 h-3 rounded-full ${sys.pulse} animate-ping opacity-20`} />
                                        <div className={`relative w-2 h-2 rounded-full ${sys.pulse} shadow-[0_0_10px_rgba(var(--primary),0.5)]`} />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                        <CardFooter className="p-8 border-t border-white/5 bg-black/20">
                            <Button variant="ghost" className="w-full text-primary hover:text-white hover:bg-primary/10 font-heading font-black uppercase text-[10px] tracking-[0.3em] h-12 rounded-xl transition-all" asChild>
                                <a href="/health" target="_blank">
                                    System Diagnostics <ExternalLink className="w-3.5 h-3.5 ml-3" />
                                </a>
                            </Button>
                        </CardFooter>
                    </Card>

                    <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-primary/20 to-transparent border border-primary/20 relative overflow-hidden group">
                        <div className="relative z-10">
                            <h4 className="text-white font-heading font-black uppercase tracking-tight italic text-lg mb-2">Technical Support</h4>
                            <p className="text-xs text-zinc-400 font-medium leading-relaxed mb-6">Need assistance scaling your distribution network?</p>
                            <Button className="w-full bg-white text-black hover:bg-zinc-200 font-heading font-black uppercase text-[10px] tracking-widest h-12 rounded-xl shadow-xl active:scale-95 transition-all">
                                Contact Engineering
                            </Button>
                        </div>
                        <Sparkles className="absolute -bottom-6 -right-6 w-32 h-32 text-primary/10 group-hover:text-primary/20 transition-colors duration-1000 rotate-12" />
                    </div>
                </div>
            </div>

            <footer className="flex items-center justify-center py-6 opacity-30 mt-10">
                <div className="flex items-center gap-4 text-[10px] font-heading font-black text-zinc-600 uppercase tracking-[0.4em]">
                    <Shield size={14} className="text-primary/60" />
                    Secure Configuration Layer
                    <div className="w-12 h-[1px] bg-zinc-800" />
                </div>
            </footer>
        </div>
    );
}
