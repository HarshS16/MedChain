"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FileText, Search, Filter, Upload, ExternalLink, ShieldCheck, Clock, User, Loader2, Sparkles, AlertCircle } from "lucide-react";
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
      setRecords(result.data.records || []);
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
          recordId: record.recordId,
          recordType: record.recordType,
          ipfsCid: record.ipfsCid,
          metadata: { medicalCategory: record.medicalCategory }
        })
      });

      if (!response.ok) throw new Error("AI analysis failed");
      
      const result = await response.json();
      setAnalyses(prev => ({
        ...prev,
        [record.recordId]: result.data.analysis
      }));
    } catch (err) {
      console.error("AI Error:", err);
      alert("AI analysis is currently unavailable. Check your backend logs or OpenRouter key.");
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-outfit">My Medical Records</h2>
          <p className="text-gray-400 text-sm">View and manage your entire encrypted health history.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleUploadClick}
            disabled={isUploading}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl ${isUploading ? 'bg-indigo-600/50 grayscale pointer-events-none' : 'bg-indigo-600 hover:bg-indigo-500'} text-white text-sm font-medium transition-all active:scale-95 shadow-lg shadow-indigo-600/20`}
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {isUploading ? "Uploading..." : "Upload New"}
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
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-white/[0.02] border border-white/[0.06] animate-pulse" />
          ))}
        </div>
      ) : records.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-12 text-center">
          <FileText className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No records found</h3>
          <p className="text-gray-400 max-w-sm mx-auto">
            Upload your reports to start using AI analysis.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {records.map((record) => (
            <motion.div 
              key={record.recordId}
              layout
              className="rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-indigo-500/30 transition-all flex flex-col h-full"
            >
              <div className="p-6 flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-indigo-600/10 text-indigo-400">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex gap-1">
                    {(record.medicalCategory || []).slice(0, 2).map((cat) => (
                      <span key={cat} className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-white/[0.05] text-gray-400">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
                
                <h3 className="font-bold text-lg mb-1 leading-tight">{record.recordType}</h3>
                <div className="space-y-1.5 mb-6">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <User className="w-3.5 h-3.5" />
                    <span>{record.doctorName || "Self Uploaded"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(record.recordedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* AI Analysis View Area */}
                <AnimatePresence>
                  {analyses[record.recordId] && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mb-6 p-4 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-xs leading-relaxed text-indigo-200 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-2 opacity-10">
                         <Sparkles className="w-12 h-12" />
                      </div>
                      <div className="flex items-center gap-2 mb-2 text-indigo-400 font-bold uppercase tracking-tighter">
                        <Sparkles className="w-3.5 h-3.5" />
                        AI INSIGHT
                      </div>
                      {analyses[record.recordId].split('\n').map((line, idx) => (
                        <p key={idx} className={line.trim() ? "mb-1" : "mb-2"}>{line}</p>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => handleAIAnalysis(record)}
                    disabled={analyzingIds.has(record.recordId)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-indigo-600/20 text-indigo-400 text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-50"
                  >
                    {analyzingIds.has(record.recordId) ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    {analyses[record.recordId] ? "Refresh AI" : "Get AI Analysis"}
                  </button>
                  
                  <a 
                    href={`https://gateway.pinata.cloud/ipfs/${record.ipfsCid}`} 
                    target="_blank" 
                    className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-gray-400 hover:text-white transition-all flex items-center justify-center w-10 h-10"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div className="px-6 py-3 border-t border-white/[0.06] flex items-center gap-1.5 text-[10px] text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="font-medium uppercase tracking-wider">Blockchain Verified</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
