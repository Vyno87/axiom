"use client";

import { Users, UserCheck, Clock, AlertTriangle } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";

export default function StatsGrid() {
    const stats = [
        {
            title: "Total Employees",
            value: "142",
            change: "+4 new",
            icon: Users,
            color: "text-cyan-400",
            bg: "bg-cyan-500/10",
            border: "border-cyan-500/20",
        },
        {
            title: "Present Today",
            value: "118",
            change: "92% rate",
            icon: UserCheck,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20",
        },
        {
            title: "Avg. Check-in",
            value: "08:42",
            change: "On time",
            icon: Clock,
            color: "text-purple-400",
            bg: "bg-purple-500/10",
            border: "border-purple-500/20",
        },
        {
            title: "Late Arrivals",
            value: "5",
            change: "-2 vs yesterday",
            icon: AlertTriangle,
            color: "text-rose-400",
            bg: "bg-rose-500/10",
            border: "border-rose-500/20",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
                <GlassCard key={index} hoverEffect className="flex flex-col justify-between h-32">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-white/40 text-sm font-medium tracking-wide">{stat.title}</p>
                            <h3 className="text-3xl font-bold mt-1 text-white">{stat.value}</h3>
                        </div>
                        <div className={`p-2 rounded-lg ${stat.bg} ${stat.border} border`}>
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-auto">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${stat.bg} ${stat.color} border ${stat.border}`}>
                            {stat.change}
                        </span>
                    </div>
                </GlassCard>
            ))}
        </div>
    );
}
