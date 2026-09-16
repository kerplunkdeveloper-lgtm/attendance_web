"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { attendanceApi, leavesApi, payrollApi, employeesApi } from "@/lib/api";
import PunchClockCard from "@/components/attendance/PunchClockCard";
import UnlockPlanModal from "@/components/auth/UnlockPlanModal";
import {
  Users,
  CheckCircle2,
  Clock,
  Home,
  CalendarDays,
  Receipt,
  TrendingUp,
  Building2,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  MapPin,
  Calendar,
  Lock,
  Key,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function DashboardOverview() {
  const { user, role, refreshUser } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [recentAttendance, setRecentAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  const isPlanLocked = Boolean(user?.planLocked || user?.organization?.planLocked);
  const isAdmin = role === "COMPANY_ADMIN" || role === "SUPER_ADMIN";

  const isAdminOrManager = role === "COMPANY_ADMIN" || role === "SUPER_ADMIN" || role === "MANAGER";

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      try {
        const [summaryRes, historyRes] = await Promise.allSettled([
          attendanceApi.getSummary(),
          attendanceApi.getMyAttendance({ limit: 5 }),
        ]);

        if (summaryRes.status === "fulfilled" && summaryRes.value?.success) {
          setSummary(summaryRes.value.data || summaryRes.value);
        }
        if (historyRes.status === "fulfilled" && historyRes.value?.success) {
          setRecentAttendance(
            Array.isArray(historyRes.value.data) ? historyRes.value.data.slice(0, 5) : []
          );
        }
      } catch (err) {
        console.error("Failed to load dashboard metrics:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const employeeName = user?.employee?.firstName || user?.email?.split("@")[0] || "User";

  return (
    <div className="space-y-8">
      {/* Plan Activation Required Banner */}
      {isPlanLocked && isAdmin && (
        <div className="relative rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-slate-900 border border-amber-500/30 overflow-hidden shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  Plan Pending Activation
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 text-[10px] font-semibold">
                  Action Required
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Your workspace is currently locked. Enter the unlock code sent to{" "}
                <strong className="text-white">{user?.email}</strong> upon registration to enable all enterprise features.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowUnlockModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition flex items-center gap-2"
          >
            <Key className="w-3.5 h-3.5" />
            Enter Unlock Code
          </button>
        </div>
      )}

      {/* Unlock Plan Modal */}
      <UnlockPlanModal
        isOpen={showUnlockModal}
        organizationName={user?.organization?.name}
        onClose={() => setShowUnlockModal(false)}
        onSuccess={async () => {
          setShowUnlockModal(false);
          await refreshUser();
        }}
      />

      {/* Welcome Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-indigo-900/60 via-slate-900/80 to-slate-900 border border-indigo-500/20 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-bold border border-indigo-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                Workforce Intelligence
              </span>
              <span className="text-xs text-slate-400">|</span>
              <span className="text-xs text-slate-300 font-semibold">{user?.organization?.name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Good day, {employeeName}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
              Your geofenced smart workspace is ready. Clock in below to begin your shift or manage your team's approvals.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/leaves"
              className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
            >
              Apply Leave
            </Link>
            <Link
              href="/payroll"
              className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
            >
              View Payslips
            </Link>
            {isAdminOrManager && (
              <Link
                href="/approvals"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition flex items-center gap-1.5"
              >
                Approvals Inbox
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Interactive Live Punch Card */}
      <PunchClockCard />

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">Present Today</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">
              {summary?.presentCount ?? (loading ? "-" : "6")}
            </span>
            <span className="text-xs text-emerald-400 font-semibold">Active at desk</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Geofence verified punches</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">Remote WFH</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <Home className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-sky-400">
              {summary?.wfhCount ?? (loading ? "-" : "2")}
            </span>
            <span className="text-xs text-slate-400">employees</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Manager approved telecommute</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">On Leave / Rest</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-indigo-300">
              {summary?.onLeaveCount ?? (loading ? "-" : "1")}
            </span>
            <span className="text-xs text-slate-400">approved</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Scheduled time off</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">Late Arrivals</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-400">
              {summary?.lateCount ?? (loading ? "-" : "1")}
            </span>
            <span className="text-xs text-amber-400/80 font-semibold">Exceeded grace</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">15 min grace policy check</p>
        </div>
      </div>

      {/* Two Column Layout: Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Quick Workflow Hub */}
        <div className="lg:col-span-7 glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              SaaS Fast-Track Actions
            </h3>
            <span className="text-xs text-slate-400">1-Click Shortcuts</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/attendance"
              className="p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/30 transition group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition" />
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition" />
              </div>
              <div>
                <h4 className="font-semibold text-xs text-white">Punch History & Regularization</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Request missed-punch correction or audit logs
                </p>
              </div>
            </Link>

            <Link
              href="/leaves"
              className="p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/30 transition group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <CalendarDays className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition" />
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition" />
              </div>
              <div>
                <h4 className="font-semibold text-xs text-white">Leave Quotas & Balances</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Check CL, SL, EL remaining and apply
                </p>
              </div>
            </Link>

            <Link
              href="/payroll"
              className="p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/30 transition group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <Receipt className="w-5 h-5 text-sky-400 group-hover:scale-110 transition" />
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-sky-400 transition" />
              </div>
              <div>
                <h4 className="font-semibold text-xs text-white">Formatted Salary Payslips</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Download letterhead PDF with PF/ESI breakdown
                </p>
              </div>
            </Link>

            <Link
              href="/expenses"
              className="p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/30 transition group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-amber-400 group-hover:scale-110 transition" />
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition" />
              </div>
              <div>
                <h4 className="font-semibold text-xs text-white">Reimbursement Claims</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Upload bill receipts for travel, food, supplies
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Right Column: Recent Activity Logs */}
        <div className="lg:col-span-5 glass-card rounded-3xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                Your Recent Logs
              </h3>
              <Link href="/attendance" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {recentAttendance.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">No recent logs recorded yet.</p>
              ) : (
                recentAttendance.map((log, i) => (
                  <div
                    key={log.id || i}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-white">{formatDate(log.date)}</p>
                      <p className="text-[11px] text-slate-400">
                        {log.workHours ? `${log.workHours.toFixed(1)} hrs worked` : "In Progress"}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        log.status === "PRESENT"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : log.status === "LATE"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          : "bg-sky-500/10 text-sky-400 border-sky-500/30"
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Branch GPS Geofence: 250m Radius</span>
            <span className="text-emerald-400 font-semibold">Operational</span>
          </div>
        </div>
      </div>
    </div>
  );
}
