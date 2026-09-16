"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import PayrollView from "@/components/payroll/PayrollView";

export default function PayrollPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <PayrollView />
      </AppLayout>
    </ProtectedRoute>
  );
}
