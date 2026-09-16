"use client";

import React, { useState, useEffect } from "react";
import { notificationsApi } from "@/lib/api";
import { CommunicationStatus } from "@/types";
import {
  Radio,
  Mail,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

export default function CommunicationGatewayView() {
  const [status, setStatus] = useState<CommunicationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [testEmailAddress, setTestEmailAddress] = useState("");
  const [testPhone, setTestPhone] = useState("+91 98765 43210");
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [isTestingWhatsapp, setIsTestingWhatsapp] = useState(false);
  const [isTriggeringReminders, setIsTriggeringReminders] = useState(false);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const res = await notificationsApi.getCommunicationStatus();
      if (res?.success) {
        setStatus(res);
      }
    } catch (err: any) {
      console.error("Failed to load communication gateway status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTestingEmail(true);
    try {
      const res = await notificationsApi.testEmail(testEmailAddress || undefined);
      if (res?.success) {
        toast.success(res.message || "Test email dispatched successfully!");
        confetti({ particleCount: 50, spread: 60 });
      } else {
        toast.error(res?.message || "Email test failed");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to dispatch test email");
    } finally {
      setIsTestingEmail(false);
    }
  };

  const handleTestWhatsapp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTestingWhatsapp(true);
    try {
      const res = await notificationsApi.testWhatsApp(testPhone || undefined);
      if (res?.success) {
        toast.success(res.message || "Test WhatsApp alert triggered!");
        confetti({ particleCount: 50, spread: 60 });
      } else {
        toast.error(res?.message || "WhatsApp test failed");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to dispatch WhatsApp alert");
    } finally {
      setIsTestingWhatsapp(false);
    }
  };

  const handleTriggerReminders = async () => {
    setIsTriggeringReminders(true);
    try {
      const res = await notificationsApi.triggerReminders("ALL");
      if (res?.success) {
        toast.success(res.message || "Daily attendance reminders dispatched successfully!");
      } else {
        toast.error(res?.message || "Failed to trigger reminders");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to trigger reminders");
    } finally {
      setIsTriggeringReminders(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Radio className="w-7 h-7 text-indigo-400" />
            Communication & Alert Gateway
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated HTML email dispatch, Twilio WhatsApp alerts, and shift reminder scheduler health
          </p>
        </div>

        <button
          onClick={loadStatus}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-2 text-xs font-semibold"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Gateway Status
        </button>
      </div>

      {/* Gateway Channels Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Email Gateway Card */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Nodemailer SMTP Gateway</h3>
                <p className="text-xs text-slate-400">Transactional HTML Email Engine</p>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                status?.email?.isConfigured
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/30"
              }`}
            >
              {status?.email?.isConfigured ? "Operational" : "Simulation Mode"}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">Provider:</span>
              <span className="font-semibold">{status?.email?.provider || "Nodemailer SMTP"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Sender Address:</span>
              <span className="font-mono text-indigo-300">{status?.email?.from || "noreply@workpulse.com"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Templates:</span>
              <span className="text-emerald-400 font-semibold">Branded WorkPulse Responsive HTML</span>
            </div>
          </div>

          {/* Test Email Dispatch Form */}
          <form onSubmit={handleTestEmail} className="space-y-3 pt-2">
            <label className="block text-xs font-semibold text-slate-300">Dispatch Test Email</label>
            <div className="flex gap-2">
              <input
                type="email"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                placeholder="Enter recipient email or leave empty for self"
                className="flex-1 glass-input rounded-xl px-3 py-2 text-xs"
              />
              <button
                type="submit"
                disabled={isTestingEmail}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shrink-0"
              >
                {isTestingEmail ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Send Test
              </button>
            </div>
          </form>
        </div>

        {/* WhatsApp Gateway Card */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Twilio WhatsApp Alert Hub</h3>
                <p className="text-xs text-slate-400">Direct Employee Messaging</p>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                status?.whatsapp?.mode === "LIVE"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-sky-500/10 text-sky-400 border-sky-500/30"
              }`}
            >
              {status?.whatsapp?.mode || "SIMULATION"} Mode
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">Provider:</span>
              <span className="font-semibold">{status?.whatsapp?.provider || "Twilio"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Sender Number:</span>
              <span className="font-mono text-emerald-300">
                {status?.whatsapp?.senderNumber || "whatsapp:+14155238886"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Zero-Crash Resilience:</span>
              <span className="text-emerald-400 font-semibold">Active (Automatic Simulation Fallback)</span>
            </div>
          </div>

          {/* Test WhatsApp Alert Form */}
          <form onSubmit={handleTestWhatsapp} className="space-y-3 pt-2">
            <label className="block text-xs font-semibold text-slate-300">Trigger WhatsApp Alert</label>
            <div className="flex gap-2">
              <input
                type="tel"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="flex-1 glass-input rounded-xl px-3 py-2 text-xs font-mono"
              />
              <button
                type="submit"
                disabled={isTestingWhatsapp}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shrink-0"
              >
                {isTestingWhatsapp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Send WhatsApp
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Automated Scheduler Trigger Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 flex flex-wrap items-center justify-between gap-6">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
            <Clock className="w-5 h-5 text-indigo-400" />
            Automated Shift Punch Reminder Scheduler
          </h3>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Dispatches automated morning alerts (08:50 AM) to prompt clock-in and evening alerts (06:00 PM) to clock out. Evaluates non-punched employees and marks automated EOD absent status at 11:00 PM.
          </p>
        </div>

        <button
          onClick={handleTriggerReminders}
          disabled={isTriggeringReminders}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition disabled:opacity-50"
        >
          {isTriggeringReminders ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Trigger Reminder Evaluation Now
        </button>
      </div>
    </div>
  );
}
