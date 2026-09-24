"use client";

import React, { useEffect, useState } from "react";
import { departmentsApi } from "@/lib/api";
import { unwrapList } from "@/lib/utils";
import { FolderTree, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/ui/PageHeader";

export default function DepartmentsView() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await departmentsApi.list();
      setDepartments(unwrapList(res));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await departmentsApi.create({ name: name.trim() });
      if (res?.success) {
        toast.success("Department created");
        setName("");
        load();
      } else toast.error(res?.message || "Create failed");
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Create failed");
    } finally {
      setSaving(false);
    }
  };

  const handleRename = async (id: string) => {
    if (!editName.trim()) return;
    try {
      const res = await departmentsApi.update(id, { name: editName.trim() });
      if (res?.success) {
        toast.success("Department renamed");
        setEditingId(null);
        load();
      } else toast.error(res?.message || "Update failed");
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Update failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this department? Employees will be unassigned.")) return;
    try {
      const res = await departmentsApi.remove(id);
      if (res?.success !== false) {
        toast.success("Department deleted");
        load();
      } else toast.error(res?.message || "Delete failed");
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        icon={FolderTree}
        title="Departments"
        description="Org structure used on invites, onboarding, and reports."
      />

      <form onSubmit={handleCreate} className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New department name"
          className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs"
        />
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          Add
        </button>
      </form>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-xs text-slate-500">Loading…</p>
        ) : departments.length === 0 ? (
          <p className="p-8 text-center text-xs text-slate-500">No departments yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {departments.map((d) => (
              <li key={d.id} className="px-4 py-3 flex items-center justify-between gap-3 text-xs">
                {editingId === d.id ? (
                  <div className="flex-1 flex gap-2">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 px-2 py-1.5 rounded-lg border border-slate-200"
                    />
                    <button onClick={() => handleRename(d.id)} className="text-indigo-600 font-semibold">
                      Save
                    </button>
                    <button onClick={() => setEditingId(null)} className="text-slate-500">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div>
                      <div className="font-semibold text-slate-900">{d.name}</div>
                      <div className="text-slate-500">{d._count?.employees ?? d.employeeCount ?? 0} employees</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingId(d.id);
                          setEditName(d.name);
                        }}
                        className="text-indigo-600 font-semibold"
                      >
                        Rename
                      </button>
                      <button onClick={() => handleDelete(d.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
