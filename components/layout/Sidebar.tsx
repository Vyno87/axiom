"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, History, Settings, Fingerprint } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: Users, label: "Employees", href: "/employees" },
    { icon: History, label: "History", href: "/history" },
    { icon: Settings, label: "Settings", href: "/settings" },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <motion.aside
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="fixed left-0 top-0 bottom-0 w-64 glass-panel border-r border-white/10 hidden md:flex flex-col z-50"
        >
            <div className="p-8 flex items-center gap-3">
                <div className="bg-cyan-500/20 p-2 rounded-lg border border-cyan-500/50">
                    <Fingerprint className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tighter text-white">
                        AXIOM<span className="text-cyan-400">.ID</span>
                    </h1>
                    <p className="text-xs text-white/40 tracking-widest">SYSTEM V2.0</p>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-8">
                {menuItems.map((item) => {
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

            <div className="p-6">
                <div className="glass-card p-4 rounded-xl bg-gradient-to-br from-cyan-900/20 to-purple-900/20 border border-white/5">
                    <p className="text-xs text-cyan-300 mb-1">System Status</p>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                        <span className="text-sm font-medium text-white">Online</span>
                    </div>
                </div>
            </div>
        </motion.aside>
    );
}
