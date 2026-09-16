"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Key, Loader2, CheckCircle2, X, Mail, AlertCircle } from "lucide-react";
import { authApi } from "@/lib/api";
import { toast } from "sonner";

interface UnlockPlanModalProps {
  isOpen: boolean;
  organizationName?: string;
  onSuccess: () => void;
  onClose?: () => void;
}

export default function UnlockPlanModal({
  isOpen,
  organizationName,
  onSuccess,
  onClose,
}: UnlockPlanModalProps) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = code.trim().toUpperCase();
    if (!cleaned) {
      setError("Please enter your unlock code.");
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const result = await authApi.activatePlan(cleaned);
      if (result?.success) {
        toast.success(result.message || "🎉 Plan activated! Dashboard is now fully unlocked.");
        onSuccess();
      } else {
        setError(result?.message || "Invalid unlock code. Please try again.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid unlock code. Check your email and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-md rounded-3xl border border-slate-800 bg-[#0d1424] shadow-2xl overflow-hidden"
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          {/* Ambient glow */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative p-8">
            {/* Close button */}
            {onClose && (
              <button
                onClick={onClose}
                className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Icon + Title */}
            <div className="flex flex-col items-center text-center mb-8">
              <motion.div
                className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4"
                animate={{ rotate: [0, -5, 5, -5, 5, 0] }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Lock className="w-7 h-7 text-amber-400" />
              </motion.div>

              <h2 className="text-xl font-bold text-white mb-2">Activate Your Plan</h2>
              <p className="text-sm text-slate-400 max-w-xs">
                Enter the unlock code sent to your email when you registered{" "}
                {organizationName && (
                  <span className="text-indigo-400 font-medium">{organizationName}</span>
                )}.
              </p>
            </div>

            {/* Email hint */}
            <div className="flex items-center gap-2.5 mb-6 px-4 py-3 rounded-2xl bg-indigo-500/5 border border-indigo-500/20">
              <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
              <p className="text-xs text-indigo-300">
                Check your inbox for an email from WorkPulse with subject:{" "}
                <span className="font-mono font-semibold">"[WorkPulse] Your Plan Unlock Code"</span>
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Unlock Code
                </label>
                <input
                  ref={inputRef}
                  id="unlock-code-input"
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setError(null);
                    setCode(e.target.value.toUpperCase());
                  }}
                  placeholder="WP-XXXX-XXXX-XXXX"
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white font-mono text-lg tracking-widest placeholder:text-slate-600 placeholder:text-base placeholder:tracking-normal outline-none transition"
                  autoComplete="off"
                  spellCheck={false}
                  autoFocus
                />
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-start gap-2 mb-4 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                  >
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <p>{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={isLoading || !code.trim()}
                id="activate-plan-btn"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    Activate Plan
                  </>
                )}
              </button>
            </form>

            <p className="mt-4 text-center text-xs text-slate-600">
              Can't find your code?{" "}
              <a href="mailto:support@workpulse.com" className="text-indigo-400 hover:underline">
                Contact support
              </a>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
