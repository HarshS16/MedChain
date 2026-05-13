"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  Users,
  FileText,
  Activity,
  Shield,
  Bell,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Lock,
  History,
  TrendingUp,
  Pill as PillIcon,
  Stethoscope,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import ChatBot from "../../components/ChatBot";
const sidebarLinks = [
  { href: "/patient/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/patient/history", icon: Activity, label: "Medical History" },
  { href: "/patient/records", icon: FileText, label: "My Records" },
  { href: "/patient/trends", icon: TrendingUp, label: "Trend Analysis" },
  { href: "/patient/medicines", icon: PillIcon, label: "Medicinal Records" },
  { href: "/patient/doctors", icon: Stethoscope, label: "Your Doctors" },
  { href: "/patient/access", icon: Lock, label: "Access Control" },
  { href: "/patient/audit", icon: History, label: "Audit Logs" },
];
export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{
    name: string;
    abhaId: string;
    id: string;
  } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem("medchain_user");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.role !== "patient") {
        router.push("/login");
      }
      setUser(parsed);
    } else {
      router.push("/login");
    }
  }, [router]);
  const handleLogout = () => {
    localStorage.removeItem("medchain_token");
    localStorage.removeItem("medchain_user");
    router.push("/login");
  };
  if (!user) return null;
  return (
    <div className="h-screen overflow-hidden bg-[#F8FAFC] flex font-sans text-slate-800">
      {" "}
      {/* ---- Sidebar ---- */}{" "}
      <aside
        className={`fixed lg:relative z-40 h-screen bg-white shadow-[4px_0_24px_rgba(0,0,0,0.02)] border-r border-slate-100 flex flex-col transition-all duration-300 ${isCollapsed ? "w-20" : "w-72"} ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {" "}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-8 w-6 h-6 bg-white border border-slate-200 rounded-full items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-colors z-50 shadow-sm"
        >
          {" "}
          {isCollapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}{" "}
        </button>{" "}
        {/* Logo */}{" "}
        <div
          className={`p-6 flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}
        >
          {" "}
          <Link
            href="/patient/dashboard"
            className="flex items-center gap-3 overflow-hidden"
          >
            {" "}
            <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
              {" "}
              <Heart className="w-4.5 h-4.5 text-white" />{" "}
            </div>{" "}
            {!isCollapsed && (
              <span className="text-xl font-black whitespace-nowrap text-slate-800 tracking-tight">
                {" "}
                Med<span className="text-indigo-600">Chain</span>{" "}
              </span>
            )}{" "}
          </Link>{" "}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-slate-600"
          >
            {" "}
            <X className="w-5 h-5" />{" "}
          </button>{" "}
        </div>{" "}
        {/* Navigation */}{" "}
        <nav className="flex-1 px-4 space-y-2 py-4 overflow-y-auto">
          {" "}
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                title={isCollapsed ? link.label : undefined}
                className={`flex items-center gap-3 py-3.5 rounded-2xl text-[14px] font-bold transition-all ${isActive ? "bg-indigo-50 text-indigo-600" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"} ${isCollapsed ? "justify-center px-0" : "px-4"}`}
              >
                {" "}
                <link.icon
                  className={`w-5 h-5 shrink-0 ${isActive ? "text-indigo-600" : "text-slate-400"}`}
                />{" "}
                {!isCollapsed && (
                  <span className="whitespace-nowrap">{link.label}</span>
                )}{" "}
              </Link>
            );
          })}{" "}
        </nav>{" "}
        {/* User section */}{" "}
        <div className="p-4 border-t border-slate-100 flex flex-col items-center bg-slate-50">
          {" "}
          <div
            className={`flex items-center w-full gap-3 py-3 rounded-2xl ${isCollapsed ? "bg-transparent justify-center px-0" : "bg-white px-4 hover:shadow-md transition-all shadow-sm border border-slate-100"}`}
          >
            {" "}
            <Link
              href="/patient/profile"
              className="flex items-center gap-3 flex-1 min-w-0"
            >
              {" "}
              <div
                className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold text-[15px] shadow-sm"
                title={user.name}
              >
                {" "}
                {user.name?.charAt(0) || "P"}{" "}
              </div>{" "}
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  {" "}
                  <p className="text-[14px] font-bold text-slate-800 truncate">
                    {user.name}
                  </p>{" "}
                  <p className="text-[11px] font-semibold text-slate-400 truncate tracking-wide">
                    {" "}
                    ABHA: {user.abhaId}{" "}
                  </p>{" "}
                </div>
              )}{" "}
            </Link>{" "}
            {!isCollapsed && (
              <button
                onClick={handleLogout}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Logout"
              >
                {" "}
                <LogOut className="w-4 h-4 shrink-0" />{" "}
              </button>
            )}{" "}
          </div>{" "}
          {isCollapsed && (
            <button
              onClick={handleLogout}
              className="mt-2 p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Logout"
            >
              {" "}
              <LogOut className="w-5 h-5" />{" "}
            </button>
          )}{" "}
        </div>{" "}
      </aside>{" "}
      {/* ---- Mobile overlay ---- */}{" "}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}{" "}
      {/* ---- Main Content ---- */}{" "}
      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden relative">
        {" "}
        {/* Top bar */}{" "}
        <header className="sticky top-0 z-20 bg-white/ backdrop-blur-xl px-8 py-5 flex items-center justify-between border-b border-slate-100">
          {" "}
          <div className="flex items-center gap-4">
            {" "}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-slate-100"
            >
              {" "}
              <Menu className="w-5 h-5" />{" "}
            </button>{" "}
            <div>
              {" "}
              <h1 className="text-[19px] font-black text-slate-800 tracking-tight">
                Patient Portal
              </h1>{" "}
              <p className="text-[13px] text-slate-500 font-medium">
                Welcome
              </p>{" "}
            </div>{" "}
          </div>{" "}
          <div className="flex items-center gap-3 relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-100 transition-all shadow-sm focus:outline-none"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2 w-2 h-2 rounded-full bg-red-500 border border-white" />
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute top-12 right-0 w-80 bg-white border border-slate-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden flex flex-col z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                  <h3 className="font-bold text-slate-800">Notifications</h3>
                  <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">1 NEW</span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  <div className="p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors opacity-100 bg-indigo-50/30">
                    <p className="text-sm font-semibold text-slate-800 mb-0.5">Doctor Access Request</p>
                    <p className="text-xs font-medium text-slate-500">Dr. Sarah Smith requested access to your recent blood test records.</p>
                    <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wider">Just now</p>
                  </div>
                  <div className="p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors opacity-70">
                    <p className="text-sm font-semibold text-slate-800 mb-0.5">AI Analysis Complete</p>
                    <p className="text-xs font-medium text-slate-500">Your uploaded MRI report has been processed and is ready for review.</p>
                    <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wider">2 hrs ago</p>
                  </div>
                  <div className="p-4 hover:bg-slate-50 cursor-pointer transition-colors opacity-70">
                    <p className="text-sm font-semibold text-slate-800 mb-0.5">Consent Expired</p>
                    <p className="text-xs font-medium text-slate-500">The temporary access grant for Dr. John Doe has successfully expired.</p>
                    <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wider">Yesterday</p>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 text-center border-t border-slate-100 text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer transition-colors">
                  View All Activity
                </div>
              </div>
            )}
          </div>
        </header>{" "}
        {/* Page content */} <div className="p-8">{children}</div>{" "}
      </main>{" "}
      <ChatBot />
    </div>
  );
}
