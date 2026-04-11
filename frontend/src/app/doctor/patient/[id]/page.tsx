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
    <div className="space-y-6">
      {/* Header & Meta */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
        <div className="flex gap-4">
          <Link href="/doctor/dashboard" className="p-2.5 rounded-xl bg-white/[0.05] text-gray-400 hover:text-white transition-all h-fit">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold">{MOCK_PATIENT.name}</h1>
              <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono border border-indigo-500/20">
                {MOCK_PATIENT.id}
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              ABHA: {MOCK_PATIENT.abhaId} • {MOCK_PATIENT.age}y / {MOCK_PATIENT.gender} • +91 {MOCK_PATIENT.phone}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="px-5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm font-medium hover:bg-white/[0.1] transition-all flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            Verified Access
          </button>
          <Link href="/doctor/new-record" className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20">
            <Plus className="w-4 h-4" />
            New Entry
          </Link>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Data & Analytics (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Navigation Tabs */}
          <div className="flex border-b border-white/[0.06] gap-8">
            {['summary', 'records', 'timeline'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-2 text-sm font-semibold transition-all relative ${
                  activeTab === tab ? "text-white" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {activeTab === tab && (
                  <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
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
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-12 text-center">
                   <FileText className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                   <p className="text-gray-500">Record list loading from blockchain...</p>
                </div>
              )}
              {activeTab === 'timeline' && (
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-12 text-center">
                   <Clock className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                   <p className="text-gray-500">Visual timeline rendering...</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Column: AI Assistant & Quick Info (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="h-[600px]">
            <ChatPanel patientId={MOCK_PATIENT.id} />
          </div>

          {/* Quick Vital Trends */}
          <div className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500">Vital Trends</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <p className="text-[10px] text-gray-500 uppercase tracking-tighter">HbA1c</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-emerald-400">6.8</span>
                  <span className="text-[10px] text-emerald-400/50">↓ 0.4</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Blood Pressure</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-indigo-400">128/82</span>
                </div>
              </div>
            </div>
            <button className="w-full py-2 text-xs font-medium text-gray-500 hover:text-white transition-colors">
              View All Vitals & Trends
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
