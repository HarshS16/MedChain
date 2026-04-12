"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Brain,
  Link2,
  Lock,
  Users,
  Activity,
  ChevronRight,
  Sparkles,
  Database,
  FileSearch,
  ArrowRight,
  Heart,
  Stethoscope,
  Fingerprint,
  Blocks,
  Cpu,
  Globe,
  CheckCircle2,
  Zap,
} from "lucide-react";
import Link from "next/link";

// ============================================
// Animation Variants
// ============================================
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const },
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

// ============================================
// Feature Data
// ============================================
const features = [
  {
    icon: Blocks,
    title: "Blockchain Immutability",
    desc: "Every medical interaction recorded on Hyperledger Fabric. Tamper-proof, auditable, permanent.",
    color: "from-indigo-500 to-purple-600",
    glow: "rgba(99, 102, 241, 0.15)",
  },
  {
    icon: Lock,
    title: "Patient-Owned Encryption",
    desc: "AES-256 + ECIES encryption. You control your keys. You decide who sees your data.",
    color: "from-teal-400 to-emerald-600",
    glow: "rgba(20, 184, 166, 0.15)",
  },
  {
    icon: Brain,
    title: "AI-Powered Queries",
    desc: 'Ask "What medications has this patient tried for diabetes?" and get synthesized answers with citations.',
    color: "from-amber-400 to-orange-600",
    glow: "rgba(245, 158, 11, 0.15)",
  },
  {
    icon: FileSearch,
    title: "Auto-Summaries",
    desc: "Hierarchical patient summaries — from one-liners to full condition breakdowns — generated in seconds.",
    color: "from-pink-400 to-rose-600",
    glow: "rgba(244, 114, 182, 0.15)",
  },
  {
    icon: Fingerprint,
    title: "ABHA Integration",
    desc: "Linked to India's Ayushman Bharat Health Account. One identity. Every hospital. Every doctor.",
    color: "from-cyan-400 to-blue-600",
    glow: "rgba(34, 211, 238, 0.15)",
  },
  {
    icon: Shield,
    title: "Zero-Trust Access",
    desc: "Smart contract ACLs. Fabric CA verification. Immutable audit trails. Every access logged forever.",
    color: "from-violet-400 to-indigo-600",
    glow: "rgba(139, 92, 246, 0.15)",
  },
];

const stats = [
  { value: "100%", label: "Tamper-Proof", icon: Shield },
  { value: "< 5s", label: "AI Summary", icon: Zap },
  { value: "E2E", label: "Encrypted", icon: Lock },
  { value: "ABDM", label: "Compliant", icon: CheckCircle2 },
];

const techStack = [
  { name: "Hyperledger Fabric", category: "Blockchain", icon: Blocks },
  { name: "AES-256 + ECIES", category: "Encryption", icon: Lock },
  { name: "IPFS", category: "Storage", icon: Database },
  { name: "PubMedBERT", category: "AI Embeddings", icon: Cpu },
  { name: "pgvector", category: "Vector Store", icon: Database },
  { name: "GLM-4 / Gemini", category: "LLM", icon: Brain },
];

