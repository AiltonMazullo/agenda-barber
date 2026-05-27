"use client";

import { Calendar, Clock, X, RotateCcw } from "lucide-react";
import type { Appointment } from "@/types/appointment.types";

interface AppointmentItemProps {
  appointment: Appointment;
  variant: "upcoming" | "past" | "cancelled";
  onCancel?: (id: string) => void;
  onRebook?: (appt: Appointment) => void;
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
};

const STATUS_TONE: Record<string, string> = {
  PENDING: "bg-warning/15 text-warning-foreground",
  CONFIRMED: "bg-brand/15 text-brand",
  COMPLETED: "bg-success/15 text-success-foreground",
  CANCELLED: "bg-danger/15 text-danger-foreground",
};

function formatBRLFromCents(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function AppointmentItem({
  appointment,
  variant,
  onCancel,
  onRebook,
}: AppointmentItemProps) {
  const date = new Date(appointment.scheduledAt);
  const dateStr = date.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
  const timeStr = date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <article className="rounded-lg border border-border-subtle bg-surface-raised p-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <div
        className="size-3 rounded-full shrink-0"
        style={{ backgroundColor: appointment.service.hex ?? "#f5b82e" }}
      />
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-foreground truncate">
            {appointment.service.name}
          </h3>
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
              STATUS_TONE[appointment.status] ?? ""
            }`}
          >
            {STATUS_LABEL[appointment.status] ?? appointment.status}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="size-3" />
            <span className="capitalize">{dateStr}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="size-3" />
            <span>{timeStr}</span>
          </div>
          <span className="font-bold text-brand">
            {formatBRLFromCents(appointment.service.priceInCents)}
          </span>
        </div>
      </div>

      {variant === "upcoming" && onCancel && (
        <button
          type="button"
          onClick={() => onCancel(appointment.id)}
          className="text-xs text-danger-foreground hover:underline cursor-pointer flex items-center gap-1 shrink-0"
        >
          <X className="size-3" />
          Cancelar
        </button>
      )}

      {variant === "past" && onRebook && (
        <button
          type="button"
          onClick={() => onRebook(appointment)}
          className="text-xs text-brand hover:underline cursor-pointer flex items-center gap-1 shrink-0"
        >
          <RotateCcw className="size-3" />
          Agendar de novo
        </button>
      )}
    </article>
  );
}
