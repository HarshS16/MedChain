"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  FileText,
  Activity,
  Brain,
  Plus,
  Clock,
  TrendingUp,
  ChevronRight,
  Stethoscope,
  Clipboard,
  Search,
  ArrowUpRight,
  Shield,
  Zap,
} from "lucide-react";
import Link from "next/link";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

const statsData = [
  {
    label: "Active Patients",
    value: "0",
    change: "+0 this week",
    icon: Users,
    color: "from-indigo-500 to-violet-600",
    bgAccent: "bg-indigo-500/10",
    textAccent: "text-indigo-400",
  },
  {
    label: "Records Created",
    value: "0",
    change: "+0 today",
    icon: FileText,
    color: "from-teal-500 to-emerald-600",
    bgAccent: "bg-teal-500/10",
    textAccent: "text-teal-400",
  },
  {
    label: "AI Queries",
    value: "0",
    change: "Ready to use",
    icon: Brain,
    color: "from-amber-500 to-orange-600",
    bgAccent: "bg-amber-500/10",
    textAccent: "text-amber-400",
  },
  {
    label: "Access Grants",
    value: "0",
    change: "Secure",
    icon: Shield,
    color: "from-pink-500 to-rose-600",
    bgAccent: "bg-pink-500/10",
    textAccent: "text-pink-400",
  },
];

const quickActions = [
  {
    label: "Search Patient",
    desc: "Find by ABHA ID, name, or phone",
    icon: Search,
    href: "/doctor/patient/search",
    color: "from-indigo-500 to-purple-600",
  },
  {
    label: "New Record",
    desc: "Create a medical record entry",
    icon: Plus,
    href: "/doctor/new-record",
    color: "from-teal-500 to-emerald-600",
  },
  {
    label: "AI Assistant",
    desc: "Query patient history with AI",
    icon: Brain,
    href: "#",
    color: "from-amber-500 to-orange-600",
  },
];

export default function DoctorDashboard() {
  const [user, setUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("medchain_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* ---- Welcome Banner ---- */}
      <motion.div
        variants={fadeInUp as any}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600/20 to-teal-600/10 border border-indigo-500/20 p-8"
      >
        <div className="absolute inset-0 dot-pattern opacity-10" />
        <div className="relative">
          <h2 className="text-2xl font-bold mb-2">
            Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 17 ? "Afternoon" : "Evening"}, Dr. {user?.name?.split(" ")[0] || "Doctor"} 👋
          </h2>
          <p className="text-gray-400 mb-6 max-w-lg">
            Your MedChain dashboard is ready. Search for patients, create records, or query medical histories with AI.
          </p>
          <Link
            href="/doctor/patient/search"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 transition-all text-sm font-medium"
          >
            <Search className="w-4 h-4" />
            Search Patients
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Decorative */}
        <div className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl" />
      </motion.div>

      {/* ---- Stats Grid ---- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, i) => (
          <motion.div
            key={stat.label}
            variants={fadeInUp as any}
            custom={i}
            className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all group cursor-default"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <span className={`text-xs ${stat.textAccent} ${stat.bgAccent} px-2 py-1 rounded-lg`}>
                {stat.change}
              </span>
            </div>
            <p className="text-3xl font-bold mb-1">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* ---- Quick Actions ---- */}
      <motion.div variants={fadeInUp as any} custom={5}>
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, i) => (
            <Link
              key={action.label}
              href={action.href}
              className="group p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-indigo-500/30 hover:bg-indigo-500/[0.03] transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-gray-600 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <h4 className="font-semibold mb-1">{action.label}</h4>
              <p className="text-sm text-gray-500">{action.desc}</p>
            </Link>
          ))}
        </div>
      </motion.div>

      <motion.div variants={fadeInUp as any} custom={6}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Patients</h3>
          <Link href="/doctor/patient/search" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">View All</Link>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {[
            { id: "PAT-a3f9e2b1-4c67", name: "Rajesh Kumar", abhaId: "12-3456-7890-1234", lastVisit: "2 hours ago", status: "Follow-up" },
            { id: "PAT-b7e2d1a3-9f88", name: "Suman Singh", abhaId: "99-1234-5678-0000", lastVisit: "Yesterday", status: "New Case" },
          ].map((patient) => (
            <Link
              key={patient.id}
              href={`/doctor/patient/${patient.id}`}
              className="group flex flex-wrap items-center justify-between p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-indigo-500/[0.03] hover:border-indigo-500/30 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold">
                  {patient.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-semibold text-white group-hover:text-indigo-400 transition-colors">{patient.name}</h4>
                  <p className="text-xs text-gray-500">ABHA: {patient.abhaId}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-gray-400 mb-1">{patient.lastVisit}</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-gray-400 border border-white/[0.1]">{patient.status}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-white transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* ---- System Status ---- */}
      <motion.div variants={fadeInUp as any} custom={7}>
        <div className="flex items-center gap-4 p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-gray-400">Blockchain: Online</span>
          </div>
          <div className="h-4 w-px bg-white/[0.06]" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-gray-400">IPFS: Connected</span>
          </div>
          <div className="h-4 w-px bg-white/[0.06]" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs text-gray-400">AI Service: Pending Setup</span>
          </div>
          <div className="h-4 w-px bg-white/[0.06]" />
          <div className="flex items-center gap-2">
            <Zap className="w-3 h-3 text-indigo-400" />
            <span className="text-xs text-gray-400">E2E Encryption: Active</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
