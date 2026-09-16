"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/context/AuthContext";
import EmployeeDocumentsView from "@/components/employees/EmployeeDocumentsView";
import {
  User,
  FileCheck2,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Shield,
  Loader2,
  Clock,
  CheckCircle2,
  UserMinus,
  AlertTriangle,
  FileText,
  Calendar,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { offboardingApi } from "@/lib/api";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"DOCUMENTS" | "PROFILE" | "EXIT">("DOCUMENTS");

  // Exit & Resignation state
  const [myExit, setMyExit] = useState<any>(null);
  const [exitLoading, setExitLoading] = useState(false);
  const [resignationReason, setResignationReason] = useState("");
  const [preferredLwd, setPreferredLwd] = useState("");
  const [employeeComments, setEmployeeComments] = useState("");
  const [isSubmittingResignation, setIsSubmittingResignation] = useState(false);

  const loadMyExit = async () => {
    setExitLoading(true);
    try {
      const res = await offboardingApi.getMyExit();
      if (res?.success && res.data) {
        setMyExit(res.data);
      } else {
        setMyExit(null);
      }
    } catch {
      setMyExit(null);
    } finally {
      setExitLoading(false);
    }
  };

  useEffect(() => {
    if (user?.employee) {
      loadMyExit();
    }
  }, [user]);

  const handleResignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resignationReason.trim()) {
      toast.error("Please provide a reason for resignation");
      return;
    }

    setIsSubmittingResignation(true);
    try {
      const res = await offboardingApi.initiate({
        exitType: "RESIGNATION",
        reason: resignationReason,
        preferredLastWorkingDate: preferredLwd || undefined,
        employeeComments,
        noticePeriodDays: 30,
      });

      if (res?.success) {
        toast.success("Resignation submitted to HR. Clearances initiated.");
        setResignationReason("");
        setPreferredLwd("");
        setEmployeeComments("");
        loadMyExit();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit resignation");
    } finally {
      setIsSubmittingResignation(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
          <p className="text-sm">Loading employee profile...</p>
        </div>
      </AppLayout>
    );
  }

  const employee = user?.employee;
  const isSuperOrAdmin = ["SUPER_ADMIN", "COMPANY_ADMIN", "MANAGER"].includes(user?.role || "");

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Header Profile Hero Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 bg-gradient-to-r from-[#090d16] via-indigo-950/30 to-[#090d16] shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 to-sky-400 text-white font-black text-3xl flex items-center justify-center shadow-xl border border-white/10 shrink-0">
                {employee?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl font-black text-white">
                    {employee?.firstName
                      ? `${employee.firstName} ${employee.lastName || ""}`
                      : user?.email?.split("@")[0]}
                  </h1>
                  {employee?.employeeCode && (
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {employee.employeeCode}
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 uppercase tracking-wider">
                    {user?.role}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-2 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    {user?.email}
                  </span>
                  {employee?.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      {employee.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    {employee?.department?.name || "Corporate"} • {employee?.branch?.name || "Main HQ"}
                  </span>
                </div>
              </div>
            </div>

            {/* Tab navigation pills */}
            <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto">
              <button
                onClick={() => setActiveTab("DOCUMENTS")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeTab === "DOCUMENTS"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <FileCheck2 className="w-4 h-4" />
                Employee Documents
              </button>
              <button
                onClick={() => setActiveTab("PROFILE")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeTab === "PROFILE"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <User className="w-4 h-4" />
                Profile Info
              </button>
              <button
                onClick={() => setActiveTab("EXIT")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeTab === "EXIT"
                    ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <UserMinus className="w-4 h-4" />
                Exit & Separation
              </button>
            </div>
          </div>
        </div>

        {/* Tab Body */}
        {activeTab === "DOCUMENTS" ? (
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 bg-[#090d16]/80 shadow-2xl">
            {employee ? (
              <EmployeeDocumentsView
                employeeId={employee.id}
                employeeName={`${employee.firstName} ${employee.lastName || ""}`.trim()}
                employeeCode={employee.employeeCode}
                isCurrentUserAdmin={isSuperOrAdmin}
              />
            ) : (
              <div className="text-center py-16 text-slate-400">
                <FileCheck2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white mb-1">No Linked Employee Record Found</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Your administrator account is not linked to a specific staff record. Go to the{" "}
                  <a href="/employees" className="text-indigo-400 underline font-bold">
                    Employee Directory
                  </a>{" "}
                  to view and verify all workforce documents.
                </p>
              </div>
            )}
          </div>
        ) : activeTab === "EXIT" ? (
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 bg-[#090d16]/80 shadow-2xl space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <UserMinus className="w-5 h-5 text-rose-400" />
                Employee Separation & Resignation Lifecycle
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Submit resignation notice, track departmental clearances, and review Full & Final settlement.
              </p>
            </div>

            {exitLoading ? (
              <div className="py-12 text-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin text-rose-500 mx-auto mb-2" />
                <p className="text-xs">Loading separation records...</p>
              </div>
            ) : myExit ? (
              <div className="space-y-6">
                {/* Active Exit Status Banner */}
                <div className="glass-card rounded-2xl p-5 border border-amber-500/30 bg-amber-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                      Current Stage: {myExit.status.replace(/_/g, " ")}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1.5">
                      Separation Request in Progress
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Submitted on <strong>{formatDate(myExit.resignationDate)}</strong> • Notice:{" "}
                      <strong>{myExit.noticePeriodDays} Days</strong>
                    </p>
                    <p className="text-xs text-indigo-300 mt-0.5">
                      Approved Last Working Day (LWD):{" "}
                      <strong>
                        {myExit.approvedLastWorkingDate
                          ? formatDate(myExit.approvedLastWorkingDate)
                          : "Awaiting HR Review"}
                      </strong>
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-400">Clearances Completed</p>
                    <p className="text-2xl font-black text-white mt-0.5">
                      {myExit.metrics?.clearedCount} / {myExit.metrics?.totalClearances}
                    </p>
                    <div className="w-32 bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden ml-auto">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{ width: `${myExit.metrics?.clearanceProgress || 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Clearances Table */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-white">Your Handover Clearances</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {myExit.clearances?.map((c: any) => (
                      <div
                        key={c.id}
                        className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-200">{c.itemName}</p>
                          <p className="text-[10px] text-slate-400 uppercase">{c.department.replace(/_/g, " ")}</p>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            c.status === "CLEARED" || c.status === "WAIVED"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Final Settlement if calculated */}
                {myExit.finalSettlement && (
                  <div className="glass-card rounded-2xl p-5 border border-indigo-500/30 bg-indigo-950/20 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-indigo-300 uppercase">Calculated Full & Final Settlement</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Status: <strong className="text-white">{myExit.finalSettlement.status}</strong>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-white font-mono">
                        ₹{Number(myExit.finalSettlement.netPayable).toLocaleString("en-IN")}
                      </p>
                      <p className="text-[10px] text-slate-400">Net Separation Amount</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleResignSubmit} className="max-w-xl space-y-4 text-xs">
                <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <AlertTriangle className="w-4 h-4" />
                    Voluntary Separation Notice
                  </div>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    Submitting this form initiates standard organizational separation protocols. The mandatory notice
                    period is 30 days. You will be scheduled for an exit interview and handover checklist with your manager.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Reason for Resignation *</label>
                  <textarea
                    value={resignationReason}
                    onChange={(e) => setResignationReason(e.target.value)}
                    rows={3}
                    required
                    placeholder="Please share the reason for your departure..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Preferred Last Working Day</label>
                  <input
                    type="date"
                    value={preferredLwd}
                    onChange={(e) => setPreferredLwd(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Subject to HR and management approval.</p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Feedback / Handover Notes</label>
                  <textarea
                    value={employeeComments}
                    onChange={(e) => setEmployeeComments(e.target.value)}
                    rows={2}
                    placeholder="Any comments regarding KT or project dependencies..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingResignation}
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/25 flex items-center gap-2"
                >
                  {isSubmittingResignation && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Submit Resignation Notice
                </button>
              </form>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card rounded-3xl p-6 border border-slate-800 bg-[#090d16]/80 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <Briefcase className="w-4 h-4 text-indigo-400" />
                Employment & Role Details
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/50">
                  <span className="text-slate-400">System User ID:</span>
                  <span className="text-slate-300 font-mono text-[11px]">{user?.id}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/50">
                  <span className="text-slate-400">Employee Code:</span>
                  <span className="text-indigo-300 font-mono font-bold">{employee?.employeeCode || "N/A"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/50">
                  <span className="text-slate-400">Department:</span>
                  <span className="text-slate-200 font-medium">{employee?.department?.name || "Corporate Operations"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/50">
                  <span className="text-slate-400">Work Location / Branch:</span>
                  <span className="text-slate-200 font-medium">{employee?.branch?.name || "Main Headquarters"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/50">
                  <span className="text-slate-400">Shift Schedule:</span>
                  <span className="text-slate-200 font-medium">{employee?.shift?.name || "Standard Day Shift"}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Account Role:</span>
                  <span className="text-indigo-400 font-semibold">{user?.role}</span>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-3xl p-6 border border-slate-800 bg-[#090d16]/80 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <Shield className="w-4 h-4 text-emerald-400" />
                Statutory Compliance & Security
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/50">
                  <span className="text-slate-400">Employment Status:</span>
                  <span className="text-emerald-400 font-bold">{employee?.status || "ACTIVE"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/50">
                  <span className="text-slate-400">Document Compliance Status:</span>
                  <span className="text-indigo-300 font-semibold">10 Configured Categories</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/50">
                  <span className="text-slate-400">Mandatory IDs:</span>
                  <span className="text-slate-300">Aadhaar, PAN, Education, Bank</span>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab("DOCUMENTS")}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2"
                  >
                    <FileCheck2 className="w-4 h-4" />
                    Manage All My Documents
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
