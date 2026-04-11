"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Send, User, Search, FileText, Loader2, Sparkles } from "lucide-react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: Array<{ id: string; type: string }>;
}

export default function ChatPanel({ patientId }: { patientId: string }) {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: `I have indexed all medical records for this patient. You can ask me about medication history, surgical patterns, or specific diagnostic trends.` 
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      // Simulation of AI Service call
      await new Promise(r => setTimeout(r, 1500));
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Based on the patient's records from 2023-2024, they have been primary managing Type 2 Diabetes with Metformin 500mg. There was a recorded shift in July 2023 when Amlodipine was replaced by Telmisartan due to ankle edema.`,
        citations: [
          { id: 'REC-2023-017', type: 'PRESCRIPTION' },
          { id: 'REC-2024-002', type: 'CONSULTATION' }
        ]
      }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Error connecting to AI service. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/[0.06] flex items-center justify-between glass-dark">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-indigo-400" />
          <span className="text-sm font-semibold">AI Medical Assistant</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span className="text-[10px] text-indigo-400 font-mono">RAG-ENABLED</span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${
                msg.role === 'user' ? 'bg-indigo-600' : 'bg-surface-700 border border-white/[0.08]'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Brain className="w-4 h-4 text-indigo-400" />}
              </div>
              <div className={`space-y-3 p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' ? 'bg-indigo-600/20 text-indigo-100 rounded-tr-none' : 'bg-white/[0.04] border border-white/[0.06] text-gray-300 rounded-tl-none'
              }`}>
                <p>{msg.content}</p>
                
                {msg.citations && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-white/[0.06]">
                    {msg.citations.map((c, ci) => (
                      <div key={ci} className="flex items-center gap-1 px-2 py-1 rounded bg-white/[0.05] text-[10px] text-teal-400 font-medium border border-teal-500/20">
                        <FileText className="w-3 h-3 text-teal-500/50" />
                        {c.id}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-surface-700 flex items-center justify-center"><Brain className="w-4 h-4 text-indigo-400" /></div>
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                <span className="text-xs text-gray-500">Searching records...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-white/[0.06] bg-white/[0.02]">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about medications, allergies, or history..."
            className="w-full pl-4 pr-12 py-3.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
