"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ChevronDown, ChevronRight, Activity, Calendar, Clipboard, AlertCircle } from "lucide-react";

interface SummaryProps {
  patientId: string;
  data: {
    l0: string;
    l1: {
      conditions: Array<{ name: string; status: string; details: string }>;
      surgical?: Array<{ name: string; date: string }>;
      allergies?: Array<{ substance: string; reaction: string }>;
    };
    l2: Array<{ date: string; event: string; type: string }>;
  };
}

export default function PatientSummaryView({ patientId, data }: SummaryProps) {
  const [level, setLevel] = useState(0);

  return (
    <div className="space-y-6">
      {/* Level Selector */}
      <div className="flex rounded-xl bg-white/[0.05] p-1 w-fit">
        {[0, 1, 2].map((l) => (
          <button
            key={l}
            onClick={() => setLevel(l)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
              level === l ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            Level {l}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={level}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="min-h-[200px]"
        >
          {level === 0 && (
            <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/20">
              <div className="flex gap-4">
                <Brain className="w-8 h-8 text-indigo-400 shrink-0" />
                <p className="text-lg leading-relaxed text-gray-200 font-medium">
                  {data.l0}
                </p>
              </div>
            </div>
          )}

          {level === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Conditions */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Medical Conditions
                </h4>
                {data.l1.conditions.map((c, i) => (
                  <div key={i} className="group">
                    <p className="font-semibold text-white">{c.name}</p>
                    <p className="text-xs text-indigo-400 mb-1">{c.status}</p>
                    <p className="text-sm text-gray-400">{c.details}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                {/* Allergies */}
                <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/10">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-red-400 flex items-center gap-2 mb-3">
                    <AlertCircle className="w-4 h-4" /> Drug Allergies
                  </h4>
                  {data.l1.allergies?.map((a, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span className="font-medium text-white">{a.substance}</span>
                      <span className="text-red-400/80">{a.reaction}</span>
                    </div>
                  ))}
                </div>

                {/* Surgical */}
                <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2 mb-3">
                    <Clipboard className="w-4 h-4" /> Surgical History
                  </h4>
                  {data.l1.surgical?.map((s, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span className="font-medium text-white">{s.name}</span>
                      <span className="text-emerald-400/80">{s.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {level === 2 && (
            <div className="space-y-3">
              {data.l2.map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] group hover:bg-white/[0.04] transition-all">
                  <div className="text-sm font-mono text-gray-500 w-24 shrink-0">{item.date}</div>
                  <div className={`w-2 h-2 rounded-full ${
                    item.type === 'SURGERY' ? 'bg-red-500' : 
                    item.type === 'DIAGNOSIS' ? 'bg-indigo-500' : 'bg-emerald-500'
                  }`} />
                  <div className="flex-1 text-sm font-medium text-gray-300">{item.event}</div>
                  <div className="text-xs px-2 py-0.5 rounded bg-white/[0.05] text-gray-500 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.type}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
