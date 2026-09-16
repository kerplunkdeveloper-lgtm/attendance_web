"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import OvertimeAndCompOffView from "@/components/overtime/OvertimeAndCompOffView";

export default function OvertimePage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <OvertimeAndCompOffView />
      </AppLayout>
    </ProtectedRoute>
  );
}
