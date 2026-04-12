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
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type AuthMode = "login" | "register-patient" | "register-doctor";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.3 },
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
    role: "doctor" as "patient" | "doctor",
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
    <div className="min-h-screen bg-surface-900 flex">
      {/* ---- Left Panel — Branding ---- */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 hero-mesh" />
        <div className="absolute inset-0 dot-pattern opacity-20" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-teal-400 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">
              Med<span className="text-indigo-400">Chain</span>
            </span>
          </Link>

          <div className="max-w-md">
            <h2 className="text-4xl font-bold leading-tight mb-6">
              Your Medical History.
              <br />
              <span className="gradient-text">Secured on Chain.</span>
            </h2>
            <p className="text-gray-400 leading-relaxed mb-8">
              Access tamper-proof medical records, get AI-powered health
              insights, and take full control of your healthcare data.
            </p>

            <div className="space-y-4">
              {[
                { icon: Shield, text: "End-to-end encrypted records" },
                { icon: Stethoscope, text: "Verified doctor access only" },
                {
                  icon: Users,
                  text: "Patient-controlled data sharing",
                },
              ].map((item) => (
                <div
                  key={item.text}
                  className="flex items-center gap-3 text-sm text-gray-300"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-indigo-400" />
                  </div>
                  {item.text}
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-gray-600">
            ABDM Compliant • DPDPA Ready • NMC Verified
          </p>
        </div>
      </div>

      {/* ---- Right Panel — Form ---- */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link
            href="/"
            className="flex lg:hidden items-center gap-3 mb-10 justify-center"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-teal-400 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">
              Med<span className="text-indigo-400">Chain</span>
            </span>
          </Link>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={fadeIn}
            >
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">
                  {mode === "login"
                    ? "Welcome Back"
                    : mode === "register-patient"
                    ? "Register as Patient"
                    : "Register as Doctor"}
                </h1>
                <p className="text-gray-400">
                  {mode === "login"
                    ? "Sign in to your MedChain account"
                    : "Create your MedChain identity"}
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "login" && (
                  <>
                    {/* Role Switch */}
                    <div className="flex rounded-xl bg-white/[0.05] p-1 mb-6">
                      {(["doctor", "patient"] as const).map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => updateField("role", role)}
                          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                            formData.role === role
                              ? "bg-indigo-600 text-white shadow-lg"
                              : "text-gray-400 hover:text-white"
                          }`}
                        >
                          {role === "doctor" ? (
                            <Stethoscope className="w-4 h-4" />
                          ) : (
                            <Users className="w-4 h-4" />
                          )}
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </button>
                      ))}
                    </div>

                    <InputField
                      icon={<Mail className="w-4 h-4" />}
                      placeholder={
                        formData.role === "doctor"
                          ? "NMC Number or Email"
                          : "ABHA ID or Email"
                      }
                      value={formData.identifier}
                      onChange={(v) => updateField("identifier", v)}
                    />
                  </>
                )}

                {mode.startsWith("register") && (
                  <>
                    <InputField
                      icon={<User className="w-4 h-4" />}
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={(v) => updateField("name", v)}
                    />
                    <InputField
                      icon={<Mail className="w-4 h-4" />}
                      placeholder="Email Address"
                      type="email"
                      value={formData.email}
                      onChange={(v) => updateField("email", v)}
                    />
                    <InputField
                      icon={<Phone className="w-4 h-4" />}
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={(v) => updateField("phone", v)}
                    />
                  </>
                )}

                {mode === "register-patient" && (
                  <InputField
                    icon={<CreditCard className="w-4 h-4" />}
                    placeholder="ABHA ID (XX-XXXX-XXXX-XXXX)"
                    value={formData.abhaId}
                    onChange={(v) => updateField("abhaId", v)}
                  />
                )}

                {mode === "register-doctor" && (
                  <>
                    <InputField
                      icon={<CreditCard className="w-4 h-4" />}
                      placeholder="NMC Registration Number"
                      value={formData.nmcRegistrationNo}
                      onChange={(v) => updateField("nmcRegistrationNo", v)}
                    />
                    <InputField
                      icon={<Stethoscope className="w-4 h-4" />}
                      placeholder="Specialization"
                      value={formData.specialization}
                      onChange={(v) => updateField("specialization", v)}
                    />
                    <InputField
                      icon={<Building2 className="w-4 h-4" />}
                      placeholder="Hospital ID"
                      value={formData.hospitalId}
                      onChange={(v) => updateField("hospitalId", v)}
                    />
                  </>
                )}

                {/* Password */}
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    className="w-full pl-11 pr-12 py-3.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-semibold hover:from-indigo-500 hover:to-indigo-400 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {mode === "login" ? "Sign In" : "Create Account"}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Mode Switchers */}
              <div className="mt-8 space-y-3 text-center">
                {mode === "login" ? (
                  <>
                    <p className="text-sm text-gray-500">
                      Don&apos;t have an account?
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setMode("register-patient")}
                        className="flex-1 py-3 rounded-xl border border-white/[0.08] text-sm text-gray-300 hover:bg-white/[0.05] hover:border-indigo-500/30 transition-all flex items-center justify-center gap-2"
                      >
                        <Users className="w-4 h-4" />
                        As Patient
                      </button>
                      <button
                        onClick={() => setMode("register-doctor")}
                        className="flex-1 py-3 rounded-xl border border-white/[0.08] text-sm text-gray-300 hover:bg-white/[0.05] hover:border-teal-500/30 transition-all flex items-center justify-center gap-2"
                      >
                        <Stethoscope className="w-4 h-4" />
                        As Doctor
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => setMode("login")}
                    className="text-sm text-gray-400 hover:text-indigo-400 transition-colors flex items-center gap-1 mx-auto"
                  >
                    Already have an account? Sign In
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ---- Reusable Input Component ----
function InputField({
  icon,
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
        {icon}
      </div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
        required
      />
    </div>
  );
}
