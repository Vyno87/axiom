"use client";

import { motion } from "framer-motion";
import StatsGrid from "@/components/dashboard/StatsGrid";
import RecentLog from "@/components/dashboard/RecentLog";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import NeonButton from "@/components/ui/NeonButton";
import { Download, RefreshCw, Lock } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider"; // Import provider

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useLanguage(); // Use hook

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") return <div className="text-white/40">{t("loading")}</div>;

  if (!session) return null;

  // USER DASHBOARD (Limited View)
  if (session?.user?.role !== "admin") {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">{t("welcome")}, {session.user?.name}</h1>
        <GlassCard>
          <div className="text-center py-12">
            <Lock className="w-12 h-12 text-cyan-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white">{t("employeeAccess")}</h2>
            <p className="text-white/40 mt-2">{t("limitedAccess")}</p>
            <p className="text-white/40">{t("scanFinger")}</p>
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
            {t("dashTitle")}
          </h1>
          <p className="text-white/40 mt-1">{t("dashSubtitle")}</p>
        </motion.div>

        <div className="flex gap-3">
          <NeonButton size="sm" variant="primary" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" /> {t("dashRefresh")}
          </NeonButton>
          <NeonButton size="sm" variant="success" glow={false}>
            <Download className="w-4 h-4 mr-2" /> {t("dashReport")}
          </NeonButton>
        </div>
      </div>

      {/* Stats Row */}
      <StatsGrid />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Real Charts */}
        <div className="lg:col-span-2">
          <DashboardCharts />
        </div>

        {/* Right Column: Recent Activity */}
        <div className="lg:col-span-1">
          <RecentLog />
        </div>
      </div>
    </div>
  );
}
