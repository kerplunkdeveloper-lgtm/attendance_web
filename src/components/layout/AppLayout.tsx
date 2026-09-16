"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useAttendance } from "@/context/AttendanceContext";
import {
  LayoutDashboard,
  Clock,
  CalendarDays,
  Receipt,
  Users,
  Building2,
  CalendarRange,
  UserPlus,
  Wallet,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Coffee,
  Menu,
  X,
  Radio,
  Sparkles,
  Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { notificationsApi } from "@/lib/api";
import { NotificationItem } from "@/types";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  roles?: string[];
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, role, logout, switchDemoRole } = useAuth();
  const { todayStatus, checkIn, checkOut, startBreak, endBreak, isActionLoading, isWithinGeofence } = useAttendance();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const res = await notificationsApi.getAll();
        if (res?.success && Array.isArray(res.data)) {
          setNotifications(res.data);
          setUnreadCount(res.data.filter((n: NotificationItem) => !n.isRead).length);
        }
      } catch {
        // ignore
      }
    }
    loadNotifications();
  }, []);

  const navSections: { title: string; items: NavItem[] }[] = [
    {
      title: "Core Workflows",
      items: [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { label: "Smart Punch & Clock", href: "/attendance", icon: Clock },
        { label: "Leave Management", href: "/leaves", icon: CalendarDays },
        { label: "Payroll & Payslips", href: "/payroll", icon: Receipt },
      ],
    },
    {
      title: "Management & Team",
      items: [
        {
          label: "Approvals Inbox",
          href: "/approvals",
          icon: ShieldCheck,
          roles: ["SUPER_ADMIN", "COMPANY_ADMIN", "MANAGER"],
        },
        {
          label: "Employee Directory",
          href: "/employees",
          icon: Users,
          roles: ["SUPER_ADMIN", "COMPANY_ADMIN", "MANAGER"],
        },
        {
          label: "Shifts & Rosters",
          href: "/shifts",
          icon: CalendarRange,
          roles: ["SUPER_ADMIN", "COMPANY_ADMIN", "MANAGER"],
        },
        {
          label: "Candidate Onboarding",
          href: "/onboarding",
          icon: UserPlus,
          roles: ["SUPER_ADMIN", "COMPANY_ADMIN", "MANAGER"],
        },
        {
          label: "Expense Claims",
          href: "/expenses",
          icon: Wallet,
        },
        {
          label: "Overtime & Comp-Off",
          href: "/overtime",
          icon: Layers,
        },
      ],
    },
    {
      title: "Organization & System",
      items: [
        {
          label: "Branches & Geofences",
          href: "/branches",
          icon: Building2,
          roles: ["SUPER_ADMIN", "COMPANY_ADMIN"],
        },
        {
          label: "Reports & Analytics",
          href: "/reports",
          icon: BarChart3,
          roles: ["SUPER_ADMIN", "COMPANY_ADMIN", "MANAGER"],
        },
        {
          label: "Communication Gateway",
          href: "/communication",
          icon: Radio,
          badge: "Live",
          roles: ["SUPER_ADMIN", "COMPANY_ADMIN"],
        },
        {
          label: "Plan & Settings",
          href: "/settings",
          icon: Settings,
          roles: ["SUPER_ADMIN", "COMPANY_ADMIN"],
        },
      ],
    },
  ];

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  const isCheckedIn = todayStatus?.hasCheckedIn && !todayStatus?.hasCheckedOut;
  const isOnBreak = todayStatus?.isOnBreak;

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      {/* Top Demo Persona Banner */}
      <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-indigo-950/80 border-b border-indigo-500/20 px-4 py-1.5 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-slate-200">WorkPulse Production SaaS</span>
          <span className="hidden sm:inline text-slate-400">|</span>
          <span className="hidden sm:inline text-indigo-300 font-medium">
            Organization: {user?.organization?.name || "WorkPulse Global Technologies"}
          </span>
        </div>

        {/* Quick Role Switcher for instant demonstration */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-[11px] text-slate-400 font-medium hidden md:inline">Quick Persona Switch:</span>
          <div className="flex items-center rounded-lg bg-slate-900/80 p-0.5 border border-slate-700/60 text-[11px]">
            <button
              onClick={() => switchDemoRole("ADMIN")}
              className={`px-2.5 py-0.5 rounded-md transition font-medium ${
                role === "COMPANY_ADMIN"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Admin (Alex)
            </button>
            <button
              onClick={() => switchDemoRole("MANAGER")}
              className={`px-2.5 py-0.5 rounded-md transition font-medium ${
                role === "MANAGER"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Manager (Sarah)
            </button>
            <button
              onClick={() => switchDemoRole("EMPLOYEE")}
              className={`px-2.5 py-0.5 rounded-md transition font-medium ${
                role === "EMPLOYEE"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Employee (Michael)
            </button>
          </div>
        </div>
      </div>

      {/* Main Top Header */}
      <header className="sticky top-0 z-40 bg-[#0c1222]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-slate-800/60 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition">
              <div className="w-full h-full bg-[#0c1222] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
                  WorkPulse
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  v2.0 Enterprise
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Quick Header Punch Dial */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <MapPin className={`w-3.5 h-3.5 ${isWithinGeofence ? "text-emerald-400" : "text-amber-400"}`} />
              <span className="font-mono text-[11px]">
                {isCheckedIn ? (isOnBreak ? "On Break" : "Clocked In") : "Clocked Out"}
              </span>
            </div>

            {!isCheckedIn ? (
              <button
                onClick={() => checkIn()}
                disabled={isActionLoading}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition flex items-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Clock In
              </button>
            ) : isOnBreak ? (
              <button
                onClick={endBreak}
                disabled={isActionLoading}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-500 text-white shadow-sm transition flex items-center gap-1"
              >
                <Coffee className="w-3.5 h-3.5" />
                End Break
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={startBreak}
                  disabled={isActionLoading}
                  className="px-2 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                  title="Take a short break"
                >
                  <Coffee className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => checkOut()}
                  disabled={isActionLoading}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow-sm transition"
                >
                  Clock Out
                </button>
              </div>
            )}
          </div>

          {/* Notifications Center */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Drawer */}
            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-2xl p-4 z-50"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-2">
                    <span className="font-semibold text-sm text-slate-200">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-500 py-6 text-center">No notifications at the moment</p>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div
                          key={n.id}
                          className={`p-2.5 rounded-xl text-xs transition border ${
                            n.isRead
                              ? "bg-slate-900/40 border-slate-800/40 text-slate-400"
                              : "bg-indigo-950/30 border-indigo-500/20 text-slate-200"
                          }`}
                        >
                          <div className="font-medium text-slate-200 mb-0.5">{n.title}</div>
                          <div className="text-slate-400 text-[11px] leading-relaxed">{n.message}</div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile Pill */}
          <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-400 text-white font-bold text-xs flex items-center justify-center uppercase shadow">
              {user?.employee?.firstName?.[0] || user?.email?.[0] || "U"}
            </div>
            <div className="hidden xl:block text-left">
              <p className="text-xs font-semibold text-slate-200 truncate max-w-[130px]">
                {user?.employee?.firstName ? `${user.employee.firstName} ${user.employee.lastName || ""}` : user?.email}
              </p>
              <p className="text-[10px] text-indigo-400 font-medium uppercase tracking-wider">{role}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 border-r border-slate-800/80 bg-[#090d16]/70 backdrop-blur-sm p-4 shrink-0">
          <div className="flex-1 space-y-6 overflow-y-auto pr-1">
            {navSections.map((section, idx) => {
              const visibleItems = section.items.filter((item) => {
                if (!item.roles) return true;
                return role && item.roles.includes(role);
              });

              if (visibleItems.length === 0) return null;

              return (
                <div key={idx} className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-1">
                    {section.title}
                  </div>
                  {visibleItems.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                          isActive
                            ? "bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {item.badge}
                          </span>
                        )}
                        {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />}
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Org Subscription Meter Card */}
          <div className="pt-4 border-t border-slate-800/80">
            <div className="p-3 rounded-2xl bg-gradient-to-b from-indigo-950/40 to-slate-900/60 border border-indigo-500/20">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-slate-200">
                  {user?.organization?.subscriptionPlan || "Enterprise Plan"}
                </span>
                <span className="text-[10px] text-emerald-400 font-bold px-1.5 py-0.2 rounded bg-emerald-500/10">
                  Active
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mb-2">
                Workforce Quota: {user?.organization?.maxEmployees || 10} Employees
              </p>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="w-3/5 h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400" />
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="lg:hidden fixed inset-0 z-50 bg-[#090d16]/95 backdrop-blur-xl p-6 flex flex-col"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <span className="text-lg font-bold text-white">Navigation</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-4 space-y-4">
                {navSections.map((sec, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-slate-500 px-2">{sec.title}</p>
                    {sec.items
                      .filter((it) => !it.roles || (role && it.roles.includes(role)))
                      .map((it) => {
                        const Icon = it.icon;
                        return (
                          <Link
                            key={it.href}
                            href={it.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800"
                          >
                            <Icon className="w-4 h-4 text-indigo-400" />
                            <span>{it.label}</span>
                          </Link>
                        );
                      })}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-mesh-radial">
          {children}
        </main>
      </div>
    </div>
  );
}
