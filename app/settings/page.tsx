"use client";

import GlassCard from "@/components/ui/GlassCard";
import NeonButton from "@/components/ui/NeonButton";
import { Server, Wifi, Shield, RefreshCcw, Smartphone, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">System Settings</h1>
                <p className="text-white/40">Configure application and hardware parameters</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassCard>
                    <div className="flex items-center gap-3 mb-6">
                        <Server className="w-6 h-6 text-cyan-400" />
                        <h2 className="text-xl font-bold text-white">Device Configuration</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                            <div>
                                <h3 className="font-medium text-white">Main ESP32 Node</h3>
                                <p className="text-sm text-white/40">ID: ESP32-AX-01</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                <span className="text-xs text-emerald-400">Connected</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                            <div>
                                <h3 className="font-medium text-white">Firmware Version</h3>
                                <p className="text-sm text-white/40">v2.1.0 (Stable)</p>
                            </div>
                            <NeonButton size="sm" variant="primary" glow={false}>
                                Check Update
                            </NeonButton>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard>
                    <div className="flex items-center gap-3 mb-6">
                        <Shield className="w-6 h-6 text-purple-400" />
                        <h2 className="text-xl font-bold text-white">Security & Account</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                            <h3 className="font-medium text-white mb-2">Password</h3>
                            <p className="text-sm text-white/40 mb-4">Update your account password for better security.</p>
                            <div className="flex gap-2">
                                <NeonButton size="sm" variant="primary" glow={false}>
                                    <Shield className="w-4 h-4 mr-2" /> Change Password
                                </NeonButton>
                            </div>
                        </div>

                        <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                            <h3 className="font-medium text-white mb-2">Session Management</h3>
                            <NeonButton size="sm" variant="danger" onClick={() => signOut({ callbackUrl: '/login' })}>
                                <LogOut className="w-4 h-4 mr-2" /> Sign Out
                            </NeonButton>
                        </div>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
