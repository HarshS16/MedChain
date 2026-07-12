"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Calendar, 
  FileText, 
  Brain, 
  Activity, 
  Shield, 
  ChevronRight, 
  Clock,
  Plus
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import PatientSummaryView from "@/components/medical/PatientSummary";
import ChatPanel from "@/components/ai/ChatPanel";

// Mock data for demo
const MOCK_PATIENT = {
  id: "PAT-a3f9e2b1-4c67",
  name: "Rajesh Kumar",
  abhaId: "12-3456-7890-1234",
  age: 45,
  gender: "Male",
  phone: "9876543210",
  summary: {
    l0: "45M, Type 2 DM (2019), Hypertension (2023). Currently managed with Metformin and Telmisartan. No recent hospitalizations.",
    l1: {
      conditions: [
        { name: "Type 2 Diabetes Mellitus", status: "Since 2019", details: "HbA1c trend 8.2 → 6.8. Well controlled." },
        { name: "Essential Hypertension", status: "Since 2023", details: "BP stabilized with Telmisartan 40mg." }
      ],
      surgical: [
        { name: "Laparoscopic Appendectomy", date: "Oct 2022" }
      ],
      allergies: [
        { substance: "Sulfa Drugs", reaction: "Skin Rash" }
      ]
    },
    l2: [
      { date: "2024-06-20", event: "Routine Follow-up - Endocrinology", type: "CONSULTATION" },
      { date: "2023-11-15", event: "Hypertension Diagnosis", type: "DIAGNOSIS" },
      { date: "2022-10-05", event: "Appendectomy Surgery", type: "SURGERY" }
    ]
  }
};

export default function PatientDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('summary');

  return (
    <div className="-m-6 p-8 min-h-[calc(100vh-80px)] bg-[#F8FAFC] text-slate-800 rounded-tl-[2.5rem] font-sans relative overflow-hidden">
      {/* ---- Dynamic Ambient Meshes ---- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-[30rem] h-[30rem] bg-indigo-400/20 rounded-full blur-[100px] mix-blend-multiply animate-pulse" style={{ animationDuration: "8s" }} />
        <div className="absolute top-20 -right-40 w-[30rem] h-[30rem] bg-teal-400/20 rounded-full blur-[100px] mix-blend-multiply animate-pulse" style={{ animationDuration: "10s" }} />
      </div>

      <div className="space-y-8 relative z-10 max-w-7xl mx-auto">
        {/* Header & Meta */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-start bg-white/60 backdrop-blur-xl border border-slate-100 p-8 rounded-[2rem] shadow-sm">
          <div className="flex gap-5 items-start">
            <Link href="/doctor/dashboard" className="p-3 rounded-[1.2rem] bg-white text-slate-400 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 transition-all shadow-sm">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">{MOCK_PATIENT.name}</h1>
                <span className="text-[11px] px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 font-bold uppercase tracking-widest border border-indigo-100">
                  {MOCK_PATIENT.id}
                </span>
              </div>
              <p className="text-slate-500 font-medium">
                ABHA: <span className="text-slate-700">{MOCK_PATIENT.abhaId}</span> • {MOCK_PATIENT.age}y / {MOCK_PATIENT.gender} • +91 {MOCK_PATIENT.phone}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="px-5 py-3 rounded-[1.2rem] bg-emerald-50 border border-emerald-100 text-[13px] font-bold text-emerald-700 hover:bg-emerald-100 transition-all flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              Verified Access
            </button>
            <Link href="/doctor/new-record" className="px-5 py-3 rounded-[1.2rem] bg-indigo-600 text-white text-[13px] font-bold tracking-wide hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-[0_8px_16px_rgba(79,70,229,0.2)] hover:-translate-y-0.5">
              <Plus className="w-4 h-4" />
              New Entry
            </Link>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Data & Analytics (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 gap-8">
              {['summary', 'records', 'timeline'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 px-2 text-[14px] font-bold tracking-wide transition-all relative ${
                    activeTab === tab ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {activeTab === tab && (
                    <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.5)]" />
                  )}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="min-h-[400px]"
              >
                {activeTab === 'summary' && (
                  <PatientSummaryView patientId={MOCK_PATIENT.id} data={MOCK_PATIENT.summary} />
                )}
                {activeTab === 'records' && (
                  <div className="rounded-[2rem] border border-slate-100 bg-white/60 backdrop-blur-xl p-16 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                     <FileText className="w-16 h-16 text-slate-300 mx-auto mb-6" />
                     <p className="text-slate-500 font-medium">Record list loading from blockchain...</p>
                  </div>
                )}
                {activeTab === 'timeline' && (
                  <div className="rounded-[2rem] border border-slate-100 bg-white/60 backdrop-blur-xl p-16 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                     <Clock className="w-16 h-16 text-slate-300 mx-auto mb-6" />
                     <p className="text-slate-500 font-medium">Visual timeline rendering...</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Column: AI Assistant & Quick Info (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="h-[600px] rounded-[2rem] overflow-hidden border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/60 backdrop-blur-xl">
              {/* Ensure ChatPanel component respects the new light theme, you may need to update its internal styles if it was hardcoded to dark mode */}
              <ChatPanel patientId={MOCK_PATIENT.id} />
            </div>

            {/* Quick Vital Trends */}
            <div className="p-6 rounded-[2rem] border border-slate-100 bg-white/60 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-5">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Vital Trends</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mb-1">HbA1c</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-emerald-600">6.8</span>
                    <span className="text-[11px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded">↓ 0.4</span>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mb-1">Blood Pressure</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-indigo-600">128/82</span>
                  </div>
                </div>
              </div>
              <button className="w-full py-3 rounded-[1rem] bg-slate-50 text-[13px] font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                View All Vitals & Trends
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
