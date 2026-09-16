import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { AttendanceProvider } from "@/context/AttendanceContext";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "WorkPulse | Enterprise Workforce Management & Smart Geofenced Attendance",
  description:
    "Next-generation SaaS platform for geofenced smart attendance, automated payroll, leave entitlement, and digital candidate onboarding.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} dark h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#090d16] text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
        <AuthProvider>
          <AttendanceProvider>
            {children}
            <Toaster
              theme="dark"
              position="top-right"
              richColors
              closeButton
              toastOptions={{
                style: {
                  background: "#0f172a",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#f8fafc",
                },
              }}
            />
          </AttendanceProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
