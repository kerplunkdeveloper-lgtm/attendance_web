"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import DashboardOverview from "@/components/dashboard/DashboardOverview";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <DashboardOverview />
      </AppLayout>
    </ProtectedRoute>
  );
}
