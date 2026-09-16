"use client";

import React, { useState, useEffect } from "react";
import { LeaveRequest, LeaveBalance, LeaveType } from "@/types";
import { leavesApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { formatDate } from "@/lib/utils";
import {
  CalendarDays,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Layers,
  AlertCircle,
  Loader2,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function LeavesView() {
  const { user, role } = useAuth();
  const [activeTab, setActiveTab] = useState<"MY_LEAVES" | "APPROVALS">("MY_LEAVES");
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [myRequests, setMyRequests] = useState<LeaveRequest[]>([]);
  const [teamRequests, setTeamRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Apply Modal state
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedTypeId, setSelectedTypeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [reason, setReason] = useState("");
  const [submittingApply, setSubmittingApply] = useState(false);

  // Review Modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [reviewAction, setReviewAction] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [reviewNote, setReviewNote] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const canApprove = role === "COMPANY_ADMIN" || role === "SUPER_ADMIN" || role === "MANAGER";

  const loadData = async () => {
    setLoading(true);
    try {
      const [typesRes, balRes, myRes] = await Promise.allSettled([
        leavesApi.getTypes(),
        leavesApi.getBalances(),
        leavesApi.getMyLeaves(),
      ]);

      if (typesRes.status === "fulfilled" && typesRes.value?.success) {
        setLeaveTypes(typesRes.value.data || typesRes.value.leaveTypes || []);
      }
      if (balRes.status === "fulfilled" && balRes.value?.success) {
        setBalances(balRes.value.data || balRes.value.balances || []);
      }
      if (myRes.status === "fulfilled" && myRes.value?.success) {
        setMyRequests(myRes.value.data || myRes.value.leaveRequests || []);
      }

      if (canApprove) {
        const teamRes = await leavesApi.getAllLeaves();
        if (teamRes?.success) {
          setTeamRequests(teamRes.data || teamRes.leaveRequests || []);
        }
      }
    } catch (err) {
      console.error("Failed to load leaves:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [canApprove]);

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTypeId || !startDate || !endDate || !reason) {
      toast.error("Please fill all required fields");
      return;
    }

    setSubmittingApply(true);
    try {
      const res = await leavesApi.apply({
        leaveTypeId: selectedTypeId,
        startDate,
        endDate,
        isHalfDay,
        reason,
      });

      if (res?.success) {
        toast.success("Leave application submitted successfully!");
        setApplyModalOpen(false);
        setReason("");
        loadData();
      } else {
        toast.error(res?.message || "Failed to apply for leave");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to apply for leave");
    } finally {
      setSubmittingApply(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    setSubmittingReview(true);
    try {
      const res = await leavesApi.review(selectedRequest.id, {
        status: reviewAction,
        reviewNote: reviewNote || undefined,
      });

      if (res?.success) {
        toast.success(`Leave request marked as ${reviewAction}!`);
        setReviewModalOpen(false);
        setReviewNote("");
        loadData();
      } else {
        toast.error(res?.message || "Failed to review request");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to review request");
    } finally {
      setSubmittingReview(false);
    }
  };

  const pendingApprovals = teamRequests.filter((r) => r.status === "PENDING");

  return (
    <div className="space-y-6">
      {/* Top Banner & Apply CTA */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <CalendarDays className="w-7 h-7 text-indigo-400" />
            Leave Entitlements & Time Off
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track statutory leave quotas, submit time-off applications, and review team requests
          </p>
        </div>

        <button
          onClick={() => {
            if (leaveTypes.length > 0 && !selectedTypeId) {
              setSelectedTypeId(leaveTypes[0].id);
            }
            setApplyModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          Apply for Leave
        </button>
      </div>

      {/* Leave Quota Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {balances.length === 0 ? (
          <>
            <div className="glass-card rounded-2xl p-5 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400">Casual Leave (CL)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
                  Standard
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">12</span>
                <span className="text-xs text-slate-400">/ 12 days remaining</span>
              </div>
            </div>
            <div className="glass-card rounded-2xl p-5 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400">Sick Leave (SL)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                  Paid
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-emerald-400">10</span>
                <span className="text-xs text-slate-400">/ 10 days remaining</span>
              </div>
            </div>
            <div className="glass-card rounded-2xl p-5 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400">Privilege / Earned (EL)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300">
                  Accrued
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-sky-400">15</span>
                <span className="text-xs text-slate-400">/ 15 days remaining</span>
              </div>
            </div>
            <div className="glass-card rounded-2xl p-5 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400">Comp-Off Credit</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                  Rest Day OT
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-amber-400">2</span>
                <span className="text-xs text-slate-400">days accrued</span>
              </div>
            </div>
          </>
        ) : (
          balances.map((b) => (
            <div key={b.id} className="glass-card rounded-2xl p-5 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400">
                  {b.leaveType?.name || "Leave Quota"}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
                  {b.leaveType?.code || "LEAVE"}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">{b.remainingDays}</span>
                <span className="text-xs text-slate-400">/ {b.totalDays} days</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800">
        <button
          onClick={() => setActiveTab("MY_LEAVES")}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition ${
            activeTab === "MY_LEAVES"
              ? "border-indigo-500 text-indigo-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          My Leave Applications ({myRequests.length})
        </button>

        {canApprove && (
          <button
            onClick={() => setActiveTab("APPROVALS")}
            className={`pb-3 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === "APPROVALS"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>Team Approvals</span>
            {pendingApprovals.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                {pendingApprovals.length} Pending
              </span>
            )}
          </button>
        )}
      </div>

      {/* Tab Content: My Leaves */}
      {activeTab === "MY_LEAVES" && (
        <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800 font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Leave Type</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Days</th>
                  <th className="py-3.5 px-4">Reason</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Review Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-500">
                      Loading leave applications...
                    </td>
                  </tr>
                ) : myRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-500">
                      No leave requests submitted yet. Click "Apply for Leave" above.
                    </td>
                  </tr>
                ) : (
                  myRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-semibold text-white">
                        {req.leaveType?.name || "Leave"}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {formatDate(req.startDate)} to {formatDate(req.endDate)}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-indigo-300">
                        {req.totalDays} {req.isHalfDay ? "(Half Day)" : "day(s)"}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">
                        {req.reason}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            req.status === "APPROVED"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : req.status === "REJECTED"
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 italic">
                        {req.reviewNote || "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: Team Approvals */}
      {activeTab === "APPROVALS" && (
        <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800 font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">Leave Type</th>
                  <th className="py-3.5 px-4">Dates</th>
                  <th className="py-3.5 px-4">Days</th>
                  <th className="py-3.5 px-4">Reason</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {teamRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-500">
                      No team leave requests found.
                    </td>
                  </tr>
                ) : (
                  teamRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">
                          {req.employee?.firstName} {req.employee?.lastName}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {req.employee?.department?.name || req.employee?.employeeCode}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-300">
                        {req.leaveType?.name || "Leave"}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {formatDate(req.startDate)} - {formatDate(req.endDate)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-indigo-300">
                        {req.totalDays}d
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">
                        {req.reason}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            req.status === "APPROVED"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : req.status === "REJECTED"
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {req.status === "PENDING" ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedRequest(req);
                                setReviewAction("APPROVED");
                                setReviewModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 transition"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRequest(req);
                                setReviewAction("REJECTED");
                                setReviewModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 transition"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px] italic">Reviewed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      {applyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-[#0f172a] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-400" />
                Apply for Leave
              </h3>
              <button
                onClick={() => setApplyModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Leave Category <span className="text-rose-400">*</span>
                </label>
                <select
                  value={selectedTypeId}
                  onChange={(e) => setSelectedTypeId(e.target.value)}
                  className="w-full glass-input rounded-xl p-2.5 text-xs text-slate-200"
                  required
                >
                  <option value="">Select a category...</option>
                  {leaveTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.code}) - {t.daysAllowed} days quota
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Start Date <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full glass-input rounded-xl p-2.5 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    End Date <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full glass-input rounded-xl p-2.5 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="halfDay"
                  checked={isHalfDay}
                  onChange={(e) => setIsHalfDay(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="halfDay" className="text-xs text-slate-300 font-medium cursor-pointer">
                  This is a Half-Day Leave (0.5 day)
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Reason for Time-Off <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Family function, medical appointment, urgent personal work..."
                  className="w-full glass-input rounded-xl p-3 text-xs resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setApplyModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingApply}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition flex items-center gap-2"
                >
                  {submittingApply && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Submit Application
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">
              {reviewAction === "APPROVED" ? "Approve Leave Request" : "Reject Leave Request"}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Applicant:{" "}
              <span className="font-semibold text-slate-200">
                {selectedRequest.employee?.firstName} {selectedRequest.employee?.lastName}
              </span>{" "}
              ({selectedRequest.totalDays} day(s))
            </p>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Reviewer Note / Feedback
                </label>
                <textarea
                  rows={3}
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder={
                    reviewAction === "APPROVED"
                      ? "e.g. Approved. Please ensure handoff of active tasks."
                      : "e.g. Rejected due to critical project release deadline."
                  }
                  className="w-full glass-input rounded-xl p-3 text-xs resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className={`px-5 py-2 rounded-xl text-white font-semibold text-xs transition ${
                    reviewAction === "APPROVED"
                      ? "bg-emerald-600 hover:bg-emerald-500"
                      : "bg-rose-600 hover:bg-rose-500"
                  }`}
                >
                  {submittingReview ? "Processing..." : `Confirm ${reviewAction}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
