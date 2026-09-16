"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import LeavesView from "@/components/leaves/LeavesView";

export default function LeavesPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <LeavesView />
      </AppLayout>
    </ProtectedRoute>
  );
}
