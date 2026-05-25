"use client";

import { AppointmentCard } from "@/components/schedule/AppointmentCard";
import type { Appointment } from "@/types/appointment.types";
import type { Service } from "@/types/service.types";

interface ServicoColunaProps {
  service: Service;
  appointments: Appointment[];
  onCardClick: (a: Appointment) => void;
}

export function ServicoColuna({
  service,
  appointments,
  onCardClick,
}: ServicoColunaProps) {
  const ordered = [...appointments].sort(
    (a, b) =>
      new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
  );

  return (
    <div className="flex flex-col min-w-65 flex-1 bg-surface-raised rounded-lg border border-border-subtle overflow-hidden">
      <div className="px-3 py-3 border-b border-border-subtle flex items-center gap-2">
        <span
          className="size-3 rounded-full shrink-0"
          style={{ backgroundColor: service.hex ?? "#f5b82e" }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground truncate">
            {service.name}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {service.durationMin} min ·{" "}
            {(service.priceInCents / 100).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        </div>
        <span className="text-[10px] font-bold bg-surface-elevated text-muted-foreground px-2 py-0.5 rounded-md shrink-0">
          {appointments.length}
        </span>
      </div>
      <div className="flex-1 p-2 space-y-2 overflow-y-auto schedule-scroll">
        {ordered.length === 0 ? (
          <p className="text-xs text-text-faint text-center py-8">
            Sem agendamentos
          </p>
        ) : (
          ordered.map((a) => (
            <AppointmentCard
              key={a.id}
              appointment={a}
              onClick={() => onCardClick(a)}
            />
          ))
        )}
      </div>
    </div>
  );
}
