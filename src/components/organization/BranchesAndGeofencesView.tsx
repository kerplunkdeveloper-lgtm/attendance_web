"use client";

import React, { useState, useEffect } from "react";
import { Branch } from "@/types";
import { branchesApi } from "@/lib/api";
import {
  Building2,
  MapPin,
  Plus,
  Navigation,
  CheckCircle2,
  ShieldCheck,
  Loader2,
  Trash2,
  Compass,
} from "lucide-react";
import { toast } from "sonner";

export default function BranchesAndGeofencesView() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("11.9344");
  const [longitude, setLongitude] = useState("79.8358");
  const [radiusMeters, setRadiusMeters] = useState(250);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadBranches = async () => {
    setLoading(true);
    try {
      const res = await branchesApi.list();
      if (res?.success && Array.isArray(res.data)) {
        setBranches(res.data);
      } else if (Array.isArray(res)) {
        setBranches(res);
      }
    } catch (err: any) {
      console.error("Failed to load branches:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await branchesApi.create({
        name,
        address,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        radiusMeters: Number(radiusMeters),
      });

      if (res?.success) {
        toast.success("Branch location & geofence perimeter configured successfully!");
        setModalOpen(false);
        setName("");
        setAddress("");
        loadBranches();
      } else {
        toast.error(res?.message || "Failed to create branch");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to create branch");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Preset quick fill for Indian tech hubs
  const applyPreset = (presetName: string, lat: string, lng: string) => {
    setName(presetName);
    setLatitude(lat);
    setLongitude(lng);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-indigo-400" />
            Branch Locations & GPS Geofences
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure physical office perimeters with Haversine GPS radius validation for tamper-proof punching
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          Add Branch Geofence
        </button>
      </div>

      {/* Geofence Info Alert */}
      <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-slate-300 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white">Smart Anti-Buddy-Punching Protection</span>
          <p className="text-slate-400 mt-0.5 leading-relaxed">
            When an employee punches from their mobile device or web browser, WorkPulse computes their real-time Haversine distance from the branch's GPS coordinates. If outside the configured radius (e.g. 250m), the punch requires WFH justification.
          </p>
        </div>
      </div>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-500 mb-2" />
            Loading registered branch geofences...
          </div>
        ) : branches.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500">
            No branch locations found. Click "Add Branch Geofence" to create one.
          </div>
        ) : (
          branches.map((b) => (
            <div
              key={b.id}
              className="glass-card rounded-3xl p-6 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition relative overflow-hidden"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Geofence Active
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">{b.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {b.address || "Main Corporate Tech Facility"}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">GPS Coordinates:</span>
                    <span className="font-mono text-slate-300">
                      {Number(b.latitude).toFixed(4)}, {Number(b.longitude).toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Allowed Perimeter:</span>
                    <span className="font-bold text-emerald-400">
                      {b.radiusMeters || 250} meters
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5 text-indigo-400" />
                  Haversine Mode
                </span>
                <span className="font-mono text-[10px] text-slate-500">
                  ID: {b.id.slice(0, 8)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Branch Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0f172a] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Add Branch & Geofence Perimeter</h3>
            <p className="text-xs text-slate-400 mb-4">
              Configure coordinates and geofence boundary radius for clock-in checks
            </p>

            {/* Quick Presets */}
            <div className="mb-4">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                Quick Coordinate Autofill:
              </span>
              <div className="flex flex-wrap gap-1.5 text-[10px]">
                <button
                  type="button"
                  onClick={() => applyPreset("Pondicherry Technology HQ", "11.9344", "79.8358")}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                >
                  Pondicherry HQ
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("Chennai Innovation Hub", "12.9010", "80.2279")}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                >
                  Chennai OMR
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("Bangalore Electronic City", "12.8399", "77.6770")}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                >
                  Bangalore EC
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateBranch} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Branch Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Pondicherry Technology HQ"
                  className="w-full glass-input rounded-xl p-2.5 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Physical Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 100 Beach Road, White Town, Pondicherry"
                  className="w-full glass-input rounded-xl p-2.5 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Latitude *</label>
                  <input
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-full glass-input rounded-xl p-2.5 text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Longitude *</label>
                  <input
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-full glass-input rounded-xl p-2.5 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Geofence Radius: <span className="text-indigo-400 font-bold">{radiusMeters} meters</span>
                  </label>
                  <span className="text-[10px] text-slate-500">Recommended: 200m - 350m</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={1000}
                  step={25}
                  value={radiusMeters}
                  onChange={(e) => setRadiusMeters(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
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
                  Save Geofence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
