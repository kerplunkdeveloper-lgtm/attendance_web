"use client";

import React, { useState } from "react";
import { Employee } from "@/types";
import EmployeeDocumentsView from "./EmployeeDocumentsView";
import {
  User,
  FileCheck2,
  Mail,
  Phone,
  Building2,
  Clock,
  Shield,
  Briefcase,
  Calendar,
  X,
  CreditCard,
  MapPin,
  Sparkles,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface EmployeeProfileModalProps {
  employee: Employee | null;
  isOpen: boolean;
  initialTab?: "PROFILE" | "DOCUMENTS";
  onClose: () => void;
  isCurrentUserAdmin?: boolean;
}

export default function EmployeeProfileModal({
  employee,
  isOpen,
  initialTab = "DOCUMENTS",
  onClose,
  isCurrentUserAdmin = true,
}: EmployeeProfileModalProps) {
  const [activeTab, setActiveTab] = useState<"PROFILE" | "DOCUMENTS">(initialTab);

  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-5xl bg-[#090d16] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col my-auto max-h-[92vh]">
        {/* Modal Top Header Banner */}
        <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-b border-slate-800 p-6">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 border border-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-400 text-white font-black text-2xl flex items-center justify-center shadow-xl border border-white/10 shrink-0">
              {employee.firstName?.[0] || "E"}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black text-white">
                  {employee.firstName} {employee.lastName || ""}
                </h1>
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {employee.employeeCode}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    employee.status === "ACTIVE"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                  }`}
                >
                  {employee.status}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  {employee.user?.email || "No email assigned"}
                </span>
                {employee.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    {employee.phone}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  {employee.department?.name || "General"} • {employee.branch?.name || "HQ"}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 border-t border-slate-800/80 pt-4">
            <button
              onClick={() => setActiveTab("DOCUMENTS")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === "DOCUMENTS"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <FileCheck2 className="w-4 h-4" />
              Documents & Compliance
            </button>
            <button
              onClick={() => setActiveTab("PROFILE")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === "PROFILE"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <User className="w-4 h-4" />
              Profile Details
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === "DOCUMENTS" ? (
            <EmployeeDocumentsView
              employeeId={employee.id}
              employeeName={`${employee.firstName} ${employee.lastName || ""}`.trim()}
              employeeCode={employee.employeeCode}
              isCurrentUserAdmin={isCurrentUserAdmin}
            />
          ) : (
            <div className="space-y-6">
              {/* Profile details grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-card rounded-2xl p-5 border border-slate-800 bg-[#0f172a]/60 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                    <Briefcase className="w-4 h-4 text-indigo-400" />
                    Employment & Assignment
                  </h3>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Employee ID:</span>
                      <span className="text-indigo-300 font-mono font-semibold">{employee.employeeCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Department:</span>
                      <span className="text-slate-200 font-medium">{employee.department?.name || "General"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Branch / Location:</span>
                      <span className="text-slate-200 font-medium">{employee.branch?.name || "Main HQ"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Shift Schedule:</span>
                      <span className="text-slate-200 font-medium">{employee.shift?.name || "General Shift"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">System Role:</span>
                      <span className="text-indigo-300 font-semibold">{employee.user?.role || "EMPLOYEE"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Joined On:</span>
                      <span className="text-slate-200">{formatDate(employee.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-5 border border-slate-800 bg-[#0f172a]/60 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                    Statutory & Compliance Status
                  </h3>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Account Status:</span>
                      <span className="text-emerald-400 font-semibold">{employee.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Compliance Audit:</span>
                      <span className="text-slate-200">Active Employment File</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Direct Document Access:</span>
                      <button
                        onClick={() => setActiveTab("DOCUMENTS")}
                        className="text-indigo-400 font-bold hover:underline"
                      >
                        Manage 10 Document Slots →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
