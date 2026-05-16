import { Users, DollarSign, TrendingUp } from "lucide-react";
import { SERVICOS, type Agendamento } from "@/mock/schedule";

interface ResumoDiaProps {
  agendamentos: Agendamento[];
}

export function ResumoDia({ agendamentos }: ResumoDiaProps) {
  const total = agendamentos.length;
  const faturamento = agendamentos.reduce((acc, ag) => {
    const s = SERVICOS.find((sv) => sv.id === ag.servicoId);
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
    ? (SERVICOS.find((s) => s.id === topServico[0])?.nome ?? "—")
    : "—";

  return (
    <div className="flex items-center gap-3 px-4 md:px-6 py-2.5 border-b border-border-subtle shrink-0 overflow-x-auto">
      <div className="flex items-center gap-2 shrink-0 px-3 py-1.5 rounded-md bg-surface-raised border border-border-subtle">
        <Users className="size-3.5 text-brand" />
        <span className="text-[10px] text-muted-foreground">Atendimentos</span>
        <span className="text-sm font-bold text-white">{total}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0 px-3 py-1.5 rounded-md bg-surface-raised border border-border-subtle">
        <DollarSign className="size-3.5 text-emerald-400" />
        <span className="text-[10px] text-muted-foreground">Faturamento</span>
        <span className="text-sm font-bold text-emerald-400">
          R$ {faturamento.toFixed(2).replace(".", ",")}
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0 px-3 py-1.5 rounded-md bg-surface-raised border border-border-subtle">
        <TrendingUp className="size-3.5 text-blue-400" />
        <span className="text-[10px] text-muted-foreground">Mais realizado</span>
        <span className="text-sm font-bold text-white truncate max-w-[120px]">
          {topServicoNome}
        </span>
        {topServico && (
          <span className="text-[10px] text-text-subtle">
            ({topServico[1]}x)
          </span>
        )}
      </div>
    </div>
  );
}
