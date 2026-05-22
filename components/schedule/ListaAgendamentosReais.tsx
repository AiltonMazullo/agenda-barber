"use client";

import { useMemo, useState } from "react";
import {
  Clock,
  Search,
  CheckCircle2,
  XCircle,
  CheckSquare,
  Wifi,
  AlertCircle,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/shared";
import { useAuth } from "@/hooks/useAuth";
import { useAppointments } from "@/hooks/useAppointments";
import { useServices } from "@/hooks/useServices";
import { DialogNovoAgendamentoAPI } from "@/components/schedule/DialogNovoAgendamentoAPI";
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

export function ListaAgendamentosReais() {
  const { barbershop } = useAuth();
  const { appointments, isLoading, create, updateStatus, cancel } =
    useAppointments(barbershop?.id);
  const { services } = useServices(barbershop?.id);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [novoDialog, setNovoDialog] = useState(false);

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

  async function handleAction(
    appt: Appointment,
    action: "CONFIRMED" | "COMPLETED" | "CANCELLED" | "DELETE",
  ) {
    setBusyId(appt.id);
    try {
      if (action === "DELETE") {
        if (!confirm("Remover este agendamento? Essa ação não pode ser desfeita.")) {
          return;
        }
        await cancel(appt.id);
      } else {
        await updateStatus(appt.id, action);
      }
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header / filtros */}
      <div className="flex items-center gap-2 px-4 md:px-6 py-3 border-b border-border-subtle shrink-0 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-40">
          <Search className="size-3.5 text-text-subtle shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cliente ou serviço..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-text-subtle outline-none min-w-0"
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

        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <div className="flex items-center gap-1.5 text-[11px] text-text-subtle">
            <Wifi className="size-3 text-success-foreground" />
            dados da API
          </div>
          <button
            type="button"
            onClick={() => setNovoDialog(true)}
            className="h-8 px-3 rounded-md text-xs font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors flex items-center gap-1.5"
          >
            <Plus className="size-3.5" />
            Novo
          </button>
        </div>
      </div>

      {/* Lista */}
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
          <div className="space-y-2">
            {filtered.map((a) => {
              const { date, time } = formatDateTime(a.scheduledAt);
              const isCancelled = a.status === "CANCELLED";
              const isCompleted = a.status === "COMPLETED";
              const busy = busyId === a.id;
              return (
                <div
                  key={a.id}
                  className={cn(
                    "rounded-lg border bg-surface-raised p-4 transition-colors",
                    isCancelled || isCompleted
                      ? "border-border-subtle opacity-70"
                      : "border-border hover:border-brand/40",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-1 self-stretch rounded-full shrink-0"
                      style={{
                        backgroundColor: a.service.hex ?? "#f5b82e",
                      }}
                    />
                    <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          {a.client.name}
                        </p>
                        <p className="text-xs text-text-subtle truncate">
                          {a.client.email}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground truncate">
                          {a.service.name}
                        </p>
                        <p className="text-[10px] text-text-subtle">
                          {a.service.durationMin} min ·{" "}
                          {(a.service.priceInCents / 100).toLocaleString(
                            "pt-BR",
                            { style: "currency", currency: "BRL" },
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="size-3 text-text-subtle" />
                        <div className="text-xs">
                          <span className="text-white font-mono">{time}</span>
                          <span className="text-text-subtle ml-1.5">
                            {date}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between md:justify-end gap-2">
                        <StatusBadge tone={STATUS_TONE[a.status]}>
                          {STATUS_LABEL[a.status]}
                        </StatusBadge>
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  {!isCancelled && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border-subtle">
                      {a.status === "PENDING" && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => handleAction(a, "CONFIRMED")}
                          className="h-7 px-3 rounded-md border border-info/40 bg-info/10 text-xs font-semibold text-info-foreground hover:bg-info/20 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <CheckCircle2 className="size-3" />
                          Confirmar
                        </button>
                      )}
                      {!isCompleted && a.status !== "CANCELLED" && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => handleAction(a, "COMPLETED")}
                          className="h-7 px-3 rounded-md border border-success/40 bg-success/10 text-xs font-semibold text-success-foreground hover:bg-success/20 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <CheckSquare className="size-3" />
                          Concluir
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleAction(a, "CANCELLED")}
                        className="h-7 px-3 rounded-md border border-warning/40 bg-warning/10 text-xs font-semibold text-warning-foreground hover:bg-warning/20 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <XCircle className="size-3" />
                        Cancelar
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleAction(a, "DELETE")}
                        className="h-7 px-3 rounded-md border border-danger/40 bg-transparent text-xs font-semibold text-danger-foreground hover:bg-danger/10 transition-colors flex items-center gap-1.5 ml-auto disabled:opacity-50"
                      >
                        Remover
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <DialogNovoAgendamentoAPI
        open={novoDialog}
        onOpenChange={setNovoDialog}
        services={services}
        onCreate={create}
      />
    </div>
  );
}
