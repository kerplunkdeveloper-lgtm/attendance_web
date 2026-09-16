"use client";

import React from "react";
import AppLayout from "@/components/layout/AppLayout";
import OffboardingView from "@/components/offboarding/OffboardingView";

export default function OffboardingPage() {
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto pb-12">
        <OffboardingView />
      </div>
    </AppLayout>
  );
}
