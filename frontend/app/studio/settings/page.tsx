
'use client';

import { Shield, Mail, Key, Save, Bell, Globe } from 'lucide-react';

export default function SettingsPage() {
    return (
        <div className="animate-in fade-in duration-500 space-y-10">
            <header>
                <h1 className="text-3xl font-black text-white tracking-tight">Studio Settings</h1>
                <p className="text-gray-500 mt-2 font-medium">Configure your administrative credentials and preferences</p>
            </header>

            <div className="max-w-3xl space-y-6">
                {/* Profile Section */}
                <div className="bg-[#111] border border-white/5 rounded-3xl p-8 shadow-2xl">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-blue-600/10 rounded-2xl text-blue-500">
                            <Shield className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold">Admin Credentials</h2>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Admin Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="email"
                                    readOnly
                                    value="admin@vinzhub.cloud"
                                    className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm text-gray-400 outline-none cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Current Password</label>
                            <div className="relative group">
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="password"
                                    readOnly
                                    value="••••••••••••"
                                    className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm text-gray-400 outline-none cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <p className="text-[10px] text-gray-600 italic">Credentials can be updated via backend environment variables for maximum security.</p>
                    </div>
                </div>

                {/* Notifications */}
                <div className="bg-[#111] border border-white/5 rounded-3xl p-8 opacity-50 cursor-not-allowed">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-orange-600/10 rounded-2xl text-orange-500">
                            <Bell className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold">Preferences</h2>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400 font-medium">Coming Soon</span>
                        <div className="w-10 h-5 bg-gray-800 rounded-full"></div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button className="bg-white/5 hover:bg-white/10 text-white px-8 py-3 rounded-2xl font-black text-sm flex items-center gap-2 transition-all border border-white/10">
                        <Save className="w-5 h-5" /> Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
