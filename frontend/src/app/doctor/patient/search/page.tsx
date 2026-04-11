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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Find Patient</h2>
        <p className="text-gray-400">Search by ABHA ID, name, or phone</p>
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
        <div className="flex rounded-xl bg-white/[0.05] p-1 mb-5">
          {([
            { key: "abha" as const, label: "ABHA ID", icon: CreditCard },
            { key: "name" as const, label: "Name", icon: User },
            { key: "phone" as const, label: "Phone", icon: Phone },
          ]).map((tab) => (
            <button key={tab.key} onClick={() => setSearchType(tab.key)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${searchType === tab.key ? "bg-indigo-600 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}>
              <tab.icon className="w-4 h-4" />{tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchType === "abha" ? "Enter ABHA ID (e.g., 12-3456-7890-1234)" : searchType === "name" ? "Enter patient name..." : "Enter phone number..."}
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all text-lg" />
          </div>
          <button type="submit" disabled={searching || !searchQuery.trim()}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-semibold hover:from-indigo-500 hover:to-indigo-400 transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50 flex items-center gap-2">
            {searching ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Search<ChevronRight className="w-4 h-4" /></>}
          </button>
        </form>
      </div>

      {searched && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {results.length > 0 ? results.map((p: any) => (
            <div key={p.patientId} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 hover:border-indigo-500/30 transition-all group">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg">{p.name.charAt(0)}</div>
                  <div>
                    <h3 className="text-lg font-semibold">{p.name}</h3>
                    <p className="text-sm text-gray-400 mb-2">ABHA: {p.abhaId} • {p.age}y/{p.gender.charAt(0)} • {p.recordCount} records</p>
                    <div className="flex gap-2">{p.conditions.map((c: string) => (
                      <span key={c} className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 text-xs font-medium">{c}</span>
                    ))}</div>
                  </div>
                </div>
                <Link href={`/doctor/patient/${p.patientId}`} className="px-4 py-2 rounded-xl bg-indigo-600/20 text-indigo-400 text-sm font-medium hover:bg-indigo-600/30 transition-all flex items-center gap-1">
                  View <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )) : (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-12 text-center">
              <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h4 className="text-lg font-medium mb-2 text-gray-300">No patients found</h4>
              <p className="text-sm text-gray-500">Try &quot;Rajesh&quot; or &quot;12-3456&quot; for demo data</p>
            </div>
          )}
        </motion.div>
      )}

      {!searched && (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">💡 Try searching for <strong className="text-gray-300">&quot;Rajesh&quot;</strong> or <strong className="text-gray-300">&quot;12-3456&quot;</strong></p>
        </div>
      )}
    </motion.div>
  );
}
