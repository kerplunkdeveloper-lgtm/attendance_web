"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import {
  Sparkles,
  Shield,
  MapPin,
  Clock,
  WifiOff,
  Wifi,
  Receipt,
  Users,
  CheckCircle2,
  ArrowRight,
  Lock,
  Smartphone,
  Calendar,
  Layers,
  ChevronRight,
  KeyRound,
  FileCheck,
  TrendingUp,
  Award,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "ANNUAL">("MONTHLY");

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const plans = [
    {
      id: "FREE_TRIAL",
      name: "Free Trial",
      badge: "14 Days Full Access",
      priceMonthly: 0,
      priceAnnual: 0,
      description: "Experience all enterprise features for up to 10 employees at zero cost.",
      features: [
        "Up to 10 Employees",
        "1 Branch GPS Geofence",
        "Live & Offline Punch Clock",
        "Leave & Shift Approvals",
        "Automated Payslips",
        "Email Support",
      ],
      popular: false,
      cta: "Start 14-Day Free Trial",
    },
    {
      id: "STARTER",
      name: "Starter",
      badge: "For Growing Teams",
      priceMonthly: 29,
      priceAnnual: 24,
      description: "Essential attendance and geofence tracking for growing small businesses.",
      features: [
        "Up to 25 Employees",
        "2 Branch Locations",
        "Smart GPS Geofencing (300m)",
        "Shift Schedules & Grace Period",
        "Full Payroll & CTC Breakdown",
        "Email Unlock Code Activation",
        "Standard Support",
      ],
      popular: false,
      cta: "Get Started with Starter",
    },
    {
      id: "PROFESSIONAL",
      name: "Professional",
      badge: "Most Popular",
      priceMonthly: 79,
      priceAnnual: 65,
      description: "Complete workforce platform with shift overrides, comp-off, overtime, and payroll.",
      features: [
        "Up to 100 Employees",
        "10 Branch Locations",
        "Shift Scheduling & Day Overrides",
        "Overtime Approval Gateways",
        "Comp-Off Balance Ledger",
        "Full Statutory Payroll Engine",
        "Offline-First Attendance Sync",
        "Priority 24/7 Support",
      ],
      popular: true,
      cta: "Choose Professional",
    },
    {
      id: "ENTERPRISE",
      name: "Enterprise",
      badge: "For Large Organizations",
      priceMonthly: 199,
      priceAnnual: 160,
      description: "Unlimited power, multi-branch geofencing, custom policies, and dedicated support.",
      features: [
        "Unlimited Employees (1000+)",
        "Unlimited Branch Locations",
        "Custom Org Policy Engine",
        "Biometric Hardware Sync",
        "Multi-Tier Approval Routing",
        "Custom RBAC Roles & Permissions",
        "Dedicated Account Manager",
        "99.9% Uptime SLA",
      ],
      popular: false,
      cta: "Contact Enterprise",
    },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 relative overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* Soft Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-sky-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-10 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* ─── Navigation Header ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#090d16]/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition">
              <div className="w-full h-full bg-[#0c1222] rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition duration-300" />
              </div>
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                WorkPulse
                <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                  PRO
                </span>
              </span>
              <span className="text-[10px] text-slate-400 tracking-wider block uppercase font-medium">
                Workforce Intelligence
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
            <a href="#features" className="hover:text-white transition">
              Features
            </a>
            <a href="#offline" className="hover:text-white transition flex items-center gap-1.5">
              Offline Mode
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold">
                NEW
              </span>
            </a>
            <a href="#pricing" className="hover:text-white transition">
              Pricing Plans
            </a>
            <a href="#security" className="hover:text-white transition">
              Security & Geofencing
            </a>
          </nav>

          {/* User Auth Buttons */}
          <div className="flex items-center gap-3">
            {token && user ? (
              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition flex items-center gap-2"
              >
                Go to Workspace
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition flex items-center gap-1.5"
                >
                  Start Free Trial
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ─── Hero Section ─────────────────────────────────────────────────── */}
      <section className="relative pt-16 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold mb-6"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Enterprise GPS Geofencing · Offline-First Sync · Statutory Payroll</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-[1.1]"
        >
          The Complete{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-purple-400">
            Workforce Operating System
          </span>{" "}
          for Modern Teams.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 text-sm sm:text-base lg:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed"
        >
          Eliminate buddy punching with strict GPS boundary validation. Keep teams clocking in even
          without internet via device-level IndexedDB synchronization. Automate CTC breakdowns,
          statutory deductions, and email invitations effortlessly.
        </motion.p>

        {/* Hero CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            href="/register"
            className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition flex items-center gap-2 transform hover:-translate-y-0.5"
          >
            Create Organization Free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="px-6 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-sm shadow-lg transition flex items-center gap-2"
          >
            Live Workspace Sign In
          </Link>
        </motion.div>

        {/* ─── Interactive Live Preview Card ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-14 max-w-4xl mx-auto rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-slate-900/90 to-[#0c1222]/90 border border-indigo-500/30 shadow-2xl relative overflow-hidden text-left"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Live Geofence Radar · HQ Branch
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                12m to Branch Center (Within 300m Radius)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-indigo-400" />
                Auto-Sync Ready
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5">
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                Offline Mode Supported
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            {/* Clock Widget */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  Real-time Timekeeper
                </div>
                <div className="font-mono text-3xl font-black text-white">
                  {currentTime.toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true,
                  })}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Assigned Shift: General (09:00 - 18:00)
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Status</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Ready to Punch
                </span>
              </div>
            </div>

            {/* GPS Geofence Widget */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  GPS Coordinate Lock
                </div>
                <div className="text-sm font-bold text-white mt-1">11.9344° N, 79.8358° E</div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Hardware Accuracy: ±12m · Anti-spoofing verified
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Boundary Status</span>
                <span className="text-emerald-400 font-bold">Authorized</span>
              </div>
            </div>

            {/* Offline Engine Widget */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  IndexedDB Queue Engine
                </div>
                <div className="text-sm font-bold text-white mt-1">0 Pending Punches</div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Punches survive offline drops and sync with original time
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Sync Pipeline</span>
                <span className="text-indigo-400 font-bold">Active & Hot</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── Core Features Section ────────────────────────────────────────── */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            Enterprise Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-2">
            Built for Accurate Attendance, Compliance & Peace of Mind.
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-3">
            Every feature is engineered to eliminate leakage, keep employees informed, and simplify
            administration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-110 transition">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Smart GPS Geofencing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Restrict clock-ins to exact geographical coordinates. Configure customizable radii per
              branch with automated geofence bypass audits and device verification.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition group">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-5 group-hover:scale-110 transition">
              <WifiOff className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Offline-First Sync Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Network dropped in basements or remote sites? Punches store in browser IndexedDB with
              exact timestamps and auto-sync to the server the second connection returns.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 transition group">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-5 group-hover:scale-110 transition">
              <Receipt className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Statutory Payroll Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Full salary calculations incorporating overtime, comp-off credits, lop deductions,
              statutory PF & ESI formulas, and instant one-click payslip generation.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-110 transition">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Dynamic Rosters & Shifts</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Grace periods, rotational rosters, shift swaps, and per-day shift overrides. Rest-day
              punches automatically trigger overtime compensation gateways.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition group">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-5 group-hover:scale-110 transition">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">1-Click Employee Invitation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Invite employees via email. The system generates secure temporary credentials, emails the
              login link, and requires a permanent password setup on their first sign-in.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-rose-500/40 transition group">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-5 group-hover:scale-110 transition">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Secure Plan Unlock Keys</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upon organization registration, admins receive a unique cryptographic unlock code by
              email (format: WP-XXXX-XXXX-XXXX) to unlock their company dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Offline Mode Showcase ────────────────────────────────────────── */}
      <section id="offline" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-indigo-950/70 via-slate-900/90 to-slate-900 border border-indigo-500/30 relative overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold mb-4">
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                Zero Connectivity Tolerance
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-snug">
                Attendance Never Fails — Even When the Internet Does.
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-4 leading-relaxed">
                Factory basements, warehouse deadzones, or sudden carrier outages won't disrupt your
                operations. WorkPulse records clock-ins locally with millisecond-exact timestamps and
                synchronizes in chronological order as soon as network returns.
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>IndexedDB browser queue prevents data loss on tab close or refresh</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Exact original punch time honored by server (no unfair late marks)</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Duplicate punch deduplication prevents double check-ins</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-300">Offline Queue Visualizer</span>
                <span className="text-[11px] text-indigo-400 font-mono">POST /api/attendance/sync-offline</span>
              </div>
              <div className="space-y-2 font-mono text-xs">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center justify-between">
                  <span>[OFFLINE PUNCH] CHECK_IN @ 09:02:14 AM</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 font-bold">QUEUED</span>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center justify-between">
                  <span>[OFFLINE PUNCH] BREAK_START @ 01:15:30 PM</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 font-bold">QUEUED</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center justify-between">
                  <span>[ONLINE EVENT] Auto-sync dispatched 2 punches</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 font-bold">SYNCED ✅</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Pricing Plans Section ────────────────────────────────────────── */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            Predictable Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-2">
            Plans Tailored to Every Stage of Growth.
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-3">
            All plans include full geofencing, leave tracking, mobile integration, and email unlock code.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="mt-6 inline-flex items-center p-1 rounded-2xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setBillingCycle("MONTHLY")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                billingCycle === "MONTHLY"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle("ANNUAL")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                billingCycle === "ANNUAL"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Annual Billing
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((p) => {
            const price = billingCycle === "MONTHLY" ? p.priceMonthly : p.priceAnnual;
            return (
              <div
                key={p.id}
                className={`rounded-3xl p-6 flex flex-col justify-between transition relative ${
                  p.popular
                    ? "bg-gradient-to-b from-indigo-950/80 to-slate-900 border-2 border-indigo-500 shadow-2xl shadow-indigo-500/20"
                    : "bg-slate-900/60 border border-slate-800 hover:border-slate-700"
                }`}
              >
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-500 text-white text-[10px] font-extrabold uppercase tracking-wider shadow">
                    Most Popular
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-white">{p.name}</h3>
                    <span className="text-[10px] font-semibold text-slate-400">{p.badge}</span>
                  </div>

                  <div className="mb-4">
                    <span className="text-3xl font-black text-white">${price}</span>
                    <span className="text-xs text-slate-400"> / month</span>
                  </div>

                  <p className="text-xs text-slate-400 mb-6 leading-relaxed">{p.description}</p>

                  <div className="space-y-2.5 pb-6 border-b border-slate-800/80">
                    {p.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <Link
                    href={`/register?plan=${p.id}`}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                      p.popular
                        ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25"
                        : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                    }`}
                  >
                    {p.cta}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Security & Geofence Assurance ────────────────────────────────── */}
      <section id="security" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center sm:text-left">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Bank-Grade Data Security</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Encrypted with bcrypt and JSON Web Tokens. Device-level authentication tokens and
                isolated organization multi-tenancy.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Mobile & Web Parity</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Admins and managers command operations via web. Field staff and employees clock in
                via responsive web or WorkPulse companion app.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Statutory Labor Compliance</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Fully compliant with Indian Factories Act and Shops & Establishment Act rules for
                overtime, minimum rest, and PF/ESI calculations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800/80 bg-[#060911] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-white">WorkPulse Technologies Inc.</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <Link href="/login" className="hover:text-white transition">
              Sign In
            </Link>
            <Link href="/register" className="hover:text-white transition">
              Start Free Trial
            </Link>
            <a href="#features" className="hover:text-white transition">
              Features
            </a>
            <a href="#pricing" className="hover:text-white transition">
              Pricing
            </a>
          </div>

          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} WorkPulse. All rights reserved. Geofenced Enterprise Attendance.
          </p>
        </div>
      </footer>
    </div>
  );
}
