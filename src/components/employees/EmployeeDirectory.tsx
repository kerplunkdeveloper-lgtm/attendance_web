"use client";

import React, { useState, useEffect } from "react";
import { Employee } from "@/types";
import { employeesApi, branchesApi, departmentsApi, shiftsApi } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Trash2,
  Edit,
  Sparkles,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

export default function EmployeeDirectory() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Create / Invite Employee Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [inviteMode, setInviteMode] = useState<"INVITE" | "MANUAL">("INVITE");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("Password@123");
  const [phone, setPhone] = useState("");
  const [employeeCode, setEmployeeCode] = useState("");
  const [role, setRole] = useState("EMPLOYEE");
  const [branchId, setBranchId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [shiftId, setShiftId] = useState("");
  const [ctc, setCtc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [empRes, brRes, deptRes, shiftRes] = await Promise.allSettled([
        employeesApi.list(),
        branchesApi.list(),
        departmentsApi.list(),
        shiftsApi.list(),
      ]);

      if (empRes.status === "fulfilled" && empRes.value?.success) {
        setEmployees(empRes.value.data || empRes.value.employees || []);
      }
      if (brRes.status === "fulfilled" && brRes.value?.success) {
        setBranches(brRes.value.data || brRes.value.branches || []);
      }
      if (deptRes.status === "fulfilled" && deptRes.value?.success) {
        setDepartments(deptRes.value.data || deptRes.value.departments || []);
      }
      if (shiftRes.status === "fulfilled" && shiftRes.value?.success) {
        setShifts(shiftRes.value.data || shiftRes.value.shifts || []);
      }
    } catch (err) {
      console.error("Failed to load employees:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let res;
      if (inviteMode === "INVITE") {
        res = await employeesApi.inviteEmployee({
          firstName,
          lastName,
          email,
          phone,
          employeeCode: employeeCode || `WP-EMP-${Date.now().toString().slice(-4)}`,
          role,
          branchId: branchId || undefined,
          departmentId: departmentId || undefined,
          shiftId: shiftId || undefined,
          ctc: ctc ? Number(ctc) : undefined,
        });
      } else {
        res = await employeesApi.create({
          firstName,
          lastName,
          email,
          password,
          phone,
          employeeCode: employeeCode || `WP-EMP-${Date.now().toString().slice(-4)}`,
          role,
          branchId: branchId || undefined,
          departmentId: departmentId || undefined,
          shiftId: shiftId || undefined,
          ctc: ctc ? Number(ctc) : undefined,
        });
      }

      if (res?.success) {
        if (inviteMode === "INVITE") {
          toast.success(`Invitation dispatched! Credentials emailed to ${email}.`);
        } else {
          toast.success("Employee onboarded and account credentials created!");
        }
        confetti({ particleCount: 60, spread: 60 });
        setModalOpen(false);
        // Reset form
        setFirstName("");
        setLastName("");
        setEmail("");
        setPhone("");
        setEmployeeCode("");
        setCtc("");
        loadData();
      } else {
        toast.error(res?.message || "Failed to add employee");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to add employee");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const query = searchQuery.toLowerCase();
    const fullName = `${emp.firstName} ${emp.lastName || ""}`.toLowerCase();
    const code = (emp.employeeCode || "").toLowerCase();
    const emailStr = (emp.user?.email || "").toLowerCase();
    const dept = (emp.department?.name || "").toLowerCase();
    return fullName.includes(query) || code.includes(query) || emailStr.includes(query) || dept.includes(query);
  });

  return (
    <div className="space-y-6">
      {/* Header & Add Action */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Users className="w-7 h-7 text-indigo-400" />
            Workforce Employee Directory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage organization members, assign branches, departments, shifts, and configure compensation
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setInviteMode("INVITE");
              if (branches.length > 0 && !branchId) setBranchId(branches[0].id);
              if (departments.length > 0 && !departmentId) setDepartmentId(departments[0].id);
              if (shifts.length > 0 && !shiftId) setShiftId(shifts[0].id);
              setModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition"
          >
            <Mail className="w-4 h-4" />
            Invite Employee
          </button>

          <button
            onClick={() => {
              setInviteMode("MANUAL");
              if (branches.length > 0 && !branchId) setBranchId(branches[0].id);
              if (departments.length > 0 && !departmentId) setDepartmentId(departments[0].id);
              if (shifts.length > 0 && !shiftId) setShiftId(shifts[0].id);
              setModalOpen(true);
            }}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            Manual Add
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-card rounded-2xl p-3 border border-slate-800 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search employees by name, code, email, department..."
          className="bg-transparent border-none text-xs text-slate-200 placeholder-slate-500 focus:outline-none w-full"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="text-xs text-slate-400 hover:text-white px-2"
          >
            Clear
          </button>
        )}
      </div>

      {/* Directory Table */}
      <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Code</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Branch</th>
                <th className="py-3.5 px-4">Shift</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500">
                    Loading workforce directory...
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    No employees matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-sky-400 text-white font-bold text-xs flex items-center justify-center shadow">
                          {emp.firstName?.[0] || "E"}
                        </div>
                        <div>
                          <p className="font-semibold text-white">
                            {emp.firstName} {emp.lastName || ""}
                          </p>
                          <p className="text-[11px] text-slate-400">{emp.user?.email || emp.phone || "-"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-indigo-300">
                      {emp.employeeCode}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {emp.department?.name || "-"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {emp.branch?.name || "HQ"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {emp.shift?.name || "General Shift"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {emp.user?.role || "EMPLOYEE"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          emp.status === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                        }`}
                      >
                        {emp.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0f172a] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">
              {inviteMode === "INVITE" ? "Invite Employee via Email" : "Add New Workforce Member"}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              {inviteMode === "INVITE"
                ? "Auto-generates temporary access credentials and emails them to the employee."
                : "Directly provisions an account with custom credentials and role assignment."}
            </p>

            {/* Mode Switcher Tabs */}
            <div className="flex rounded-xl bg-slate-900/90 p-1 border border-slate-800 mb-4">
              <button
                type="button"
                onClick={() => setInviteMode("INVITE")}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  inviteMode === "INVITE"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                Email Invite (Auto Credentials)
              </button>
              <button
                type="button"
                onClick={() => setInviteMode("MANUAL")}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  inviteMode === "MANUAL"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                Manual Provisioning
              </button>
            </div>

            {inviteMode === "INVITE" && (
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 mb-4 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-indigo-200 leading-relaxed">
                  WorkPulse will generate a secure temporary password and email it to the employee with their company sign-in link. They must change password upon first login.
                </p>
              </div>
            )}

            <form onSubmit={handleCreateEmployee} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">First Name *</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full glass-input rounded-xl p-2.5 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full glass-input rounded-xl p-2.5 text-xs"
                  />
                </div>
              </div>

              <div className={inviteMode === "INVITE" ? "space-y-1" : "grid grid-cols-2 gap-3"}>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="employee@company.com"
                    className="w-full glass-input rounded-xl p-2.5 text-xs"
                    required
                  />
                </div>
                {inviteMode === "MANUAL" && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Temporary Password *</label>
                    <input
                      type="text"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full glass-input rounded-xl p-2.5 text-xs font-mono"
                      required
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Employee Code</label>
                  <input
                    type="text"
                    value={employeeCode}
                    onChange={(e) => setEmployeeCode(e.target.value)}
                    placeholder="e.g. WP-EMP-009 (optional)"
                    className="w-full glass-input rounded-xl p-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">System Role *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full glass-input rounded-xl p-2.5 text-xs text-slate-200"
                  >
                    <option value="EMPLOYEE">EMPLOYEE</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="COMPANY_ADMIN">COMPANY_ADMIN</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Branch</label>
                  <select
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    className="w-full glass-input rounded-xl p-2.5 text-xs text-slate-200"
                  >
                    <option value="">Select Branch...</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full glass-input rounded-xl p-2.5 text-xs text-slate-200"
                  >
                    <option value="">Select Department...</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Shift Schedule</label>
                  <select
                    value={shiftId}
                    onChange={(e) => setShiftId(e.target.value)}
                    className="w-full glass-input rounded-xl p-2.5 text-xs text-slate-200"
                  >
                    <option value="">Select Shift...</option>
                    {shifts.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.startTime} - {s.endTime})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Annual CTC (INR)</label>
                  <input
                    type="number"
                    value={ctc}
                    onChange={(e) => setCtc(e.target.value)}
                    placeholder="e.g. 900000"
                    className="w-full glass-input rounded-xl p-2.5 text-xs"
                  />
                </div>
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
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : inviteMode === "INVITE" ? (
                    <Send className="w-3.5 h-3.5" />
                  ) : null}
                  {inviteMode === "INVITE" ? "Send Email Invitation" : "Create Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
