"use client";

import { useMemo, useState } from "react";
import { Clock, Search, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/shared";
import type {
  Appointment,
  AppointmentStatus,
} from "@/types/appointment.types";
import type { Tone } from "@/types/common.types";

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
};

const STATUS_TONE: Record<AppointmentStatus, Tone> = {
  PENDING: "warning",
  CONFIRMED: "info",
  COMPLETED: "success",
  CANCELLED: "danger",
};

type StatusFilter = "todos" | AppointmentStatus;

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "PENDING", label: "Pendentes" },
  { value: "CONFIRMED", label: "Confirmados" },
  { value: "COMPLETED", label: "Concluídos" },
  { value: "CANCELLED", label: "Cancelados" },
];

interface ModoListaProps {
  appointments: Appointment[];
  isLoading?: boolean;
  onCardClick: (a: Appointment) => void;
}

function formatDateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    time: d.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

export function ModoLista({
  appointments,
  isLoading,
  onCardClick,
}: ModoListaProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return appointments
      .filter((a) => {
        if (statusFilter !== "todos" && a.status !== statusFilter) return false;
        if (
          q &&
          !a.client.name.toLowerCase().includes(q) &&
          !a.service.name.toLowerCase().includes(q)
        )
          return false;
        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
      );
  }, [appointments, search, statusFilter]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-2 px-4 md:px-6 py-3 border-b border-border-subtle shrink-0 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-40">
          <Search className="size-3.5 text-text-subtle shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cliente ou serviço..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-text-subtle outline-none min-w-0"
          />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setStatusFilter(f.value)}
              className={cn(
                "h-8 px-3 rounded-md text-xs font-semibold transition-colors",
                statusFilter === f.value
                  ? "bg-brand text-brand-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated border border-border",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <span className="text-[11px] text-text-subtle ml-auto shrink-0">
          {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex-1 overflow-auto schedule-scroll px-4 md:px-6 py-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-text-subtle text-sm">
            Carregando agendamentos…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-text-subtle gap-2">
            <AlertCircle className="size-8 opacity-40" />
            <p className="text-sm">
              {appointments.length === 0
                ? "Nenhum agendamento cadastrado ainda."
                : "Nenhum agendamento corresponde aos filtros."}
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {filtered.map((a) => {
              const { date, time } = formatDateTime(a.scheduledAt);
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => onCardClick(a)}
                  className="w-full text-left rounded-lg border border-border-subtle bg-surface-raised hover:border-border hover:bg-surface-elevated transition-colors p-3 flex items-center gap-3"
                >
                  <div
                    className="w-0.5 self-stretch rounded-full shrink-0"
                    style={{ backgroundColor: a.service.hex ?? "#f5b82e" }}
                  />
                  <div className="flex-1 grid grid-cols-4 gap-2 items-center min-w-0">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {a.client.name}
                      </p>
                      <p className="text-xs text-text-subtle truncate">
                        {a.client.email}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="size-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: a.service.hex ?? "#f5b82e" }}
                        />
                        <p className="text-xs text-muted-foreground truncate">
                          {a.service.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="size-3 text-text-subtle" />
                      <div className="text-xs">
                        <span className="text-foreground font-mono">{time}</span>
                        <span className="text-text-subtle ml-1.5">{date}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <StatusBadge tone={STATUS_TONE[a.status]}>
                        {STATUS_LABEL[a.status]}
                      </StatusBadge>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-emerald-400 shrink-0">
                    {(a.service.priceInCents / 100).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
