"use client";

import { motion } from "framer-motion";
import {
  Star,
  Signature,
  CircleAlert,
  Cake,
  CheckCircle2,
  StickyNote,
  Wifi,
  Monitor,
  Hourglass,
  Info,
} from "lucide-react";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import { STATUS_LEGENDA } from "./status";

const ICON_ITEMS = [
  { icon: Star, label: "Primeiro agendamento" },
  { icon: Signature, label: "Assinante ativo" },
  { icon: CircleAlert, label: "Assinante inadimplente" },
  { icon: Cake, label: "Aniversariante da semana" },
  { icon: CheckCircle2, label: "Confirmado" },
  { icon: StickyNote, label: "Cliente com nota" },
  { icon: Wifi, label: "Agendado pelo cliente" },
  { icon: Monitor, label: "Agendado pela recepção" },
  { icon: Hourglass, label: "Aguardando confirmação" },
] as const;

/** Legenda dos ícones de situação/atributos do agendamento. */
export function IconLegend() {
  return (
    <div className="flex items-center gap-3 px-4 md:px-6 py-2 border-b border-border-subtle shrink-0 overflow-x-auto schedule-scroll">
      {ICON_ITEMS.map(({ icon: Icon, label }) => (
        <div key={label} className="flex items-center gap-1.5 shrink-0">
          <Icon className="size-3.5 text-brand" />
          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Legenda de cores das situações do agendamento. */
export function ColorLegend() {
  return (
    <div className="flex items-center gap-3 px-4 md:px-6 py-2 border-b border-border-subtle shrink-0 overflow-x-auto schedule-scroll">
      {STATUS_LEGENDA.map((s) => (
        <div key={s.label} className="flex items-center gap-1.5 shrink-0">
          <span
            className="size-2.5 rounded-full border border-border-subtle"
            style={{ backgroundColor: s.cor }}
          />
          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
            {s.label}
          </span>
        </div>
      ))}
      <div className="ml-auto shrink-0">
        <AgendaInfo />
      </div>
    </div>
  );
}

/** Ícone "i" com balão informativo (HoverCard do shadcn, animado com framer-motion). */
export function AgendaInfo() {
  return (
    <HoverCard>
      <HoverCardTrigger
        render={
          <button
            type="button"
            aria-label="Como agendar"
            className="size-6 rounded-full grid place-items-center text-muted-foreground hover:text-brand transition-colors"
          />
        }
      >
        <Info className="size-4" />
      </HoverCardTrigger>
      <HoverCardContent side="top" align="end" className="w-60">
        <motion.div
          initial={{ opacity: 0, y: -4, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
        >
          <p className="text-[11px] font-bold text-brand uppercase tracking-widest mb-1">
            Como agendar
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            As colunas são os profissionais e as linhas são os horários. Clique
            em um horário livre na coluna do profissional para abrir um novo
            agendamento.
          </p>
        </motion.div>
      </HoverCardContent>
    </HoverCard>
  );
}
