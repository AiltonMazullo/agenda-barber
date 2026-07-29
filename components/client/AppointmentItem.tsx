"use client";

import { Calendar, Clock, X, CalendarClock, RotateCcw, Shuffle } from "lucide-react";
import type { ClientAppointment } from "@/types/appointment.types";
import type { AppointmentGroup } from "@/utils/groupAppointments";

interface AppointmentItemProps {
  group: AppointmentGroup;
  variant: "upcoming" | "past";
  /**
   * Nome do profissional resolvido externamente (vínculo local + lista de
   * funcionários). `null` → "Sem preferência" (ícone de sorteio).
   */
  professionalName?: string | null;
  /** Foto do profissional (fallback local); ausente → iniciais. */
  photoUrl?: string | null;
  onCancel?: (id: string) => void;
  onReschedule?: (appt: ClientAppointment) => void;
  onRebook?: (appt: ClientAppointment) => void;
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

const MESES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

function formatBRLFromCents(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export function AppointmentItem({
  group,
  variant,
  professionalName,
  photoUrl,
  onCancel,
  onReschedule,
  onRebook,
}: AppointmentItemProps) {
  const { primary, services, totalDurationMin } = group;
  const date = new Date(primary.scheduledAt);
  // scheduledAt guarda a hora de parede local "disfarçada" de UTC (ver
  // convenção em agendar/page.tsx), então usamos os getters UTC — não os
  // locais nem toLocaleTimeString, que reconverteriam pelo fuso real do
  // navegador e desalinhariam o horário exibido (ex.: -3h no Brasil).
  const dateStr = `${String(date.getUTCDate()).padStart(2, "0")} ${MESES[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
  const timeStr = `${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}`;

  const serviceNames = services.map((s) => s.name).join(" + ");
  const totalPriceInCents = services.reduce((sum, s) => sum + s.priceInCents, 0);

  const resolvedName =
    professionalName ||
    primary.employee?.appName ||
    primary.employee?.name ||
    null;
  const noEmployee = !resolvedName;
  const profName = resolvedName ?? "Sem preferência";

  return (
    <article className="rounded-xl border border-border-subtle bg-surface-raised p-4 flex flex-col gap-4 sm:flex-row sm:items-center">
      {/* Avatar do profissional */}
      <div
        className={`size-12 rounded-full grid place-items-center shrink-0 bg-cover bg-center overflow-hidden ${
          noEmployee ? "bg-surface-base text-muted-foreground" : "bg-brand/15 text-brand"
        }`}
        style={photoUrl ? { backgroundImage: `url(${photoUrl})` } : undefined}
      >
        {noEmployee ? (
          <Shuffle className="size-5" />
        ) : (
          !photoUrl && (
            <span className="text-xs font-bold">{initialsOf(profName)}</span>
          )
        )}
      </div>

      {/* Serviço(s) + meta + preço */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2">
          <span
            className="size-2 rounded-full shrink-0"
            style={{ backgroundColor: services[0]?.hex ?? "#f5b82e" }}
          />
          <h3 className="text-sm font-bold text-foreground truncate">
            {serviceNames}
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="size-3" />
            {totalDurationMin} min
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="size-3" />
            {dateStr}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="size-3" />
            {timeStr}
          </span>
        </div>
        <p className="text-sm font-bold text-brand">
          {formatBRLFromCents(totalPriceInCents)}
        </p>
      </div>

      {/* Profissional */}
      <div className="min-w-0 sm:w-32 shrink-0">
        <p className="text-xs text-muted-foreground">Profissional</p>
        <p className="text-sm font-bold text-foreground truncate">{profName}</p>
      </div>

      {/* Status + ações */}
      <div className="flex flex-row items-center justify-between gap-4 sm:flex-col sm:items-end shrink-0">
        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
            STATUS_TONE[primary.status] ?? ""
          }`}
        >
          {STATUS_LABEL[primary.status] ?? primary.status}
        </span>

        {variant === "upcoming" ? (
          <div className="flex items-center gap-3">
            {onReschedule && (
              <button
                type="button"
                onClick={() => onReschedule(primary)}
                className="text-xs font-medium text-brand hover:underline cursor-pointer flex items-center gap-1"
              >
                <CalendarClock className="size-3.5" />
                Remarcar
              </button>
            )}
            {onCancel && (
              <button
                type="button"
                onClick={() => onCancel(primary.id)}
                className="text-xs font-medium text-danger-foreground hover:underline cursor-pointer flex items-center gap-1"
              >
                <X className="size-3.5" />
                Cancelar
              </button>
            )}
          </div>
        ) : (
          onRebook && (
            <button
              type="button"
              onClick={() => onRebook(primary)}
              className="text-xs font-medium text-brand hover:underline cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="size-3.5" />
              Agendar de novo
            </button>
          )
        )}
      </div>
    </article>
  );
}
