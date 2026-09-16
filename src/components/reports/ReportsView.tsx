"use client";

import React, { useState, useEffect } from "react";
import { reportsApi } from "@/lib/api";
import { formatDate, formatTime } from "@/lib/utils";
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  Home,
  XCircle,
  CalendarDays,
  Printer,
  FileText,
  Search,
  RefreshCw,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import AttendanceReportPdfModal from "./AttendanceReportPdfModal";

export default function ReportsView() {
  const [activeTab, setActiveTab] = useState<"DAILY" | "MONTHLY">("DAILY");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [dailyStatusFilter, setDailyStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [dailyReport, setDailyReport] = useState<any>(null);
  const [monthlyReport, setMonthlyReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // PDF Modal State
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfModalType, setPdfModalType] = useState<"DAILY" | "MONTHLY">("DAILY");

  const loadReports = async () => {
    setLoading(true);
    try {
      const [dailyRes, monthlyRes] = await Promise.allSettled([
        reportsApi.getDaily(selectedDate),
        reportsApi.getMonthly(selectedMonth, selectedYear),
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
  }, [selectedDate, selectedMonth, selectedYear]);

  const handleExportDailyCSV = () => {
    const records = dailyReport?.records || dailyReport?.attendances || [];
    const headers = ["Employee Code", "Name", "Department", "Date", "Status", "Check In", "Check Out", "Work Hours", "Late Minutes"];
    const rows = records.map((a: any) => [
      a.employee?.employeeCode || "WP-EMP",
      `"${a.employee?.firstName || ""} ${a.employee?.lastName || ""}"`.trim(),
      `"${a.employee?.department?.name || "General"}"`,
      selectedDate,
      a.status,
      a.checkIn ? formatTime(a.checkIn) : "-",
      a.checkOut ? formatTime(a.checkOut) : "-",
      a.workHours ? Number(a.workHours).toFixed(1) : "0",
      a.lateMinutes || "0",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e: any[]) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `WorkPulse_Daily_Attendance_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Daily attendance CSV exported successfully!");
  };

  const handleExportMonthlyCSV = () => {
    const reportList = monthlyReport?.report || [];
    const headers = ["Employee Code", "Name", "Department", "Present Days", "Late Days", "Leaves Taken", "Absent Days", "WFH Days", "Total Work Hours", "Overtime Hours"];
    const rows = reportList.map((m: any) => [
      m.employeeCode || "WP-EMP",
      `"${m.name}"`,
      `"${m.department}"`,
      m.presentDays,
      m.lateDays || 0,
      m.approvedLeaveDays || 0,
      m.absentDays || 0,
      m.wfhDays || 0,
      m.totalWorkingHours,
      m.overtimeHours,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e: any[]) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `WorkPulse_Monthly_Attendance_${selectedMonth}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Monthly attendance CSV exported successfully!");
  };

  const openPdfModal = (type: "DAILY" | "MONTHLY") => {
    setPdfModalType(type);
    setPdfModalOpen(true);
  };

  // Filter daily records by tab and search
  const dailyRecords = (dailyReport?.records || dailyReport?.attendances || []).filter((r: any) => {
    const matchesStatus = dailyStatusFilter === "ALL" || r.status === dailyStatusFilter;
    const fullName = `${r.employee?.firstName || ""} ${r.employee?.lastName || ""}`.toLowerCase();
    const code = (r.employee?.employeeCode || "").toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || code.includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Filter monthly records by search
  const monthlyRecords = (monthlyReport?.report || []).filter((m: any) => {
    const fullName = (m.name || "").toLowerCase();
    const code = (m.employeeCode || "").toLowerCase();
    return fullName.includes(searchQuery.toLowerCase()) || code.includes(searchQuery.toLowerCase());
  });

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-indigo-400" />
            Attendance Reports & PDF Generator
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            View & download official PDF registers for daily records (Present, Late, Absent, Leaves) and monthly overall muster rolls
          </p>
        </div>

        {/* View Tab Buttons */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setActiveTab("DAILY")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "DAILY"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Daily Attendance
          </button>
          <button
            onClick={() => setActiveTab("MONTHLY")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "MONTHLY"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Monthly Overall
          </button>
        </div>
      </div>

      {/* Control Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl">
        {/* Date / Month Picker Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {activeTab === "DAILY" ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-300">Select Date:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="glass-input rounded-xl px-3 py-1.5 text-xs text-slate-200 bg-slate-900 border border-slate-700"
              />
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-300">Select Period:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="glass-input rounded-xl px-3 py-1.5 text-xs text-slate-200 bg-slate-900 border border-slate-700"
              >
                {monthNames.map((name, idx) => (
                  <option key={name} value={idx + 1}>
                    {name}
                  </option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="glass-input rounded-xl px-3 py-1.5 text-xs text-slate-200 bg-slate-900 border border-slate-700"
              >
                {[2025, 2026, 2027].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search employee or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 w-48 sm:w-56"
            />
          </div>
        </div>

        {/* Action Buttons: Download PDF & Export CSV */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={loadReports}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => openPdfModal(activeTab)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            {activeTab === "DAILY" ? "View & Download Daily PDF" : "View & Download Monthly PDF"}
          </button>

          <button
            onClick={activeTab === "DAILY" ? handleExportDailyCSV : handleExportMonthlyCSV}
            className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 font-semibold text-xs flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* ── KPI Stat Cards ──────────────────────────────────────────────── */}
      {activeTab === "DAILY" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Present */}
          <button
            type="button"
            onClick={() => setDailyStatusFilter(dailyStatusFilter === "PRESENT" ? "ALL" : "PRESENT")}
            className={`glass-card rounded-2xl p-4 border text-left transition cursor-pointer ${
              dailyStatusFilter === "PRESENT"
                ? "border-emerald-500 bg-emerald-950/20 ring-1 ring-emerald-500/40"
                : "border-slate-800 hover:border-emerald-500/40"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Present</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-black text-white">{dailyReport?.summary?.present ?? 0}</p>
            <span className="text-[10px] text-emerald-400 font-medium">Verified On-Site</span>
          </button>

          {/* Late */}
          <button
            type="button"
            onClick={() => setDailyStatusFilter(dailyStatusFilter === "LATE" ? "ALL" : "LATE")}
            className={`glass-card rounded-2xl p-4 border text-left transition cursor-pointer ${
              dailyStatusFilter === "LATE"
                ? "border-amber-500 bg-amber-950/20 ring-1 ring-amber-500/40"
                : "border-slate-800 hover:border-amber-500/40"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Late Arrivals</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-black text-amber-400">{dailyReport?.summary?.late ?? 0}</p>
            <span className="text-[10px] text-amber-400/80 font-medium">Exceeded Grace</span>
          </button>

          {/* Absent */}
          <button
            type="button"
            onClick={() => setDailyStatusFilter(dailyStatusFilter === "ABSENT" ? "ALL" : "ABSENT")}
            className={`glass-card rounded-2xl p-4 border text-left transition cursor-pointer ${
              dailyStatusFilter === "ABSENT"
                ? "border-rose-500 bg-rose-950/20 ring-1 ring-rose-500/40"
                : "border-slate-800 hover:border-rose-500/40"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Absent</span>
              <XCircle className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-2xl font-black text-rose-400">{dailyReport?.summary?.absent ?? 0}</p>
            <span className="text-[10px] text-rose-400/80 font-medium">Unexcused</span>
          </button>

          {/* On Leave */}
          <button
            type="button"
            onClick={() => setDailyStatusFilter(dailyStatusFilter === "ON_LEAVE" ? "ALL" : "ON_LEAVE")}
            className={`glass-card rounded-2xl p-4 border text-left transition cursor-pointer ${
              dailyStatusFilter === "ON_LEAVE"
                ? "border-indigo-500 bg-indigo-950/20 ring-1 ring-indigo-500/40"
                : "border-slate-800 hover:border-indigo-500/40"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">On Leave</span>
              <CalendarDays className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-black text-indigo-300">{dailyReport?.summary?.onLeave ?? 0}</p>
            <span className="text-[10px] text-slate-400 font-medium">Approved Leaves</span>
          </button>

          {/* WFH */}
          <button
            type="button"
            onClick={() => setDailyStatusFilter(dailyStatusFilter === "WORK_FROM_HOME" ? "ALL" : "WORK_FROM_HOME")}
            className={`glass-card rounded-2xl p-4 border text-left transition cursor-pointer ${
              dailyStatusFilter === "WORK_FROM_HOME"
                ? "border-sky-500 bg-sky-950/20 ring-1 ring-sky-500/40"
                : "border-slate-800 hover:border-sky-500/40"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Remote WFH</span>
              <Home className="w-4 h-4 text-sky-400" />
            </div>
            <p className="text-2xl font-black text-sky-400">{dailyReport?.summary?.wfh ?? 0}</p>
            <span className="text-[10px] text-sky-400/80 font-medium">Telecommute</span>
          </button>

          {/* Total Staff */}
          <button
            type="button"
            onClick={() => setDailyStatusFilter("ALL")}
            className={`glass-card rounded-2xl p-4 border text-left transition cursor-pointer ${
              dailyStatusFilter === "ALL"
                ? "border-slate-600 bg-slate-800/40"
                : "border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Staff</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                {dailyReport?.summary?.attendanceRate ?? 0}% rate
              </span>
            </div>
            <p className="text-2xl font-black text-white">{dailyReport?.summary?.totalEmployees ?? 0}</p>
            <span className="text-[10px] text-indigo-400 font-medium">Show All Rows</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-card rounded-2xl p-4 border border-slate-800">
            <p className="text-[11px] font-semibold text-slate-400 uppercase mb-1">Total Active Workforce</p>
            <p className="text-2xl font-bold text-white">{monthlyReport?.totalEmployees ?? 0}</p>
            <span className="text-[10px] text-slate-400">Employees in payroll</span>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-slate-800">
            <p className="text-[11px] font-semibold text-slate-400 uppercase mb-1">Standard Work Days</p>
            <p className="text-2xl font-bold text-emerald-400">26 Days</p>
            <span className="text-[10px] text-emerald-400/80">Indian Statutory Standard</span>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-slate-800">
            <p className="text-[11px] font-semibold text-slate-400 uppercase mb-1">Total Overtime Hours</p>
            <p className="text-2xl font-bold text-amber-400">
              {(monthlyReport?.report || [])
                .reduce((sum: number, r: any) => sum + parseFloat(r.overtimeHours || 0), 0)
                .toFixed(1)}{" "}
              hrs
            </p>
            <span className="text-[10px] text-amber-400/80">Across all departments</span>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-slate-800">
            <p className="text-[11px] font-semibold text-slate-400 uppercase mb-1">Approved Leaves Taken</p>
            <p className="text-2xl font-bold text-indigo-300">
              {(monthlyReport?.report || []).reduce(
                (sum: number, r: any) => sum + Number(r.approvedLeaveDays || 0),
                0
              )}{" "}
              days
            </p>
            <span className="text-[10px] text-slate-400">CL, SL, EL recorded</span>
          </div>
        </div>
      )}

      {/* ── Table Container ─────────────────────────────────────────────── */}
      <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-white">
              {activeTab === "DAILY"
                ? `Daily Attendance Register (${formatDate(selectedDate)})`
                : `Monthly Overall Muster Roll (${monthNames[selectedMonth - 1]} ${selectedYear})`}
            </h3>
            {activeTab === "DAILY" && dailyStatusFilter !== "ALL" && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                Filtered: {dailyStatusFilter}
              </span>
            )}
          </div>
          <span className="text-xs text-slate-400">
            {activeTab === "DAILY" ? `${dailyRecords.length} records displayed` : `${monthlyRecords.length} staff entries`}
          </span>
        </div>

        <div className="overflow-x-auto">
          {activeTab === "DAILY" ? (
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800 font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Code</th>
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Check In</th>
                  <th className="py-3.5 px-4">Check Out</th>
                  <th className="py-3.5 px-4">Total Hours</th>
                  <th className="py-3.5 px-4">Late (Mins)</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-slate-500">
                      Loading daily attendance register...
                    </td>
                  </tr>
                ) : dailyRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-500">
                      No attendance logs found matching the filter for {formatDate(selectedDate)}.
                    </td>
                  </tr>
                ) : (
                  dailyRecords.map((a: any, idx: number) => {
                    const empName = `${a.employee?.firstName || ""} ${a.employee?.lastName || ""}`.trim() || "Employee";
                    const isLate = a.status === "LATE";
                    const isAbsent = a.status === "ABSENT";
                    const isOnLeave = a.status === "ON_LEAVE";
                    const isPresent = a.status === "PRESENT" || a.status === "WORK_FROM_HOME";

                    return (
                      <tr key={a.id || idx} className="hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-400">
                          {a.employee?.employeeCode || `WP-${100 + idx}`}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-white">
                          {empName}
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          {a.employee?.department?.name || "General"}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-300">
                          {a.checkIn ? formatTime(a.checkIn) : "-"}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-300">
                          {a.checkOut ? formatTime(a.checkOut) : "-"}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-indigo-300">
                          {a.workHours ? `${Number(a.workHours).toFixed(1)} hrs` : "-"}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-amber-400">
                          {a.lateMinutes && a.lateMinutes > 0 ? `${a.lateMinutes} mins` : "-"}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              isPresent
                                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                : isLate
                                ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                                : isAbsent
                                ? "bg-rose-500/15 text-rose-400 border-rose-500/30 font-black"
                                : isOnLeave
                                ? "bg-indigo-500/15 text-indigo-400 border-indigo-500/30"
                                : "bg-slate-800 text-slate-300 border-slate-700"
                            }`}
                          >
                            {a.status?.replace(/_/g, " ")}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800 font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Code</th>
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4 text-center text-emerald-400">Present Days</th>
                  <th className="py-3.5 px-4 text-center text-amber-400">Late Days</th>
                  <th className="py-3.5 px-4 text-center text-indigo-400">Leaves</th>
                  <th className="py-3.5 px-4 text-center text-rose-400">Absent Days</th>
                  <th className="py-3.5 px-4 text-center text-sky-400">WFH</th>
                  <th className="py-3.5 px-4 text-right">Work Hours</th>
                  <th className="py-3.5 px-4 text-right text-indigo-300">OT (hrs)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="text-center py-10 text-slate-500">
                      Loading monthly muster roll...
                    </td>
                  </tr>
                ) : monthlyRecords.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-12 text-slate-500">
                      No monthly attendance summaries found.
                    </td>
                  </tr>
                ) : (
                  monthlyRecords.map((m: any, idx: number) => (
                    <tr key={m.employeeId || idx} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        {m.employeeCode || `WP-${100 + idx}`}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white">
                        {m.name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {m.department}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-emerald-400">
                        {m.presentDays}
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-amber-400">
                        {m.lateDays || 0}
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-indigo-300">
                        {m.approvedLeaveDays || 0}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-rose-400">
                        {m.absentDays ?? Math.max(0, 26 - m.presentDays - (m.approvedLeaveDays || 0))}
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-sky-400">
                        {m.wfhDays || 0}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-200">
                        {m.totalWorkingHours} hrs
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-indigo-400">
                        {m.overtimeHours} hrs
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Printable PDF Modal ─────────────────────────────────────────── */}
      <AttendanceReportPdfModal
        isOpen={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
        type={pdfModalType}
        dailyData={dailyReport}
        monthlyData={monthlyReport}
        selectedDate={selectedDate}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
      />
    </div>
  );
}
