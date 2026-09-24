import type { ReactNode } from "react";
import { CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import Brand from "@/components/ui/Brand";

interface AuthShellProps {
  children: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  asideTitle?: string;
  asideDescription?: string;
  points?: string[];
  footer?: ReactNode;
  wide?: boolean;
}

export default function AuthShell({
  children,
  eyebrow,
  title,
  description,
  asideTitle = "Run every workday from one calm, connected workspace.",
  asideDescription = "Attendance, people operations, approvals, and payroll stay aligned in real time.",
  points = [
    "Location-aware attendance with offline sync",
    "Simple approvals and real-time workforce visibility",
    "Payroll-ready records with a complete audit trail",
  ],
  footer,
  wide = false,
}: AuthShellProps) {
  return (
    <main className="auth-canvas relative min-h-screen overflow-hidden lg:grid lg:grid-cols-[minmax(420px,0.92fr)_minmax(0,1.08fr)]">
      <div aria-hidden="true" className="marketing-grid pointer-events-none absolute inset-0 opacity-60" />

      <aside className="relative hidden overflow-hidden bg-[#081226] px-10 py-10 text-white lg:flex lg:flex-col xl:px-16 xl:py-12">
        <div aria-hidden="true" className="absolute -left-24 top-24 h-80 w-80 rounded-full bg-blue-500/20 blur-[100px]" />
        <div aria-hidden="true" className="absolute -bottom-24 right-0 h-96 w-96 rounded-full bg-violet-500/15 blur-[110px]" />

        <Brand inverse subtitle="Workforce operating system" className="relative z-10 w-fit" />

        <div className="relative z-10 my-auto max-w-[34rem] py-16">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[11px] font-semibold text-blue-200">
            <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
            Built for teams that are going places
          </div>
          <h1 className="text-balance text-4xl font-semibold leading-[1.12] tracking-[-0.045em] xl:text-[46px]">
            {asideTitle}
          </h1>
          <p className="mt-5 max-w-lg text-[15px] leading-7 text-slate-300">
            {asideDescription}
          </p>

          <ul className="mt-9 space-y-4">
            {points.map((point) => (
              <li key={point} className="flex items-center gap-3 text-sm text-slate-200">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
                  <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck aria-hidden="true" className="h-4 w-4 text-blue-300" />
          Encrypted, role-aware, and built for operational trust.
        </div>
      </aside>

      <section className="relative flex min-h-screen items-center justify-center px-4 py-8 sm:px-8 lg:px-12 lg:py-12">
        <div className={`w-full ${wide ? "max-w-[540px]" : "max-w-[450px]"}`}>
          <Brand subtitle="Workforce operating system" className="mb-10 w-fit lg:hidden" />

          <div className="mb-7">
            <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600">{eyebrow}</div>
            <h2 className="text-balance text-[32px] font-semibold leading-tight tracking-[-0.04em] text-slate-950 sm:text-[36px]">
              {title}
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-slate-600">{description}</p>
          </div>

          <div className="app-card p-5 sm:p-7">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-slate-600">{footer}</div>}
        </div>
      </section>
    </main>
  );
}
