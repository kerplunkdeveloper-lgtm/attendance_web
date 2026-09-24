"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import AppraisalsView from "@/components/appraisals/AppraisalsView";

export default function AppraisalsPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <AppraisalsView />
      </AppLayout>
    </ProtectedRoute>
  );
}
