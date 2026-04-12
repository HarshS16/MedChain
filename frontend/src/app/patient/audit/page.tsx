"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { History, Shield, AlertTriangle, CheckCircle2, XCircle, Search, Filter, Fingerprint, Calendar } from "lucide-react";

const MOCK_AUDIT = [
  { id: "LOG-09", action: "CONSENT_VERIFIED", entity: "Dr. Sharma", details: "Smart contract evaluated read permission. Access Granted.", timestamp: "Today, 10:45 AM", status: "success", ip: "192.168.1.1" },
  { id: "LOG-08", action: "RECORD_ACCESSED", entity: "Apollo Hospitals", details: "Viewed MRI Scan #3451", timestamp: "Yesterday, 14:20 PM", status: "success", ip: "192.168.0.44" },
  { id: "LOG-07", action: "UNAUTHORIZED_ATTEMPT", entity: "Unknown IP", details: "Invalid cryptographic signature provided.", timestamp: "Yesterday, 09:12 AM", status: "blocked", ip: "45.22.11.9" },
  { id: "LOG-06", action: "CONSENT_REVOKED", entity: "Self", details: "Revoked access from Global Care Clinic", timestamp: "Oct 10, 11:30 AM", status: "success", ip: "127.0.0.1" },
  { id: "LOG-05", action: "RECORD_CREATED", entity: "Dr. Deepa Patel", Blood: "Added Blood Test Report", timestamp: "Oct 01, 16:00 PM", status: "success", ip: "192.168.8.2" }
];

export default function AuditLogsPage() {
  const [logs] = useState(MOCK_AUDIT);

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'success': return <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></div>;
      case 'blocked': return <div className="w-8 h-8 rounded-full bg-red-50 border border-red-100 flex items-center justify-center"><XCircle className="w-4 h-4 text-red-500" /></div>;
      default: return <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center"><AlertTriangle className="w-4 h-4 text-slate-500" /></div>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-3xl font-black mb-2 text-slate-800 tracking-tight flex items-center gap-3">
            Audit Trail
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[11px] uppercase font-bold tracking-widest flex items-center gap-1.5">
              <Fingerprint className="w-3 h-3" /> Immutable
            </span>
          </h2>
          <p className="text-[15px] text-slate-500 font-medium">A cryptographic record of every interaction with your health ledger.</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
            <input 
              type="text" 
              placeholder="Search logs..." 
              className="h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 text-[14px] font-medium outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all w-full md:w-64"
            />
          </div>
          <button className="h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-600 flex items-center gap-2 hover:bg-slate-50 font-bold text-[14px] transition-colors">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="bg-white/60 backdrop-blur-xl border border-slate-100 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 uppercase text-[11px] font-bold text-slate-500 tracking-wider">
                <th className="px-6 py-5 rounded-tl-[2rem]">Action</th>
                <th className="px-6 py-5">Entity Evaluated</th>
                <th className="px-6 py-5 hidden md:table-cell">Cryptographic Details</th>
                <th className="px-6 py-5">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {logs.map((log, i) => (
                <motion.tr 
                  key={log.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-slate-50/50 transition-colors group cursor-default"
                >
                  <td className="px-6 py-5 text-[14px]">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(log.status)}
                      <div>
                        <p className={`font-bold ${log.status === 'blocked' ? 'text-red-700' : 'text-slate-800'}`}>{log.action}</p>
                        <p className="text-[12px] text-slate-400 font-mono mt-0.5">{log.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-[14px]">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-medium">
                      <Shield className="w-3.5 h-3.5 text-slate-400" /> {log.entity}
                    </span>
                  </td>
                  <td className="px-6 py-5 hidden md:table-cell text-[14px]">
                    <p className="text-slate-600 font-medium">{log.details}</p>
                    <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                       IP: {log.ip}
                    </p>
                  </td>
                  <td className="px-6 py-5 text-[14px] text-slate-500 font-medium whitespace-nowrap">
                    <div className="flex items-center gap-2">
                       <Calendar className="w-4 h-4 text-slate-300" />
                       {log.timestamp}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-[13px] font-medium text-slate-500">
          Showing 5 most recent evaluations 
          <button className="text-indigo-600 font-bold hover:underline">View All Network Logs</button>
        </div>
      </div>
    </div>
  );
}
