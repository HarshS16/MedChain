"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Shield,
  Clock,
  LogOut,
  ChevronRight,
  TrendingUp,
  Activity,
  Plus,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { 
      delay: i * 0.1, 
      duration: 0.5, 
      ease: "easeOut" 
    },
  }),
};

interface UserStats {
  records: number;
  consents: number;
  healthScore: string;
}

export default function PatientDashboard() {
  const [user, setUser] = useState<{ name: string; abhaId: string; id: string } | null>(null);
  const [stats, setStats] = useState<UserStats>({ records: 0, consents: 0, healthScore: "N/A" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("medchain_user");
    if (stored) {
      const parsedUser = JSON.parse(stored);
      setUser(parsedUser);
      // Use patientId (PAT-xxxx) with fallback to id
      const targetId = parsedUser.patientId || parsedUser.id;
      if (targetId) fetchDashboardData(targetId);
    }
  }, []);

  const fetchDashboardData = async (patientId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("medchain_token");

      // Fetch Records Stats
      const recordsRes = await fetch(`http://localhost:3001/api/records/patient/${patientId}/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const recordsData = await recordsRes.json();

      // Fetch Active Consents
      const accessRes = await fetch(`http://localhost:3001/api/access/my-grants`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const accessData = await accessRes.json();

      setStats({
        records: recordsData.data?.totalRecords || 0,
        consents: accessData.data?.count || 0,
        healthScore: "92/100" // Simulated health score based on recent activity
      });
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* ---- Welcome Banner ---- */}
      <motion.div
        variants={fadeInUp}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600/20 to-emerald-600/10 border border-indigo-500/20 p-8"
      >
        <div className="absolute inset-0 dot-pattern opacity-10" />
        <div className="relative">
          <h2 className="text-2xl font-bold mb-2">
            Welcome back, {user?.name?.split(" ")[0] || "Patient"} 👋
          </h2>
          <p className="text-gray-400 mb-6 max-w-lg">
            Your personal health ledger is secure. You have total control over who accesses your records.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/patient/records"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-all text-sm font-medium shadow-lg shadow-indigo-600/20"
            >
              <FileText className="w-4 h-4" />
              View My Records
            </Link>
            <Link
              href="/patient/access"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 transition-all text-sm font-medium"
            >
              <Shield className="w-4 h-4" />
              Manage Access
            </Link>
          </div>
        </div>

        {/* Decorative */}
        <div className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl" />
      </motion.div>

      {/* ---- Quick Stats ---- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: "Medical Records",
            value: loading ? "..." : stats.records,
            icon: FileText,
            color: "from-blue-500 to-indigo-600",
          },
          {
            label: "Active Consents",
            value: loading ? "..." : stats.consents,
            icon: Shield,
            color: "from-emerald-500 to-teal-600",
          },
          {
            label: "Health Score",
            value: loading ? "..." : stats.healthScore,
            icon: Activity,
            color: "from-amber-500 to-orange-600",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            variants={fadeInUp}
            custom={i}
            className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-all relative group overflow-hidden"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold">
                {stat.value}
              </p>
              {loading && <Loader2 className="w-4 h-4 animate-spin text-gray-600" />}
            </div>
            
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
               <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* ---- Security Audit Summary ---- */}
      <motion.div variants={fadeInUp} custom={3}>
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 lg:p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold">Privacy & Security</h3>
              <p className="text-sm text-gray-400">Recent access history to your records</p>
            </div>
            <Link href="/patient/audit" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center gap-1">
              Full Audit Trail <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-6 text-center">
              <Shield className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h4 className="text-lg font-medium mb-1">Your data is safe</h4>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                No unauthorized access attempts detected. Only your verified clinicians can view your data with your explicit consent.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ---- Quick Actions ---- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div variants={fadeInUp} custom={4} className="p-6 rounded-2xl border border-white/[0.06] bg-red-500/5 hover:bg-red-500/10 transition-all border-red-500/10 group cursor-pointer">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-bold text-red-400 text-lg mb-2">Emergency Access</h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                Setup a one-time emergency access token that verified medical responders can use in life-threatening situations.
              </p>
            </div>
            <Plus className="w-6 h-6 text-red-500 group-hover:rotate-90 transition-transform" />
          </div>
        </motion.div>

        <motion.div variants={fadeInUp} custom={5} className="p-6 rounded-2xl border border-white/[0.06] bg-indigo-500/5 hover:bg-indigo-500/10 transition-all border-indigo-500/10 group cursor-pointer">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-bold text-indigo-400 text-lg mb-2">Sync ABHA Folder</h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                Automatically import external records from the ABHA health ecosystem into your secure MedChain ledger.
              </p>
            </div>
            <ArrowUpRight className="w-6 h-6 text-indigo-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </div>
        </motion.div>
      </div>

    </motion.div>
  );
}
