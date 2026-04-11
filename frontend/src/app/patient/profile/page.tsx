"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { User, QrCode, CreditCard, MapPin, Phone, Mail } from "lucide-react";
import { motion } from "framer-motion";

export default function PatientProfilePage() {
  const [user, setUser] = useState<{ id: string; name: string; abhaId: string; patientId: string } | null>(null);

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

  // Use patientId, fallback to id if patientId isn't present in localstorage yet
  const targetId = user.patientId || user.id;
  
  // The value embedded in the QR Code. Designed for doctor's app scanner.
  const qrValue = `medchain://scan/patient/${targetId}`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-gray-400">Manage your identity and instantly share your medical history.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        
        {/* ---- User Identity Card ---- */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-3 glass-dark border border-white/[0.06] rounded-2xl p-6 md:p-8 flex flex-col justify-center space-y-8"
        >
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-teal-500 flex items-center justify-center text-white font-bold text-4xl shadow-xl shadow-indigo-500/20">
              {user.name?.charAt(0) || "P"}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{user.name}</h2>
              <div className="flex items-center gap-2 mt-1 text-gray-400">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold uppercase border border-indigo-500/20">
                  Patient Account
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <CreditCard className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">ABHA ID</span>
              </div>
              <p className="text-base font-medium text-white">{user.abhaId}</p>
            </div>
            
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <User className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">System ID</span>
              </div>
              <p className="text-base font-medium text-white truncate" title={targetId}>{targetId}</p>
            </div>
          </div>
        </motion.div>

        {/* ---- Doctor Scan QR Card ---- */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-2 relative overflow-hidden glass-dark border border-indigo-500/30 rounded-2xl p-6 md:p-8 flex flex-col items-center text-center justify-center"
        >
          {/* Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl -z-10" />

          <div className="p-4 bg-white rounded-2xl shadow-xl shadow-black/20 mb-6 relative">
            <div className="absolute -top-3 -right-3 w-8 h-8 bg-indigo-500 rounded-full text-white flex items-center justify-center shadow-lg border-2 border-[#1E1E2E]">
              <QrCode className="w-4 h-4" />
            </div>
            <QRCode 
              value={qrValue} 
              size={160}
              level="H"
              className="rounded"
            />
          </div>

          <h3 className="text-lg font-bold text-white mb-2">Doctor Express Scan</h3>
          <p className="text-sm text-gray-400 leading-relaxed max-w-[250px]">
            Have your doctor scan this code from their MedChain App to instantly retrieve and analyze your medical history.
          </p>
        </motion.div>

      </div>
    </div>
  );
}
