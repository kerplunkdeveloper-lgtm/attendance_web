"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import ChatView from "@/components/chat/ChatView";

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <ChatView />
      </AppLayout>
    </ProtectedRoute>
  );
}
