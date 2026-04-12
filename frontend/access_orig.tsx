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
          <h2 className="text-3xl font-bold mb-2">Access Control</h2>
          <p className="text-gray-400">Manage digital consent for doctors and clinical organizations.</p>
        </div>
        <div className="flex gap-2 p-1 rounded-xl bg-white/[0.05]">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20 flex items-center gap-2">
            <Shield className="w-3 h-3" /> Zero-Trust Active
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
          <p className="text-xs text-gray-500 uppercase font-bold mb-1 tracking-widest">Active Consents</p>
          <p className="text-4xl font-bold text-white">{grants.length}</p>
        </div>
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
          <p className="text-xs text-gray-500 uppercase font-bold mb-1 tracking-widest">Global Privacy</p>
          <p className="text-4xl font-bold text-white">Full</p>
        </div>
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
          <p className="text-xs text-gray-500 uppercase font-bold mb-1 tracking-widest">Smart Contract</p>
          <p className="text-4xl font-bold text-white transition-all hover:text-indigo-400 cursor-help">v1.2</p>
        </div>
      </div>

      {/* Grant List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold">Authorized Entities</h3>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20">
            <Plus className="w-4 h-4" /> Grant New Access
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence>
            {grants.map((grant) => (
              <motion.div
                key={grant.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] group hover:bg-white/[0.04] transition-all"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-teal-500 flex items-center justify-center text-white shrink-0">
                      <Stethoscope className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold flex items-center gap-2 text-white">
                        {grant.name}
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/[0.05] text-gray-400 uppercase font-mono">{grant.scope}</span>
                      </h4>
                      <div className="flex flex-col gap-1 mt-1">
                        <p className="text-sm text-gray-400 flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> {grant.hospital}</p>
                        <p className="text-xs text-indigo-400">{grant.specialization}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-white/[0.05]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" /> Granted: {grant.grantedAt}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-amber-500/70 font-medium">
                        <Clock className="w-3 h-3" /> Expires: {grant.expiresAt}
                      </div>
                    </div>

                    <button
                      onClick={() => handleRevoke(grant.id)}
                      disabled={revoking === grant.id}
                      className="px-4 py-2 rounded-xl bg-red-500/10 text-red-500 text-sm font-semibold border border-red-500/20 hover:bg-red-500 hover:text-white transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {revoking === grant.id ? (
                        <>
                          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
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
            <div className="py-20 text-center border-2 border-dashed border-white/[0.05] rounded-3xl">
              <Lock className="w-12 h-12 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500">Your health data is completely locked.</p>
              <p className="text-sm text-gray-600">No external doctors currently have access.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
