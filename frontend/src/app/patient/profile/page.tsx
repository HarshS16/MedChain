"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { User, QrCode, CreditCard, ShieldCheck, Zap, Share2 } from "lucide-react";
import { motion } from "framer-motion";

export default function PatientProfilePage() {
  const [user, setUser] = useState<{
    id: string;
    name: string;
    abhaId: string;
    patientId: string;
  } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("medchain_user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const targetId = user.patientId || user.id;
  const qrValue = `medchain://scan/patient/${targetId}`;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
           <span className="p-1 px-2 rounded-md bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest border border-indigo-100/50">Account Center</span>
        </div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Identity & Connectivity</h1>
        <p className="text-slate-500 font-medium">Manage your digital health identity and cross-platform access tokens.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* ---- User Identity Card ---- */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-3 bg-white rounded-[2.5rem] border border-slate-100 p-8 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.02)] flex flex-col justify-between relative overflow-hidden"
        >
          {/* Subtle Background Pattern */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full -mr-32 -mt-32 blur-3xl -z-10" />
          
          <div className="space-y-10">
            <div className="flex flex-col sm:flex-row sm:items-center gap-8">
              <div className="relative">
                <div className="w-28 h-28 shrink-0 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-black text-4xl shadow-2xl shadow-indigo-200">
                  {user.name?.charAt(0) || "P"}
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-xl shadow-lg border border-slate-50 flex items-center justify-center">
                   <ShieldCheck className="w-5 h-5 text-emerald-500" />
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                   <h2 className="text-3xl font-black text-slate-800 tracking-tight">{user.name}</h2>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-1">
                    <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[11px] font-black uppercase tracking-widest border border-emerald-100">
                      Verified Identity
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[11px] font-black uppercase tracking-widest border border-indigo-100">
                      Standard Patient Plan
                    </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all group">
                <div className="flex items-center gap-3 text-slate-400 mb-2 group-hover:text-indigo-500 transition-colors">
                  <CreditCard className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">ABHA ID (Government)</span>
                </div>
                <p className="text-lg font-black text-slate-700 tracking-tight">{user.abhaId}</p>
              </div>

              <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all group">
                <div className="flex items-center gap-3 text-slate-400 mb-2 group-hover:text-indigo-500 transition-colors">
                  <User className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">MedChain Protocol ID</span>
                </div>
                <p className="text-lg font-black text-slate-700 tracking-tight truncate" title={targetId}>{targetId}</p>
              </div>
            </div>
          </div>

          <div className="mt-10 p-5 bg-indigo-600 rounded-3xl text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl shadow-indigo-100">
             <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                   <Zap className="w-6 h-6" />
                </div>
                <div>
                   <p className="text-sm font-black">Fast-Track Consent Active</p>
                   <p className="text-[10px] font-bold text-white/70 uppercase">Emergency Protocol Enabled</p>
                </div>
             </div>
             <button className="px-6 py-2.5 bg-white text-indigo-600 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-50 transition-all active:scale-95 shadow-lg">
                Manage Protocol
             </button>
          </div>
        </motion.div>

        {/* ---- Doctor Scan QR Card ---- */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 p-8 md:p-10 flex flex-col items-center text-center justify-center relative overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.02)]"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600" />
          
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
            <Share2 className="w-6 h-6" />
          </div>
          
          <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Express Access QR</h3>
          <p className="text-sm text-slate-400 font-semibold leading-relaxed mb-8 max-w-[260px]">
            Share this clinical access token with verified doctors to instantly fetch your records.
          </p>

          <div className="p-6 bg-slate-50 rounded-[2.5rem] shadow-inner mb-8 relative border border-slate-100">
            <div className="absolute -top-3 -right-3 w-10 h-10 bg-indigo-600 rounded-2xl text-white flex items-center justify-center shadow-lg border-4 border-white">
              <QrCode className="w-5 h-5" />
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <QRCode value={qrValue} size={180} level="H" className="rounded" fgColor="#1e1b4b" />
            </div>
          </div>

          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">MedChain Secure Protocol V2.1</p>
          
          <div className="flex items-center gap-4 w-full">
             <button title="Print Card" className="flex-1 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-all">
                Print Card
             </button>
             <button title="Download QR" className="flex-1 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-all">
                Save Image
             </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
