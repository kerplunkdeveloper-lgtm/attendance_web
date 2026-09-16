"use client";

import React, { useState, useEffect } from "react";
import { useAttendance } from "@/context/AttendanceContext";
import { useAuth } from "@/context/AuthContext";
import {
  Clock,
  MapPin,
  Coffee,
  CheckCircle2,
  Home,
  AlertCircle,
  Loader2,
  Timer,
  Navigation,
  WifiOff,
  RefreshCw,
  Wifi,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatTime, formatDurationMinutes } from "@/lib/utils";

export default function PunchClockCard() {
  const { user } = useAuth();
  const {
    todayStatus,
    currentLocation,
    distanceToBranch,
    isWithinGeofence,
    checkIn,
    checkOut,
    startBreak,
    endBreak,
    wfhCheckIn,
    isActionLoading,
    isOnline,
    pendingPunchCount,
    syncStatus,
    lastSyncedAt,
    triggerSync,
  } = useAttendance();

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [wfhModalOpen, setWfhModalOpen] = useState(false);
  const [wfhNote, setWfhNote] = useState("");

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isCheckedIn = todayStatus?.hasCheckedIn && !todayStatus?.hasCheckedOut;
  const hasCheckedOut = todayStatus?.hasCheckedOut;
  const isOnBreak = todayStatus?.isOnBreak;
  const isWfh = todayStatus?.isWorkFromHome;

  const branch = user?.employee?.branch;
  const shift = user?.employee?.shift;

  const handleWfhSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await wfhCheckIn(wfhNote || "Remote Work from Home");
    if (success) {
      setWfhModalOpen(false);
      setWfhNote("");
    }
  };

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
      {/* Background soft ambient glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* ── Offline / Sync Status Banner ─────────────────────────────────── */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            key="offline-banner"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative z-20 mb-5 flex items-center gap-3 px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300"
          >
            <WifiOff className="w-4 h-4 shrink-0 text-amber-400" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-amber-300">You are offline</p>
              <p className="text-[11px] text-amber-400/80">
                Punches are saved to this device and will sync automatically when internet returns.
              </p>
            </div>
            {pendingPunchCount > 0 && (
              <span className="shrink-0 px-2 py-0.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
                {pendingPunchCount} pending
              </span>
            )}
          </motion.div>
        )}

        {isOnline && pendingPunchCount > 0 && (
          <motion.div
            key="sync-banner"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative z-20 mb-5 flex items-center gap-3 px-4 py-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300"
          >
            <Wifi className="w-4 h-4 shrink-0 text-indigo-400" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-indigo-300">
                {syncStatus === "syncing" ? "Syncing..." : `${pendingPunchCount} punch${pendingPunchCount > 1 ? "es" : ""} pending sync`}
              </p>
              <p className="text-[11px] text-indigo-400/80">
                {syncStatus === "syncing"
                  ? "Uploading offline punches to server..."
                  : "Tap sync to upload saved offline punches."}
              </p>
            </div>
            <button
              onClick={triggerSync}
              disabled={syncStatus === "syncing"}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-300 text-xs font-semibold transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${syncStatus === "syncing" ? "animate-spin" : ""}`} />
              {syncStatus === "syncing" ? "Syncing" : "Sync Now"}
            </button>
          </motion.div>
        )}

        {isOnline && syncStatus === "synced" && pendingPunchCount === 0 && lastSyncedAt && (
          <motion.div
            key="synced-banner"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative z-20 mb-5 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <p className="text-xs font-semibold">
              All punches synced ·{" "}
              <span className="font-normal opacity-70">
                {lastSyncedAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Left: Real-time Live Clock Dial */}
        <div className="lg:col-span-5 flex flex-col items-center text-center p-4">
          <div className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-2 flex items-center gap-1.5">
            <Timer className="w-3.5 h-3.5 animate-spin" />
            Live Enterprise Timekeeper
          </div>

          <div className="font-mono text-4xl sm:text-5xl font-black tracking-tight text-white mb-2">
            {currentTime.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
            })}
          </div>

          <p className="text-sm font-medium text-slate-400">
            {currentTime.toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>

          {/* Shift Details */}
          <div className="mt-4 px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
            <span className="text-slate-400">Assigned Shift: </span>
            <span className="font-semibold text-slate-200">
              {shift?.name || "General Morning (09:00 - 18:00)"}
            </span>
          </div>

          {/* Geofence Status Badge */}
          <div className="mt-4 flex items-center gap-2 text-xs">
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-medium border ${
                isWithinGeofence
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-400"
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>
                {isWithinGeofence ? "Within Branch Geofence" : "Outside Branch Geofence"}
              </span>
              {distanceToBranch !== null && (
                <span className="text-[11px] opacity-80 font-mono">({distanceToBranch}m away)</span>
              )}
            </div>
          </div>
        </div>

        {/* Center: Big Interactive Action Hub */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-2">
          {!isCheckedIn && !hasCheckedOut ? (
            <div className="flex flex-col items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={checkIn}
                disabled={isActionLoading}
                className="relative w-40 h-40 sm:w-44 sm:h-44 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 p-1.5 shadow-xl shadow-emerald-500/25 flex items-center justify-center group disabled:opacity-50"
              >
                {/* Ripple ring animation */}
                <div className="absolute inset-0 rounded-full border-2 border-emerald-400/40 animate-ripple pointer-events-none" />
                <div className="w-full h-full rounded-full bg-[#0a1420] flex flex-col items-center justify-center transition group-hover:bg-[#0d1d2e]">
                  {isActionLoading ? (
                    <Loader2 className="w-10 h-10 animate-spin text-emerald-400" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-2 group-hover:scale-110 transition" />
                      <span className="text-base font-black tracking-wider text-white uppercase">
                        Clock In
                      </span>
                      <span className="text-[11px] text-emerald-400 font-medium">GPS Geofenced</span>
                    </>
                  )}
                </div>
              </motion.button>

              <button
                onClick={() => setWfhModalOpen(true)}
                className="text-xs font-medium text-slate-400 hover:text-indigo-400 flex items-center gap-1.5 transition"
              >
                <Home className="w-3.5 h-3.5" />
                Working from home today?
              </button>
            </div>
          ) : isCheckedIn ? (
            <div className="flex flex-col items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={checkOut}
                disabled={isActionLoading}
                className="relative w-40 h-40 sm:w-44 sm:h-44 rounded-full bg-gradient-to-tr from-rose-600 via-red-500 to-amber-500 p-1.5 shadow-xl shadow-rose-500/25 flex items-center justify-center group disabled:opacity-50"
              >
                <div className="w-full h-full rounded-full bg-[#1e1014] flex flex-col items-center justify-center transition group-hover:bg-[#281318]">
                  {isActionLoading ? (
                    <Loader2 className="w-10 h-10 animate-spin text-rose-400" />
                  ) : (
                    <>
                      <Clock className="w-12 h-12 text-rose-400 mb-2 group-hover:scale-110 transition" />
                      <span className="text-base font-black tracking-wider text-white uppercase">
                        Clock Out
                      </span>
                      <span className="text-[11px] text-rose-400 font-medium">End Shift</span>
                    </>
                  )}
                </div>
              </motion.button>

              {/* Break toggle button */}
              {isOnBreak ? (
                <button
                  onClick={endBreak}
                  disabled={isActionLoading}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition"
                >
                  <Coffee className="w-4 h-4" />
                  Resume Work (End Break)
                </button>
              ) : (
                <button
                  onClick={startBreak}
                  disabled={isActionLoading}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs flex items-center gap-2 transition"
                >
                  <Coffee className="w-4 h-4 text-amber-400" />
                  Take a Coffee Break
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-base font-bold text-white mb-1">Shift Completed Today</h4>
              <p className="text-xs text-slate-400 max-w-xs">
                You have clocked out for today. See you tomorrow!
              </p>
            </div>
          )}
        </div>

        {/* Right: Today's Metrics Breakdown */}
        <div className="lg:col-span-3 space-y-3">
          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80">
            <p className="text-[11px] font-semibold uppercase text-slate-500 mb-1">Punch In Time</p>
            <p className="text-lg font-bold text-slate-200">
              {todayStatus?.attendance?.checkIn
                ? formatTime(todayStatus.attendance.checkIn)
                : "-- : --"}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80">
            <p className="text-[11px] font-semibold uppercase text-slate-500 mb-1">Punch Out Time</p>
            <p className="text-lg font-bold text-slate-200">
              {todayStatus?.attendance?.checkOut
                ? formatTime(todayStatus.attendance.checkOut)
                : isCheckedIn
                ? "Active Now"
                : "-- : --"}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80">
            <p className="text-[11px] font-semibold uppercase text-slate-500 mb-1">Break Duration</p>
            <p className="text-lg font-bold text-amber-400">
              {formatDurationMinutes(todayStatus?.totalBreakMinutes || 0)}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80">
            <p className="text-[11px] font-semibold uppercase text-slate-500 mb-1">Punch Mode</p>
            <p className="text-sm font-bold text-indigo-400">
              {isWfh ? "Remote (Work From Home)" : "On-Site (Office HQ)"}
            </p>
          </div>
        </div>
      </div>

      {/* WFH Modal */}
      {wfhModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Work From Home Check-In</h3>
                <p className="text-xs text-slate-400">Clock in remotely with manager visibility</p>
              </div>
            </div>

            <form onSubmit={handleWfhSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Remote Work Note / Deliverables for Today
                </label>
                <textarea
                  rows={3}
                  value={wfhNote}
                  onChange={(e) => setWfhNote(e.target.value)}
                  placeholder="e.g. Working on sprint tasks, client meetings, review backlog..."
                  className="w-full rounded-xl glass-input p-3 text-xs resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setWfhModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isActionLoading}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition"
                >
                  {isActionLoading ? "Clocking In..." : "Confirm WFH Punch"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
