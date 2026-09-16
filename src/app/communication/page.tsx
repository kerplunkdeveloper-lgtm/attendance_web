"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import CommunicationGatewayView from "@/components/communication/CommunicationGatewayView";

export default function CommunicationPage() {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN", "COMPANY_ADMIN"]}>
      <AppLayout>
        <CommunicationGatewayView />
      </AppLayout>
    </ProtectedRoute>
  );
}
