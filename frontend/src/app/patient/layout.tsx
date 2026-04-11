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
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

const sidebarLinks = [
  { href: "/patient/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/patient/records", icon: FileText, label: "My Records" },
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
  const [user, setUser] = useState<{ name: string; abhaId: string; id: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

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
    <div className="min-h-screen bg-surface-900 flex">
      {/* ---- Sidebar ---- */}
      <aside
        className={`fixed lg:relative z-40 h-screen bg-surface-800 border-r border-white/[0.06] flex flex-col transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-72"
        } ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-8 w-6 h-6 bg-surface-700 border border-white/[0.1] rounded-full items-center justify-center text-gray-400 hover:text-white hover:bg-surface-600 transition-colors z-50 shadow-lg"
        >
          {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>

        {/* Logo */}
        <div className={`p-6 flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}>
          <Link href="/patient/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-indigo-500 to-teal-400 flex items-center justify-center">
              <Heart className="w-4.5 h-4.5 text-white" />
            </div>
            {!isCollapsed && (
              <span className="text-lg font-bold whitespace-nowrap">
                Med<span className="text-indigo-400">Chain</span>
              </span>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2 py-4 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                title={isCollapsed ? link.label : undefined}
                className={`flex items-center gap-3 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/20"
                    : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                } ${isCollapsed ? "justify-center px-0" : "px-4"}`}
              >
                <link.icon className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span className="whitespace-nowrap">{link.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-white/[0.06] flex flex-col items-center">
          <div className={`flex items-center w-full gap-3 py-3 rounded-xl ${isCollapsed ? "bg-transparent justify-center px-0" : "bg-white/[0.03] px-4"}`}>
            <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-teal-500 flex items-center justify-center text-white font-semibold text-sm" title={user.name}>
              {user.name?.charAt(0) || "P"}
            </div>
            {!isCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    ABHA: {user.abhaId}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-red-400 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                </button>
              </>
            )}
          </div>
          {isCollapsed && (
            <button
               onClick={handleLogout}
               className="mt-2 p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-white/[0.04] transition-colors"
               title="Logout"
             >
               <LogOut className="w-5 h-5" />
             </button>
          )}
        </div>
      </aside>


      {/* ---- Mobile overlay ---- */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ---- Main Content ---- */}
      <main className="flex-1 min-h-screen overflow-auto">
        {/* Top bar */}
        <header className="sticky top-0 z-20 glass-dark px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-semibold">Patient Portal</h1>
              <p className="text-xs text-gray-500">Welcome, {user.name?.split(' ')[0]}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2.5 rounded-xl bg-white/[0.05] text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
