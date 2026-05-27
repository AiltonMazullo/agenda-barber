"use client";

import { TrendingUp, DollarSign, Users } from "lucide-react";
import type { AgendamentoVM, ServicoVM } from "./types";

export function ResumoDia({
  agendamentos,
  servicoById,
}: {
  agendamentos: AgendamentoVM[];
  servicoById: Map<string, ServicoVM>;
}) {
  const total = agendamentos.length;
  const faturamento = agendamentos.reduce((acc, ag) => {
    const s = servicoById.get(ag.servicoId);
    return acc + (s?.preco ?? 0);
  }, 0);

  const servicoCount = agendamentos.reduce<Record<string, number>>(
    (acc, ag) => {
      acc[ag.servicoId] = (acc[ag.servicoId] ?? 0) + 1;
      return acc;
    },
    {},
  );

  const topServico = Object.entries(servicoCount).sort(
    (a, b) => b[1] - a[1],
  )[0];
  const topServicoNome = topServico
    ? (servicoById.get(topServico[0])?.nome ?? "—")
    : "—";

  return (
    <div className="flex items-center gap-3 px-4 md:px-6 py-2.5 border-b border-[#1c2128] shrink-0 overflow-x-auto">
      <div className="flex items-center gap-2 shrink-0 px-3 py-1.5 rounded-md bg-[#161b22] border border-[#21262d]">
        <Users className="size-3.5 text-[#f5b82e]" />
        <span className="text-[10px] text-[#8b949e]">Atendimentos</span>
        <span className="text-sm font-bold text-white">{total}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0 px-3 py-1.5 rounded-md bg-[#161b22] border border-[#21262d]">
        <DollarSign className="size-3.5 text-emerald-400" />
        <span className="text-[10px] text-[#8b949e]">Faturamento</span>
        <span className="text-sm font-bold text-emerald-400">
          R$ {faturamento.toFixed(2).replace(".", ",")}
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0 px-3 py-1.5 rounded-md bg-[#161b22] border border-[#21262d]">
        <TrendingUp className="size-3.5 text-blue-400" />
        <span className="text-[10px] text-[#8b949e]">Mais realizado</span>
        <span className="text-sm font-bold text-white truncate max-w-[120px]">
          {topServicoNome}
        </span>
        {topServico && (
          <span className="text-[10px] text-[#4d5562]">({topServico[1]}x)</span>
        )}
      </div>
    </div>
  );
}
