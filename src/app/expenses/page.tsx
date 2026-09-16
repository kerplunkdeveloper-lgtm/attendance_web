"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import ExpenseClaimsView from "@/components/expenses/ExpenseClaimsView";

export default function ExpensesPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <ExpenseClaimsView />
      </AppLayout>
    </ProtectedRoute>
  );
}
