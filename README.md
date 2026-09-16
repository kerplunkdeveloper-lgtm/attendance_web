# attendance_web

**WorkPulse Enterprise Suite — Modern Next.js Frontend Application**

A comprehensive, production-ready enterprise workforce management platform built with Next.js 15, TypeScript, Tailwind CSS, Framer Motion, and IndexedDB.

---

## 🌟 Key Capabilities

- **Smart GPS Geofenced Attendance**: Precise branch coordinate verification, boundary checks, and geofence bypass auditing.
- **Offline-First Punch Clock Engine**: IndexedDB client queue for recording punches with millisecond-exact timestamps during internet dropouts, with automated batch synchronization upon reconnection.
- **Dynamic Rostering & Shifts**: Customizable shifts, grace periods, rotational rosters, and per-day shift overrides with automated rest-day overtime calculations.
- **Automated Statutory Payroll**: CTC breakdown, PF/ESI statutory formulas, professional tax, leave deduction tracking, and one-click PDF payslip generator.
- **Organization & Plan Licensing**: Multi-tiered subscription licensing with cryptographic email unlock codes (`WP-XXXX-XXXX-XXXX`).
- **1-Click Employee Invitation**: Automated credential generation, welcome email dispatch, and forced first-login password reset.
- **Role-Based Access Control (RBAC)**: Distinct permissions for Super Admin, Company Admin, Manager, and Employee.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Run Development Server
```bash
npm run dev
```

Navigate to `http://localhost:3000` to view the application.

---

## 🛠️ Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Glassmorphism, CSS Variables
- **Animations**: Framer Motion, Canvas Confetti
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Client Storage**: Browser IndexedDB (`workpulse_offline`)
