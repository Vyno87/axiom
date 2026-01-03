"use client";

import { useState, useMemo } from "react";
import GlassCard from "@/components/ui/GlassCard";
import NeonButton from "@/components/ui/NeonButton";
import { format } from "date-fns";
import useSWR from "swr";
import { FileDown, FileSpreadsheet, Calendar, TrendingUp } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
        "/api/attendance?limit=1000",
        fetcher
    );

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Filter by date range
    const filteredLogs = useMemo(() => {
        if (!data?.data) return [];

        let logs = data.data;

        if (startDate) {
            logs = logs.filter(log => new Date(log.timestamp) >= new Date(startDate));
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59);
            logs = logs.filter(log => new Date(log.timestamp) <= end);
        }

        return logs;
    }, [data, startDate, endDate]);

    // Calculate statistics (pivot table data)
    const stats = useMemo(() => {
        if (filteredLogs.length === 0) return null;

        const checkIns = filteredLogs.filter(log => log.status === "In").length;
        const checkOuts = filteredLogs.filter(log => log.status === "Out").length;
        const total = filteredLogs.length;

        // Group by department
        const byDepartment: Record<string, { in: number; out: number }> = {};
        filteredLogs.forEach(log => {
            const dept = log.user?.department || "Unknown";
            if (!byDepartment[dept]) {
                byDepartment[dept] = { in: 0, out: 0 };
            }
            if (log.status === "In") byDepartment[dept].in++;
            else byDepartment[dept].out++;
        });

        return {
            checkIns,
            checkOuts,
            total,
            checkInPercent: ((checkIns / total) * 100).toFixed(1),
            checkOutPercent: ((checkOuts / total) * 100).toFixed(1),
            byDepartment,
        };
    }, [filteredLogs]);

    const exportToCSV = () => {
        const headers = ["Timestamp", "Employee", "Department", "Event", "UID"];
        const rows = filteredLogs.map(log => [
            format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss"),
            log.user?.name || `UID: ${log.uid}`,
            log.user?.department || "Unknown",
            `CHECK-${log.status.toUpperCase()}`,
            log.uid.toString(),
        ]);

        const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `attendance-report-${format(new Date(), "yyyy-MM-dd")}.csv`;
        a.click();
    };

    const exportToPDF = () => {
        const doc = new jsPDF();

        // Title
        doc.setFontSize(18);
        doc.setTextColor(6, 182, 212); // Cyan
        doc.text("Axiom ID - Attendance Report", 14, 15);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated: ${format(new Date(), "MMM dd, yyyy HH:mm")}`, 14, 22);

        if (startDate || endDate) {
            doc.text(
                `Period: ${startDate || "All time"} to ${endDate || "Present"}`,
                14,
                28
            );
        }

        // Statistics Summary
        if (stats) {
            doc.setFontSize(12);
            doc.setTextColor(0);
            doc.text("Summary Statistics", 14, 38);

            const summaryData = [
                ["Total Events", stats.total.toString()],
                ["Check-Ins", `${stats.checkIns} (${stats.checkInPercent}%)`],
                ["Check-Outs", `${stats.checkOuts} (${stats.checkOutPercent}%)`],
            ];

            autoTable(doc, {
                startY: 42,
                head: [["Metric", "Value"]],
                body: summaryData,
                theme: "grid",
                headStyles: { fillColor: [6, 182, 212] },
            });
        }

        // Department Breakdown
        if (stats && Object.keys(stats.byDepartment).length > 0) {
            doc.setFontSize(12);
            doc.text("Department Breakdown", 14, (doc as any).lastAutoTable.finalY + 10);

            const deptData = Object.entries(stats.byDepartment).map(([dept, { in: ins, out }]) => [
                dept,
                ins.toString(),
                out.toString(),
                (ins + out).toString(),
            ]);

            autoTable(doc, {
                startY: (doc as any).lastAutoTable.finalY + 14,
                head: [["Department", "Check-Ins", "Check-Outs", "Total"]],
                body: deptData,
                theme: "striped",
                headStyles: { fillColor: [139, 92, 246] }, // Purple
            });
        }

        // Detailed Logs Table
        doc.addPage();
        doc.setFontSize(14);
        doc.text("Detailed Attendance Logs", 14, 15);

        const tableData = filteredLogs.slice(0, 500).map(log => [
            format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss"),
            log.user?.name || `UID: ${log.uid}`,
            log.user?.department || "Unknown",
            `CHECK-${log.status.toUpperCase()}`,
        ]);

        autoTable(doc, {
            startY: 20,
            head: [["Timestamp", "Employee", "Department", "Event"]],
            body: tableData,
            theme: "grid",
            styles: { fontSize: 8 },
            headStyles: { fillColor: [6, 182, 212] },
        });

        doc.save(`attendance-report-${format(new Date(), "yyyy-MM-dd")}.pdf`);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Attendance Logs</h1>
                    <p className="text-white/40">Complete history with analytics</p>
                </div>
                <div className="flex gap-2">
                    <NeonButton size="sm" variant="success" onClick={exportToCSV}>
                        <FileSpreadsheet className="w-4 h-4 mr-2" /> Export CSV
                    </NeonButton>
                    <NeonButton size="sm" variant="primary" onClick={exportToPDF}>
                        <FileDown className="w-4 h-4 mr-2" /> Export PDF
                    </NeonButton>
                </div>
            </div>

            {/* Statistics Summary */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <GlassCard className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-white/40">Total Events</p>
                                <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-cyan-400/40" />
                        </div>
                    </GlassCard>
                    <GlassCard className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-white/40">Check-Ins</p>
                                <p className="text-2xl font-bold text-emerald-400 mt-1">{stats.checkIns}</p>
                                <p className="text-xs text-white/40">{stats.checkInPercent}%</p>
                            </div>
                        </div>
                    </GlassCard>
                    <GlassCard className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-white/40">Check-Outs</p>
                                <p className="text-2xl font-bold text-purple-400 mt-1">{stats.checkOuts}</p>
                                <p className="text-xs text-white/40">{stats.checkOutPercent}%</p>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            )}

            {/* Date Range Filter */}
            <GlassCard className="p-4">
                <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-medium text-white/40 mb-1">
                            <Calendar className="w-3 h-3 inline mr-1" /> Start Date
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-cyan-500/50 outline-none"
                        />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-medium text-white/40 mb-1">
                            <Calendar className="w-3 h-3 inline mr-1" /> End Date
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-cyan-500/50 outline-none"
                        />
                    </div>
                    <NeonButton
                        size="sm"
                        variant="primary"
                        glow={false}
                        onClick={() => {
                            setStartDate("");
                            setEndDate("");
                        }}
                    >
                        Clear Filter
                    </NeonButton>
                </div>
            </GlassCard>

            {/* Pivot Table - Department Breakdown */}
            {stats && Object.keys(stats.byDepartment).length > 0 && (
                <GlassCard className="p-0 overflow-hidden">
                    <div className="p-4 border-b border-white/10">
                        <h3 className="font-bold text-white">Department Breakdown</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-white/5 text-white/50 text-sm">
                                <tr>
                                    <th className="px-6 py-3 text-left">Department</th>
                                    <th className="px-6 py-3 text-right">Check-Ins</th>
                                    <th className="px-6 py-3 text-right">Check-Outs</th>
                                    <th className="px-6 py-3 text-right">Total</th>
                                    <th className="px-6 py-3 text-right">% of Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {Object.entries(stats.byDepartment).map(([dept, { in: ins, out }]) => {
                                    const deptTotal = ins + out;
                                    const percent = ((deptTotal / stats.total) * 100).toFixed(1);
                                    return (
                                        <tr key={dept} className="hover:bg-white/5">
                                            <td className="px-6 py-3 text-white font-medium">{dept}</td>
                                            <td className="px-6 py-3 text-right text-emerald-400">{ins}</td>
                                            <td className="px-6 py-3 text-right text-purple-400">{out}</td>
                                            <td className="px-6 py-3 text-right text-white font-bold">{deptTotal}</td>
                                            <td className="px-6 py-3 text-right text-cyan-400">{percent}%</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>
            )}

            {/* Detailed Logs */}
            <GlassCard className="overflow-hidden p-0">
                <div className="p-4 border-b border-white/10">
                    <h3 className="font-bold text-white">Detailed Logs ({filteredLogs.length} records)</h3>
                </div>
                <div className="overflow-x-auto">
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
                            ) : filteredLogs.length === 0 ? (
                                <tr><td colSpan={4} className="p-8 text-center text-white/30">No records found for this period.</td></tr>
                            ) : (
                                filteredLogs.slice(0, 100).map((log) => (
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
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${log.status === 'In' ? 'text-emerald-400 bg-emerald-500/10' : 'text-purple-400 bg-purple-500/10'}`}>
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
                </div>
                {filteredLogs.length > 100 && (
                    <div className="p-4 bg-white/5 text-center text-white/40 text-sm">
                        Showing first 100 of {filteredLogs.length} records. Use export for full data.
                    </div>
                )}
            </GlassCard>
        </div>
    );
}
