"use client";

import React, { useRef } from "react";
import { Payslip } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Printer, Download, X, Building2, ShieldCheck } from "lucide-react";

interface PayslipModalProps {
  payslip: Payslip | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PayslipModal({ payslip, isOpen, onClose }: PayslipModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !payslip) return null;

  const handlePrint = () => {
    window.print();
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const monthString = monthNames[payslip.month - 1] || `Month ${payslip.month}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white text-slate-900 rounded-3xl p-6 sm:p-10 shadow-2xl relative my-8 print:p-0 print:m-0 print:shadow-none print:w-full print:max-w-none">
        {/* Top Control Bar (Hidden on print) */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-200 mb-6 print:hidden">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Payslip #{payslip.id.slice(0, 8).toUpperCase()}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                payslip.status === "PAID"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {payslip.status}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-2 shadow transition"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Payslip Letterhead Document */}
        <div ref={printRef} className="space-y-6 text-slate-800">
          {/* Company Header */}
          <div className="flex items-start justify-between pb-6 border-b-2 border-slate-900">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black">
                  WP
                </div>
                <h2 className="text-xl font-black tracking-tight text-slate-900">
                  WorkPulse Global Technologies Pvt Ltd
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                100 Beach Road, White Town, Pondicherry 605001, India | CIN: U72200PY2026PTC012345
              </p>
            </div>
            <div className="text-right">
              <h3 className="text-base font-black text-slate-900 uppercase tracking-wide">
                Salary Payslip
              </h3>
              <p className="text-xs font-semibold text-indigo-600">
                {monthString} {payslip.year}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Generated: {formatDate(payslip.createdAt)}</p>
            </div>
          </div>

          {/* Employee Information Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Employee Name</span>
              <span className="font-bold text-slate-900 text-sm">
                {payslip.employee?.firstName} {payslip.employee?.lastName || ""}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Employee Code</span>
              <span className="font-bold text-slate-900">
                {payslip.employee?.employeeCode || "WP-EMP-001"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Department</span>
              <span className="font-bold text-slate-900">
                {payslip.employee?.department?.name || "Engineering"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Branch Location</span>
              <span className="font-bold text-slate-900">
                {payslip.employee?.branch?.name || "Pondicherry HQ"}
              </span>
            </div>
          </div>

          {/* Breakdown Table: Earnings & Deductions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Earnings Column */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <div className="bg-slate-100 px-4 py-2.5 font-bold text-xs text-slate-800 uppercase tracking-wide border-b border-slate-200">
                Earnings
              </div>
              <div className="p-4 space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Basic Salary</span>
                  <span className="font-semibold">{formatCurrency(payslip.basicSalary)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">House Rent Allowance (HRA)</span>
                  <span className="font-semibold">{formatCurrency(payslip.hra)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Special & Other Allowances</span>
                  <span className="font-semibold">{formatCurrency(payslip.allowances)}</span>
                </div>
                {payslip.overtimePay > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Overtime Credit (OT)</span>
                    <span>+{formatCurrency(payslip.overtimePay)}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
                  <span>Gross Earnings</span>
                  <span>{formatCurrency(payslip.grossSalary)}</span>
                </div>
              </div>
            </div>

            {/* Deductions Column */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <div className="bg-slate-100 px-4 py-2.5 font-bold text-xs text-slate-800 uppercase tracking-wide border-b border-slate-200">
                Statutory Deductions
              </div>
              <div className="p-4 space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Provident Fund (PF - 12%)</span>
                  <span className="font-semibold">
                    {formatCurrency(Math.round(payslip.basicSalary * 0.12))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Employee State Insurance (ESI)</span>
                  <span className="font-semibold">{formatCurrency(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Professional Tax (PT)</span>
                  <span className="font-semibold">{formatCurrency(200)}</span>
                </div>
                {payslip.lopDeduction > 0 && (
                  <div className="flex justify-between text-rose-600 font-semibold">
                    <span>Loss of Pay (Absent / LOP)</span>
                    <span>-{formatCurrency(payslip.lopDeduction)}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
                  <span>Total Deductions</span>
                  <span className="text-rose-600">{formatCurrency(payslip.totalDeductions)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Salary Highlight Box */}
          <div className="p-5 rounded-2xl bg-indigo-50 border-2 border-indigo-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-indigo-900 uppercase tracking-wide block">
                Net Disbursed Take-Home Salary
              </span>
              <p className="text-xs text-indigo-700 italic mt-0.5">
                Calculated on attendance records adhering to 26 working days standard.
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-indigo-900">
                {formatCurrency(payslip.netSalary)}
              </span>
            </div>
          </div>

          {/* Footer & Authorized Signatory */}
          <div className="pt-8 border-t border-slate-200 flex items-end justify-between text-xs text-slate-500">
            <div>
              <p className="font-semibold text-slate-800">Note:</p>
              <p className="text-[11px] max-w-sm">
                This is an electronically verified payslip generated by WorkPulse HRMS. No physical signature is required.
              </p>
            </div>
            <div className="text-center">
              <div className="w-32 border-b border-slate-400 mb-1" />
              <span className="text-[11px] font-semibold text-slate-800">Authorized Signatory</span>
              <p className="text-[10px] text-slate-400">WorkPulse Finance & HR</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
