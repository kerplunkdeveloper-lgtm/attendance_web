"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/lib/api";
import {
  Settings,
  Sparkles,
  Check,
  Shield,
  Building2,
  Users,
  CreditCard,
  Zap,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function SubscriptionSettingsView() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<any[]>([]);
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "ANNUAL">("MONTHLY");

  useEffect(() => {
    async function loadPlans() {
      try {
        const res = await authApi.getPlans();
        if (res?.success && Array.isArray(res.plans)) {
          setPlans(res.plans);
        }
      } catch (err) {
        console.error("Failed to load plans:", err);
      }
    }
    loadPlans();
  }, []);

  const currentPlan = user?.organization?.subscriptionPlan || "FREE_TRIAL";
  const maxEmployees = user?.organization?.maxEmployees || 10;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-indigo-400" />
          Subscription & Organization Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your SaaS license tier, employee quota, enterprise security features, and company profile
        </p>
      </div>

      {/* Current Active Plan Overview Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                {currentPlan.replace(/_/g, " ")}
              </span>
              <span className="text-xs text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10">
                Active Tier
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">
              {user?.organization?.name || "WorkPulse Global Technologies"}
            </h2>
            <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
              Your organization has access to GPS Geofencing, Automated Payroll, Multi-Branch Hierarchies, and WhatsApp communications.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs min-w-[240px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Employee Capacity:</span>
              <span className="font-bold text-white">{maxEmployees} Employees</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="w-3/5 h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400" />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>6 Active in Database</span>
              <span>{maxEmployees - 6} Seats Available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Billing Cycle Switcher */}
      <div className="flex flex-col items-center text-center space-y-3">
        <h3 className="text-xl font-bold text-white">Available SaaS Subscription Tiers</h3>
        <p className="text-xs text-slate-400 max-w-md">
          Scale effortlessly as your workforce grows. Save 20% with annual billing.
        </p>

        <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setBillingCycle("MONTHLY")}
            className={`px-4 py-1.5 rounded-lg transition ${
              billingCycle === "MONTHLY" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle("ANNUAL")}
            className={`px-4 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              billingCycle === "ANNUAL" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            <span>Annual Billing</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {plans.map((p) => {
          const isSelected = currentPlan === p.id;
          const price = billingCycle === "MONTHLY" ? p.priceMonthly : p.priceAnnual;
          return (
            <div
              key={p.id}
              className={`glass-card rounded-3xl p-6 border flex flex-col justify-between transition relative ${
                p.popular
                  ? "border-indigo-500/50 shadow-xl shadow-indigo-500/10"
                  : isSelected
                  ? "border-emerald-500/40"
                  : "border-slate-800"
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-sky-400 text-white text-[10px] font-black uppercase tracking-wider shadow">
                  Most Popular
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                    {p.badge}
                  </span>
                  <h4 className="text-lg font-bold text-white mt-0.5">{p.name}</h4>
                  <p className="text-xs text-slate-400 mt-1 min-h-[32px]">{p.description}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">${price}</span>
                  <span className="text-xs text-slate-400">/ user / mo</span>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
                  {p.features?.map((f: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-slate-300">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-[11px] leading-relaxed">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-800">
                <button
                  disabled={isSelected}
                  className={`w-full py-2.5 rounded-xl text-xs font-semibold transition ${
                    isSelected
                      ? "bg-slate-800 text-emerald-400 border border-emerald-500/30 cursor-default"
                      : p.popular
                      ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                  }`}
                >
                  {isSelected ? "Current Active Plan" : "Upgrade Plan"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
