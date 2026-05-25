"use client";

import { useMemo } from "react";
import { Users, DollarSign, TrendingUp } from "lucide-react";
import type { Appointment } from "@/types/appointment.types";

interface ResumoDiaProps {
  appointments: Appointment[];
}

export function ResumoDia({ appointments }: ResumoDiaProps) {
  const stats = useMemo(() => {
    const total = appointments.length;
    const faturamento = appointments.reduce(
      (acc, a) => acc + a.service.priceInCents / 100,
      0,
    );
    const servicoCount = appointments.reduce<Record<string, number>>(
      (acc, a) => {
        const key = a.service.name;
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      },
      {},
    );
    const sorted = Object.entries(servicoCount).sort((a, b) => b[1] - a[1]);
    const top = sorted[0];
    return { total, faturamento, topNome: top?.[0] ?? "—", topQtd: top?.[1] };
  }, [appointments]);

  return (
    <div className="flex items-center gap-3 px-4 md:px-6 py-2.5 border-b border-border-subtle shrink-0 overflow-x-auto schedule-scroll">
      <div className="flex items-center gap-2 shrink-0 px-3 py-1.5 rounded-md bg-surface-raised border border-border-subtle">
        <Users className="size-3.5 text-brand" />
        <span className="text-[10px] text-muted-foreground">Atendimentos</span>
        <span className="text-sm font-bold text-foreground">{stats.total}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0 px-3 py-1.5 rounded-md bg-surface-raised border border-border-subtle">
        <DollarSign className="size-3.5 text-emerald-400" />
        <span className="text-[10px] text-muted-foreground">Faturamento previsto</span>
        <span className="text-sm font-bold text-emerald-400">
          {stats.faturamento.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0 px-3 py-1.5 rounded-md bg-surface-raised border border-border-subtle">
        <TrendingUp className="size-3.5 text-blue-400" />
        <span className="text-[10px] text-muted-foreground">Mais agendado</span>
        <span className="text-sm font-bold text-foreground truncate max-w-30">
          {stats.topNome}
        </span>
        {stats.topQtd && (
          <span className="text-[10px] text-text-subtle">({stats.topQtd}x)</span>
        )}
      </div>
    </div>
  );
}
