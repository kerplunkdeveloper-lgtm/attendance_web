"use client";

import React, { useState, useEffect } from "react";
import { useAttendance, PunchOptions } from "@/context/AttendanceContext";
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
  Briefcase,
  Car,
  Building2,
  Sparkles,
  ShieldCheck,
  Check,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatTime, formatDurationMinutes } from "@/lib/utils";

type WorkMode = "OFFICE" | "WORK_FROM_HOME" | "CLIENT_VISIT" | "TRAVEL";

interface WorkModeItem {
  id: WorkMode;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  badgeClass: string;
}

const WORK_MODES: WorkModeItem[] = [
  {
    id: "OFFICE",
    label: "Office / Shoot",
    sublabel: "Studio / HQ",
    icon: Building2,
    color: "from-indigo-600 to-cyan-500",
    badgeClass: "bg-indigo-500/15 border-indigo-500/30 text-indigo-300",
  },
  {
    id: "WORK_FROM_HOME",
    label: "Work From Home",
    sublabel: "Remote",
    icon: Home,
    color: "from-emerald-600 to-teal-500",
    badgeClass: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
  },
  {
    id: "CLIENT_VISIT",
    label: "Client Visit",
    sublabel: "On-site Meeting",
    icon: Briefcase,
    color: "from-amber-600 to-orange-500",
    badgeClass: "bg-amber-500/15 border-amber-500/30 text-amber-300",
  },
  {
    id: "TRAVEL",
    label: "Travel / Field",
    sublabel: "Transit / Field Work",
    icon: Car,
    color: "from-purple-600 to-pink-500",
    badgeClass: "bg-purple-500/15 border-purple-500/30 text-purple-300",
  },
];

export default function PunchClockCard() {
  const { user } = useAuth();
  const {
    todayStatus,
    currentLocation,
    distanceToBranch,
    checkIn,
    checkOut,
    startBreak,
    endBreak,
    isActionLoading,
    isOnline,
    pendingPunchCount,
    syncStatus,
    lastSyncedAt,
    triggerSync,
  } = useAttendance();

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [selectedWorkMode, setSelectedWorkMode] = useState<WorkMode>("OFFICE");
  const [punchNote, setPunchNote] = useState("");
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"CHECK_IN" | "CHECK_OUT">("CHECK_IN");

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

  const openConfirmModal = (action: "CHECK_IN" | "CHECK_OUT") => {
    setPendingAction(action);
    setConfirmModalOpen(true);
  };

  const handleConfirmPunch = async () => {
    const options: PunchOptions = {
      workMode: selectedWorkMode,
      note: punchNote.trim() || undefined,
    };

    let ok = false;
    if (pendingAction === "CHECK_IN") {
      ok = await checkIn(options);
    } else {
      ok = await checkOut(options);
    }

    if (ok) {
      setConfirmModalOpen(false);
      setPunchNote("");
    }
  };

  const activeModeObj = WORK_MODES.find((m) => m.id === selectedWorkMode) || WORK_MODES[0];
  const ActiveIcon = activeModeObj.icon;

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

      {/* ── Mode Selection Pills Bar ────────────────────────────────────── */}
      <div className="relative z-10 mb-6 p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center justify-between text-xs mb-2.5 px-1">
          <span className="font-bold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Select Today's Work Mode:
          </span>
          <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Location Eligible Anywhere
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {WORK_MODES.map((mode) => {
            const Icon = mode.icon;
            const isSelected = selectedWorkMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => setSelectedWorkMode(mode.id)}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-500/50 scale-[1.01]"
                    : "bg-slate-800/60 border-slate-750 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected ? "bg-indigo-500 text-white" : "bg-slate-700/60 text-slate-400"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold leading-tight truncate">{mode.label}</p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{mode.sublabel}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

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

          {/* Location Eligibility Badge */}
          <div className="mt-4 flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full font-medium border bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
              <Navigation className="w-3.5 h-3.5" />
              <span>Location Verified & Eligible</span>
              {currentLocation && (
                <span className="text-[10px] opacity-80 font-mono">
                  ({currentLocation.latitude.toFixed(2)}, {currentLocation.longitude.toFixed(2)})
                </span>
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
                onClick={() => openConfirmModal("CHECK_IN")}
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
                      <span className="text-[11px] text-emerald-400 font-medium">
                        {activeModeObj.label}
                      </span>
                    </>
                  )}
                </div>
              </motion.button>

              <p className="text-xs text-slate-400 text-center flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                Click button to review & confirm punch
              </p>
            </div>
          ) : isCheckedIn ? (
            <div className="flex flex-col items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => openConfirmModal("CHECK_OUT")}
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
            <p className="text-[11px] font-semibold uppercase text-slate-500 mb-1">Active Work Mode</p>
            <p className="text-sm font-bold text-indigo-400 flex items-center gap-1.5">
              <ActiveIcon className="w-4 h-4 text-indigo-300" />
              {activeModeObj.label}
            </p>
          </div>
        </div>
      </div>

      {/* ── Attendance Confirmation Alert Modal ──────────────────────────── */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-lg bg-[#0c1222] border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-2xl ${
                    pendingAction === "CHECK_IN"
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                  }`}
                >
                  {pendingAction === "CHECK_IN" ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <Clock className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    {pendingAction === "CHECK_IN" ? "Confirm Clock-In" : "Confirm Clock-Out"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Verify work mode and location before recording your attendance
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Confirmation Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                Work Mode for this Punch:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {WORK_MODES.map((mode) => {
                  const Icon = mode.icon;
                  const isSelected = selectedWorkMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setSelectedWorkMode(mode.id)}
                      className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? "bg-indigo-600/25 border-indigo-500 text-white ring-1 ring-indigo-500/50"
                          : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected ? "bg-indigo-500 text-white" : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">{mode.label}</p>
                        <p className="text-[10px] text-slate-400 truncate">{mode.sublabel}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Location & Time Status Box */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  GPS Location Status:
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-[11px]">
                  ✅ Eligible Anywhere
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-300">
                {currentLocation
                  ? `Lat: ${currentLocation.latitude.toFixed(6)} | Lng: ${currentLocation.longitude.toFixed(6)} (Accuracy ±${Math.round(currentLocation.accuracy || 10)}m)`
                  : "Live Geolocation detected and approved"}
              </p>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Timer className="w-3.5 h-3.5 text-indigo-400" />
                  Punch Timestamp:
                </span>
                <span className="text-slate-200 font-mono font-semibold">
                  {currentTime.toLocaleTimeString("en-IN", { hour12: true })}
                </span>
              </div>
            </div>

            {/* Optional Remarks Note */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Remarks / Location Notes (Optional):
              </label>
              <input
                type="text"
                value={punchNote}
                onChange={(e) => setPunchNote(e.target.value)}
                placeholder="e.g., Shoot at ECR Studio 2, Client meeting at DLF, WFH sprint..."
                className="w-full rounded-xl glass-input px-3.5 py-2.5 text-xs text-white"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPunch}
                disabled={isActionLoading}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs text-white shadow-lg transition flex items-center gap-2 ${
                  pendingAction === "CHECK_IN"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-emerald-500/20"
                    : "bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 shadow-rose-500/20"
                } disabled:opacity-50`}
              >
                {isActionLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Recording...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    {pendingAction === "CHECK_IN" ? "Confirm & Clock In" : "Confirm & Clock Out"}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
