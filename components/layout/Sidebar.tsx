"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, History, Settings, Fingerprint, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function Sidebar() {
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const { t, language, setLanguage } = useLanguage();

    const menuItems = [
        { icon: LayoutDashboard, label: t("navDashboard"), href: "/" },
        { icon: Users, label: t("navEmployees"), href: "/employees", role: "admin" },
        { icon: History, label: t("navHistory"), href: "/history", role: "admin" },
        { icon: Settings, label: t("navSettings"), href: "/settings" },
    ];

    // Hide sidebar on login page
    if (pathname === "/login") return null;

    return (
        <motion.aside
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="fixed left-0 top-0 bottom-0 w-64 glass-panel border-r border-white/10 hidden md:flex flex-col z-50 bg-black/50 backdrop-blur-xl"
        >
            <div className="p-8 flex items-center gap-3">
                <div className="bg-cyan-500/20 p-2 rounded-lg border border-cyan-500/50">
                    <Fingerprint className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tighter text-white">
                        AXIOM<span className="text-cyan-400">.ID</span>
                    </h1>
                    <p className="text-xs text-white/40 tracking-widest">SYSTEM V2.1</p>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-8">
                {menuItems.map((item) => {
                    // Role Check
                    if (item.role === "admin" && (session?.user as any)?.role !== "admin") return null;

                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href}>
                            <div
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                                    isActive
                                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                                        : "text-white/60 hover:text-white hover:bg-white/5"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-cyan-500/10"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <item.icon className={cn("w-5 h-5 z-10", isActive && "drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]")} />
                                <span className="z-10 font-medium">{item.label}</span>

                                {isActive && (
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-400 rounded-l-full shadow-[0_0_10px_#22d3ee]" />
                                )}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-6 space-y-4">
                {/* Language Switcher */}
                <div className="flex bg-white/5 rounded-full p-1 border border-white/10 w-full justify-between">
                    <button
                        onClick={() => setLanguage("en")}
                        className={`flex-1 px-2 py-1 rounded-full text-xs font-medium transition-all ${language === "en" ? "bg-cyan-500/20 text-cyan-400" : "text-white/40 hover:text-white"
                            }`}
                    >
                        English
                    </button>
                    <button
                        onClick={() => setLanguage("id")}
                        className={`flex-1 px-2 py-1 rounded-full text-xs font-medium transition-all ${language === "id" ? "bg-purple-500/20 text-purple-400" : "text-white/40 hover:text-white"
                            }`}
                    >
                        Indonesia
                    </button>
                </div>

                {/* User Profile */}
                {status === "authenticated" && (
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-xs font-bold text-cyan-400">
                            {session.user?.name?.[0] || "U"}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">{session.user?.name}</p>
                            <p className="text-xs text-white/40 capitalize">{(session.user as any)?.role}</p>
                        </div>
                    </div>
                )}
            </div>
        </motion.aside>
    );
}
