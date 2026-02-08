
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
        toast.info("Read-only Configuration", {
            description: "System parameters are defined via environmental variables.",
        });
    };

    return (
        <div className="animate-in fade-in duration-700 space-y-10">

            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-heading font-bold text-foreground tracking-tight">System Configuration</h1>
                    <p className="text-muted-foreground text-sm">Manage administrative credentials and infrastructure protocols.</p>
                </div>
                <Button onClick={handleSave} className="h-11 px-6 rounded-lg font-bold shadow-lg shadow-primary/20">
                    <Save className="w-4 h-4 mr-2" /> Save Changes
                </Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Admin Identity */}
                    <Card className="bg-card border-border rounded-xl shadow-sm overflow-hidden">
                        <CardHeader className="bg-muted/10 p-8 border-b border-border">
                            <CardTitle className="flex items-center gap-3 text-lg font-heading font-bold">
                                <Shield className="w-5 h-5 text-primary" />
                                Master Access Control
                            </CardTitle>
                            <CardDescription className="text-sm mt-1">Universal credentials for the Vinz Studio network.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Administrative Email</Label>
                                    <div className="relative group/field">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within/field:text-primary" />
                                        <Input
                                            readOnly
                                            value="admin@vinzhub.xyz"
                                            className="bg-accent/40 border-border rounded-lg pl-10 h-11 text-muted-foreground/80 cursor-not-allowed font-medium text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Master Password</Label>
                                    <div className="relative group/field">
                                        <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within/field:text-primary" />
                                        <Input
                                            type="password"
                                            readOnly
                                            value="••••••••••••••••"
                                            className="bg-accent/40 border-border rounded-lg pl-10 h-11 text-muted-foreground/80 cursor-not-allowed text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg flex items-start gap-4">
                                <Sparkles className="w-4 h-4 text-primary mt-1 shrink-0" />
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    <span className="text-primary font-bold uppercase tracking-widest mr-2">Tip:</span>
                                    Update environmental constants <code className="text-foreground font-mono bg-accent/50 px-1.5 py-0.5 rounded border border-border">ADMIN_EMAIL</code> and <code className="text-foreground font-mono bg-accent/50 px-1.5 py-0.5 rounded border border-border">ADMIN_PASSWORD</code> on your host machine to rotate these credentials.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Operational Toggles */}
                    <Card className="bg-card border-border rounded-xl shadow-sm overflow-hidden p-8">
                        <CardTitle className="text-lg font-heading font-bold mb-6 flex items-center gap-3">
                            <Bell className="w-5 h-5 text-orange-500" />
                            Platform Protocols
                        </CardTitle>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-muted/5 rounded-lg border border-border transition-colors hover:border-primary/20">
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-foreground">Infrastructure Monitoring</p>
                                    <p className="text-xs text-muted-foreground">Receive real-time health alerts from the global network nodes.</p>
                                </div>
                                <Switch disabled className="data-[state=checked]:bg-primary" />
                            </div>
                            <Separator className="bg-border" />
                            <div className="flex items-center justify-between p-4 bg-muted/5 rounded-lg border border-border transition-colors hover:border-primary/20">
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-foreground">Public Asset Discovery</p>
                                    <p className="text-xs text-muted-foreground">Authorize indexing for external distribution engines.</p>
                                </div>
                                <Switch disabled />
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="space-y-8">
                    <Card className="bg-card border-border rounded-xl shadow-sm overflow-hidden">
                        <CardHeader className="p-6 border-b border-border bg-muted/10">
                            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Infrastructure Pulse</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            {[
                                { name: 'DB Instance', icon: Database, color: 'text-emerald-500' },
                                { name: 'Object Storage', icon: Cloud, color: 'text-blue-500' },
                                { name: 'CDN Gateway', icon: Globe, color: 'text-indigo-500' },
                                { name: 'Worker Cluster', icon: Zap, color: 'text-amber-500' }
                            ].map((sys) => (
                                <div key={sys.name} className="flex items-center justify-between p-4 bg-accent/20 rounded-lg border border-border group hover:border-primary/20 transition-all">
                                    <div className="flex items-center gap-3">
                                        <sys.icon className={`w-4 h-4 ${sys.color} group-hover:scale-110 transition-transform`} />
                                        <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors">{sys.name}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                        <CardFooter className="p-6 border-t border-border bg-muted/5">
                            <Button variant="ghost" className="w-full text-primary hover:text-foreground hover:bg-primary/5 font-bold uppercase text-[10px] tracking-widest h-10 rounded-lg" asChild>
                                <a href="/health" target="_blank">
                                    Network Diagnostics <ExternalLink className="w-3.5 h-3.5 ml-2" />
                                </a>
                            </Button>
                        </CardFooter>
                    </Card>

                    <div className="p-8 rounded-xl bg-primary/10 border border-primary/20 relative overflow-hidden group">
                        <div className="relative z-10">
                            <h4 className="text-foreground font-heading font-bold text-lg mb-2">Technical Core</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed mb-6">Access dedicated documentation for scaling your distribution network.</p>
                            <Button className="w-full bg-primary text-white hover:bg-primary/90 font-bold uppercase text-[10px] tracking-widest h-11 rounded-lg">
                                Documentation Hub
                            </Button>
                        </div>
                        <Cpu className="absolute -bottom-4 -right-4 w-24 h-24 text-primary/5 group-hover:text-primary/10 transition-colors rotate-12" />
                    </div>
                </div>
            </div>

            <footer className="flex items-center justify-center py-6 opacity-40 mt-10">
                <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.4em]">
                    <Shield size={12} className="text-primary/60" />
                    Secure Interface v2.1
                    <div className="w-8 h-[1px] bg-border" />
                </div>
            </footer>
        </div>
    );
}
