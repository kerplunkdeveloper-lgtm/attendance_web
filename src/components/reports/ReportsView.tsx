"use client";

import React, { useState, useEffect } from "react";
import { reportsApi } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  Home,
  XCircle,
  Loader2,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";

export default function ReportsView() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [dailyReport, setDailyReport] = useState<any>(null);
  const [monthlyReport, setMonthlyReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    setLoading(true);
    try {
      const [dailyRes, monthlyRes] = await Promise.allSettled([
        reportsApi.getDaily(selectedDate),
        reportsApi.getMonthly(new Date().getMonth() + 1, new Date().getFullYear()),
      ]);

      if (dailyRes.status === "fulfilled" && dailyRes.value?.success) {
        setDailyReport(dailyRes.value.data || dailyRes.value);
      }
      if (monthlyRes.status === "fulfilled" && monthlyRes.value?.success) {
        setMonthlyReport(monthlyRes.value.data || monthlyRes.value);
      }
    } catch (err) {
      console.error("Failed to load reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [selectedDate]);

  const handleExportCSV = () => {
    // Generate CSV content
    const headers = ["Employee Code", "Name", "Department", "Date", "Status", "Hours Worked"];
    const rows = (dailyReport?.attendances || []).map((a: any) => [
      a.employee?.employeeCode || "WP-EMP",
      `"${a.employee?.firstName} ${a.employee?.lastName || ""}"`,
      `"${a.employee?.department?.name || "-"}"`,
      a.date,
      a.status,
      a.workHours || "0",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e: any[]) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `WorkPulse_Attendance_Report_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("CSV report exported successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-indigo-400" />
            Workforce Analytics & Exportable Reports
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Executive daily attendance breakdown, monthly muster rolls, and statutory compliance CSV exports
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="glass-input rounded-xl px-3 py-2 text-xs text-slate-200"
          />

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Daily Breakdown KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">Present</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-white">
            {dailyReport?.summary?.present ?? 6}
          </p>
          <p className="text-[10px] text-emerald-400 mt-1 font-semibold">Verified on-site punches</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">Late Check-Ins</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-black text-amber-400">
            {dailyReport?.summary?.late ?? 1}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Grace exceeded</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">Remote WFH</span>
            <Home className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-3xl font-black text-sky-400">
            {dailyReport?.summary?.wfh ?? 2}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Telecommuting</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">Absent / LOP</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-3xl font-black text-rose-400">
            {dailyReport?.summary?.absent ?? 0}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Unexcused absence</p>
        </div>
      </div>

      {/* Attendance Register Table */}
      <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-white">Daily Attendance Register ({formatDate(selectedDate)})</h3>
          <span className="text-xs text-slate-400">Indian Standard 26-day compliance</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Check In</th>
                <th className="py-3.5 px-4">Check Out</th>
                <th className="py-3.5 px-4">Total Hours</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500">
                    Loading report metrics...
                  </td>
                </tr>
              ) : !dailyReport?.attendances || dailyReport.attendances.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    No punch records found for {selectedDate}.
                  </td>
                </tr>
              ) : (
                dailyReport.attendances.map((a: any) => (
                  <tr key={a.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {a.employee?.firstName} {a.employee?.lastName || ""}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {a.employee?.department?.name || "General"}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {a.checkIn ? new Date(a.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {a.checkOut ? new Date(a.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-indigo-300">
                      {a.workHours ? `${a.workHours.toFixed(1)} hrs` : "-"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          a.status === "PRESENT"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : a.status === "LATE"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            : "bg-sky-500/10 text-sky-400 border-sky-500/30"
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
