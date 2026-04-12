"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, X, Bot, User, Loader2, Sparkles, MinusCircle } from "lucide-react";

interface Message {
  role: "user" | "bot";
  content: string;
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", content: "Hi! I'm your MedChain AI assistant. I can help you understand our decentralized platform or answer questions about your medical records. How can I assist you today?" }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    const userMsg = message.trim();
    setMessage("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const stored = localStorage.getItem("medchain_user");
      const user = stored ? JSON.parse(stored) : null;
      const patientId = user?.patientId || user?.id;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          patientId: patientId,
          chatHistory: messages.map(m => ({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.content })).slice(-6)
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [...prev, { role: "bot", content: data.response }]);
      } else {
        setMessages((prev) => [...prev, { role: "bot", content: "Sorry, I encountered an error. Please try again." }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: "bot", content: "Unable to connect to service. Please check your connection." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => { setIsOpen(true); setIsMinimized(false); }}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-700 text-white flex items-center justify-center shadow-[0_8px_30px_rgba(79,70,229,0.3)] hover:scale-110 active:scale-95 transition-all"
          >
            <MessageSquare className="w-8 h-8" />
            <motion.div 
               animate={{ scale: [1, 1.2, 1] }} 
               transition={{ repeat: Infinity, duration: 2 }} 
               className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-[#F8FAFC]" 
            />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              height: isMinimized ? '64px' : '550px'
            }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-[380px] bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-slate-100 flex flex-col overflow-hidden transition-all duration-300"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-4 px-6 flex items-center justify-between text-white relative shrink-0">
               <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
               <div className="flex items-center gap-3 relative z-10">
                 <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                   <Bot className="w-5 h-5 text-white" />
                 </div>
                 <div>
                   <h3 className="font-bold text-[15px] leading-none">MedChain Assistant</h3>
                   <div className="flex items-center gap-1.5 mt-1">
                     <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                     <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">AI Expert Online</span>
                   </div>
                 </div>
               </div>
               <div className="flex items-center gap-2 relative z-10">
                 <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                    <MinusCircle className="w-4 h-4" />
                 </button>
                 <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                    <X className="w-4 h-4" />
                 </button>
               </div>
            </div>

            {/* Messages Area */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-white border border-slate-200 text-slate-400 shadow-sm'}`}>
                          {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>
                        <div className={`p-4 rounded-2xl text-[14px] leading-relaxed shadow-sm ${
                          msg.role === 'user' 
                            ? 'bg-indigo-600 text-white rounded-tr-none' 
                            : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none font-medium'
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="flex gap-2 items-center">
                        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                          <Bot className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                           <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                           <span className="text-xs text-slate-400 font-bold tracking-widest uppercase">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100">
                   <div className="relative flex items-center">
                     <input
                       type="text"
                       value={message}
                       onChange={(e) => setMessage(e.target.value)}
                       placeholder="Ask about your records or MedChain..."
                       className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-5 pr-12 text-[14px] focus:outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                     />
                     <button
                       type="submit"
                       disabled={!message.trim() || loading}
                       className="absolute right-2 w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 disabled:bg-slate-300 transition-all active:scale-90"
                     >
                       <Send className="w-4 h-4" />
                     </button>
                   </div>
                   <div className="flex items-center gap-2 mt-3 px-2">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI analysis based on MedChain Ledger</p>
                   </div>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
