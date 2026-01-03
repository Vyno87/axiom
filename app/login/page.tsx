"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Fingerprint, Lock, User, Smartphone } from "lucide-react";
import NeonButton from "@/components/ui/NeonButton";
import GlassCard from "@/components/ui/GlassCard";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function LoginPage() {
    const router = useRouter();
    const { t, language, setLanguage } = useLanguage();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);

    // Handle PWA Install Prompt (Android/Desktop)
    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowInstallPrompt(true);
        };

        window.addEventListener("beforeinstallprompt", handler);

        return () => {
            window.removeEventListener("beforeinstallprompt", handler);
        };
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const res = await signIn("credentials", {
            username,
            password,
            redirect: false,
        });

        if (res?.error) {
            setError(t("errorTitle")); // Simplified error message for i18n
            setLoading(false);
        } else {
            router.push("/");
        }
    };

    const handleInstallClick = () => {
        // Android / Desktop (Chrome/Edge)
        if (deferredPrompt) {
            deferredPrompt.prompt();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            deferredPrompt.userChoice.then((choiceResult: any) => {
                if (choiceResult.outcome === "accepted") {
                    console.log("User accepted the install prompt");
                }
                setDeferredPrompt(null);
                setShowInstallPrompt(false);
            });
        }
        // iOS / Others - Show Manual Instructions
        else {
            const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
            if (isIOS) {
                alert("To install on iOS:\n1. Tap the Share button below 👇\n2. Scroll down and tap 'Add to Home Screen' ➕");
            } else {
                alert("To install:\nLook for the 'Install' icon in your browser address bar or menu.");
            }
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black relative overflow-hidden px-4">
            {/* Background Gradients - Nuansa Neon */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Core Neon Glows */}
                <div className="absolute top-[-10%] left-[-5%] w-[80vh] h-[80vh] bg-cyan-500/10 rounded-full blur-[120px] animate-float-neon" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[70vh] h-[70vh] bg-purple-600/10 rounded-full blur-[100px] animate-float-neon-delayed" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vh] h-[60vh] bg-blue-500/5 rounded-full blur-[150px] animate-float-neon-slow" />

                {/* Grid Overlay for Tech Feel */}
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05] bg-center [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
            </div>

            {/* Language Switcher - Absolute Top Right */}
            <div className="absolute top-6 right-6 z-20">
                <div className="flex bg-white/5 rounded-full p-1 border border-white/10 backdrop-blur-md">
                    <button
                        onClick={() => setLanguage("en")}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${language === "en" ? "bg-cyan-500/20 text-cyan-400" : "text-white/40 hover:text-white"
                            }`}
                    >
                        ENG
                    </button>
                    <button
                        onClick={() => setLanguage("id")}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${language === "id" ? "bg-purple-500/20 text-purple-400" : "text-white/40 hover:text-white"
                            }`}
                    >
                        IND
                    </button>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-md relative z-10"
            >
                <GlassCard className="p-8 border-white/10 shadow-[0_0_50px_rgba(6,182,212,0.1)]">
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                            className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10 shadow-lg"
                        >
                            <Fingerprint className="w-8 h-8 text-cyan-400" />
                        </motion.div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">AXIOM IDENTITY</h1>
                        <p className="text-white/40 text-sm mt-1">{t("loginSubtitle")}</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <div className="relative group">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-cyan-400 transition-colors" />
                                <input
                                    type="text"
                                    placeholder={t("usernameLabel")}
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-cyan-400 transition-colors" />
                                <input
                                    type="password"
                                    placeholder={t("passwordLabel")}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-rose-400 text-xs text-center bg-rose-500/10 py-2 rounded-lg border border-rose-500/20"
                            >
                                {error}
                            </motion.div>
                        )}

                        <NeonButton
                            type="submit"
                            className="w-full mt-4 h-12 text-sm font-semibold tracking-wider uppercase"
                            disabled={loading}
                        >
                            {loading ? t("signingIn") : t("signInButton")}
                        </NeonButton>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
                        <NeonButton
                            size="sm"
                            variant="success"
                            onClick={handleInstallClick}
                            className="w-full h-10 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400"
                            disabled={!showInstallPrompt && /iPhone|iPad|iPod/.test(navigator.userAgent) === false && !deferredPrompt}
                        >
                            <Smartphone className="w-4 h-4 mr-2" />
                            {t("installPWA")}
                        </NeonButton>

                        <p className="text-white/20 text-[10px] text-center uppercase tracking-widest">
                            Secure Terminal v1.0.4
                        </p>
                    </div>
                </GlassCard>
            </motion.div>
        </div>
    );
}
