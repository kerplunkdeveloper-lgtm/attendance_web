"use client";

import React, { useState, useEffect } from "react";
import { Shift } from "@/types";
import { shiftsApi } from "@/lib/api";
import {
  CalendarRange,
  Clock,
  Plus,
  Users,
  CheckCircle2,
  Calendar,
  Sparkles,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function ShiftsAndRostersView() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Shift Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [graceMinutes, setGraceMinutes] = useState(15);
  const [workingDays, setWorkingDays] = useState("1,2,3,4,5,6"); // Monday to Saturday
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadShifts = async () => {
    setLoading(true);
    try {
      const res = await shiftsApi.list();
      if (res?.success && Array.isArray(res.data)) {
        setShifts(res.data);
      } else if (Array.isArray(res)) {
        setShifts(res);
      }
    } catch (err: any) {
      console.error("Failed to load shifts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShifts();
  }, []);

  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await shiftsApi.create({
        name,
        startTime,
        endTime,
        graceMinutes: Number(graceMinutes),
        workingDays,
      });

      if (res?.success) {
        toast.success("Shift schedule configured successfully!");
        setModalOpen(false);
        setName("");
        loadShifts();
      } else {
        toast.error(res?.message || "Failed to create shift");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to create shift");
    } finally {
      setIsSubmitting(false);
    }
  };

  const daysLabelMap: { [k: string]: string } = {
    "1": "Mon",
    "2": "Tue",
    "3": "Wed",
    "4": "Thu",
    "5": "Fri",
    "6": "Sat",
    "0": "Sun",
  };

  const parseWorkingDays = (daysStr: string) => {
    if (!daysStr) return "Mon - Sat";
    return daysStr
      .split(",")
      .map((d) => daysLabelMap[d.trim()] || d)
      .join(", ");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <CalendarRange className="w-7 h-7 text-indigo-400" />
            Shift Management & Rosters
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Define work hours, grace arrival periods, 6-day week schedules, and automated overtime rules
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          Create Shift Schedule
        </button>
      </div>

      {/* Shifts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-500 mb-2" />
            Loading shift rosters...
          </div>
        ) : shifts.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500">
            No shift rosters configured yet.
          </div>
        ) : (
          shifts.map((s) => (
            <div
              key={s.id}
              className="glass-card rounded-3xl p-6 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Clock className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                    Active Roster
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">{s.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Working Days: <span className="text-slate-200 font-medium">{parseWorkingDays(s.workingDays)}</span>
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Timings:</span>
                    <span className="font-bold text-white">
                      {s.startTime} - {s.endTime}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Grace Arrival:</span>
                    <span className="font-semibold text-amber-400">
                      {s.graceMinutes} minutes
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Monthly Standard:</span>
                    <span className="font-semibold text-emerald-400">26 Days Standard</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Overtime Threshold: &gt; 9 hrs</span>
                <span className="text-indigo-400 font-semibold">Auto-Calculated</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Shift Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0f172a] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Create Shift Schedule</h3>
            <p className="text-xs text-slate-400 mb-4">
              Configure shift working hours, grace period, and working days bitmask
            </p>

            <form onSubmit={handleCreateShift} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Shift Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. General Morning Shift, Night Shift, Weekend Roster"
                  className="w-full glass-input rounded-xl p-2.5 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Start Time *</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full glass-input rounded-xl p-2.5 text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">End Time *</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full glass-input rounded-xl p-2.5 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Grace Minutes *
                  </label>
                  <input
                    type="number"
                    value={graceMinutes}
                    onChange={(e) => setGraceMinutes(Number(e.target.value))}
                    min={0}
                    max={60}
                    className="w-full glass-input rounded-xl p-2.5 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Working Days Bitmask
                  </label>
                  <input
                    type="text"
                    value={workingDays}
                    onChange={(e) => setWorkingDays(e.target.value)}
                    placeholder="1,2,3,4,5,6 (Mon-Sat)"
                    className="w-full glass-input rounded-xl p-2.5 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
