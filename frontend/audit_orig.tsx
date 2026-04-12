"use client";

import { motion } from "framer-motion";
import { History, Shield, Eye, FilePlus, User, Building2, Clock, CheckCircle2, AlertCircle } from "lucide-react";

const AUDIT_LOGS = [
  {
    id: "LOG-1",
    action: "READ_RECORD",
    actor: "Dr. Sharma",
    org: "Apollo Hospitals",
    timestamp: "2024-06-21 14:30:05",
    details: "Viewed Consultation Note #REC-2023-017",
    status: "AUTHORIZED",
    onChain: true
  },
  {
    id: "LOG-2",
    action: "CREATE_RECORD",
    actor: "Dr. Deepa Patel",
    org: "Vasan Health Center",
    timestamp: "2024-06-20 10:15:22",
    details: "Created Prescription #REC-2024-002",
    status: "AUTHORIZED",
    onChain: true
  },
  {
    id: "LOG-3",
    action: "ACCESS_DENIED",
    actor: "Unknown (DOC-9921)",
    org: "City General Clinic",
    timestamp: "2024-06-19 22:10:00",
    details: "Unauthorized attempt to access L1 Summary",
    status: "BLOCKED",
    onChain: true
  },
  {
    id: "LOG-4",
    action: "GRANT_ACCESS",
    actor: "Patient (Self)",
    org: "MediChain System",
    timestamp: "2024-06-15 09:00:00",
    details: "Granted READ_WRITE access to Dr. Sharma",
    status: "AUTHORIZED",
    onChain: true
  }
];

export default function AuditLogPage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold mb-2 text-white">Security Audit Trail</h2>
        <p className="text-gray-400">Immutable ledger of every interaction with your medical records.</p>
      </div>

      <div className="space-y-4">
        {AUDIT_LOGS.map((log, i) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`p-5 rounded-2xl border bg-white/[0.02] flex items-start gap-5 transition-all hover:bg-white/[0.04] ${
              log.status === 'BLOCKED' ? 'border-red-500/20' : 'border-white/[0.06]'
            }`}
          >
            <div className={`p-3 rounded-xl shrink-0 ${
              log.action === 'ACCESS_DENIED' ? 'bg-red-500/10 text-red-500' : 
              log.action === 'GRANT_ACCESS' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-emerald-500/10 text-emerald-400'
            }`}>
              {log.action === 'READ_RECORD' ? <Eye className="w-5 h-5" /> : 
               log.action === 'CREATE_RECORD' ? <FilePlus className="w-5 h-5" /> : 
               log.action === 'ACCESS_DENIED' ? <AlertCircle className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold flex items-center gap-2">
                    {log.action.replace('_', ' ')}
                    {log.onChain && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                        ON-CHAIN
                      </span>
                    )}
                  </h4>
                  <p className="text-sm text-gray-400">{log.details}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                    <Clock className="w-3 h-3" /> {log.timestamp}
                  </div>
                  <div className={`text-[10px] font-bold uppercase tracking-wider ${
                    log.status === 'BLOCKED' ? 'text-red-500' : 'text-emerald-500'
                  }`}>
                    {log.status}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-3 border-t border-white/[0.04] mt-3">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <User className="w-3 h-3" /> {log.actor}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Building2 className="w-3.5 h-3.5" /> {log.org}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-indigo-400 font-mono ml-auto">
                  TX: {log.id}-{Math.random().toString(16).slice(2, 8)}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-center">
        <p className="text-sm text-gray-400">
          Showing last 20 health events. For the complete cryptographic history, use the 
          <span className="text-indigo-400 font-medium cursor-pointer ml-1">Archive Export</span> tool.
        </p>
      </div>
    </div>
  );
}
