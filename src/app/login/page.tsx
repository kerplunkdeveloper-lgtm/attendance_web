"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import {
  Sparkles,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Building2,
  Users,
  CheckCircle2,
  Loader2,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("admin@workpulse.com");
  const [password, setPassword] = useState("Password@123");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await login(email, password);
    setSubmitting(false);
  };

  const handleQuickFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("Password@123");
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-mesh-radial relative overflow-hidden">
      {/* Background soft ambient glowing spheres */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-sky-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 p-0.5 shadow-xl shadow-indigo-500/30">
            <div className="w-full h-full bg-[#0c1222] rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-indigo-400" />
            </div>
          </div>
          <span className="text-2xl font-black tracking-tight text-white">WorkPulse</span>
        </div>

        <h2 className="text-2xl font-black tracking-tight text-white">
          Sign in to your Enterprise Workspace
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Smart Geofenced Attendance, Dynamic Rosters & Statutory Payroll
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card py-8 px-6 sm:px-10 rounded-3xl border border-slate-800 shadow-2xl space-y-6"
        >
          {/* Quick Demo Personas Bar */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                1-Click Demo Personas:
              </span>
              <span className="text-slate-500 font-mono">Password@123</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickFill("admin@workpulse.com")}
                className="px-2 py-1.5 rounded-xl bg-slate-800/80 hover:bg-indigo-600/30 text-slate-300 hover:text-white border border-slate-700 transition font-medium text-center"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill("hr@workpulse.com")}
                className="px-2 py-1.5 rounded-xl bg-slate-800/80 hover:bg-indigo-600/30 text-slate-300 hover:text-white border border-slate-700 transition font-medium text-center"
              >
                Manager
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill("employee@workpulse.com")}
                className="px-2 py-1.5 rounded-xl bg-slate-800/80 hover:bg-indigo-600/30 text-slate-300 hover:text-white border border-slate-700 transition font-medium text-center"
              >
                Employee
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Corporate Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full glass-input rounded-xl pl-10 pr-3 py-2.5 text-xs text-white"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">Password</label>
                <span className="text-[11px] text-indigo-400 hover:underline cursor-pointer">
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full glass-input rounded-xl pl-10 pr-3 py-2.5 text-xs text-white font-mono"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition flex items-center justify-center gap-2"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Sign In to WorkPulse</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
            Don't have an organization account?{" "}
            <Link href="/register" className="font-semibold text-indigo-400 hover:text-indigo-300">
              Register Free Trial
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
