"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Stethoscope,
  Users,
  Shield,
  Eye,
  EyeOff,
  ArrowRight,
  ChevronRight,
  Mail,
  Lock,
  User,
  Phone,
  Building2,
  CreditCard,
  Fingerprint,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type AuthMode = "login" | "register-patient" | "register-doctor";

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -30,
    transition: { duration: 0.4 },
  },
};

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
    role: "patient" as "patient" | "doctor", // Default to patient for new aesthetic
    name: "",
    email: "",
    phone: "",
    abhaId: "",
    nmcRegistrationNo: "",
    specialization: "",
    hospitalId: "HOSP-default",
  });

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      let endpoint = "";
      let body: Record<string, unknown> = {};

      if (mode === "login") {
        endpoint = "/api/auth/login";
        body = {
          identifier: formData.identifier,
          password: formData.password,
          role: formData.role,
        };
      } else if (mode === "register-patient") {
        endpoint = "/api/auth/register-patient";
        body = {
          abhaId: formData.abhaId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        };
      } else {
        endpoint = "/api/auth/register-doctor";
        body = {
          nmcRegistrationNo: formData.nmcRegistrationNo,
          name: formData.name,
          email: formData.email,
          specialization: formData.specialization,
          hospitalId: formData.hospitalId,
          password: formData.password,
        };
      }

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Authentication failed");
      }

      // Store token and redirect
      localStorage.setItem("medchain_token", data.data.token);
      localStorage.setItem("medchain_user", JSON.stringify(data.data.user));

      const userRole = data.data.user.role;
      if (userRole === "doctor") {
        router.push("/doctor/dashboard");
      } else if (userRole === "patient") {
        router.push("/patient/dashboard");
      } else {
        router.push("/admin/doctors");
      }
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B3921] relative overflow-x-hidden font-sans flex flex-col">
      {/* ---- Floating Navbar ---- */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-7xl z-50 bg-white rounded-full px-8 py-4 flex items-center justify-between shadow-2xl">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-black text-[#0B3921] tracking-tight">MedChain</span>
        </Link>

        <div className="hidden md:flex items-center gap-10 text-[#0B3921] text-sm font-semibold">
          <Link href="/" className="hover:opacity-70 transition-opacity">Home</Link>
          <a href="#" className="hover:opacity-70 transition-opacity">About</a>
          <a href="#" className="hover:opacity-70 transition-opacity">Features</a>
          <a href="#" className="hover:opacity-70 transition-opacity">Security</a>
          <a href="#" className="hover:opacity-70 transition-opacity">Contact</a>
        </div>

        <Link 
          href="/login"
          className="bg-[#E6C156] text-[#0B3921] px-8 py-2.5 rounded-full font-bold text-sm shadow-md hover:scale-105 transition-all"
        >
          Join Medchain
        </Link>
      </nav>

      {/* ---- Decorative Orbs ---- */}
      <div className="absolute top-1/2 right-[-10%] w-[600px] h-[600px] bg-[#1E503C] rounded-full blur-[100px] opacity-40 -z-10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#E6C156] rounded-full blur-[100px] opacity-10 -z-10" />

      {/* ---- Page Content ---- */}
      <main className="flex-1 flex items-center justify-center pt-40 pb-20 px-6">
        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Side: Branding / Welcome */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="hidden lg:block space-y-8"
          >
            <div className="space-y-4">
              <span className="font-mono text-[#E6C156] tracking-widest text-sm font-bold uppercase">
                _Secure Your Health Data
              </span>
              <h1 className="text-6xl xl:text-7xl font-bold text-white leading-none">
                {mode === "login" ? "Welcome Back to Your Ledger." : "Join the Medical Revolution."}
              </h1>
              <p className="text-[#A7C0B5] text-xl max-w-md leading-relaxed">
                Connect your medical records to the most secure blockchain network in healthcare.
              </p>
            </div>

            <div className="flex gap-6">
              <div className="w-24 h-48 bg-[#1E503C] rounded-full flex flex-col items-center justify-center gap-6 shadow-inner">
                <Shield className="w-8 h-8 text-[#E6C156]" />
                <div className="w-1.5 h-12 bg-white/10 rounded-full" />
              </div>
              <div className="w-24 h-48 bg-[#E6C156] rounded-full flex flex-col items-center justify-center self-end shadow-2xl">
                <Fingerprint className="w-8 h-8 text-[#0B3921]" />
                <div className="w-1.5 h-12 bg-[#0B3921]/10 rounded-full" />
              </div>
            </div>
          </motion.div>

          {/* Right Side: Auth Form */}
          <div className="w-full max-w-md mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={fadeIn}
                className="space-y-8"
              >
                {/* Headers */}
                <div className="text-center lg:text-left">
                  <h2 className="text-4xl font-bold text-white mb-3">
                    {mode === "login" 
                      ? "Sign In" 
                      : mode === "register-patient" 
                      ? "Create Patient ID" 
                      : "Doctor Registration"}
                  </h2>
                  <p className="text-[#A7C0B5]">
                    Enter your details to access the MedChain ecosystem.
                  </p>
                </div>

                {/* Role Switchers (Only on Login) */}
                {mode === "login" && (
                  <div className="flex p-1.5 bg-[#1E503C] rounded-full border border-white/5 shadow-2xl">
                    {(["patient", "doctor"] as const).map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => updateField("role", role)}
                        className={`flex-1 py-3 rounded-full text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                          formData.role === role
                            ? "bg-white text-[#0B3921] shadow-lg"
                            : "text-[#A7C0B5] hover:text-white"
                        }`}
                      >
                        {role === "doctor" ? <Stethoscope className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                        {role.toUpperCase()}
                      </button>
                    ))}
                  </div>
                )}

                {/* Error Box */}
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm font-medium"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Main Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === "login" && (
                    <div className="space-y-4">
                      <div className="relative group">
                        <input
                          type="text"
                          placeholder={formData.role === "doctor" ? "NMC Number or Email" : "ABHA ID or Email"}
                          value={formData.identifier}
                          onChange={(e) => updateField("identifier", e.target.value)}
                          className="w-full bg-white rounded-full px-8 py-5 text-lg text-black placeholder-[#A7C0B5] focus:outline-none shadow-2xl focus:ring-4 focus:ring-[#E6C156]/20 transition-all font-medium"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {mode.startsWith("register") && (
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Your Full Name"
                        value={formData.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        className="w-full bg-white rounded-full px-8 py-5 text-black placeholder-[#A7C0B5] focus:outline-none shadow-xl transition-all font-medium"
                        required
                      />
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        className="w-full bg-white rounded-full px-8 py-5 text-black placeholder-[#A7C0B5] focus:outline-none shadow-xl transition-all font-medium"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Phone Number"
                        value={formData.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                        className="w-full bg-white rounded-full px-8 py-5 text-black placeholder-[#A7C0B5] focus:outline-none shadow-xl transition-all font-medium"
                        required
                      />
                      {mode === "register-patient" && (
                        <input
                          type="text"
                          placeholder="ABHA ID (XX-XXXX-XXXX-XXXX)"
                          value={formData.abhaId}
                          onChange={(e) => updateField("abhaId", e.target.value)}
                          className="w-full bg-white rounded-full px-8 py-5 text-black placeholder-[#A7C0B5] focus:outline-none shadow-xl transition-all font-medium"
                          required
                        />
                      )}
                      {mode === "register-doctor" && (
                        <>
                          <input
                            type="text"
                            placeholder="NMC Registration No"
                            value={formData.nmcRegistrationNo}
                            onChange={(e) => updateField("nmcRegistrationNo", e.target.value)}
                            className="w-full bg-white rounded-full px-8 py-5 text-black placeholder-[#A7C0B5] focus:outline-none shadow-xl"
                            required
                          />
                          <input
                            type="text"
                            placeholder="Specialization (e.g. Cardiology)"
                            value={formData.specialization}
                            onChange={(e) => updateField("specialization", e.target.value)}
                            className="w-full bg-white rounded-full px-8 py-5 text-black placeholder-[#A7C0B5] focus:outline-none shadow-xl"
                            required
                          />
                        </>
                      )}
                    </div>
                  )}

                  <div className="relative group">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={formData.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      className="w-full bg-white rounded-full px-8 py-5 text-lg text-black placeholder-[#A7C0B5] focus:outline-none shadow-2xl focus:ring-4 focus:ring-[#E6C156]/20 transition-all font-medium"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-6 top-1/2 -translate-y-1/2 text-[#A7C0B5] hover:text-[#0B3921] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-5 rounded-full bg-[#E6C156] text-[#0B3921] font-black text-xl hover:bg-[#d4b045] transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-4 border-[#0B3921]/20 border-t-[#0B3921] rounded-full animate-spin" />
                    ) : (
                      <>
                        {mode === "login" ? "ACCESS LEDGER" : "CLAIM IDENTITY"}
                        <ArrowRight className="w-6 h-6" />
                      </>
                    )}
                  </button>
                </form>

                {/* Footer Switcher */}
                <div className="text-center space-y-4 pt-4">
                  {mode === "login" ? (
                    <>
                      <p className="text-[#A7C0B5] text-sm">Don&apos;t have a MedChain ID?</p>
                      <div className="flex gap-3 justify-center">
                        <button 
                          onClick={() => setMode("register-patient")}
                          className="px-6 py-2.5 rounded-full border border-white/10 text-white text-xs font-bold hover:bg-white/5 transition-all"
                        >
                          PATIENT SIGNUP
                        </button>
                        <button 
                          onClick={() => setMode("register-doctor")}
                          className="px-6 py-2.5 rounded-full border border-white/10 text-white text-xs font-bold hover:bg-white/5 transition-all"
                        >
                          DOCTOR SIGNUP
                        </button>
                      </div>
                    </>
                  ) : (
                    <button 
                      onClick={() => setMode("login")}
                      className="text-[#E6C156] font-bold text-sm tracking-wide hover:underline underline-offset-4"
                    >
                      ALREADY HAVE AN ACCOUNT? SIGN IN
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="mt-auto py-8 text-center border-t border-white/5 mx-6">
        <p className="text-[#A7C0B5] text-xs font-medium tracking-widest uppercase">
          © {new Date().getFullYear()} Medchain Decentralized Ledger • ABDM Indian Healthcare Compliance
        </p>
      </footer>
    </div>
  );
}
