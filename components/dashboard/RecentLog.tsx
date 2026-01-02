"use client";

import useSWR from "swr";
import GlassCard from "@/components/ui/GlassCard";
import { format } from "date-fns";

// Fetcher function
const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface AttendanceLog {
    _id: string;
    uid: number;
    timestamp: string;
    status: "In" | "Out";
    user?: {
        name: string;
        department: string;
    };
}

export default function RecentLog() {
    const { data, error, isLoading } = useSWR<{ data: AttendanceLog[] }>(
        "/api/attendance?limit=5",
        fetcher,
        { refreshInterval: 2000 }
    );

    if (error) return <div className="text-rose-400">Failed to load real-time data</div>;

    return (
        <GlassCard className="h-full min-h-[400px]">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white">Live Activity</h3>
                    <p className="text-white/40 text-sm">Real-time biometric scans</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs text-emerald-400 font-mono">LIVE SOCKET</span>
                </div>
            </div>

            <div className="space-y-4">
                {isLoading ? (
                    <div className="animate-pulse space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-16 bg-white/5 rounded-xl" />
                        ))}
                    </div>
                ) : (
                    data?.data.map((log) => (
                        <div
                            key={log._id}
                            className="group flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-cyan-500/30 transition-all duration-300"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border ${log.status === "In"
                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                        : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                    }`}>
                                    {log.status === "In" ? "IN" : "OUT"}
                                </div>
                                <div>
                                    <h4 className="font-medium text-white group-hover:text-cyan-400 transition-colors">
                                        {log.user?.name || `ID: ${log.uid}`}
                                    </h4>
                                    <p className="text-xs text-white/40">{log.user?.department || "Unknown Dept"}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-mono text-white/80">
                                    {format(new Date(log.timestamp), "HH:mm:ss")}
                                </p>
                                <p className="text-xs text-white/30">
                                    {format(new Date(log.timestamp), "dd MMM")}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </GlassCard>
    );
}
