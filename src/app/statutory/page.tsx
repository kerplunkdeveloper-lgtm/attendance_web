"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import StatutoryView from "@/components/statutory/StatutoryView";

export default function StatutoryPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <StatutoryView />
      </AppLayout>
    </ProtectedRoute>
  );
}
