"use client";

import GlassCard from "@/components/ui/GlassCard";
import { format } from "date-fns";
import useSWR from "swr";

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

export default function HistoryPage() {
    const { data, isLoading } = useSWR<{ data: AttendanceLog[] }>(
        "/api/attendance?limit=50",
        fetcher
    );

    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Attendance Logs</h1>
                <p className="text-white/40">Complete history of all biometric scans</p>
            </div>

            <GlassCard className="overflow-hidden p-0">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-white/50 text-sm font-medium">
                        <tr>
                            <th className="px-6 py-4">Time</th>
                            <th className="px-6 py-4">Employee</th>
                            <th className="px-6 py-4">Event</th>
                            <th className="px-6 py-4">Device</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {isLoading ? (
                            <tr><td colSpan={4} className="p-8 text-center text-white/30">Loading history...</td></tr>
                        ) : (
                            data?.data.map((log) => (
                                <tr key={log._id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="text-white font-mono">{format(new Date(log.timestamp), "HH:mm:ss")}</div>
                                        <div className="text-xs text-white/40">{format(new Date(log.timestamp), "MMM dd, yyyy")}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-white">{log.user?.name || `UID: ${log.uid}`}</div>
                                        <div className="text-xs text-white/40">{log.user?.department || "Unknown"}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${log.status === 'In' ? 'text-emerald-400 bg-emerald-500/10' : 'text-purple-400 bg-purple-500/10'
                                            }`}>
                                            CHECK-{log.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-white/30 text-sm">
                                        ESP32-S3 (Main)
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </GlassCard>
        </div>
    );
}
