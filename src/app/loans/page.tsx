"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import LoansView from "@/components/loans/LoansView";

export default function LoansPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <LoansView />
      </AppLayout>
    </ProtectedRoute>
  );
}
