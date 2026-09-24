"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Building2, Mail, Lock, ArrowRight, Loader2, User } from "lucide-react";
import MarketingAuthLayout, { AuthCard, authFieldRing } from "@/components/ui/MarketingAuthLayout";

export default function RegisterPage() {
  const { register } = useAuth();
  const [orgName, setOrgName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [subscriptionPlan, setSubscriptionPlan] = useState("FREE_TRIAL");
  const [submitting, setSubmitting] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const planParam = params.get("plan");
      if (planParam && ["FREE_TRIAL", "STARTER", "PROFESSIONAL", "ENTERPRISE"].includes(planParam)) {
        setSubscriptionPlan(planParam);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await register({
      organizationName: orgName,
      firstName,
      lastName,
      email,
      password,
      role: "COMPANY_ADMIN",
      subscriptionPlan,
      billingCycle: "MONTHLY",
    });
    setSubmitting(false);
  };

  const inputWrap = (name: string) =>
    `flex items-center gap-3 rounded-full border bg-white px-4 py-2.5 transition-all ${authFieldRing(focused === name)}`;

  return (
    <MarketingAuthLayout>
      <AuthCard>
        <h2 className="text-[28px] font-black tracking-tight text-slate-950">Start a free trial</h2>
        <p className="mt-1 text-[13px] text-slate-400">Create your organization — you will be the company admin.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3.5">
          <div>
            <label className="mb-1.5 block text-[12px] font-bold text-slate-600">Organization name</label>
            <div className={inputWrap("org")}>
              <Building2 className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="Acme Technologies"
                onFocus={() => setFocused("org")}
                onBlur={() => setFocused(null)}
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-300"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[12px] font-bold text-slate-600">First name</label>
              <div className={inputWrap("first")}>
                <User className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  onFocus={() => setFocused("first")}
                  onBlur={() => setFocused(null)}
                  className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none"
                  required
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-bold text-slate-600">Last name</label>
              <div className={inputWrap("last")}>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  onFocus={() => setFocused("last")}
                  onBlur={() => setFocused(null)}
                  className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] font-bold text-slate-600">Work email</label>
            <div className={inputWrap("email")}>
              <Mail className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@company.com"
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-300"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] font-bold text-slate-600">Password</label>
            <div className={inputWrap("password")}>
              <Lock className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused(null)}
                autoComplete="new-password"
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] font-bold text-slate-600">Plan</label>
            <div className={inputWrap("plan")}>
              <select
                value={subscriptionPlan}
                onChange={(e) => setSubscriptionPlan(e.target.value)}
                onFocus={() => setFocused("plan")}
                onBlur={() => setFocused(null)}
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none"
              >
                <option value="FREE_TRIAL">Free trial — 14 days, 10 employees</option>
                <option value="STARTER">Starter — 25 employees</option>
                <option value="PROFESSIONAL">Professional — 100 employees</option>
                <option value="ENTERPRISE">Enterprise — unlimited</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-full bg-[#5B52F5] py-3.5 text-sm font-bold text-white shadow-[0_10px_24px_-8px_rgba(91,82,245,0.7)] transition hover:bg-[#4F46E5] active:scale-[0.99] disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Create workspace
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-[11px] text-slate-400">Or</span>
          </div>
        </div>

        <p className="text-center text-[13px] text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-indigo-600 hover:text-indigo-700">
            Sign in
          </Link>
        </p>
      </AuthCard>
    </MarketingAuthLayout>
  );
}
