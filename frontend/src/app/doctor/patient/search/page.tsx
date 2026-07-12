"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, User, CreditCard, Phone, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";

export default function PatientSearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"abha" | "name" | "phone">("abha");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearched(true);
    await new Promise((r) => setTimeout(r, 1500));

    if (searchQuery.includes("12") || searchQuery.toLowerCase().includes("raj")) {
      setResults([{
        patientId: "PAT-a3f9e2b1-4c67",
        name: "Rajesh Kumar",
        abhaId: "12-3456-7890-1234",
        age: 45, gender: "Male",
        lastVisit: "2024-06-20",
        recordCount: 12,
        conditions: ["Type 2 DM", "Hypertension"],
      }]);
    } else {
      setResults([]);
    }
    setSearching(false);
  };

  return (
    <div className="-m-6 p-8 min-h-[calc(100vh-80px)] bg-[#F8FAFC] text-slate-800 rounded-tl-[2.5rem] font-sans relative overflow-hidden">
      {/* ---- Dynamic Ambient Meshes ---- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-indigo-400/20 rounded-full blur-[100px] mix-blend-multiply animate-pulse" style={{ animationDuration: "9s" }} />
        <div className="absolute -bottom-20 left-10 w-[30rem] h-[30rem] bg-teal-400/20 rounded-full blur-[100px] mix-blend-multiply animate-pulse" style={{ animationDuration: "11s" }} />
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-8 relative z-10">
        <div className="bg-white/60 backdrop-blur-xl border border-slate-100 p-8 rounded-[2rem] shadow-sm">
          <h2 className="text-3xl font-black mb-2 text-slate-800 tracking-tight">Find Patient</h2>
          <p className="text-slate-500 font-medium">Search the blockchain registry by ABHA ID, name, or phone number.</p>
        </div>

        <div className="rounded-[2rem] border border-slate-100 bg-white/60 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
          <div className="flex rounded-xl bg-slate-100/50 p-1.5 mb-6 border border-slate-200/60">
            {([
              { key: "abha" as const, label: "ABHA ID", icon: CreditCard },
              { key: "name" as const, label: "Name", icon: User },
              { key: "phone" as const, label: "Phone", icon: Phone },
            ]).map((tab) => (
              <button key={tab.key} onClick={() => setSearchType(tab.key)}
                className={`flex-1 py-3 rounded-lg text-[13px] font-bold tracking-wide transition-all flex items-center justify-center gap-2 ${searchType === tab.key ? "bg-white text-indigo-600 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700"}`}>
                <tab.icon className="w-4 h-4" />{tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearch} className="flex gap-4 flex-col sm:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchType === "abha" ? "Enter ABHA ID (e.g., 12-3456-7890-1234)" : searchType === "name" ? "Enter patient name..." : "Enter phone number..."}
                className="w-full pl-14 pr-6 py-5 rounded-[1.5rem] bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-lg shadow-sm font-medium" />
            </div>
            <button type="submit" disabled={searching || !searchQuery.trim()}
              className="sm:w-auto w-full px-10 py-5 rounded-[1.5rem] bg-indigo-600 text-white font-black uppercase tracking-widest text-[15px] hover:bg-indigo-700 hover:-translate-y-0.5 transition-all shadow-[0_10px_20px_rgba(79,70,229,0.3)] disabled:opacity-50 flex items-center justify-center gap-3">
              {searching ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Search <ChevronRight className="w-5 h-5" /></>}
            </button>
          </form>
        </div>

        {searched && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {results.length > 0 ? results.map((p: any) => (
              <div key={p.patientId} className="rounded-[2rem] border border-slate-100 bg-white/60 backdrop-blur-xl shadow-sm hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 hover:border-indigo-200 transition-all duration-500 p-6 group">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-[1.2rem] bg-gradient-to-br from-indigo-500 to-teal-400 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">{p.name}</h3>
                      <p className="text-[13px] text-slate-500 font-medium mt-1 mb-3">ABHA: <span className="text-slate-700">{p.abhaId}</span> • {p.age}y/{p.gender.charAt(0)} • {p.recordCount} records</p>
                      <div className="flex gap-2">{p.conditions.map((c: string) => (
                        <span key={c} className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-700 text-[11px] font-bold uppercase tracking-wider">{c}</span>
                      ))}</div>
                    </div>
                  </div>
                  <Link href={`/doctor/patient/${p.patientId}`} className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-indigo-50 text-indigo-600 text-[13px] font-bold uppercase tracking-wider hover:bg-indigo-600 hover:text-white transition-colors flex items-center justify-center gap-2 group/btn">
                    View Profile <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            )) : (
              <div className="rounded-[2rem] border border-slate-100 bg-white/60 backdrop-blur-xl shadow-sm p-16 text-center">
                <Search className="w-16 h-16 text-slate-300 mx-auto mb-6" />
                <h4 className="text-2xl font-black mb-2 text-slate-800">No patients found</h4>
                <p className="text-[15px] text-slate-500 font-medium">Try searching for <strong className="text-slate-700">&quot;Rajesh&quot;</strong> or <strong className="text-slate-700">&quot;12-3456&quot;</strong> for demo data.</p>
              </div>
            )}
          </motion.div>
        )}

        {!searched && (
          <div className="text-center py-10">
            <p className="text-[14px] text-slate-500 font-medium bg-slate-100/50 inline-block px-6 py-3 rounded-full">
              💡 Try searching for <strong className="text-indigo-600">Rajesh</strong> or <strong className="text-indigo-600">12-3456</strong>
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
