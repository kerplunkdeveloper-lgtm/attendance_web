import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { AttendanceProvider } from "@/context/AttendanceContext";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: {
    default: "WorkPulse | Modern workforce operations",
    template: "%s | WorkPulse",
  },
  description:
    "One connected workspace for attendance, people operations, leave, payroll, onboarding, and workforce insights.",
  applicationName: "WorkPulse",
  keywords: ["workforce management", "attendance", "payroll", "HR software", "geofencing"],
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f5f7fb",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[#f5f7fb] font-sans text-slate-900 antialiased">
        <AuthProvider>
          <AttendanceProvider>
            {children}
            <Toaster
              theme="light"
              position="top-right"
              richColors
              closeButton
              toastOptions={{
                style: {
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  color: "#0f172a",
                },
              }}
            />
          </AttendanceProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
