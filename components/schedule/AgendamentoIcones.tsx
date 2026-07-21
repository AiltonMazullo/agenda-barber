"use client";

import {
  Star,
  Signature,
  CircleAlert,
  Cake,
  CheckCircle2,
  StickyNote,
  Hourglass,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AgendamentoVM } from "./types";

/** Ícones de situação/atributos, na mesma ordem/semântica da legenda (IconLegend). */
export function AgendamentoIcones({
  agendamento,
  iconClassName = "size-2.5",
}: {
  agendamento: AgendamentoVM;
  iconClassName?: string;
}) {
  const items: { key: string; Icon: typeof Star; className: string }[] = [];
  if (agendamento.primeiroAgendamento) {
    items.push({ key: "primeiro", Icon: Star, className: "text-brand" });
  }
  if (agendamento.assinante === "ativo") {
    items.push({ key: "assinante", Icon: Signature, className: "text-brand" });
  }
  if (agendamento.assinante === "inadimplente") {
    items.push({ key: "inadimplente", Icon: CircleAlert, className: "text-danger-foreground" });
  }
  if (agendamento.aniversarianteSemana) {
    items.push({ key: "aniversario", Icon: Cake, className: "text-brand" });
  }
  if (agendamento.status === "CONFIRMED") {
    items.push({ key: "confirmado", Icon: CheckCircle2, className: "text-success-foreground" });
  }
  if (agendamento.status === "PENDING") {
    items.push({ key: "aguardando", Icon: Hourglass, className: "text-warning-foreground" });
  }
  if (agendamento.temNota) {
    items.push({ key: "nota", Icon: StickyNote, className: "text-text-faint" });
  }

  if (items.length === 0) return null;

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {items.map(({ key, Icon, className }) => (
        <Icon key={key} className={cn(iconClassName, "shrink-0", className)} />
      ))}
    </div>
  );
}
