"use client";

import { useState } from "react";
import GlassCard from "@/components/ui/GlassCard";
import NeonButton from "@/components/ui/NeonButton";
import { Server, Shield, LogOut, Lock, X } from "lucide-react";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/components/providers/LanguageProvider"; // Import provider

export default function SettingsPage() {
    const { t } = useLanguage();
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passForm, setPassForm] = useState({ current: "", new: "", confirm: "" });
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ type: "", text: "" });

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setMsg({ type: "", text: "" });

        if (passForm.new !== passForm.confirm) {
            setMsg({ type: "error", text: "New passwords do not match" }); // Simple alert for now, can i18n
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/user/password", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword: passForm.current,
                    newPassword: passForm.new
                }),
            });
            const data = await res.json();

            if (res.ok) {
                setMsg({ type: "success", text: t("success") });
                setTimeout(() => {
                    setIsPasswordModalOpen(false);
                    setPassForm({ current: "", new: "", confirm: "" });
                    setMsg({ type: "", text: "" });
                }, 1500);
            } else {
                setMsg({ type: "error", text: data.error || t("error") });
            }
        } catch (error) {
            setMsg({ type: "error", text: t("error") });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">{t("setTitle")}</h1>
                <p className="text-white/40">{t("setSubtitle")}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassCard>
                    <div className="flex items-center gap-3 mb-6">
                        <Server className="w-6 h-6 text-cyan-400" />
                        <h2 className="text-xl font-bold text-white">{t("setDevice")}</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                            <div>
                                <h3 className="font-medium text-white">{t("setMainNode")}</h3>
                                <p className="text-sm text-white/40">ID: ESP32-AX-01</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                <span className="text-xs text-emerald-400">{t("setConnected")}</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                            <div>
                                <h3 className="font-medium text-white">{t("setFirmware")}</h3>
                                <p className="text-sm text-white/40">v2.1.0 (Stable)</p>
                            </div>
                            <NeonButton size="sm" variant="primary" glow={false}>
                                {t("setCheckUpdate")}
                            </NeonButton>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard>
                    <div className="flex items-center gap-3 mb-6">
                        <Shield className="w-6 h-6 text-purple-400" />
                        <h2 className="text-xl font-bold text-white">{t("setSecurity")}</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                            <h3 className="font-medium text-white mb-2">{t("setPassTitle")}</h3>
                            <p className="text-sm text-white/40 mb-4">{t("setPassDesc")}</p>
                            <div className="flex gap-2">
                                <NeonButton
                                    size="sm"
                                    variant="primary"
                                    glow={false}
                                    onClick={() => setIsPasswordModalOpen(true)}
                                >
                                    <Shield className="w-4 h-4 mr-2" /> {t("setChangePass")}
                                </NeonButton>
                            </div>
                        </div>

                        <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                            <h3 className="font-medium text-white mb-2">{t("setSession")}</h3>
                            <NeonButton size="sm" variant="danger" onClick={() => signOut({ callbackUrl: '/login' })}>
                                <LogOut className="w-4 h-4 mr-2" /> {t("setSignOut")}
                            </NeonButton>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* PASSWORD CHANGE MODAL */}
            <AnimatePresence>
                {isPasswordModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setIsPasswordModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-2xl"
                        >
                            <button
                                onClick={() => setIsPasswordModalOpen(false)}
                                className="absolute right-4 top-4 text-white/40 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Lock className="w-5 h-5 text-cyan-400" /> {t("cpTitle")}
                            </h2>

                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-white/40 mb-1">{t("cpCurrent")}</label>
                                    <input
                                        type="password" required
                                        value={passForm.current}
                                        onChange={e => setPassForm({ ...passForm, current: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-500/50 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-white/40 mb-1">{t("cpNew")}</label>
                                    <input
                                        type="password" required
                                        value={passForm.new}
                                        onChange={e => setPassForm({ ...passForm, new: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-500/50 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-white/40 mb-1">{t("cpConfirm")}</label>
                                    <input
                                        type="password" required
                                        value={passForm.confirm}
                                        onChange={e => setPassForm({ ...passForm, confirm: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-500/50 outline-none"
                                    />
                                </div>

                                {msg.text && (
                                    <div className={`text-xs text-center p-2 rounded-lg ${msg.type === 'error' ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                        {msg.text}
                                    </div>
                                )}

                                <NeonButton type="submit" className="w-full" disabled={loading}>
                                    {loading ? t("cpUpdating") : t("cpUpdate")}
                                </NeonButton>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
