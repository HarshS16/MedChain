"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Shield,
  Activity,
  TrendingUp,
  Plus,
  ArrowUpRight,
  Loader2,
  AlertTriangle,
  X,
  Droplet,
  Stethoscope,
  FilePlus,
} from "lucide-react";
import Link from "next/link";
import QRCode from "react-qr-code";
import UploadModal from "@/components/UploadModal";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

interface UserStats {
  records: number;
  consents: number;
  healthScore: string;
}

export default function PatientDashboard() {
  const [user, setUser] = useState<{
    name: string;
    abhaId: string;
    id: string;
    patientId?: string;
  } | null>(null);
  const [stats, setStats] = useState<UserStats>({
    records: 0,
    consents: 0,
    healthScore: "68/100",
  });
  const [loading, setLoading] = useState(true);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("medchain_user");
    if (stored) {
      const parsedUser = JSON.parse(stored);
      setUser(parsedUser);
      const targetId = parsedUser.patientId || parsedUser.id;
      if (targetId) fetchDashboardData(targetId);
    }
  }, []);

  const fetchDashboardData = async (patientId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("medchain_token");

      const recordsRes = await fetch(
        `http://localhost:3001/api/records/patient/${patientId}/stats`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const recordsData = await recordsRes.json();

      const accessRes = await fetch(
        `http://localhost:3001/api/access/my-grants`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const accessData = await accessRes.json();

      setStats({
        records: recordsData.data?.totalRecords || 0,
        consents: accessData.data?.count || 0,
        healthScore: "92/100", // Simulated score
      });
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="-m-6 p-8 min-h-[calc(100vh-80px)] bg-[#F8FAFC] text-slate-800 rounded-tl-[2.5rem] font-sans relative overflow-hidden">
      {/* ---- Dynamic Ambient Meshes ---- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="absolute -top-40 -left-40 w-[30rem] h-[30rem] bg-indigo-400/30 rounded-full blur-[100px] mix-blend-multiply animate-pulse"
          style={{ animationDuration: "8s" }}
        />
        <div
          className="absolute top-20 -right-40 w-[30rem] h-[30rem] bg-purple-400/30 rounded-full blur-[100px] mix-blend-multiply animate-pulse"
          style={{ animationDuration: "10s" }}
        />
        <div
          className="absolute -bottom-40 left-1/2 w-[30rem] h-[30rem] bg-emerald-300/30 rounded-full blur-[100px] mix-blend-multiply animate-pulse"
          style={{ animationDuration: "12s" }}
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        className="relative z-10 space-y-10 max-w-7xl mx-auto"
      >
        {/* ---- Welcome Banner ---- */}
        <motion.div
          variants={fadeInUp as any}
          className="relative overflow-hidden rounded-[2.5rem] bg-indigo-50/50 border border-indigo-100 p-10 lg:p-12"
        >
          {/* Subtle grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#818cf81a_1px,transparent_1px),linear-gradient(to_bottom,#818cf81a_1px,transparent_1px)] bg-[size:24px_24px] opacity-60"></div>
          <div className="absolute -right-10 -top-10 w-64 h-64 bg-indigo-400/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8 md:gap-4">
            <div className="max-w-xl">
              <h2 className="text-4xl font-extrabold mb-3 text-slate-800 tracking-tight">
                Welcome back, {user?.name?.split(" ")[0] || "Patient"}
              </h2>
              <p className="text-slate-600 mb-8 text-[16px] leading-relaxed font-medium">
                Your decentralized health ledger is active. You hold the cryptographic keys and have total control over who accesses your history.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/patient/records"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all text-[14px] font-bold shadow-lg shadow-indigo-600/20 hover:-translate-y-0.5"
                >
                  <FileText className="w-4 h-4" /> View My Records
                </Link>
                <Link
                  href="/patient/access"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all text-[14px] font-bold shadow-sm hover:-translate-y-0.5"
                >
                  <Shield className="w-4 h-4" /> Manage Access
                </Link>
              </div>
            </div>
            
            {/* Minimalist health status indicator */}
            <div className="md:shrink-0 flex items-center justify-center hidden sm:flex">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-[spin_3s_linear_infinite]"></div>
                <div className="absolute inset-2 rounded-full border-4 border-indigo-50 border-b-indigo-400 animate-[spin_4s_linear_infinite_reverse]"></div>
                <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center relative z-10 border border-slate-50">
                  <Activity className="w-7 h-7 text-indigo-600" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ---- Quick Stats (Glassmorphic) ---- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {[
            {
              label: "Medical Records",
              value: loading ? "..." : stats.records,
              icon: FileText,
              color: "from-[#4F46E5] to-[#7C3AED]",
              glow: "shadow-indigo-500/30",
            },
            {
              label: "Active Consents",
              value: loading ? "..." : stats.consents,
              icon: Shield,
              color: "from-[#8B5CF6] to-[#D946EF]",
              glow: "shadow-purple-500/30",
            },
            {
              label: "Health Score",
              value: loading ? "..." : stats.healthScore,
              icon: Activity,
              color: "from-[#F59E0B] to-[#EF4444]",
              glow: "shadow-orange-500/30",
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={fadeInUp as any}
              custom={i}
              className="p-8 rounded-[2.5rem] bg-white/60 backdrop-blur-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500 relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 pointer-events-none" />
              <div className="relative z-10 flex items-center justify-between mb-6">
                <div
                  className={`w-16 h-16 rounded-[1.25rem] bg-gradient-to-br ${stat.color} p-[1px] ${stat.glow} shadow-xl group-hover:scale-110 transition-transform duration-500`}
                >
                  <div className="w-full h-full rounded-[1.2rem] bg-gradient-to-br from-white/20 to-transparent flex items-center justify-center backdrop-blur-md">
                    <stat.icon className="w-7 h-7 text-white drop-shadow-md" />
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 text-emerald-500 shadow-sm">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <p className="text-[16px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                {stat.label}
              </p>
              <div className="flex items-baseline gap-3 relative z-10">
                <p className="text-5xl font-black tracking-tighter text-slate-800 drop-shadow-sm">
                  {stat.value}
                </p>
                {loading && (
                  <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* ---- Bottom Row: Security & Quick Actions ---- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Privacy & Security (Premium White Card) */}
          <motion.div variants={fadeInUp as any} custom={3} className="h-full">
            <div className="h-full rounded-[2.5rem] border border-slate-100 bg-white/60 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 lg:p-10 flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                    Privacy & Security
                  </h3>
                  <p className="text-[15px] text-slate-500 mt-1 font-medium">
                    Recent access history & integrity
                  </p>
                </div>
                <Link
                  href="/patient/audit"
                  className="px-5 py-2.5 rounded-2xl bg-slate-800 text-white hover:bg-indigo-600 text-[13px] font-bold uppercase tracking-wider flex items-center gap-2 transition-colors shadow-lg shadow-slate-200"
                >
                  Audit Trail
                </Link>
              </div>
              <div className="flex-1 rounded-[1.5rem] bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-100 p-8 text-center flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/20 rounded-full blur-[50px] mix-blend-multiply" />
                <div className="w-20 h-20 rounded-[1.5rem] bg-white border-2 border-emerald-100 flex items-center justify-center mb-6 relative z-10 shadow-xl shadow-emerald-500/10 group-hover:-translate-y-2 transition-transform duration-500">
                  <Shield className="w-10 h-10 text-emerald-500" />
                </div>
                <h4 className="text-2xl font-black text-emerald-950 mb-3 relative z-10 tracking-tight">
                  Your data is verified & safe
                </h4>
                <p className="text-[15px] text-emerald-800/70 max-w-sm mx-auto relative z-10 leading-relaxed font-medium">
                  Zero unauthorized access attempts detected. Your cryptographic
                  ledger confirms 100% data integrity.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions (Vibrant Interactive Cards) */}
          <div className="space-y-6 lg:space-y-8">
            <motion.div
              variants={fadeInUp as any}
              custom={4}
              onClick={() => setShowEmergencyModal(true)}
              className="p-8 lg:p-10 rounded-[2.5rem] border border-slate-100 bg-white/60 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-2xl hover:shadow-red-500/10 hover:border-red-200 transition-all duration-500 group cursor-pointer relative overflow-hidden"
            >
              <div className="absolute -right-8 -top-8 w-48 h-48 bg-gradient-to-bl from-red-100 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="flex items-start justify-between relative z-10">
                <div className="pr-12">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 p-[1px] shadow-lg shadow-red-500/20 group-hover:scale-110 transition-transform duration-500">
                      <div className="w-full h-full bg-white/40 backdrop-blur rounded-[15px] flex justify-center items-center">
                        <Plus className="w-7 h-7 text-white" />
                      </div>
                    </div>
                    <h4 className="font-black text-slate-800 text-2xl tracking-tight">
                      Emergency Access
                    </h4>
                  </div>
                  <p className="text-[15px] text-slate-500 leading-relaxed font-medium">
                    Generate a one-time emergency cryptographic token for
                    verified first responders.
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all shrink-0 shadow-sm border border-red-100 group-hover:border-red-500">
                  <ArrowUpRight className="w-6 h-6 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={fadeInUp as any}
              custom={5}
              onClick={() => {
                window.open("https://phr.abdm.gov.in/register", "_blank");
              }}
              className="p-8 lg:p-10 rounded-[2.5rem] border border-slate-100 bg-white/60 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-200 transition-all duration-500 group cursor-pointer relative overflow-hidden"
            >
              <div className="absolute -right-8 -top-8 w-48 h-48 bg-gradient-to-bl from-indigo-100 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="flex items-start justify-between relative z-10">
                <div className="pr-12">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-[1px] shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-500">
                      <div className="w-full h-full bg-white/40 backdrop-blur rounded-[15px] flex justify-center items-center">
                        <Activity className="w-7 h-7 text-white" />
                      </div>
                    </div>
                    <h4 className="font-black text-slate-800 text-2xl tracking-tight">
                      Sync ABHA
                    </h4>
                  </div>
                  <p className="text-[15px] text-slate-500 leading-relaxed font-medium">
                    Link external public health records into your private
                    MedChain encrypted ledger.
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0 shadow-sm border border-indigo-100 group-hover:border-indigo-600">
                  <ArrowUpRight className="w-6 h-6 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Emergency Modal */}
      <AnimatePresence>
        {showEmergencyModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEmergencyModal(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl z-50 overflow-hidden flex flex-col border border-red-100 max-h-[90vh]"
            >
              <div className="bg-gradient-to-br from-red-500 to-rose-600 p-6 sm:p-8 flex items-start justify-between relative shrink-0">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                <div className="relative z-10 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-6 h-6" />
                    <h3 className="text-2xl font-black tracking-tight">Emergency Access</h3>
                  </div>
                  <p className="text-red-100 font-medium text-[15px] max-w-xs">
                    Show this QR code to first responders for instant one-time access to your history.
                  </p>
                </div>
                <button
                  onClick={() => setShowEmergencyModal(false)}
                  className="relative z-10 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white backdrop-blur transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 sm:p-8 overflow-y-auto w-full border-t border-red-200">
                <div className="flex flex-col items-center justify-center mb-8">
                  <div className="p-4 bg-white rounded-2xl shadow-xl shadow-red-500/10 border-2 border-red-100 mb-4 inline-block">
                    <QRCode
                      value={`medchain://emergency/${user?.patientId || user?.id}`}
                      size={180}
                      level="H"
                      className="rounded-lg"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Emergency Token ID</p>
                    <p className="text-lg font-black text-slate-800 tracking-tight font-mono bg-slate-50 border border-slate-200 px-4 py-1.5 rounded-xl shadow-sm">
                      ET-{Math.floor(Math.random()*9000)+1000}-{Math.floor(Math.random()*9000)+1000}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wide text-[13px] border-b border-slate-100 pb-2">Critical Medical Target Data</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 flex flex-col justify-center">
                      <div className="flex items-center gap-2 text-rose-600 mb-1">
                        <Droplet className="w-4 h-4" />
                        <span className="text-[11px] font-bold uppercase tracking-wider">Blood Type</span>
                      </div>
                      <p className="text-3xl font-black text-rose-700 tracking-tighter">O+</p>
                    </div>

                    <div className="p-4 rounded-[1.25rem] bg-amber-50 border border-amber-100 flex flex-col justify-center">
                      <div className="flex items-center gap-2 text-amber-600 mb-1">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-[11px] font-bold uppercase tracking-wider">Allergies</span>
                      </div>
                      <p className="text-[15px] font-bold text-amber-900 leading-snug">Penicillin<br/>Peanuts</p>
                    </div>

                    <div className="p-4 rounded-[1.25rem] bg-emerald-50 border border-emerald-100 col-span-2">
                       <div className="flex items-center gap-2 text-emerald-600 mb-1">
                        <Stethoscope className="w-4 h-4" />
                        <span className="text-[11px] font-bold uppercase tracking-wider">Pre-existing Conditions</span>
                      </div>
                      <p className="text-[15px] font-bold text-emerald-900">Hypertension, Pre-Diabetic</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ---- Floating Upload Action ---- */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1, x: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowUploadModal(true)}
        className="fixed bottom-10 left-[300px] z-[60] flex items-center gap-3 px-6 py-4 bg-indigo-600 text-white rounded-[1.8rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-400 group transition-all hover:bg-indigo-700 active:shadow-indigo-600"
      >
        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center group-hover:rotate-12 transition-transform">
          <FilePlus className="w-5 h-5 text-white" />
        </div>
        <span className="max-w-0 overflow-hidden group-hover:max-w-[150px] transition-all duration-500 whitespace-nowrap">
          Upload Record
        </span>
      </motion.button>

      {/* ---- Upload Modal ---- */}
      {user && (
        <UploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          patientId={user.patientId || user.id}
        />
      )}
    </div>
  );
}
