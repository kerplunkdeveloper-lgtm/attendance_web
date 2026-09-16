"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"DOCUMENTS" | "PROFILE">("DOCUMENTS");

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
            <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
              <button
                onClick={() => setActiveTab("DOCUMENTS")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
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
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === "PROFILE"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <User className="w-4 h-4" />
                Profile Info
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
