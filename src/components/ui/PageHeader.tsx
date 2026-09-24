"use client";

import React from "react";

export default function PageHeader({
  icon: Icon,
  title,
  description,
  actions,
}: {
  icon?: React.ElementType;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-[22px] font-semibold tracking-tight text-slate-900 flex items-center gap-2.5">
          {Icon && (
            <span className="inline-flex w-9 h-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Icon className="w-4.5 h-4.5" />
            </span>
          )}
          {title}
        </h1>
        {description && <p className="text-sm text-slate-500 mt-1.5 max-w-2xl">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
