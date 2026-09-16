"use client";

import React, { useState, useEffect } from "react";
import { Attendance, AttendanceStatus } from "@/types";
import { attendanceApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { formatDate, formatTime, formatDurationMinutes } from "@/lib/utils";
import {
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Home,
  UserCheck,
  Plus,
  RefreshCw,
  Edit3,
} from "lucide-react";
import RegularizationModal from "./RegularizationModal";
import { toast } from "sonner";

export default function AttendanceHistoryView() {
  const { user, role } = useAuth();
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);
  const [regularizationModalOpen, setRegularizationModalOpen] = useState<boolean>(false);
  const [adminMarkModalOpen, setAdminMarkModalOpen] = useState<boolean>(false);

  // Admin mark state
  const [adminEmployeeId, setAdminEmployeeId] = useState("");
  const [adminDate, setAdminDate] = useState(new Date().toISOString().split("T")[0]);
  const [adminStatus, setAdminStatus] = useState<AttendanceStatus>("PRESENT");
  const [adminInTime, setAdminInTime] = useState("09:00");
  const [adminOutTime, setAdminOutTime] = useState("18:00");
  const [adminReason, setAdminReason] = useState("");
  const [submittingAdminMark, setSubmittingAdminMark] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await attendanceApi.getMyAttendance();
      if (res?.success && Array.isArray(res.data)) {
        setAttendances(res.data);
      } else if (Array.isArray(res)) {
        setAttendances(res);
      }
    } catch (err: any) {
      console.error("Failed to load attendance logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleAdminMarkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingAdminMark(true);
    try {
      const targetEmp = adminEmployeeId || user?.employee?.id;
      if (!targetEmp) {
        toast.error("Employee ID is required");
        return;
      }
      const res = await attendanceApi.adminMarkAttendance({
        employeeId: targetEmp,
        date: adminDate,
        status: adminStatus,
        checkIn: `${adminDate}T${adminInTime}:00Z`,
        checkOut: `${adminDate}T${adminOutTime}:00Z`,
        reason: adminReason || "Direct Administrative Manual Entry",
      });

      if (res?.success) {
        toast.success("Attendance marked successfully by Admin!");
        setAdminMarkModalOpen(false);
        fetchHistory();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to mark attendance");
    } finally {
      setSubmittingAdminMark(false);
    }
  };

  const filteredLogs = attendances.filter((att) => {
    if (filterStatus === "ALL") return true;
    return att.status === filterStatus;
  });

  const totalPresent = attendances.filter((a) => a.status === "PRESENT" || a.status === "WORK_FROM_HOME").length;
  const totalLate = attendances.filter((a) => a.status === "LATE" || (a.lateMinutes && a.lateMinutes > 0)).length;
  const totalWfh = attendances.filter((a) => a.isWorkFromHome || a.status === "WORK_FROM_HOME").length;
  const totalWorkHours = attendances.reduce((acc, a) => acc + (a.workHours || 0), 0);

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case "PRESENT":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "LATE":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "HALF_DAY":
        return "bg-orange-500/10 text-orange-400 border-orange-500/30";
      case "WORK_FROM_HOME":
        return "bg-sky-500/10 text-sky-400 border-sky-500/30";
      case "ON_LEAVE":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/30";
      case "ABSENT":
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4 border border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 uppercase mb-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Present Days
          </p>
          <p className="text-2xl font-bold text-white">{totalPresent}</p>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 uppercase mb-1 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            Late Clock-Ins
          </p>
          <p className="text-2xl font-bold text-amber-400">{totalLate}</p>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 uppercase mb-1 flex items-center gap-1.5">
            <Home className="w-3.5 h-3.5 text-sky-400" />
            WFH Remote Days
          </p>
          <p className="text-2xl font-bold text-sky-400">{totalWfh}</p>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 uppercase mb-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            Total Hours
          </p>
          <p className="text-2xl font-bold text-indigo-300">{totalWorkHours.toFixed(1)} hrs</p>
        </div>
      </div>

      {/* Control Bar & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-300">Filter By Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="glass-input rounded-xl px-3 py-1.5 text-xs text-slate-200"
          >
            <option value="ALL">All Statuses</option>
            <option value="PRESENT">Present</option>
            <option value="LATE">Late</option>
            <option value="HALF_DAY">Half Day</option>
            <option value="WORK_FROM_HOME">Work From Home</option>
            <option value="ON_LEAVE">On Leave</option>
            <option value="ABSENT">Absent</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchHistory}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition"
            title="Refresh Logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {(role === "COMPANY_ADMIN" || role === "SUPER_ADMIN" || role === "MANAGER") && (
            <button
              onClick={() => setAdminMarkModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 transition shadow"
            >
              <Plus className="w-4 h-4" />
              Manual Mark (Admin)
            </button>
          )}
        </div>
      </div>

      {/* Attendance Logs Table */}
      <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Punch In</th>
                <th className="py-3.5 px-4">Punch Out</th>
                <th className="py-3.5 px-4">Work Hours</th>
                <th className="py-3.5 px-4">Breaks</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Regularization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500">
                    Loading attendance records...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    No attendance logs found for this filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {formatDate(log.date)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {formatTime(log.checkIn)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {formatTime(log.checkOut)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-indigo-300">
                      {log.workHours ? `${log.workHours.toFixed(1)} hrs` : "-"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {log.totalBreakMinutes ? `${log.totalBreakMinutes} mins` : "-"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                          log.status
                        )}`}
                      >
                        {log.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedAttendance(log);
                          setRegularizationModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition inline-flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3 text-indigo-400" />
                        Regularize
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Regularization Modal */}
      <RegularizationModal
        isOpen={regularizationModalOpen}
        attendance={selectedAttendance}
        onClose={() => setRegularizationModalOpen(false)}
        onSuccess={fetchHistory}
      />

      {/* Admin Manual Mark Modal */}
      {adminMarkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Administrative Attendance Override</h3>
            <p className="text-xs text-slate-400 mb-4">
              Directly mark or correct attendance for any employee (bypasses geofence)
            </p>

            <form onSubmit={handleAdminMarkSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Employee ID / Code
                </label>
                <input
                  type="text"
                  value={adminEmployeeId}
                  onChange={(e) => setAdminEmployeeId(e.target.value)}
                  placeholder="Enter Employee UUID or leave empty for self"
                  className="w-full glass-input rounded-xl p-2.5 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={adminDate}
                    onChange={(e) => setAdminDate(e.target.value)}
                    className="w-full glass-input rounded-xl p-2.5 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                  <select
                    value={adminStatus}
                    onChange={(e) => setAdminStatus(e.target.value as AttendanceStatus)}
                    className="w-full glass-input rounded-xl p-2.5 text-xs"
                  >
                    <option value="PRESENT">PRESENT</option>
                    <option value="LATE">LATE</option>
                    <option value="HALF_DAY">HALF_DAY</option>
                    <option value="WORK_FROM_HOME">WORK_FROM_HOME</option>
                    <option value="ON_LEAVE">ON_LEAVE</option>
                    <option value="ABSENT">ABSENT</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">In Time</label>
                  <input
                    type="time"
                    value={adminInTime}
                    onChange={(e) => setAdminInTime(e.target.value)}
                    className="w-full glass-input rounded-xl p-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Out Time</label>
                  <input
                    type="time"
                    value={adminOutTime}
                    onChange={(e) => setAdminOutTime(e.target.value)}
                    className="w-full glass-input rounded-xl p-2.5 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Reason / Note</label>
                <textarea
                  rows={2}
                  value={adminReason}
                  onChange={(e) => setAdminReason(e.target.value)}
                  placeholder="e.g. Official tour, biometric hardware sync issue..."
                  className="w-full glass-input rounded-xl p-2.5 text-xs resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setAdminMarkModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAdminMark}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition"
                >
                  {submittingAdminMark ? "Saving..." : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
