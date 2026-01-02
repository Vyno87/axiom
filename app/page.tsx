"use client";

import { motion } from "framer-motion";
import StatsGrid from "@/components/dashboard/StatsGrid";
import RecentLog from "@/components/dashboard/RecentLog";
import NeonButton from "@/components/ui/NeonButton";
import { Download, RefreshCw, Lock } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") return <div className="text-white/40">Loading Command Center...</div>;

  if (!session) return null;

  // USER DASHBOARD (Limited View)
  if ((session?.user as any)?.role !== "admin") {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Welcome, {session.user?.name}</h1>
        <GlassCard>
          <div className="text-center py-12">
            <Lock className="w-12 h-12 text-cyan-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white">Employee Access</h2>
            <p className="text-white/40 mt-2">You have limited access to this system.</p>
            <p className="text-white/40">Please scan your finger at the terminal to record attendance.</p>
          </div>
        </GlassCard>
      </div>
    );
  }

  // ADMIN DASHBOARD (Full View)
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            Command Center
          </h1>
          <p className="text-white/40 mt-1">Overview of today's biometric activity</p>
        </motion.div>

        <div className="flex gap-3">
          <NeonButton size="sm" variant="primary" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </NeonButton>
          <NeonButton size="sm" variant="success" glow={false}>
            <Download className="w-4 h-4 mr-2" /> Report
          </NeonButton>
        </div>
      </div>

      {/* Stats Row */}
      <StatsGrid />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Charts (Placeholder for now) */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="h-[400px] flex items-center justify-center border-dashed border-white/10 bg-white/5">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-cyan-500/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <span className="text-cyan-400 text-3xl font-bold">Analytics</span>
              </div>
              <p className="text-white/60">Weekly Attendance Chart</p>
              <p className="text-white/30 text-sm">(Coming in next update)</p>
            </div>
          </GlassCard>

          <div className="grid grid-cols-2 gap-6">
            <GlassCard className="h-40 bg-gradient-to-br from-purple-900/20 to-black border-purple-500/20">
              <h3 className="text-purple-300 font-bold mb-2">Late Arrivals</h3>
              <p className="text-4xl font-bold text-white">4%</p>
              <div className="w-full bg-white/10 h-1 mt-4 rounded-full overflow-hidden">
                <div className="bg-purple-500 w-[4%] h-full" />
              </div>
            </GlassCard>
            <GlassCard className="h-40 bg-gradient-to-br from-cyan-900/20 to-black border-cyan-500/20">
              <h3 className="text-cyan-300 font-bold mb-2">Device Status</h3>
              <p className="text-lg text-white">ESP32-S3 (Main)</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-emerald-400 text-sm">Signal Strong</span>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Right Column: Recent Activity */}
        <div className="lg:col-span-1">
          <RecentLog />
        </div>
      </div>
    </div>
  );
}
