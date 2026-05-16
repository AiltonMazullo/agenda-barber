import type { ReactNode } from "react";

interface InfoRowProps {
  icon: ReactNode;
  label: string;
  value: string;
}

export function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-text-subtle mt-0.5 shrink-0">{icon}</span>
      <div className="flex flex-col min-w-0">
        <span className="text-[9px] font-bold uppercase tracking-widest text-text-subtle">
          {label}
        </span>
        <span className="text-sm text-white leading-tight">{value}</span>
      </div>
    </div>
  );
}
