"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Save, Stethoscope, ChevronRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

const recordTypes = [
  "CONSULTATION", "PRESCRIPTION", "LAB_REPORT", "SURGERY",
  "DIAGNOSIS", "IMAGING", "VACCINATION", "ALLERGY", "FAMILY_HISTORY",
];

const categories = [
  "cardiology", "endocrinology", "neurology", "pulmonology",
  "gastroenterology", "nephrology", "orthopedics", "dermatology",
  "ophthalmology", "psychiatry", "oncology", "general",
];

export default function NewRecordPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    patientId: "",
    recordType: "CONSULTATION",
    medicalCategory: [] as string[],
    tags: "",
    chiefComplaint: "",
    bp: "", pulse: "", weight: "", height: "", temperature: "", spo2: "",
    findings: "",
    diagnosisCode: "", diagnosisDesc: "", diagnosisStatus: "NEW",
    drugName: "", dose: "", frequency: "", duration: "", instructions: "",
    labOrders: "",
    followUp: "",
    doctorNotes: "",
  });

  const update = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError("");
    setSuccess(false);
  };

  const toggleCategory = (cat: string) => {
    setForm(prev => ({
      ...prev,
      medicalCategory: prev.medicalCategory.includes(cat)
        ? prev.medicalCategory.filter(c => c !== cat)
        : [...prev.medicalCategory, cat],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientId) { setError("Patient ID is required"); return; }
    setLoading(true);
    setError("");

    try {
      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const token = localStorage.getItem("medchain_token");

      const body = {
        patientId: form.patientId,
        recordType: form.recordType,
        medicalCategory: form.medicalCategory,
        tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
        content: {
          chiefComplaint: form.chiefComplaint,
          examination: {
            vitals: {
              bp: form.bp, pulse: Number(form.pulse) || undefined,
              weight: Number(form.weight) || undefined, height: Number(form.height) || undefined,
              temperature: Number(form.temperature) || undefined, spo2: Number(form.spo2) || undefined,
            },
            findings: form.findings,
          },
          diagnosis: form.diagnosisCode ? [{
            icdCode: form.diagnosisCode, description: form.diagnosisDesc, status: form.diagnosisStatus,
          }] : [],
          prescriptions: form.drugName ? [{
            drug: form.drugName, dose: form.dose, frequency: form.frequency,
            duration: form.duration, instructions: form.instructions,
          }] : [],
          labOrders: form.labOrders.split(",").map(t => t.trim()).filter(Boolean),
          followUp: form.followUp,
          doctorNotes: form.doctorNotes,
        },
      };

      const res = await fetch(`${API}/api/records/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create record");

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-[14px] shadow-sm";
  const labelClass = "text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-2 block";

  return (
    <div className="-m-6 p-8 min-h-[calc(100vh-80px)] bg-[#F8FAFC] text-slate-800 rounded-tl-[2.5rem] font-sans relative overflow-hidden">
      {/* ---- Dynamic Ambient Meshes ---- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-[30rem] h-[30rem] bg-indigo-400/20 rounded-full blur-[100px] mix-blend-multiply animate-pulse" style={{ animationDuration: "8s" }} />
        <div className="absolute top-20 -right-40 w-[30rem] h-[30rem] bg-teal-400/20 rounded-full blur-[100px] mix-blend-multiply animate-pulse" style={{ animationDuration: "10s" }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-8 relative z-10">
        <div className="bg-white/60 backdrop-blur-xl border border-slate-100 p-8 rounded-[2rem] shadow-sm">
          <h2 className="text-3xl font-black mb-2 text-slate-800 tracking-tight">Create Medical Record</h2>
          <p className="text-slate-500 font-medium">Enter patient medical data. It will be encrypted and stored on-chain.</p>
        </div>

        {success && (
          <div className="p-6 rounded-[1.5rem] bg-emerald-50 border border-emerald-100 text-emerald-800 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-bold text-[15px]">Record Created Successfully</p>
              <p className="text-[13px] text-emerald-600 font-medium mt-0.5">Encrypted → IPFS → Blockchain. Hash stored on-chain.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-6 rounded-[1.5rem] bg-red-50 border border-red-100 text-red-800 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <span className="font-bold text-[15px]">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient & Record Type */}
          <div className="rounded-[2rem] border border-slate-100 bg-white/60 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 space-y-6">
            <h3 className="font-black text-xl flex items-center gap-3 text-slate-800">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center"><Stethoscope className="w-4 h-4 text-indigo-600" /></div>
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className={labelClass}>Patient ID *</label><input className={inputClass} placeholder="PAT-..." value={form.patientId} onChange={e => update("patientId", e.target.value)} required /></div>
              <div><label className={labelClass}>Record Type</label>
                <select className={inputClass} value={form.recordType} onChange={e => update("recordType", e.target.value)}>
                  {recordTypes.map(t => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>Medical Categories</label>
              <div className="flex flex-wrap gap-2">
                {categories.map(c => (
                  <button key={c} type="button" onClick={() => toggleCategory(c)}
                    className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all shadow-sm ${form.medicalCategory.includes(c) ? "bg-indigo-600 text-white border-indigo-600 shadow-indigo-200" : "bg-white text-slate-500 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600"}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div><label className={labelClass}>Tags (comma-separated)</label><input className={inputClass} placeholder="metformin, hba1c, follow-up" value={form.tags} onChange={e => update("tags", e.target.value)} /></div>
          </div>

          {/* Vitals */}
          <div className="rounded-[2rem] border border-slate-100 bg-white/60 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 space-y-6">
            <h3 className="font-black text-xl text-slate-800">Vitals & Examination</h3>
            <div><label className={labelClass}>Chief Complaint</label><textarea className={inputClass + " h-24 resize-none"} placeholder="Patient presents with..." value={form.chiefComplaint} onChange={e => update("chiefComplaint", e.target.value)} /></div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { key: "bp", label: "BP", ph: "120/80" },
                { key: "pulse", label: "Pulse", ph: "78" },
                { key: "weight", label: "Weight(kg)", ph: "72" },
                { key: "height", label: "Height(cm)", ph: "175" },
                { key: "temperature", label: "Temp(°F)", ph: "98.6" },
                { key: "spo2", label: "SpO2(%)", ph: "98" },
              ].map(v => (
                <div key={v.key}><label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">{v.label}</label><input className={inputClass} placeholder={v.ph} value={(form as any)[v.key]} onChange={e => update(v.key, e.target.value)} /></div>
              ))}
            </div>
            <div><label className={labelClass}>Findings</label><textarea className={inputClass + " h-24 resize-none"} placeholder="No pedal edema, no organomegaly..." value={form.findings} onChange={e => update("findings", e.target.value)} /></div>
          </div>

          {/* Diagnosis & Prescription */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-[2rem] border border-slate-100 bg-white/60 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 space-y-6">
              <h3 className="font-black text-xl text-slate-800">Diagnosis</h3>
              <div><label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">ICD Code</label><input className={inputClass} placeholder="E11" value={form.diagnosisCode} onChange={e => update("diagnosisCode", e.target.value)} /></div>
              <div><label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Description</label><input className={inputClass} placeholder="Type 2 Diabetes Mellitus" value={form.diagnosisDesc} onChange={e => update("diagnosisDesc", e.target.value)} /></div>
              <div><label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Status</label>
                <select className={inputClass} value={form.diagnosisStatus} onChange={e => update("diagnosisStatus", e.target.value)}>
                  <option value="NEW">New</option><option value="ONGOING">Ongoing</option><option value="RESOLVED">Resolved</option>
                </select>
              </div>
            </div>
            <div className="rounded-[2rem] border border-slate-100 bg-white/60 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 space-y-6">
              <h3 className="font-black text-xl text-slate-800">Prescription</h3>
              <div><label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Drug Name</label><input className={inputClass} placeholder="Metformin" value={form.drugName} onChange={e => update("drugName", e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Dose</label><input className={inputClass} placeholder="500mg" value={form.dose} onChange={e => update("dose", e.target.value)} /></div>
                <div><label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Frequency</label><input className={inputClass} placeholder="BD" value={form.frequency} onChange={e => update("frequency", e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Duration</label><input className={inputClass} placeholder="3 months" value={form.duration} onChange={e => update("duration", e.target.value)} /></div>
                <div><label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Instructions</label><input className={inputClass} placeholder="After meals" value={form.instructions} onChange={e => update("instructions", e.target.value)} /></div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="rounded-[2rem] border border-slate-100 bg-white/60 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 space-y-6">
            <h3 className="font-black text-xl text-slate-800">Additional</h3>
            <div><label className={labelClass}>Lab Orders (comma-separated)</label><input className={inputClass} placeholder="HbA1c, FBS, PPBS, Lipid Profile" value={form.labOrders} onChange={e => update("labOrders", e.target.value)} /></div>
            <div><label className={labelClass}>Follow Up</label><input className={inputClass} placeholder="Review in 3 months with lab reports" value={form.followUp} onChange={e => update("followUp", e.target.value)} /></div>
            <div><label className={labelClass}>Doctor Notes</label><textarea className={inputClass + " h-32 resize-none"} placeholder="Patient counseled about diet and exercise..." value={form.doctorNotes} onChange={e => update("doctorNotes", e.target.value)} /></div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-5 rounded-[1.5rem] bg-indigo-600 text-white font-black text-[15px] uppercase tracking-widest hover:bg-indigo-700 hover:-translate-y-0.5 transition-all shadow-[0_10px_20px_rgba(79,70,229,0.3)] disabled:opacity-50 flex items-center justify-center gap-3">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Create Record & Encrypt</>}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
