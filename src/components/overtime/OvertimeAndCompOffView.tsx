"use client";

import React, { useState, useEffect } from "react";
import { compOffApi, overtimeApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import {
  Layers,
  Clock,
  Plus,
  CheckCircle2,
  Calendar,
  Sparkles,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

export default function OvertimeAndCompOffView() {
  const [balance, setBalance] = useState<number>(0);
  const [history, setHistory] = useState<any[]>([]);
  const [myOvertimes, setMyOvertimes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Redeem modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [requestedDate, setRequestedDate] = useState("");
  const [days, setDays] = useState(1);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [balRes, histRes, otRes] = await Promise.allSettled([
        compOffApi.getBalance(),
        compOffApi.getHistory(),
        overtimeApi.getMy(),
      ]);

      if (balRes.status === "fulfilled" && balRes.value?.success) {
        setBalance(balRes.value.balanceDays || balRes.value.balance || 0);
      }
      if (histRes.status === "fulfilled" && histRes.value?.success) {
        setHistory(histRes.value.data || histRes.value.history || []);
      }
      if (otRes.status === "fulfilled" && otRes.value?.success) {
        setMyOvertimes(otRes.value.data || otRes.value.overtimes || []);
      }
    } catch (err) {
      console.error("Failed to load comp-off and overtime:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestedDate) {
      toast.error("Please pick a date to redeem comp-off");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await compOffApi.redeem({
        requestedDate,
        days: Number(days),
        reason,
      });

      if (res?.success) {
        toast.success("Comp-off redemption submitted for manager review!");
        confetti({ particleCount: 50, spread: 60 });
        setModalOpen(false);
        setReason("");
        loadData();
      } else {
        toast.error(res?.message || "Failed to redeem comp-off");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to redeem comp-off");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-indigo-400" />
            Comp-Off Ledger & Overtime Accrual
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Automatic credit for working on Sundays and holidays, 100% overtime accumulation, and comp-off redemption
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          Redeem Comp-Off
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 uppercase mb-1 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            Available Comp-Off Credits
          </p>
          <p className="text-3xl font-black text-emerald-400">{balance} Days</p>
          <p className="text-[10px] text-slate-400 mt-1">Ready for redemption</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 uppercase mb-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            Overtime Accrued
          </p>
          <p className="text-3xl font-black text-indigo-300">
            {myOvertimes.reduce((acc, o) => acc + (o.hours || 0), 0)} Hours
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Beyond standard 9 hr shifts</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 uppercase mb-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
            Rest-Day Rule
          </p>
          <p className="text-xl font-bold text-white">Sunday Punches Unblocked</p>
          <p className="text-[10px] text-slate-400 mt-1">100% credited to Overtime & Comp-off</p>
        </div>
      </div>

      {/* History Table */}
      <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800">
          <h3 className="font-bold text-sm text-white">Redemption & Accrual History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Days / Hours</th>
                <th className="py-3.5 px-4">Reason / Notes</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-500">
                    Loading ledger records...
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-500">
                    No redemption records found. Click "Redeem Comp-Off" to request.
                  </td>
                </tr>
              ) : (
                history.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {formatDate(item.requestedDate || item.date || item.createdAt)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
                        Comp-Off Leave
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400">
                      {item.days || 1} day
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">
                      {item.reason || "Sunday rest day compensation"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          item.status === "APPROVED"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : item.status === "REJECTED"
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        }`}
                      >
                        {item.status || "PENDING"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Redeem Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Redeem Comp-Off Leave</h3>
            <p className="text-xs text-slate-400 mb-4">
              Apply earned rest-day credits for a scheduled day off
            </p>

            <form onSubmit={handleRedeem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Date *</label>
                <input
                  type="date"
                  value={requestedDate}
                  onChange={(e) => setRequestedDate(e.target.value)}
                  className="w-full glass-input rounded-xl p-2.5 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Days to Deduct</label>
                <input
                  type="number"
                  min={0.5}
                  max={balance > 0 ? balance : 5}
                  step={0.5}
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full glass-input rounded-xl p-2.5 text-xs"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Available balance: {balance} days
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Reason / Note</label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Taking leave against Sunday client deployment work..."
                  className="w-full glass-input rounded-xl p-3 text-xs resize-none"
                />
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
                  Submit Redemption
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
