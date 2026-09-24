import Link from "next/link";
import { Activity } from "lucide-react";

interface BrandProps {
  href?: string;
  inverse?: boolean;
  compact?: boolean;
  subtitle?: string;
  className?: string;
}

export default function Brand({
  href = "/",
  inverse = false,
  compact = false,
  subtitle,
  className = "",
}: BrandProps) {
  const content = (
    <>
      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-gradient-to-br from-blue-500 via-indigo-600 to-violet-600 text-white shadow-[0_10px_25px_-10px_rgba(37,99,235,0.75)]">
        <Activity aria-hidden="true" className="h-5 w-5" strokeWidth={2.25} />
        <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-cyan-300 ring-2 ring-indigo-700/40" />
      </span>
      {!compact && (
        <span className="min-w-0 leading-none">
          <span className={`block text-[17px] font-extrabold tracking-[-0.035em] ${inverse ? "text-white" : "text-slate-950"}`}>
            Work<span className={inverse ? "text-blue-300" : "text-blue-600"}>Pulse</span>
          </span>
          {subtitle && (
            <span className={`mt-1 block truncate text-[9px] font-semibold uppercase tracking-[0.17em] ${inverse ? "text-slate-400" : "text-slate-500"}`}>
              {subtitle}
            </span>
          )}
        </span>
      )}
    </>
  );

  return (
    <Link
      href={href}
      aria-label="WorkPulse home"
      className={`inline-flex items-center gap-3 rounded-xl ${className}`}
    >
      {content}
    </Link>
  );
}