// ============================================
// Landing Page Component
// ============================================
export default function HomePage() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-surface-900 text-white overflow-x-hidden">
      {/* ---- Navbar ---- */}
      <nav className="fixed top-0 w-full z-50 glass-dark">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Med<span className="text-indigo-400">Chain</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Features
            </a>
            <a
              href="#architecture"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Architecture
            </a>
            <a
              href="#tech"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Technology
            </a>
            <Link
              href="/login"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-sm font-medium hover:from-indigo-500 hover:to-indigo-400 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ---- Hero Section ---- */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        {/* Background effects */}
        <div className="absolute inset-0 hero-mesh" />
        <div className="absolute inset-0 dot-pattern opacity-30" />

        {/* Animated gradient orbs */}
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
            left: mousePos.x * 0.02 + "%",
            top: mousePos.y * 0.02 + "%",
          }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* Badge */}
            <motion.div
              variants={fadeInUp as any}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 text-sm"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-gray-300">
                Powered by Blockchain + AI
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              variants={fadeInUp as any}
              custom={1}
              className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.05] tracking-tight mb-6"
            >
              Your Medical History.
              <br />
              <span className="gradient-text">One Chain of Truth.</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeInUp as any}
              custom={2}
              className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              A decentralized, AI-powered medical record ledger for India.
              Tamper-proof. Patient-owned. Instantly queryable by any verified
              doctor.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeInUp as any}
              custom={3}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                href="/login"
                className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-medium text-lg hover:from-indigo-500 hover:to-indigo-400 transition-all shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 flex items-center gap-2"
              >
                Launch Dashboard
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#features"
                className="px-8 py-4 rounded-2xl glass text-gray-300 font-medium text-lg hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
              >
                Explore Features
                <ChevronRight className="w-5 h-5" />
              </a>
            </motion.div>

            {/* Stats Bar */}
            <motion.div
              variants={fadeInUp as any}
              custom={4}
              className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  variants={scaleIn}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl glass"
                >
                  <stat.icon className="w-5 h-5 text-indigo-400" />
                  <span className="text-2xl font-bold gradient-text">
                    {stat.value}
                  </span>
                  <span className="text-xs text-gray-400 uppercase tracking-wider">
                    {stat.label}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2">
            <div className="w-1 h-2 rounded-full bg-indigo-400" />
          </div>
        </motion.div>
      </section>

      {/* ---- Problem Statement ---- */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-20"
          >
            <motion.p
              variants={fadeInUp as any}
              className="text-sm text-indigo-400 uppercase tracking-widest mb-3"
            >
              The Problem
            </motion.p>
            <motion.h2
              variants={fadeInUp as any}
              custom={1}
              className="text-4xl md:text-5xl font-bold mb-6"
            >
              Medical Records in India
              <br />
              <span className="text-gray-500">Are Broken</span>
            </motion.h2>
            <motion.p
              variants={fadeInUp as any}
              custom={2}
              className="text-gray-400 text-lg max-w-xl mx-auto"
            >
              Fragmented. Paper-dependent. Inaccessible. Tamper-prone.
              Unqueryable.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-5 gap-4"
          >
            {[
              {
                emoji: "📋",
                title: "Fragmented",
                desc: "Scattered across hospitals with zero interoperability",
              },
              {
                emoji: "📄",
                title: "Paper-Based",
                desc: "Physical prescriptions and unstructured photos",
              },
              {
                emoji: "🔒",
                title: "Inaccessible",
                desc: "No cross-city, cross-hospital record sharing",
              },
              {
                emoji: "⚠️",
                title: "Tamper-Prone",
                desc: "Records can be altered or fabricated",
              },
              {
                emoji: "🔍",
                title: "Unqueryable",
                desc: '"What medications tried for diabetes?" — impossible to answer',
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                variants={fadeInUp as any}
                custom={i}
                className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-red-500/30 hover:bg-red-500/[0.03] transition-all duration-300"
              >
                <span className="text-3xl mb-3 block">{item.emoji}</span>
                <h3 className="font-semibold mb-1 text-white">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ---- Features ---- */}
      <section id="features" className="py-32 relative">
        <div className="absolute inset-0 dot-pattern opacity-10" />
        <div className="max-w-7xl mx-auto px-6 relative">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-20"
          >
            <motion.p
              variants={fadeInUp as any}
              className="text-sm text-teal-400 uppercase tracking-widest mb-3"
            >
              The Solution
            </motion.p>
            <motion.h2
              variants={fadeInUp as any}
              custom={1}
              className="text-4xl md:text-5xl font-bold mb-6"
            >
              Built for the Future of
              <br />
              <span className="gradient-text">Indian Healthcare</span>
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp as any}
                custom={i}
                onMouseEnter={() => setActiveFeature(i)}
                className={`group relative p-8 rounded-3xl border transition-all duration-500 cursor-pointer ${
                  activeFeature === i
                    ? "border-indigo-500/30 bg-indigo-500/[0.05]"
                    : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]"
                }`}
                style={{
                  boxShadow:
                    activeFeature === i
                      ? `0 20px 60px ${feature.glow}`
                      : "none",
                }}
              >
                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  {feature.desc}
                </p>

                {/* Active indicator */}
                {activeFeature === i && (
                  <motion.div
                    layoutId="activeFeature"
                    className="absolute bottom-4 right-4"
                  >
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ---- Architecture ---- */}
      <section id="architecture" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-20"
          >
            <motion.p
              variants={fadeInUp as any}
              className="text-sm text-indigo-400 uppercase tracking-widest mb-3"
            >
              Architecture
            </motion.p>
            <motion.h2
              variants={fadeInUp as any}
              custom={1}
              className="text-4xl md:text-5xl font-bold mb-6"
            >
              Five Layers of
              <br />
              <span className="gradient-text">Trust & Intelligence</span>
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-4"
          >
            {[
              {
                layer: "01",
                title: "Blockchain Layer",
                desc: "Hyperledger Fabric — Permissioned network with channel-based privacy, smart contract access control",
                icon: Blocks,
                color: "from-indigo-500 to-violet-600",
              },
              {
                layer: "02",
                title: "Encryption Layer",
                desc: "AES-256-GCM symmetric + ECIES asymmetric — Patient-controlled keys, integrity verification via SHA-256",
                icon: Lock,
                color: "from-teal-500 to-emerald-600",
              },
              {
                layer: "03",
                title: "Storage Layer",
                desc: "IPFS private cluster for encrypted blobs + PostgreSQL/Supabase for metadata and vector embeddings",
                icon: Database,
                color: "from-blue-500 to-cyan-600",
              },
              {
                layer: "04",
                title: "AI Intelligence Layer",
                desc: "PubMedBERT embeddings, RAG retrieval, hierarchical summaries, memory management with condition anchors",
                icon: Brain,
                color: "from-amber-500 to-orange-600",
              },
              {
                layer: "05",
                title: "Application Layer",
                desc: "Doctor dashboard, patient portal, admin panel — Real-time access control and natural language queries",
                icon: Globe,
                color: "from-pink-500 to-rose-600",
              },
            ].map((item, i) => (
              <motion.div
                key={item.layer}
                variants={fadeInUp as any}
                custom={i}
                className="group flex items-start gap-6 p-6 md:p-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-300"
              >
                <div
                  className={`flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform`}
                >
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-mono text-gray-500 px-2 py-0.5 rounded bg-white/[0.05]">
                      LAYER {item.layer}
                    </span>
                    <h3 className="text-xl font-semibold">{item.title}</h3>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ---- AI Demo Section ---- */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 hero-mesh opacity-50" />
        <div className="max-w-7xl mx-auto px-6 relative">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp as any} className="text-center mb-16">
              <p className="text-sm text-amber-400 uppercase tracking-widest mb-3">
                AI in Action
              </p>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ask Questions.
                <br />
                <span className="gradient-text">Get Answers Instantly.</span>
              </h2>
            </motion.div>

            <motion.div
              variants={fadeInUp as any}
              custom={2}
              className="max-w-3xl mx-auto"
            >
              {/* Mock AI Chat */}
              <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
                <div className="p-4 border-b border-white/[0.06] flex items-center gap-3">
                  <Brain className="w-5 h-5 text-indigo-400" />
                  <span className="text-sm font-medium">
                    MedChain AI Assistant
                  </span>
                  <span className="text-xs text-gray-500 ml-auto">
                    Patient: Rajesh Kumar (PAT-a3f9...)
                  </span>
                </div>

                <div className="p-6 space-y-6">
                  {/* Doctor Query */}
                  <div className="flex justify-end">
                    <div className="max-w-sm px-5 py-3 rounded-2xl bg-indigo-600/20 border border-indigo-500/20 text-sm">
                      What medications has this patient tried for hypertension?
                    </div>
                  </div>

                  {/* AI Response */}
                  <div className="flex justify-start">
                    <div className="max-w-lg px-5 py-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-sm space-y-3">
                      <p className="text-gray-300">
                        Patient has been on the following anti-hypertensives:
                      </p>
                      <ol className="list-decimal list-inside space-y-2 text-gray-300">
                        <li>
                          <strong className="text-white">
                            Amlodipine 5mg
                          </strong>{" "}
                          — Prescribed by Dr. Sharma at Apollo Chennai, March
                          2023
                        </li>
                        <li>
                          <strong className="text-white">
                            Telmisartan 40mg
                          </strong>{" "}
                          — Added by Dr. Patel, July 2023 (replaced Amlodipine
                          due to ankle edema)
                        </li>
                        <li>
                          <strong className="text-white">
                            Telmisartan 40mg + HCTZ 12.5mg
                          </strong>{" "}
                          — Current regimen since Jan 2024
                        </li>
                      </ol>
                      <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
                        <FileSearch className="w-3.5 h-3.5 text-teal-400" />
                        <span className="text-xs text-gray-500">
                          Sources: REC-2023-003, REC-2023-017, REC-2024-002
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ---- Tech Stack ---- */}
      <section id="tech" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.p
              variants={fadeInUp as any}
              className="text-sm text-teal-400 uppercase tracking-widest mb-3"
            >
              Technology
            </motion.p>
            <motion.h2
              variants={fadeInUp as any}
              custom={1}
              className="text-4xl md:text-5xl font-bold"
            >
              Enterprise-Grade Stack
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
          >
            {techStack.map((tech, i) => (
              <motion.div
                key={tech.name}
                variants={scaleIn}
                className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-indigo-500/30 hover:bg-indigo-500/[0.03] transition-all text-center group"
              >
                <tech.icon className="w-8 h-8 text-gray-500 mx-auto mb-3 group-hover:text-indigo-400 transition-colors" />
                <p className="text-sm font-medium mb-1">{tech.name}</p>
                <p className="text-xs text-gray-500">{tech.category}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ---- CTA Section ---- */}
      <section className="py-32 relative">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2
              variants={fadeInUp as any}
              className="text-4xl md:text-6xl font-bold mb-6"
            >
              Ready to Transform
              <br />
              <span className="gradient-text">Indian Healthcare?</span>
            </motion.h2>
            <motion.p
              variants={fadeInUp as any}
              custom={1}
              className="text-gray-400 text-lg mb-10 max-w-xl mx-auto"
            >
              Join the decentralized health revolution. One patient. One chain.
              Every doctor informed.
            </motion.p>
            <motion.div
              variants={fadeInUp as any}
              custom={2}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                href="/login"
                className="group px-10 py-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-teal-500 text-white font-semibold text-lg hover:from-indigo-500 hover:to-teal-400 transition-all shadow-2xl shadow-indigo-500/25 hover:shadow-indigo-500/40 flex items-center gap-3"
              >
                <Stethoscope className="w-5 h-5" />
                Start as Doctor
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="px-10 py-5 rounded-2xl glass text-gray-300 font-semibold text-lg hover:text-white hover:bg-white/10 transition-all flex items-center gap-3"
              >
                <Users className="w-5 h-5" />
                Register as Patient
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ---- Footer ---- */}
      <footer className="border-t border-white/[0.06] py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-teal-400 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold">MedChain</span>
          </div>

          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} MedChain. Decentralized Healthcare for
            India.
          </p>

          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-white transition-colors">
              ABDM Compliance
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
