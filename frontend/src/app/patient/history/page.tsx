"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Activity, Clock, ShieldAlert, FileText, Droplet, HeartPulse, Shield, TestTube, User, Stethoscope } from "lucide-react";

export default function MedicalHistoryPage() {
  const [viewMode, setViewMode] = useState<"patient" | "doctor">("patient");
  
  // These metrics would ideally be parsed via NLP from the AI response
  const healthMetrics = [
    { title: "Blood Pressure", value: "128/82", unit: "mmHg", icon: HeartPulse, color: "text-rose-500", bg: "bg-rose-50", border: "border-rose-100", status: "Elevated", statusBg: "bg-rose-100", statusText: "text-rose-600" },
    { title: "Fasting Glucose", value: "102", unit: "mg/dL", icon: Droplet, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-100", status: "Borderline", statusBg: "bg-blue-100", statusText: "text-blue-600" },
    { title: "Cholesterol (Total)", value: "210", unit: "mg/dL", icon: Shield, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-100", status: "High", statusBg: "bg-amber-100", statusText: "text-amber-600" },
    { title: "Hemoglobin", value: "13.2", unit: "g/dL", icon: TestTube, color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-100", status: "Normal", statusBg: "bg-emerald-100", statusText: "text-emerald-600" },
  ];

  const content = {
    patient: {
      summaryTitle: "Your Health Overview",
      summaryText: "You currently have slightly elevated blood pressure and your recent tests show borderline high blood sugar and cholesterol levels. Your doctors have noted some changes in your memory and daily functional abilities. To stay healthy, it's very important to follow a heart-healthy diet, monitor your activity, and ensure you have someone available at home to assist you with daily decisions and medication.",
      showDetailedObservations: false
    },
    doctor: {
      summaryTitle: "Executive Clinical Summary",
      summaryText: "Based on the analyzed reports, the patient presents with a history of hypertension and hyperlipidemia. Current key health parameters show borderline elevated fasting blood glucose and cholesterol levels, indicating a pre-diabetic state. Cognitive assessment highlights severe deficits indicative of irreversible dementia, requiring comprehensive daily living assistance. Immediate dietary modifications and cardiovascular monitoring are recommended.",
      showDetailedObservations: true
    }
  };

  const currentView = content[viewMode];

  return (
    <div className="-m-6 p-8 min-h-[calc(100vh-80px)] bg-[#F8FAFC] text-slate-800 rounded-tl-[2.5rem] font-sans relative overflow-hidden">
      <div className="relative z-10 space-y-8 max-w-5xl mx-auto pb-10">
        
        {/* Header & View Toggle */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Medical History & Analytics</h1>
            <p className="text-slate-500 font-medium text-[16px]">
              AI-driven metrics and summaries dynamically adjusted for your needs.
            </p>
          </div>

          <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 flex text-[14px] font-bold self-start md:self-auto shrink-0 transition-all">
            <button
              onClick={() => setViewMode("patient")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all ${
                viewMode === "patient" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 scale-[1.02]" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              <User className="w-4 h-4" /> Patient View
            </button>
            <button
              onClick={() => setViewMode("doctor")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all ${
                viewMode === "doctor" ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-[1.02]" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              <Stethoscope className="w-4 h-4" /> Clinical View
            </button>
          </div>
        </div>

        {/* ---- Top Level: Executive Summary ---- */}
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
        >
          <div className={`absolute top-0 right-0 w-64 h-64 blur-3xl -z-10 rounded-full translate-x-1/2 -translate-y-1/2 transition-colors duration-500 ${viewMode === 'patient' ? 'bg-indigo-50' : 'bg-emerald-50'}`} />
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100 mb-6">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border transition-colors duration-500 ${viewMode === 'patient' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">{currentView.summaryTitle}</h2>
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Aggregated AI Output</p>
            </div>
          </div>
          <p className="text-[16px] text-slate-600 font-medium leading-relaxed max-w-4xl">
            {currentView.summaryText}
          </p>
        </motion.div>

        {/* ---- Middle Level: Extracted Metrics ---- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {healthMetrics.map((metric, idx) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`bg-white/80 backdrop-blur-xl border ${metric.border} rounded-[2rem] p-6 flex flex-col relative overflow-hidden transition-all hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 shadow-[0_8px_30px_rgb(0,0,0,0.04)]`}
            >
              <div className={`absolute top-0 right-0 w-24 h-24 ${metric.bg} blur-2xl -z-10 rounded-full translate-x-1/2 -translate-y-1/2 opacity-60`} />
              <div className="flex items-center justify-between mb-5">
                <div className={`w-12 h-12 rounded-xl ${metric.bg} flex items-center justify-center ${metric.color} shadow-sm border ${metric.border}`}>
                  <metric.icon className="w-6 h-6" />
                </div>
                <span className={`text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${metric.statusBg} ${metric.statusText}`}>
                  {metric.status}
                </span>
              </div>
              <p className="text-sm text-slate-500 font-bold tracking-tight mb-2">{metric.title}</p>
              <div className="flex items-baseline gap-1.5 z-10">
                <span className="text-3xl font-black text-slate-800 tracking-tighter">
                  {metric.value}
                </span>
                <span className="text-sm text-slate-500 font-bold tracking-tight">{metric.unit}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ---- Bottom Level: Detailed Timeline / Full Analysis (Doctor Only) ---- */}
        {currentView.showDetailedObservations && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-[2.5rem] p-8 md:p-10 space-y-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">Detailed Clinical Observations</h3>

            <div className="space-y-8 text-sm text-slate-600 leading-relaxed border-l-2 border-emerald-100 pl-8 ml-2 relative">
              
              <div className="relative">
                <span className="absolute -left-[41px] top-1.5 w-4 h-4 bg-emerald-500 rounded-full ring-4 ring-emerald-50 shadow-sm" />
                <h4 className="text-slate-800 text-lg font-bold tracking-tight mb-2">Clinical Impressions</h4>
                <p className="text-[15px] font-medium text-slate-500">The doctor identified Dementia and previous Stroke incidents as primary conditions. The patient exhibits significant cognitive deterioration.</p>
              </div>

              <div className="relative">
                <span className="absolute -left-[41px] top-1.5 w-4 h-4 bg-emerald-500 rounded-full ring-4 ring-emerald-50 shadow-sm" />
                <h4 className="text-slate-800 text-lg font-bold tracking-tight mb-2">Mental State & Capacity</h4>
                <p className="text-[15px] font-medium text-slate-500">Orientation and basic functional literacy are severely impaired. Patient cannot process, retain, or weigh information sufficiently to make decisions regarding personal welfare or property affairs.</p>
              </div>

              <div className="relative">
                <span className="absolute -left-[41px] top-1.5 w-4 h-4 bg-emerald-500 rounded-full ring-4 ring-emerald-50 shadow-sm" />
                <h4 className="text-slate-800 text-lg font-bold tracking-tight mb-2">Recommendations</h4>
                <p className="text-[15px] font-medium text-slate-500">
                  1. Continued supervision for personal welfare.<br/>
                  2. Dietary adjustments targeting cholesterol and blood glucose.<br/>
                  3. Routine cardiovascular monitoring.
                </p>
              </div>

            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
