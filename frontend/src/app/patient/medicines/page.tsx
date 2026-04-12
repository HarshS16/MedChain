"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Pill, 
  Search, 
  Calendar, 
  User, 
  Hospital, 
  Clock, 
  ChevronRight, 
  Filter,
  AlertCircle,
  CheckCircle2,
  Stethoscope,
  ChevronDown,
  Info
} from "lucide-react";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  doctor: string;
  hospital: string;
  date: string;
  status: "completed" | "active" | "stopped";
  notes: string;
}

const medications: Medication[] = [
  {
    id: "MED-001",
    name: "Metformin Glycomet",
    dosage: "500mg",
    frequency: "Twice daily (BD) - After meals",
    duration: "6 Months",
    doctor: "Dr. Anirudh Sharma",
    hospital: "Max Super Speciality Hospital",
    date: "2024-03-15",
    status: "active",
    notes: "Regular glucose monitoring required. Do not skip evening dose."
  },
  {
    id: "MED-002",
    name: "Telmisartan 40",
    dosage: "40mg",
    frequency: "Once daily (OD) - Morning",
    duration: "Continuous",
    doctor: "Dr. Meera Iyer",
    hospital: "Apollo Hospitals",
    date: "2024-02-10",
    status: "active",
    notes: "Take on an empty stomach for better absorption."
  },
  {
    id: "MED-003",
    name: "Amoxicillin",
    dosage: "500mg",
    frequency: "Three times daily (TDS)",
    duration: "7 Days",
    doctor: "Dr. Rajesh Gupta",
    hospital: "Fortis Escorts",
    date: "2023-12-05",
    status: "completed",
    notes: "Antibiotic course completed for respiratory infection."
  },
  {
    id: "MED-004",
    name: "Amlodipine",
    dosage: "5mg",
    frequency: "Once daily (OD)",
    duration: "3 Months",
    doctor: "Dr. Meera Iyer",
    hospital: "Apollo Hospitals",
    date: "2023-11-20",
    status: "stopped",
    notes: "Discontinued due to mild ankle swelling (edema). Replaced by Telmisartan."
  }
];

export default function MedicinalRecordsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "completed" | "stopped">("all");
  const [expandedMed, setExpandedMed] = useState<string | null>(null);

  const filteredMeds = medications.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         med.doctor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || med.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1 px-3 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.1em] border border-indigo-100/50">Medication Ledger</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            Medicinal Records
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <Pill className="w-5 h-5 text-white" />
            </div>
          </h1>
          <p className="text-slate-500 font-medium mt-2 max-w-xl">
            A comprehensive history of all medications, dosages, and clinical routines prescribed by your doctors on the MedChain network.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
           <div className="relative group w-full sm:w-72">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
             <input
               type="text"
               placeholder="Search medicine or doctor..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-sm font-medium focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
             />
           </div>
           <button className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
             <Filter className="w-4 h-4" />
             <span>Filter</span>
           </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-8 bg-slate-100/50 p-1.5 rounded-2xl w-fit">
        {["all", "active", "completed", "stopped"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status as any)}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              filterStatus === status 
                ? "bg-white text-indigo-600 shadow-md" 
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Medication List */}
      <div className="grid gap-4">
        <AnimatePresence mode="popLayout">
          {filteredMeds.map((med) => (
            <motion.div
              layout
              key={med.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="group bg-white rounded-3xl border border-slate-100 hover:border-indigo-200 transition-all hover:shadow-[0_15px_40px_rgba(0,0,0,0.03)] overflow-hidden"
            >
              <div 
                onClick={() => setExpandedMed(expandedMed === med.id ? null : med.id)}
                className="p-6 cursor-pointer"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                      med.status === "active" ? "bg-emerald-50 text-emerald-600" :
                      med.status === "stopped" ? "bg-red-50 text-red-600" :
                      "bg-indigo-50 text-indigo-600"
                    }`}>
                      <Pill className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800 mb-1">{med.name}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                          <Clock className="w-3 h-3" />
                          <span>Started on {new Date(med.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                          <User className="w-3 h-3" />
                          <span>{med.doctor}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="p-3 px-5 bg-slate-50 rounded-2xl text-center min-w-[120px]">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Frequency</p>
                      <p className="text-sm font-black text-slate-700">{med.frequency.split(' - ')[0]}</p>
                    </div>
                    <div className="p-3 px-5 bg-slate-50 rounded-2xl text-center min-w-[100px]">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Dosage</p>
                      <p className="text-sm font-black text-slate-700">{med.dosage}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] border ${
                      med.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      med.status === 'stopped' ? 'bg-red-50 text-red-600 border-red-100' :
                      'bg-slate-50 text-slate-500 border-slate-100'
                    }`}>
                      {med.status}
                    </div>
                    <ChevronDown className={`w-5 h-5 text-slate-300 transition-transform duration-300 ml-2 ${expandedMed === med.id ? 'rotate-180 text-indigo-500' : ''}`} />
                  </div>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {expandedMed === med.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-8 mt-6 border-t border-slate-50 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                           <div>
                             <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                               <Stethoscope className="w-3.5 h-3.5" />
                               Clinical Context
                             </h4>
                             <div className="p-4 rounded-2xl bg-indigo-50/30 border border-indigo-100/50">
                                <p className="text-sm text-slate-800 font-bold mb-1">{med.doctor}</p>
                                <p className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
                                  <Hospital className="w-3 h-3" />
                                  {med.hospital}
                                </p>
                             </div>
                           </div>
                           
                           <div className="lg:col-span-2">
                             <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                               <Info className="w-3.5 h-3.5" />
                               Doctor's Instructions & Notes
                             </h4>
                             <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 italic text-slate-600 text-[14px] leading-relaxed">
                               "{med.notes}"
                             </div>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100">
                             <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                               <Calendar className="w-5 h-5" />
                             </div>
                             <div>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Planned Duration</p>
                               <p className="text-sm font-bold text-slate-800">{med.duration}</p>
                             </div>
                           </div>
                           <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100">
                             <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                               <CheckCircle2 className="w-5 h-5" />
                             </div>
                             <div>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Current Adherence</p>
                               <p className="text-sm font-bold text-slate-800">{med.status === 'active' ? '98.5% (On Track)' : 'History Closed'}</p>
                             </div>
                           </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Disclaimer */}
      <div className="mt-10 p-6 rounded-[2rem] bg-amber-50 border border-amber-100 flex gap-4 items-start">
        <AlertCircle className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
        <div>
          <h4 className="font-black text-amber-900 text-sm uppercase tracking-wide mb-1">Important Disclaimer</h4>
          <p className="text-amber-800/80 text-sm leading-relaxed font-medium">
            This medicinal record is generated from aggregated clinical reports on the MedChain network. Always correlate these records with your current physical prescriptions. If you notice any discrepancy, please contact your prescribing physician or the MedChain support desk immediately. Do not self-medicate based on these records.
          </p>
        </div>
      </div>
    </div>
  );
}
