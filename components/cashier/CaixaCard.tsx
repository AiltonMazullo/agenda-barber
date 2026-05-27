"use client";

import { Building2, Clock, ChevronRight } from "lucide-react";
import { formatDate, formatTime } from "@/utils/format";
import type { CashRegister } from "@/types/cash-register.types";

export function CaixaCard({
  register,
  onClick,
}: {
  register: CashRegister;
  onClick: () => void;
}) {
  const aberto = register.closedAt === null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full text-left rounded-lg border border-border bg-surface-raised p-4 hover:border-brand/40 transition-colors flex items-center gap-3"
    >
      <div className="size-10 rounded-lg bg-brand/15 text-brand grid place-items-center shrink-0">
        <Building2 className="size-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-foreground truncate">
          {register.branch?.name ?? "Filial"}
        </p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
          <Clock className="size-3" />
          <span>
            Aberto em {formatDate(register.createdAt)} às{" "}
            {formatTime(register.createdAt)}
          </span>
        </div>
      </div>
      <span
        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
          aberto
            ? "bg-success-bg text-success-foreground"
            : "bg-surface-elevated text-muted-foreground"
        }`}
      >
        {aberto ? "Aberto" : "Fechado"}
      </span>
      <ChevronRight className="size-4 text-text-faint group-hover:text-brand transition-colors shrink-0" />
    </button>
  );
}
