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
        <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
            {/* Background Gradients */}
            {/* Animated Neon Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                        rotate: [0, 90, 0]
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute -top-[20%] -left-[10%] w-[70vh] h-[70vh] bg-cyan-500/20 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.2, 0.4, 0.2],
                        rotate: [0, -45, 0]
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                    }}
                    className="absolute top-[40%] right-[-20%] w-[60vh] h-[60vh] bg-purple-500/20 rounded-full blur-[100px]"
                />
                <motion.div
                    animate={{
                        y: [0, -50, 0],
                        opacity: [0.1, 0.3, 0.1]
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute bottom-[-10%] left-[20%] w-[50vh] h-[50vh] bg-blue-500/10 rounded-full blur-[100px]"
                />

                {/* Grid Overlay for Tech Feel */}
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
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
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md p-4 relative z-10"
            >
                <GlassCard className="p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                            <Fingerprint className="w-8 h-8 text-cyan-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">AXIOM IDENTITY</h1>
                        <p className="text-white/40 text-sm mt-1">{t("loginSubtitle")}</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                <input
                                    type="text"
                                    placeholder={t("usernameLabel")}
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                <input
                                    type="password"
                                    placeholder={t("passwordLabel")}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-rose-400 text-xs text-center bg-rose-500/10 py-2 rounded-lg"
                            >
                                {error}
                            </motion.div>
                        )}

                        <NeonButton
                            type="submit"
                            className="w-full mt-4"
                            disabled={loading}
                        >
                            {loading ? t("signingIn") : t("signInButton")}
                        </NeonButton>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
                        {/* PWA Install Button - Always show for iOS/Android/Desktop */}
                        <NeonButton
                            size="sm"
                            variant="success"
                            onClick={handleInstallClick}
                            className="w-full"
                            // Always enabled to show instructions if prompt not available (e.g. iOS)
                            disabled={!showInstallPrompt && /iPhone|iPad|iPod/.test(navigator.userAgent) === false && !deferredPrompt}
                        >
                            <Smartphone className="w-4 h-4 mr-2" />
                            {t("installPWA")}
                        </NeonButton>

                        <p className="text-white/20 text-xs text-center">
                            Install this app on your device home screen for quick access.
                        </p>
                    </div>
                </GlassCard>
            </motion.div>
        </div>
    );
}
