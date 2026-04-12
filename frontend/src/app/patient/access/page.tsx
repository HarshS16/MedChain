"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ShieldCheck, ShieldAlert, Plus, X, Clock, Calendar, Shield, MoreVertical, Search, Stethoscope, Building2 } from "lucide-react";

const MOCK_GRANTS = [
  {
    id: "GRANT-1",
    name: "Dr. Sharma",
    specialization: "Cardiology",
    hospital: "Apollo Hospitals, Chennai",
    grantedAt: "2024-06-15",
    expiresAt: "2024-12-15",
    scope: "READ_WRITE",
    status: "active"
  },
  {
    id: "GRANT-2",
    name: "Dr. Deepa Patel",
    specialization: "General Physician",
    hospital: "Vasan Health Center",
    grantedAt: "2024-01-10",
    expiresAt: "2024-07-10",
    scope: "READ_ONLY",
    status: "active"
  }
];

export default function AccessControlPage() {
  const [grants, setGrants] = useState(MOCK_GRANTS);
  const [revoking, setRevoking] = useState<string | null>(null);

  const handleRevoke = async (id: string) => {
    setRevoking(id);
    // Simulate Blockchain Revocation
    await new Promise(r => setTimeout(r, 1500));
    setGrants(prev => prev.filter(g => g.id !== id));
    setRevoking(null);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black mb-2 text-slate-800 tracking-tight">Access Control</h2>
          <p className="text-slate-500 font-medium">Manage digital consent for doctors and clinical organizations.</p>
        </div>
        <div className="flex gap-2 p-1 rounded-xl bg-white shadow-sm border border-slate-100">
          <div className="px-4 py-2 rounded-lg bg-emerald-50 text-emerald-600 text-[13px] font-bold border border-emerald-100 flex items-center gap-2">
            <Shield className="w-4 h-4" /> Zero-Trust Active
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-[1.5rem] bg-indigo-50 border border-indigo-100 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-100/50 rounded-bl-full -mr-4 -mt-4"></div>
          <p className="text-[12px] text-indigo-600/80 uppercase font-bold mb-1 tracking-widest relative z-10">Active Consents</p>
          <p className="text-4xl font-black text-indigo-950 relative z-10 tracking-tight">{grants.length}</p>
        </div>
        <div className="p-6 rounded-[1.5rem] bg-white/80 backdrop-blur border border-slate-100 shadow-sm relative overflow-hidden">
          <p className="text-[12px] text-slate-400 uppercase font-bold mb-1 tracking-widest relative z-10">Global Privacy</p>
          <p className="text-4xl font-black text-slate-800 relative z-10 tracking-tight">Full</p>
        </div>
        <div className="p-6 rounded-[1.5rem] bg-white/80 backdrop-blur border border-slate-100 shadow-sm relative overflow-hidden">
          <p className="text-[12px] text-slate-400 uppercase font-bold mb-1 tracking-widest relative z-10">Smart Contract</p>
          <p className="text-4xl font-black text-slate-800 transition-all hover:text-indigo-600 cursor-help relative z-10 tracking-tight">v1.2</p>
        </div>
      </div>

      <div className="space-y-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-[18px] text-slate-800 tracking-tight">Authorized Entities</h3>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-[14px] font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 hover:-translate-y-0.5">
            <Plus className="w-4 h-4" /> Grant New Access
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5">
          <AnimatePresence>
            {grants.map((grant) => (
              <motion.div
                key={grant.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="p-6 rounded-[1.5rem] border border-slate-100 bg-white/60 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] group hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-slate-200 transition-all"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/20">
                      <Stethoscope className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-[18px] font-black flex items-center gap-2 text-slate-800 tracking-tight">
                        {grant.name}
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase font-bold tracking-wider">{grant.scope}</span>
                      </h4>
                      <div className="flex flex-col gap-1.5 mt-1.5">
                        <p className="text-[14px] text-slate-500 font-medium flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-slate-400" /> {grant.hospital}
                        </p>
                        <p className="text-[13px] font-bold text-indigo-600">{grant.specialization}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end border-t border-slate-100 md:border-t-0 pt-4 md:pt-0">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-[13px] font-medium text-slate-500">
                        <Calendar className="w-4 h-4 text-slate-400" /> Granted: {grant.grantedAt}
                      </div>
                      <div className="flex items-center gap-2 text-[13px] text-amber-600 font-bold">
                        <Clock className="w-4 h-4 text-amber-500" /> Expires: {grant.expiresAt}
                      </div>
                    </div>

                    <button
                      onClick={() => handleRevoke(grant.id)}
                      disabled={revoking === grant.id}
                      className="px-5 py-2.5 rounded-xl bg-red-50 text-red-600 text-[14px] font-bold border border-red-100 hover:bg-red-500 hover:text-white transition-all flex items-center gap-2 disabled:opacity-50 hover:shadow-lg hover:shadow-red-500/20"
                    >
                      {revoking === grant.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Revoking...
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="w-4 h-4" />
                          Revoke
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {grants.length === 0 && (
            <div className="py-24 text-center border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50/50">
              <Lock className="w-14 h-14 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 font-bold text-[16px]">Your health data is completely locked.</p>
              <p className="text-[14px] text-slate-400 mt-1 font-medium">No external doctors currently have access.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
