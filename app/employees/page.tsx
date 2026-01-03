"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import NeonButton from "@/components/ui/NeonButton";
import TableSkeleton from "@/components/ui/TableSkeleton";
import { Plus, Search, Trash2, Edit, X, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { useLanguage } from "@/components/providers/LanguageProvider"; // Import hook

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Employee {
    _id: string;
    uid: string | number;
    name: string;
    department: string;
    isActive: boolean;
}

export default function EmployeesPage() {
    const { t } = useLanguage(); // Use hook
    const { data, error, isLoading } = useSWR("/api/employees", fetcher);
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [formData, setFormData] = useState({ uid: "", name: "", department: "" });
    const [loading, setLoading] = useState(false);

    // Filter employees
    const employees = data?.data?.filter((e: Employee) =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.department.toLowerCase().includes(search.toLowerCase()) ||
        e.uid.toString().includes(search)
    ) || [];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const method = selectedEmployee ? "PUT" : "POST";
        const body = selectedEmployee ? { ...formData, _id: selectedEmployee._id } : formData;

        try {
            const res = await fetch("/api/employees", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                mutate("/api/employees");
                toast.success(selectedEmployee ? t("success") : t("success")); // Simplified toast for now or add keys
                closeModal();
            } else {
                const data = await res.json();
                toast.error(data.error || t("error"));
            }
        } catch (err) {
            console.error(err);
            toast.error(t("error"));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedEmployee) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/employees?id=${selectedEmployee._id}`, { method: "DELETE" });
            if (!res.ok) {
                toast.error(t("error"));
                return;
            }
            mutate("/api/employees");
            toast.success(t("success"));
            setIsDeleteOpen(false);
            setSelectedEmployee(null);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (emp?: Employee) => {
        if (emp) {
            setSelectedEmployee(emp);
            setFormData({ uid: emp.uid, name: emp.name, department: emp.department });
        } else {
            setSelectedEmployee(null);
            setFormData({ uid: "", name: "", department: "" });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedEmployee(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{t("empTitle")}</h1>
                    <p className="text-white/40">{t("empSubtitle")}</p>
                </div>
                <NeonButton onClick={() => openModal()}>
                    <Plus className="w-4 h-4 mr-2" /> {t("empAdd")}
                </NeonButton>
            </div>

            <GlassCard className="p-0 overflow-hidden">
                <div className="p-4 border-b border-white/10 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                            type="text"
                            placeholder={t("empSearch")}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-white/50 text-sm font-medium">
                            <tr>
                                <th className="px-6 py-4">{t("empUID")}</th>
                                <th className="px-6 py-4">{t("empName")}</th>
                                <th className="px-6 py-4">{t("empDept")}</th>
                                <th className="px-6 py-4">{t("empStatus")}</th>
                                <th className="px-6 py-4 text-right">{t("empActions")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr><td colSpan={5} className="p-4"><TableSkeleton rows={5} /></td></tr>
                            ) : employees.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-white/40">{t("empNoData")}</td></tr>
                            ) : (
                                employees.map((emp: Employee) => (
                                    <tr key={emp._id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4 font-mono text-cyan-400">
                                            #{emp.uid.toString().padStart(3, '0')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-white">{emp.name}</div>
                                        </td>
                                        <td className="px-6 py-4 text-white/70">{emp.department}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs border ${emp.isActive
                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                                }`}>
                                                {emp.isActive ? t("empActive") : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openModal(emp)}
                                                    className="p-2 hover:bg-cyan-500/20 rounded-lg text-cyan-400 transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => { setSelectedEmployee(emp); setIsDeleteOpen(true); }}
                                                    className="p-2 hover:bg-rose-500/20 rounded-lg text-rose-400 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            {/* EDIT/ADD MODAL */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={closeModal}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-2xl"
                        >
                            <h2 className="text-xl font-bold text-white mb-4">
                                {selectedEmployee ? t("empTitle") : t("empAdd")}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-white/40 mb-1">{t("empUID")}</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.uid}
                                        onChange={e => setFormData({ ...formData, uid: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-500/50 outline-none"
                                        placeholder="e.g. 1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-white/40 mb-1">{t("empName")}</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-500/50 outline-none"
                                        placeholder="e.g. John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-white/40 mb-1">{t("empDept")}</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.department}
                                        onChange={e => setFormData({ ...formData, department: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-500/50 outline-none"
                                        placeholder="e.g. Engineering"
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex-1 py-2 rounded-xl text-white/60 hover:bg-white/5 transition-colors"
                                    >
                                        {t("empCancel")}
                                    </button>
                                    <NeonButton type="submit" className="flex-1" disabled={loading}>
                                        {loading ? t("empSaving") : t("empSave")}
                                    </NeonButton>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* DELETE CONFIRMATION */}
            <AnimatePresence>
                {isDeleteOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setIsDeleteOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-2xl text-center"
                        >
                            <div className="w-12 h-12 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="w-6 h-6 text-rose-500" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">{t("empDeleteTitle")}</h2>
                            <p className="text-white/40 mb-6">
                                {t("empDeleteDesc")}
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsDeleteOpen(false)}
                                    className="flex-1 py-2 rounded-xl text-white/60 hover:bg-white/5 transition-colors"
                                >
                                    {t("empCancel")}
                                </button>
                                <NeonButton
                                    variant="danger"
                                    className="flex-1"
                                    onClick={handleDelete}
                                    disabled={loading}
                                >
                                    {loading ? t("loading") : t("empConfirmDelete")}
                                </NeonButton>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
