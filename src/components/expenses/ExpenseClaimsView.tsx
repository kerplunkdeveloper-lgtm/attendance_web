"use client";

import React, { useState, useEffect } from "react";
import { ExpenseClaim } from "@/types";
import { expensesApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Wallet,
  Plus,
  Receipt,
  CheckCircle2,
  XCircle,
  Clock,
  Upload,
  Loader2,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

export default function ExpenseClaimsView() {
  const { user, role } = useAuth();
  const [claims, setClaims] = useState<ExpenseClaim[]>([]);
  const [loading, setLoading] = useState(true);

  // Submit Claim Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [category, setCategory] = useState("TRAVEL");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdminOrManager = role === "COMPANY_ADMIN" || role === "SUPER_ADMIN" || role === "MANAGER";

  const loadClaims = async () => {
    setLoading(true);
    try {
      if (isAdminOrManager) {
        const res = await expensesApi.getAllClaims();
        if (res?.success && Array.isArray(res.data)) {
          setClaims(res.data);
        } else if (Array.isArray(res)) {
          setClaims(res);
        }
      } else {
        const res = await expensesApi.getMyClaims();
        if (res?.success && Array.isArray(res.data)) {
          setClaims(res.data);
        } else if (Array.isArray(res)) {
          setClaims(res);
        }
      }
    } catch (err: any) {
      console.error("Failed to load claims:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClaims();
  }, [isAdminOrManager]);

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("category", category);
      formData.append("amount", amount);
      formData.append("description", description);
      if (file) {
        formData.append("receipt", file);
      }

      const res = await expensesApi.create(formData);
      if (res?.success) {
        toast.success("Expense reimbursement claim submitted successfully!");
        confetti({ particleCount: 50, spread: 60 });
        setModalOpen(false);
        setAmount("");
        setDescription("");
        setFile(null);
        loadClaims();
      } else {
        toast.error(res?.message || "Failed to submit claim");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to submit claim");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewClaim = async (id: string, status: "APPROVED" | "REJECTED") => {
    toast.loading("Updating claim status...", { id: "claim-act" });
    try {
      const res = await expensesApi.review(id, { status, reviewNote: `Finance review: ${status}` });
      toast.dismiss("claim-act");
      if (res?.success) {
        toast.success(`Claim marked as ${status}!`);
        loadClaims();
      } else {
        toast.error(res?.message || "Review action failed");
      }
    } catch (err: any) {
      toast.dismiss("claim-act");
      toast.error(err.response?.data?.message || err.message || "Action failed");
    }
  };

  const totalClaimed = claims.reduce((acc, c) => acc + (Number(c.amount) || 0), 0);
  const totalApproved = claims
    .filter((c) => c.status === "APPROVED" || c.status === "PAID")
    .reduce((acc, c) => acc + (Number(c.amount) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Wallet className="w-7 h-7 text-indigo-400" />
            Expense Reimbursement Claims
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Submit business expenditure receipts, track manager approval status, and manage settlement ledger
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          Submit Expense Claim
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 uppercase mb-1 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-indigo-400" />
            Total Claims Value
          </p>
          <p className="text-2xl font-black text-white">{formatCurrency(totalClaimed)}</p>
          <p className="text-[10px] text-slate-400 mt-1">{claims.length} claims submitted</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 uppercase mb-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Approved & Reimbursed
          </p>
          <p className="text-2xl font-black text-emerald-400">{formatCurrency(totalApproved)}</p>
          <p className="text-[10px] text-slate-400 mt-1">Settled into payroll</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 uppercase mb-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Pending Finance Audit
          </p>
          <p className="text-2xl font-black text-amber-400">
            {claims.filter((c) => c.status === "SUBMITTED" || c.status === "UNDER_REVIEW").length}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Awaiting approval</p>
        </div>
      </div>

      {/* Claims Table */}
      <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Status</th>
                {isAdminOrManager && <th className="py-3.5 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500">
                    Loading claims...
                  </td>
                </tr>
              ) : claims.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    No expense claims recorded. Click "Submit Expense Claim" above.
                  </td>
                </tr>
              ) : (
                claims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {claim.employee?.firstName ? `${claim.employee.firstName} ${claim.employee.lastName || ""}` : "Employee"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
                        {claim.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white text-sm">
                      {formatCurrency(claim.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">
                      {claim.description}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {formatDate(claim.createdAt)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          claim.status === "APPROVED" || claim.status === "PAID"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : claim.status === "REJECTED"
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        }`}
                      >
                        {claim.status}
                      </span>
                    </td>
                    {isAdminOrManager && (
                      <td className="py-3.5 px-4 text-right">
                        {claim.status === "SUBMITTED" || claim.status === "UNDER_REVIEW" ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleReviewClaim(claim.id, "APPROVED")}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 transition"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReviewClaim(claim.id, "REJECTED")}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 transition"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px] italic">Audited</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submit Claim Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Submit Expense Claim</h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter expense details and attach receipt proof for manager reimbursement
            </p>

            <form onSubmit={handleSubmitClaim} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Expense Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full glass-input rounded-xl p-2.5 text-xs text-slate-200"
                >
                  <option value="TRAVEL">Travel / Flight / Cab</option>
                  <option value="FOOD">Food / Team Dining</option>
                  <option value="ACCOMMODATION">Hotel / Lodging</option>
                  <option value="SUPPLIES">Office / Dev Equipment</option>
                  <option value="UTILITIES">Internet / Phone Bill</option>
                  <option value="MISCELLANEOUS">Miscellaneous</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Claim Amount (INR) *</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 2450"
                  className="w-full glass-input rounded-xl p-2.5 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description / Business Purpose *</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Client visit to Bangalore HQ, dinner meeting, cab receipt attached..."
                  className="w-full glass-input rounded-xl p-3 text-xs resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Attach Receipt Bill (PDF, JPG, PNG)</label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
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
                  Submit Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
