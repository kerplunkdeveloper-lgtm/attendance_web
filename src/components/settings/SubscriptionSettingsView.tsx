"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { authApi, billingApi, orgApi, apiKeysApi, employeesApi } from "@/lib/api";
import {
  Settings,
  Check,
  Loader2,
  FileText,
  ExternalLink,
  Save,
  Building,
  Zap,
  Shield,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { unwrapList } from "@/lib/utils";

export default function SubscriptionSettingsView() {
  const { user, refreshUser } = useAuth();
  const [plans, setPlans] = useState<any[]>([]);
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "ANNUAL">("MONTHLY");
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);
  const [orgForm, setOrgForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    taxId: "",
  });
  const [isSavingOrg, setIsSavingOrg] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [activeEmployeesCount, setActiveEmployeesCount] = useState(0);

  useEffect(() => {
    if (user?.organization) {
      setOrgForm({
        name: user.organization.name || "",
        email: user.organization.email || user.email || "",
        phone: user.organization.phone || "",
        address: user.organization.address || "",
        taxId: user.organization.taxId || "",
      });
    }
  }, [user]);

  useEffect(() => {
    async function loadPlans() {
      try {
        const res = await authApi.getPlans();
        if (res?.success && Array.isArray(res.plans) && res.plans.length > 0) {
          setPlans(res.plans);
        }
      } catch (err) {
        console.error("Failed to load plans from backend:", err);
        toast.error("Subscription plans are temporarily unavailable.");
      }
    }
    loadPlans();
    billingApi.orders().then((res) => setOrders(unwrapList(res).length ? unwrapList(res) : res?.data || [])).catch(() => {});
    apiKeysApi.list().then((res) => setApiKeys(unwrapList(res).length ? unwrapList(res) : res?.data || [])).catch(() => {});
    employeesApi
      .list({ page: 1, limit: 1, status: "ACTIVE" })
      .then((res) => setActiveEmployeesCount(res?.total ?? unwrapList(res).length))
      .catch(() => {});
  }, []);

  const handleUpgrade = async (planId: string) => {
    if (planId === "FREE_TRIAL") return;
    setUpgradingPlan(planId);
    try {
      const checkout = await billingApi.checkout({ plan: planId, billingCycle });
      if (checkout?.success && checkout.data?.razorpayOrderId) {
        const options = {
          key: checkout.data.keyId,
          amount: Math.round(Number(checkout.data.amountInr) * 100),
          currency: "INR",
          name: "WorkPulse",
          order_id: checkout.data.razorpayOrderId,
          handler: async (response: any) => {
            const verify = await billingApi.verify(response);
            if (verify?.success) {
              toast.success("Payment received. Plan activated.");
              await refreshUser();
            } else toast.error(verify?.message || "Verify failed");
          },
        };
        const existing = document.getElementById("razorpay-checkout");
        if (!existing) {
          await new Promise<void>((resolve, reject) => {
            const s = document.createElement("script");
            s.id = "razorpay-checkout";
            s.src = "https://checkout.razorpay.com/v1/checkout.js";
            s.onload = () => resolve();
            s.onerror = () => reject(new Error("Could not load Razorpay"));
            document.body.appendChild(s);
          });
        }
        // @ts-expect-error Razorpay global
        const rzp = new window.Razorpay(options);
        rzp.open();
        return;
      }
      const res = await authApi.upgradePlan(planId, billingCycle);
      if (res?.success) {
        toast.success(res.message || `Upgraded to ${planId}`);
        await refreshUser();
      } else toast.error(res?.message || "Upgrade failed");
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to upgrade";
      if (String(msg).includes("Razorpay is not configured")) {
        toast.error("Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET, or use an unlock code.");
      } else toast.error(msg);
    } finally {
      setUpgradingPlan(null);
    }
  };

  const handleOrgSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingOrg(true);
    try {
      const res = await orgApi.update(orgForm);
      if (res?.success) {
        toast.success("Organization profile saved successfully!");
        await refreshUser();
      } else toast.error(res?.message || "Save failed");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to save organization profile");
    } finally {
      setIsSavingOrg(false);
    }
  };

  const currentPlan = user?.organization?.subscriptionPlan || "FREE_TRIAL";
  const maxEmployees = user?.organization?.maxEmployees || 10;
  const usagePercentage = Math.min(Math.round((activeEmployeesCount / maxEmployees) * 100), 100);

  const invoices = orders.map((o) => ({
    id: o.razorpayOrderId || o.id,
    date: o.paidAt || o.createdAt,
    amount: `₹${Number(o.amountInr || 0).toLocaleString("en-IN")}`,
    status: o.status,
    plan: o.plan,
  }));

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-indigo-600" />
          Subscription & Organization Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your SaaS license tier, employee quota, enterprise security features, and company profile.
        </p>
      </div>

      {/* Current Active Plan Overview Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-indigo-50 to-sky-50 rounded-bl-full opacity-60 pointer-events-none" />
        <div className="flex flex-wrap items-center justify-between gap-6 relative">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wide">
                {currentPlan.replace(/_/g, " ")}
              </span>
              <span className="text-xs text-emerald-700 font-semibold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                Active Tier
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {user?.organization?.name || "WorkPulse Global Technologies"}
            </h2>
            <p className="text-xs text-slate-500 max-w-lg leading-relaxed">
              Your organization has full access to GPS Geofencing, Automated Payroll, Multi-Branch Hierarchies, and WhatsApp communications.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs min-w-[260px]">
            <div className="flex justify-between font-medium">
              <span className="text-slate-500">Employee Capacity:</span>
              <span className="font-bold text-slate-900">{activeEmployeesCount} / {maxEmployees}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${usagePercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>{activeEmployeesCount} Active Employees</span>
              <span>{Math.max(0, maxEmployees - activeEmployeesCount)} Seats Free</span>
            </div>
          </div>
        </div>
      </div>

      {/* Organization Profile */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Company & Organization Profile</h3>
            <p className="text-xs text-slate-500">Update your official company name, billing contact email, and address</p>
          </div>
        </div>

        <form onSubmit={handleOrgSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Organization Name</label>
              <input
                type="text"
                required
                value={orgForm.name}
                onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 placeholder-slate-400"
                placeholder="WorkPulse Global Technologies"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Billing Email Address</label>
              <input
                type="email"
                value={orgForm.email}
                onChange={(e) => setOrgForm({ ...orgForm, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 placeholder-slate-400"
                placeholder="billing@company.com"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Phone Number</label>
              <input
                type="text"
                value={orgForm.phone}
                onChange={(e) => setOrgForm({ ...orgForm, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 placeholder-slate-400"
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Tax ID / VAT Number</label>
              <input
                type="text"
                value={orgForm.taxId}
                onChange={(e) => setOrgForm({ ...orgForm, taxId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 placeholder-slate-400"
                placeholder="US-123456789"
              />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Official Office Address</label>
              <input
                type="text"
                value={orgForm.address}
                onChange={(e) => setOrgForm({ ...orgForm, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 placeholder-slate-400"
                placeholder="100 Innovation Drive, Suite 400, San Francisco, CA 94103"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSavingOrg}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs flex items-center gap-2 transition disabled:opacity-60"
            >
              {isSavingOrg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSavingOrg ? "Saving..." : "Save Organization Profile"}
            </button>
          </div>
        </form>
      </div>

      {/* Billing Cycle Switcher */}
      <div className="flex flex-col items-center text-center space-y-3 pt-4">
        <h3 className="text-xl font-bold text-slate-900">Choose Your Subscription Tier</h3>
        <p className="text-xs text-slate-500 max-w-md">
          Scale effortlessly as your workforce grows. Save 20% with annual billing.
        </p>

        <div className="flex items-center gap-2 p-1 rounded-xl bg-white border border-slate-200 shadow-xs text-xs font-semibold">
          <button
            onClick={() => setBillingCycle("MONTHLY")}
            className={`px-4 py-1.5 rounded-lg transition ${
              billingCycle === "MONTHLY" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle("ANNUAL")}
            className={`px-4 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              billingCycle === "ANNUAL" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Annual Billing</span>
          </button>
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {plans.length === 0 && (
          <div className="md:col-span-2 xl:col-span-4 rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            Subscription plans are currently unavailable. Please try again later.
          </div>
        )}
        {plans.map((p) => {
          const isSelected = currentPlan === p.id;
          const price = billingCycle === "MONTHLY" ? p.priceMonthly : p.priceAnnual;
          return (
            <div
              key={p.id}
              className={`bg-white rounded-3xl p-6 border flex flex-col justify-between transition-all duration-200 relative shadow-xs hover:shadow-md ${
                p.popular
                  ? "border-indigo-500 shadow-md ring-1 ring-indigo-500/30"
                  : isSelected
                  ? "border-emerald-500 ring-1 ring-emerald-500/30"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-indigo-600 to-sky-500 text-white text-[10px] font-black uppercase tracking-wider shadow">
                  Most Popular
                </div>
              )}
              {isSelected && (
                <div className="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shadow">
                  Active
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                    {p.badge}
                  </span>
                  <h4 className="text-lg font-bold text-slate-900 mt-0.5">{p.name}</h4>
                  <p className="text-xs text-slate-500 mt-1 min-h-[40px] leading-relaxed">{p.description}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">${price}</span>
                  <span className="text-xs text-slate-500">/ user / mo</span>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  {(Array.isArray(p.features) ? p.features : (p.features || "").split(" ")).map((f: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-slate-600">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-[11px] leading-relaxed">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100">
                <button
                  disabled={isSelected || upgradingPlan !== null}
                  onClick={() => handleUpgrade(p.id)}
                  className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    isSelected
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default font-bold"
                      : p.popular
                      ? "bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-xs font-bold disabled:opacity-50"
                      : "bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-semibold disabled:opacity-50"
                  }`}
                >
                  {upgradingPlan === p.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {isSelected
                    ? "✓ Current Active Plan"
                    : upgradingPlan === p.id
                    ? "Upgrading..."
                    : `Upgrade to ${p.name}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Billing History Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Billing History & Invoices</h3>
            <p className="text-xs text-slate-500">Download past invoices and review payment receipts</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-3 px-3">Invoice ID</th>
                <th className="pb-3 px-3">Date</th>
                <th className="pb-3 px-3">Plan Tier</th>
                <th className="pb-3 px-3">Amount</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-3 font-bold text-slate-900">{inv.id}</td>
                  <td className="py-3 px-3 text-slate-500">{inv.date}</td>
                  <td className="py-3 px-3 font-medium">{inv.plan}</td>
                  <td className="py-3 px-3 font-bold text-slate-900">{inv.amount}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => toast.success(`Downloading ${inv.id}...`)}
                      className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 ml-auto transition"
                    >
                      <span>PDF</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
