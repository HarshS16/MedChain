"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  FileText,
  Brain,
  Shield,
  Activity,
  Plus,
  Search,
  ArrowUpRight,
  TrendingUp,
  Zap,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

export default function DoctorDashboard() {
  const [user, setUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("medchain_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  return (
    <div className="-m-6 p-8 min-h-[calc(100vh-80px)] bg-[#F8FAFC] text-slate-800 rounded-tl-[2.5rem] font-sans relative overflow-hidden">
      {/* ---- Dynamic Ambient Meshes ---- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="absolute -top-40 -left-40 w-[30rem] h-[30rem] bg-indigo-400/30 rounded-full blur-[100px] mix-blend-multiply animate-pulse"
          style={{ animationDuration: "8s" }}
        />
        <div
          className="absolute top-20 -right-40 w-[30rem] h-[30rem] bg-teal-400/30 rounded-full blur-[100px] mix-blend-multiply animate-pulse"
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
                Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 17 ? "Afternoon" : "Evening"}, Dr. {user?.name?.split(" ")[0] || "Doctor"} 👋
              </h2>
              <p className="text-slate-600 mb-8 text-[16px] leading-relaxed font-medium">
                Your MedChain dashboard is ready. Search for patients, create records, or securely query medical histories with AI.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/doctor/patient/search"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all text-[14px] font-bold shadow-lg shadow-indigo-600/20 hover:-translate-y-0.5"
                >
                  <Search className="w-4 h-4" /> Search Patients
                </Link>
                <Link
                  href="/doctor/new-record"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all text-[14px] font-bold shadow-sm hover:-translate-y-0.5"
                >
                  <Plus className="w-4 h-4" /> New Record
                </Link>
              </div>
            </div>
            
            {/* Minimalist status indicator */}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {[
            {
              label: "Active Patients",
              value: "0",
              icon: Users,
              color: "from-[#4F46E5] to-[#7C3AED]",
              glow: "shadow-indigo-500/30",
            },
            {
              label: "Records Created",
              value: "0",
              icon: FileText,
              color: "from-[#10B981] to-[#059669]",
              glow: "shadow-emerald-500/30",
            },
            {
              label: "AI Queries",
              value: "0",
              icon: Brain,
              color: "from-[#F59E0B] to-[#EF4444]",
              glow: "shadow-orange-500/30",
            },
            {
              label: "Access Grants",
              value: "0",
              icon: Shield,
              color: "from-[#8B5CF6] to-[#D946EF]",
              glow: "shadow-purple-500/30",
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
                  className={`w-14 h-14 rounded-[1.25rem] bg-gradient-to-br ${stat.color} p-[1px] ${stat.glow} shadow-xl group-hover:scale-110 transition-transform duration-500`}
                >
                  <div className="w-full h-full rounded-[1.2rem] bg-gradient-to-br from-white/20 to-transparent flex items-center justify-center backdrop-blur-md">
                    <stat.icon className="w-6 h-6 text-white drop-shadow-md" />
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 text-emerald-500 shadow-sm">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <p className="text-[14px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                {stat.label}
              </p>
              <p className="text-4xl font-black tracking-tighter text-slate-800 drop-shadow-sm relative z-10">
                {stat.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* ---- Bottom Row: Recent Patients & Quick Actions ---- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Recent Patients (Premium White Card) */}
          <motion.div variants={fadeInUp as any} custom={3} className="h-full">
            <div className="h-full rounded-[2.5rem] border border-slate-100 bg-white/60 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 lg:p-10 flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                    Recent Patients
                  </h3>
                  <p className="text-[15px] text-slate-500 mt-1 font-medium">
                    Your recently accessed medical profiles
                  </p>
                </div>
                <Link
                  href="/doctor/patient/search"
                  className="px-5 py-2.5 rounded-2xl bg-slate-800 text-white hover:bg-indigo-600 text-[13px] font-bold uppercase tracking-wider flex items-center gap-2 transition-colors shadow-lg shadow-slate-200"
                >
                  View All
                </Link>
              </div>
              
              <div className="flex-1 space-y-3">
                {[
                  { id: "PAT-a3f9e2b1-4c67", name: "Rajesh Kumar", abhaId: "12-3456-7890-1234", lastVisit: "2 hours ago", status: "Follow-up", color: "text-indigo-600" },
                  { id: "PAT-b7e2d1a3-9f88", name: "Suman Singh", abhaId: "99-1234-5678-0000", lastVisit: "Yesterday", status: "New Case", color: "text-emerald-600" },
                ].map((patient) => (
                  <Link
                    key={patient.id}
                    href={`/doctor/patient/${patient.id}`}
                    className="group flex flex-wrap items-center justify-between p-4 rounded-[1.5rem] border border-slate-100 bg-white hover:bg-slate-50 hover:border-indigo-200 transition-all shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-[1rem] bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-lg ${patient.color}`}>
                        {patient.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{patient.name}</h4>
                        <p className="text-xs text-slate-500 font-medium">ABHA: {patient.abhaId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-slate-400 font-medium mb-1">{patient.lastVisit}</p>
                        <span className="text-[10px] px-2 py-1 rounded-full bg-slate-100 text-slate-500 font-bold uppercase tracking-wider">{patient.status}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Quick Actions (Vibrant Interactive Cards) */}
          <div className="space-y-6 lg:space-y-8">
            <Link href="/doctor/new-record" className="block">
              <motion.div
                variants={fadeInUp as any}
                custom={4}
                className="p-8 lg:p-10 rounded-[2.5rem] border border-slate-100 bg-white/60 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-2xl hover:shadow-emerald-500/10 hover:border-emerald-200 transition-all duration-500 group relative overflow-hidden"
              >
                <div className="absolute -right-8 -top-8 w-48 h-48 bg-gradient-to-bl from-emerald-100 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="flex items-start justify-between relative z-10">
                  <div className="pr-12">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 p-[1px] shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-500">
                        <div className="w-full h-full bg-white/40 backdrop-blur rounded-[15px] flex justify-center items-center">
                          <Plus className="w-7 h-7 text-white" />
                        </div>
                      </div>
                      <h4 className="font-black text-slate-800 text-2xl tracking-tight">
                        New Record
                      </h4>
                    </div>
                    <p className="text-[15px] text-slate-500 leading-relaxed font-medium">
                      Create a secure, encrypted medical record entry for an active patient.
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all shrink-0 shadow-sm border border-emerald-100 group-hover:border-emerald-500">
                    <ArrowUpRight className="w-6 h-6 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              </motion.div>
            </Link>

            <Link href="/doctor/patient/search" className="block">
              <motion.div
                variants={fadeInUp as any}
                custom={5}
                className="p-8 lg:p-10 rounded-[2.5rem] border border-slate-100 bg-white/60 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-200 transition-all duration-500 group relative overflow-hidden"
              >
                <div className="absolute -right-8 -top-8 w-48 h-48 bg-gradient-to-bl from-indigo-100 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="flex items-start justify-between relative z-10">
                  <div className="pr-12">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-[1px] shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-500">
                        <div className="w-full h-full bg-white/40 backdrop-blur rounded-[15px] flex justify-center items-center">
                          <Search className="w-7 h-7 text-white" />
                        </div>
                      </div>
                      <h4 className="font-black text-slate-800 text-2xl tracking-tight">
                        Search Patient
                      </h4>
                    </div>
                    <p className="text-[15px] text-slate-500 leading-relaxed font-medium">
                      Find a patient by their ABHA ID, name, or phone number in the secure registry.
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0 shadow-sm border border-indigo-100 group-hover:border-indigo-600">
                    <ArrowUpRight className="w-6 h-6 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              </motion.div>
            </Link>
          </div>
        </div>

        {/* ---- System Status ---- */}
        <motion.div variants={fadeInUp as any} custom={6}>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 p-5 rounded-[2rem] border border-slate-100 bg-white/60 backdrop-blur-xl shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Blockchain: Online</span>
            </div>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">IPFS: Connected</span>
            </div>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">AI Service: Pending</span>
            </div>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <Zap className="w-3 h-3 text-indigo-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">E2E Encryption: Active</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
