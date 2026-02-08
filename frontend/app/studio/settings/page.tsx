
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
    ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function SettingsPage() {
    const handleSave = () => {
        toast.info("Read-only Mode", { description: "These settings are managed via environment variables for security." });
    };

    return (
        <div className="animate-in fade-in duration-1000 space-y-10">
            <header className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-white tracking-tight">System Settings</h1>
                    <p className="text-gray-500 font-medium">Configure your administrative credentials and cloud infrastructure.</p>
                </div>
                <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white font-black h-11 px-8 rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all">
                    <Save className="w-5 h-5 mr-2" /> Save Configuration
                </Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* Profile Section */}
                    <Card className="bg-[#111] border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                        <CardHeader className="bg-black/20 p-8 border-b border-white/5">
                            <CardTitle className="flex items-center gap-3">
                                <Shield className="w-6 h-6 text-blue-500" />
                                Admin Credentials
                            </CardTitle>
                            <CardDescription className="font-medium text-gray-500">Manage access to your creator studio account.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="grid gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] ml-1">Administrator Email</Label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                                        <Input
                                            readOnly
                                            value="admin@vinzhub.cloud"
                                            className="bg-black/40 border-white/5 rounded-xl pl-12 h-12 text-gray-400 outline-none cursor-not-allowed font-bold"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] ml-1">Studio Password</Label>
                                    <div className="relative group">
                                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                                        <Input
                                            type="password"
                                            readOnly
                                            value="••••••••••••"
                                            className="bg-black/40 border-white/5 rounded-xl pl-12 h-12 text-gray-400 outline-none cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                            </div>
                            <Separator className="bg-white/5" />
                            <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-2xl flex items-start gap-3">
                                <Smartphone className="w-5 h-5 text-blue-500 mt-0.5" />
                                <p className="text-[11px] text-gray-500 leading-relaxed">
                                    <span className="text-blue-400 font-bold">Pro Tip:</span> To change these credentials, update the <code className="text-white px-1 bg-white/5 rounded">ADMIN_EMAIL</code> and <code className="text-white px-1 bg-white/5 rounded">ADMIN_PASSWORD</code> variables in your server's root <code className="text-white px-1 bg-white/5 rounded">.env</code> file.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Preferences */}
                    <Card className="bg-[#111] border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                        <CardHeader className="p-8">
                            <CardTitle className="flex items-center gap-3 text-lg">
                                <Bell className="w-5 h-5 text-orange-500" />
                                Notifications & Privacy
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-8 pb-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-white uppercase tracking-tight">Email Alerts</p>
                                    <p className="text-xs text-gray-500">Get notified about encoding completion</p>
                                </div>
                                <Switch disabled />
                            </div>
                            <Separator className="bg-white/5" />
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-white uppercase tracking-tight">Public API Access</p>
                                    <p className="text-xs text-gray-500">Allow third-party applications to query assets</p>
                                </div>
                                <Switch disabled />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="bg-[#111] border-white/5 rounded-3xl shadow-2xl">
                        <CardHeader className="p-6">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-gray-500 px-1">Infrastructure Status</CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 pb-6 space-y-4">
                            <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <Database className="w-4 h-4 text-green-500" />
                                    <span className="text-xs font-bold uppercase">PostgreSQL</span>
                                </div>
                                <div className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50" />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <Cloud className="w-4 h-4 text-blue-500" />
                                    <span className="text-xs font-bold uppercase">S3 Storage</span>
                                </div>
                                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50" />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <Globe className="w-4 h-4 text-purple-500" />
                                    <span className="text-xs font-bold uppercase">CDN Delivery</span>
                                </div>
                                <div className="w-2 h-2 rounded-full bg-purple-500 shadow-lg shadow-purple-500/50" />
                            </div>
                        </CardContent>
                        <CardFooter className="p-6 border-t border-white/5">
                            <Button variant="ghost" className="w-full text-blue-500 hover:text-blue-400 font-bold uppercase text-[10px] tracking-widest" asChild>
                                <a href="/health" target="_blank">
                                    System Health Check <ExternalLink className="w-3 h-3 ml-2" />
                                </a>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
