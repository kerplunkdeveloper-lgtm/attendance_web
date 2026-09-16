"use client";

import React, { Suspense } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import PunchClockCard from "@/components/attendance/PunchClockCard";
import AttendanceHistoryView from "@/components/attendance/AttendanceHistoryView";
import { Clock } from "lucide-react";

export default function AttendancePage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <Clock className="w-7 h-7 text-indigo-400" />
              Smart Geofenced Punch & Timesheet
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Real-time GPS boundary verification, WFH punches, break logging, and miss-punch regularization
            </p>
          </div>

          <PunchClockCard />
          <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading attendance view...</div>}>
            <AttendanceHistoryView />
          </Suspense>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
