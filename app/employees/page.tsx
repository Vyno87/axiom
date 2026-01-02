"use client";

import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import NeonButton from "@/components/ui/NeonButton";
import { Plus, Search, Trash2, Edit } from "lucide-react";

export default function EmployeesPage() {
    const employees = [
        { id: 1, name: "Budi Santoso", dept: "Engineering", role: "Senior Dev", status: "Active" },
        { id: 2, name: "Siti Aminah", dept: "HR", role: "Manager", status: "Active" },
        { id: 3, name: "Agus Pratama", dept: "Marketing", role: "Specialist", status: "Offline" },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Employee Directory</h1>
                    <p className="text-white/40">Manage personnel and biometric data</p>
                </div>
                <NeonButton>
                    <Plus className="w-4 h-4 mr-2" /> Add Employee
                </NeonButton>
            </div>

            <GlassCard className="p-0 overflow-hidden">
                <div className="p-4 border-b border-white/10 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                            type="text"
                            placeholder="Search employees..."
                            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                        />
                    </div>
                </div>

                <table className="w-full text-left">
                    <thead className="bg-white/5 text-white/50 text-sm font-medium">
                        <tr>
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Department</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {employees.map((emp) => (
                            <tr key={emp.id} className="hover:bg-white/5 transition-colors group">
                                <td className="px-6 py-4 font-mono text-cyan-400">#{emp.id.toString().padStart(3, '0')}</td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-white">{emp.name}</div>
                                    <div className="text-xs text-white/40">{emp.role}</div>
                                </td>
                                <td className="px-6 py-4 text-white/70">{emp.dept}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs border ${emp.status === 'Active'
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                            : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                        }`}>
                                        {emp.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 hover:bg-cyan-500/20 rounded-lg text-cyan-400 transition-colors">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 hover:bg-rose-500/20 rounded-lg text-rose-400 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </GlassCard>
        </div>
    );
}
