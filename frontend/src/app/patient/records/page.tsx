"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FileText, Search, Filter, Upload, ExternalLink, ShieldCheck, Clock, User, Loader2, Sparkles, AlertCircle, Eye, Download, FilePlus, Activity } from "lucide-react";
import { useRef, useState, useEffect } from "react";

interface MedicalRecord {
  recordId: string;
  recordType: string;
  medicalCategory: string[];
  recordedAt: string;
  doctorName?: string;
  hospitalName?: string;
  ipfsCid: string;
}

export default function MyRecordsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // AI Analysis states
  const [analyses, setAnalyses] = useState<Record<string, string>>({});
  const [analyzingIds, setAnalyzingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const userStr = localStorage.getItem("medchain_user");
      const token = localStorage.getItem("medchain_token");
      
      if (!userStr || !token) {
        setError("Session expired. Please login again.");
        return;
      }

      const user = JSON.parse(userStr);
      const targetId = user.patientId || user.id;
      
      const response = await fetch(`http://localhost:3001/api/records/patient/${targetId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Failed to fetch records");
      
      const result = await response.json();
      setRecords(result.data?.records || []);
    } catch (err: any) {
      console.error("Fetch Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAIAnalysis = async (record: MedicalRecord) => {
    if (analyzingIds.has(record.recordId)) return;
    
    try {
      setAnalyzingIds(prev => new Set(prev).add(record.recordId));
      const token = localStorage.getItem("medchain_token");

      const response = await fetch("http://localhost:3001/api/ai/analyze-record", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recordId: record.recordId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || "AI analysis failed");
      }
      
      const result = await response.json();
      setAnalyses(prev => ({
        ...prev,
        [record.recordId]: result.data.analysis
      }));
    } catch (err: any) {
      console.error("AI Error:", err);
      alert(`AI Error: ${err.message}`);
    } finally {
      setAnalyzingIds(prev => {
        const next = new Set(prev);
        next.delete(record.recordId);
        return next;
      });
    }
  };

  const handleUploadClick = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const userStr = localStorage.getItem("medchain_user");
      const token = localStorage.getItem("medchain_token");
      
      if (!userStr || !token) {
        alert("Session expired. Please login again.");
        return;
      }

      const user = JSON.parse(userStr);
      const targetId = user.patientId || user.id;
      
      const formData = new FormData();
      formData.append("document", file);
      formData.append("patientId", targetId);
      formData.append("recordType", "Patient Uploaded Document");

      const response = await fetch("http://localhost:3001/api/records/upload-document", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Upload failed");
      }

      alert("✅ Record uploaded successfully!");
      fetchRecords();
    } catch (err: any) {
      console.error("Upload Error:", err);
      alert(`❌ Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3 mb-2">
            Clinical Records
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[12px] font-bold tracking-widest uppercase">
              Encrypted
            </span>
          </h2>
          <p className="text-slate-500 font-medium text-[15px]">View and manage your verified health data stored on the MedChain ledger.</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="h-11 px-4 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center gap-2 text-slate-600 font-bold hover:bg-slate-50 transition-all text-[14px]">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button 
            onClick={handleUploadClick}
            disabled={isUploading}
            className={`h-11 px-5 rounded-xl ${isUploading ? 'bg-indigo-600/50 grayscale pointer-events-none' : 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5'} text-white shadow-lg shadow-indigo-500/20 flex items-center gap-2 font-bold transition-all text-[14px]`}
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FilePlus className="w-4 h-4" />}
            {isUploading ? "Uploading..." : "Upload Document"}
          </button>
        </div>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileChange}
        accept="image/*,.pdf"
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4].map(i => (
             <div key={i} className="h-44 rounded-[2rem] bg-slate-100 animate-pulse border border-slate-200"></div>
          ))}
        </div>
      ) : records.length === 0 ? (
        <div className="py-24 text-center rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-slate-50/50">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-600 mb-1">No records found</h3>
          <p className="text-slate-400 max-w-sm mx-auto font-medium">
            Upload your reports to start using AI analysis.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          <AnimatePresence>
            {records.map((record, i) => (
              <motion.div
                key={record.recordId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group p-7 rounded-[2.5rem] bg-white/60 backdrop-blur-xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500 relative overflow-hidden flex flex-col"
              >
                <div className="flex items-start justify-between mb-6 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex flex-wrap justify-end gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[11px] font-bold tracking-widest uppercase">
                    <ShieldCheck className="w-3 h-3" /> Verified
                  </div>
                </div>

                <div className="relative z-10 flex-1">
                  <h3 className="text-[19px] font-black text-slate-800 tracking-tight leading-tight mb-2">
                    {record.recordType}
                  </h3>
                  
                  <div className="flex gap-1 mb-4 flex-wrap">
                    {(record.medicalCategory || []).slice(0, 2).map((cat) => (
                      <span key={cat} className="inline-block px-3 py-1 rounded-[10px] bg-slate-100 text-slate-500 text-[10px] font-bold tracking-wide uppercase">
                        {cat}
                      </span>
                    ))}
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-[14px] text-slate-600 font-medium">
                      <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                        <Activity className="w-4 h-4 text-slate-400" />
                      </div>
                      <span className="truncate">{record.doctorName || 'Self Uploaded'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[14px] text-slate-600 font-medium">
                      <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4 text-slate-400" />
                      </div>
                      <span>{new Date(record.recordedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* AI Analysis View Area */}
                <AnimatePresence>
                  {analyses[record.recordId] && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mb-6 p-4 rounded-xl bg-indigo-50 border border-indigo-100 text-[13px] leading-relaxed text-indigo-900 relative overflow-hidden z-10"
                    >
                      <div className="absolute top-0 right-0 p-2 opacity-5">
                         <Sparkles className="w-12 h-12" />
                      </div>
                      <div className="flex items-center gap-2 mb-2 text-indigo-600 font-black uppercase tracking-tighter">
                        <Sparkles className="w-4 h-4" />
                        AI INSIGHT
                      </div>
                      {analyses[record.recordId].split('\n').map((line, idx) => (
                        <p key={idx} className={line.trim() ? "mb-1" : "mb-2 font-medium"}>{line}</p>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-2 pt-6 border-t border-slate-100 flex items-center justify-between relative z-10 w-full">
                  <div className="flex gap-2">
                    <a 
                      href={`https://gateway.pinata.cloud/ipfs/${record.ipfsCid}`}
                      target="_blank"
                      className="text-slate-400 hover:text-indigo-600 flex flex-col items-center gap-1 group/btn transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover/btn:bg-indigo-50 border border-slate-100 group-hover/btn:border-indigo-100">
                        <Eye className="w-4 h-4" />
                      </div>
                    </a>
                  </div>
                  <button 
                    onClick={() => handleAIAnalysis(record)}
                    disabled={analyzingIds.has(record.recordId)}
                    className="h-10 px-4 rounded-full bg-slate-800 text-white text-[13px] font-bold hover:bg-slate-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {analyzingIds.has(record.recordId) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {analyses[record.recordId] ? "Refresh AI" : "Get AI Analysis"}
                  </button>
                </div>

                {/* Decorative background subtle pulse */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-50/50 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000 z-0"></div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
