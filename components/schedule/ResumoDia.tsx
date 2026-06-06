"use client";

import Link from "next/link";
import { CalendarCheck, Receipt, ChevronRight } from "lucide-react";
import type { AgendamentoVM } from "./types";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function ResumoDia({
  agendamentos,
  comandasAbertas = 0,
}: {
  agendamentos: AgendamentoVM[];
  /** Total de comandas abertas (indicador clicável). */
  comandasAbertas?: number;
}) {
  const total = agendamentos.length;
  // Sem dados de assinatura ainda: assinantes = 0; o restante é não assinante.
  const assinantes = 0;
  const naoAssinantes = total - assinantes;

  return (
    <div className="flex items-center gap-3 px-4 md:px-6 py-2.5 border-b border-border-subtle shrink-0 overflow-x-auto schedule-scroll">
      <div className="flex items-center gap-2 shrink-0 px-3 py-1.5 rounded-md bg-surface-raised border border-border-subtle">
        <CalendarCheck className="size-3.5 text-brand" />
        <span className="text-xs text-muted-foreground">
          Agendamentos:{" "}
          <span className="font-bold text-foreground">{pad(total)}</span>
          <span className="mx-1.5 text-text-faint">·</span>
          Assinantes:{" "}
          <span className="font-bold text-foreground">{pad(assinantes)}</span>
          <span className="mx-1.5 text-text-faint">·</span>
          Não assinantes:{" "}
          <span className="font-bold text-foreground">{pad(naoAssinantes)}</span>
        </span>
      </div>

      <Link
        href="/orders"
        className="group flex items-center gap-2 shrink-0 px-3 py-1.5 rounded-md bg-surface-raised border border-border-subtle hover:border-brand/40 transition-colors"
      >
        <Receipt className="size-3.5 text-emerald-400" />
        <span className="text-xs text-muted-foreground">
          Comandas abertas:{" "}
          <span className="font-bold text-foreground">
            {pad(comandasAbertas)}
          </span>
        </span>
        <ChevronRight className="size-3 text-text-faint group-hover:text-brand transition-colors" />
      </Link>
    </div>
  );
}
