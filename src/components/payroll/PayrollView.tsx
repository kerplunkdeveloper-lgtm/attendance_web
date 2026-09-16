"use client";

import React, { useState, useEffect } from "react";
import { Payslip } from "@/types";
import { payrollApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Receipt,
  Sparkles,
  Calculator,
  Send,
  Download,
  Eye,
  CheckCircle2,
  AlertCircle,
  Loader2,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import PayslipModal from "./PayslipModal";
import { toast } from "sonner";
import confetti from "canvas-confetti";

export default function PayrollView() {
  const { role } = useAuth();
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  // Batch Generation State
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isDisbursing, setIsDisbursing] = useState<boolean>(false);

  const isAdminOrManager = role === "COMPANY_ADMIN" || role === "SUPER_ADMIN" || role === "MANAGER";

  const loadPayslips = async () => {
    setLoading(true);
    try {
      if (isAdminOrManager) {
        const res = await payrollApi.getPayslips({ month: selectedMonth, year: selectedYear });
        if (res?.success && Array.isArray(res.data)) {
          setPayslips(res.data);
        } else if (Array.isArray(res)) {
          setPayslips(res);
        }
      } else {
        const res = await payrollApi.getMyPayslips();
        if (res?.success && Array.isArray(res.data)) {
          setPayslips(res.data);
        } else if (Array.isArray(res)) {
          setPayslips(res);
        }
      }
    } catch (err: any) {
      console.error("Failed to load payslips:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayslips();
  }, [selectedMonth, selectedYear, isAdminOrManager]);

  const handleGenerateBatch = async () => {
    setIsGenerating(true);
    try {
      const res = await payrollApi.generateBatch({
        month: Number(selectedMonth),
        year: Number(selectedYear),
      });

      if (res?.success) {
        toast.success(res.message || "Monthly payroll generated successfully with live attendance calculations!");
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
        loadPayslips();
      } else {
        toast.error(res?.message || "Failed to generate payroll batch");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to generate batch");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDisburseBatch = async () => {
    setIsDisbursing(true);
    try {
      const res = await payrollApi.disburseBatch({
        month: Number(selectedMonth),
        year: Number(selectedYear),
      });

      if (res?.success) {
        toast.success(res.message || "Batch disbursed successfully! Email & WhatsApp payslips dispatched.");
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
        loadPayslips();
      } else {
        toast.error(res?.message || "Failed to disburse batch");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to disburse batch");
    } finally {
      setIsDisbursing(false);
    }
  };

  const totalDisbursement = payslips.reduce((acc, p) => acc + (p.netSalary || 0), 0);
  const totalLopDeductions = payslips.reduce((acc, p) => acc + (p.lopDeduction || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Title & Batch Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Receipt className="w-7 h-7 text-indigo-400" />
            Payroll Processing & Payslip Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Statutory attendance-linked payroll, automated PF/ESI/TDS calculations, and one-click salary disbursement
          </p>
        </div>

        {isAdminOrManager && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 glass-panel px-3 py-1.5 rounded-xl text-xs">
              <span className="text-slate-400">Month:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="bg-transparent text-white font-semibold focus:outline-none"
              >
                {[
                  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
                ].map((m, i) => (
                  <option key={i + 1} value={i + 1} className="bg-slate-900 text-white">
                    {m}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-transparent text-white font-semibold focus:outline-none"
              >
                <option value={2026} className="bg-slate-900 text-white">2026</option>
                <option value={2025} className="bg-slate-900 text-white">2025</option>
              </select>
            </div>

            <button
              onClick={handleGenerateBatch}
              disabled={isGenerating}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 transition disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Calculator className="w-3.5 h-3.5" />}
              Generate Batch
            </button>

            <button
              onClick={handleDisburseBatch}
              disabled={isDisbursing || payslips.length === 0}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition disabled:opacity-50"
            >
              {isDisbursing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Disburse & Send Alerts
            </button>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 uppercase mb-1 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-indigo-400" />
            Total Monthly Payout
          </p>
          <p className="text-2xl font-black text-white">{formatCurrency(totalDisbursement)}</p>
          <p className="text-[10px] text-slate-400 mt-1">Across {payslips.length} employee records</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 uppercase mb-1 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
            LOP Deductions
          </p>
          <p className="text-2xl font-black text-rose-400">{formatCurrency(totalLopDeductions)}</p>
          <p className="text-[10px] text-slate-400 mt-1">Attendance-linked absence deduction</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 uppercase mb-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Disbursement Mode
          </p>
          <p className="text-xl font-bold text-emerald-300">Automated Direct Bank & WhatsApp</p>
          <p className="text-[10px] text-slate-400 mt-1">Complies with 26 days/month standard</p>
        </div>
      </div>

      {/* Payslips Table */}
      <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Period</th>
                <th className="py-3.5 px-4">Basic</th>
                <th className="py-3.5 px-4">Gross</th>
                <th className="py-3.5 px-4">Deductions</th>
                <th className="py-3.5 px-4">Net Take-Home</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Payslip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-500">
                    Loading payroll records...
                  </td>
                </tr>
              ) : payslips.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500">
                    No payslips found for this cycle. Click "Generate Batch" to create.
                  </td>
                </tr>
              ) : (
                payslips.map((slip) => (
                  <tr key={slip.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <div>
                        {slip.employee?.firstName} {slip.employee?.lastName}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {slip.employee?.employeeCode || "WP-EMP"}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      Month {slip.month} / {slip.year}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {formatCurrency(slip.basicSalary)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {formatCurrency(slip.grossSalary)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-rose-400">
                      -{formatCurrency(slip.totalDeductions)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400 text-sm">
                      {formatCurrency(slip.netSalary)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          slip.status === "PAID"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        }`}
                      >
                        {slip.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedPayslip(slip);
                          setModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 transition inline-flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Letterhead
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formatted Letterhead Payslip Modal */}
      <PayslipModal
        payslip={selectedPayslip}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
