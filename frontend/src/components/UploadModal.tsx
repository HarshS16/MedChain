"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  FileUp,
  Image as ImageIcon,
  ShieldCheck,
  BrainCircuit
} from "lucide-react";
import axios from "axios";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
}

export default function UploadModal({ isOpen, onClose, patientId }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [recordType, setRecordType] = useState("Medical Report");
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("document", file);
    formData.append("patientId", patientId);
    formData.append("recordType", recordType);

    try {
      const token = localStorage.getItem("medchain_token");
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/records/upload-document`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setFile(null);
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error("Upload failed:", err);
      setError(err.response?.data?.message || "Failed to upload document. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />

        {/* Modal content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100"
        >
          {/* Header */}
          <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                Upload Medical Record
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                   <Upload className="w-4 h-4 text-white" />
                </div>
              </h2>
              <p className="text-slate-500 font-medium text-sm mt-1">Sync your clinical documents with MedChain Ledger.</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-8 space-y-8">
            {success ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-12 flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-6 border-4 border-emerald-100">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">Upload Complete!</h3>
                <p className="text-slate-500 font-medium max-w-xs">Your record has been encrypted, stored on IPFS, and is now being analyzed by AI.</p>
              </motion.div>
            ) : (
              <>
                {/* Record Type Selection */}
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Report Category</label>
                    <div className="grid grid-cols-2 gap-3">
                        {["Medical Report", "Lab Diagnosis", "Prescription", "Radiology"].map((type) => (
                            <button
                                key={type}
                                onClick={() => setRecordType(type)}
                                className={`py-4 rounded-2xl text-xs font-black uppercase tracking-wider border transition-all ${
                                    recordType === type 
                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100" 
                                    : "bg-white text-slate-500 border-slate-100 hover:border-slate-300"
                                }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Dropzone */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Attachment (PDF or Image)</label>
                  <label className={`relative group block cursor-pointer border-2 border-dashed rounded-[2rem] p-10 text-center transition-all ${
                    file ? "bg-indigo-50/30 border-indigo-300" : "bg-slate-50 border-slate-200 hover:border-indigo-400"
                  }`}>
                    <input type="file" className="hidden" onChange={handleFileChange} accept="application/pdf,image/*" />
                    
                    {file ? (
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                           {file.type === "application/pdf" ? <FileText className="w-8 h-8" /> : <ImageIcon className="w-8 h-8" />}
                        </div>
                        <p className="text-sm font-black text-slate-800 mb-1">{file.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready to sync</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-2xl bg-white text-slate-300 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:text-indigo-500 transition-all shadow-sm">
                           <FileUp className="w-8 h-8" />
                        </div>
                        <p className="text-sm font-black text-slate-700 mb-1">Select Clinical Document</p>
                        <p className="text-xs text-slate-400 font-medium">Drag and drop or click to browse</p>
                      </div>
                    )}
                  </label>
                </div>

                {/* AI & Security Badges */}
                <div className="flex items-center justify-center gap-6 py-4 bg-slate-50/50 rounded-2xl">
                    <div className="flex items-center gap-2 text-indigo-600">
                        <BrainCircuit className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">AI analysis active</span>
                    </div>
                    <div className="w-px h-4 bg-slate-200" />
                    <div className="flex items-center gap-2 text-emerald-600">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">IPFS Encrypted</span>
                    </div>
                </div>

                {error && (
                  <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-3 text-red-600">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="text-xs font-bold leading-relaxed">{error}</p>
                  </div>
                )}

                <button
                  disabled={!file || uploading}
                  onClick={handleUpload}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.1em] hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 transition-all"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Syncing to Network...
                    </>
                  ) : (
                    <>
                      Commit to MedChain
                      <CheckCircle2 className="w-5 h-5" />
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
