"use client";

import GlassCard from "@/components/ui/GlassCard";
import useSWR from "swr";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardCharts() {
    const { data, isLoading } = useSWR("/api/stats", fetcher);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GlassCard className="h-[300px] flex items-center justify-center">
                    <p className="text-white/40">Loading charts...</p>
                </GlassCard>
                <GlassCard className="h-[300px] flex items-center justify-center">
                    <p className="text-white/40">Loading data...</p>
                </GlassCard>
            </div>
        );
    }

    const weeklyData = data?.data?.weeklyTrend || [];
    const statusData = [
        { name: "Check-Ins", value: data?.data?.statusDistribution?.checkIns || 0, color: "#10b981" },
        { name: "Check-Outs", value: data?.data?.statusDistribution?.checkOuts || 0, color: "#a855f7" },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weekly Trend Chart */}
            <GlassCard className="p-6">
                <h3 className="text-lg font-bold text-white mb-4">Weekly Activity</h3>
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={weeklyData}>
                        <XAxis
                            dataKey="day"
                            stroke="#ffffff40"
                            style={{ fontSize: '12px' }}
                        />
                        <YAxis stroke="#ffffff40" style={{ fontSize: '12px' }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#0a0a0a',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                color: '#fff'
                            }}
                        />
                        <Bar dataKey="checkIns" fill="#06b6d4" name="Check-Ins" />
                        <Bar dataKey="checkOuts" fill="#a855f7" name="Check-Outs" />
                    </BarChart>
                </ResponsiveContainer>
            </GlassCard>

            {/* Status Distribution Pie */}
            <GlassCard className="p-6">
                <h3 className="text-lg font-bold text-white mb-4">Event Distribution</h3>
                <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                        <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                            {statusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#0a0a0a',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                color: '#fff'
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-4">
                    {statusData.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-xs text-white/60">{item.name}</span>
                        </div>
                    ))}
                </div>
            </GlassCard>
        </div>
    );
}
