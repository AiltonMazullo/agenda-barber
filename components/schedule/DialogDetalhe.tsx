"use client";

import { useState } from "react";
import {
  X,
  User,
  Mail,
  Scissors,
  Clock,
  CheckCircle2,
  CheckSquare,
  XCircle,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/shared";
import { InfoRow } from "@/components/schedule/InfoRow";
import type {
  Appointment,
  AppointmentStatus,
  UpdatableAppointmentStatus,
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

interface DialogDetalheProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  appointment: Appointment | null;
  onUpdateStatus: (
    id: string,
    status: UpdatableAppointmentStatus,
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function DialogDetalhe({
  open,
  onOpenChange,
  appointment,
  onUpdateStatus,
  onDelete,
}: DialogDetalheProps) {
  const [busy, setBusy] = useState(false);

  if (!appointment) return null;

  const time = new Date(appointment.scheduledAt).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const date = new Date(appointment.scheduledAt).toLocaleDateString("pt-BR");

  const isCancelled = appointment.status === "CANCELLED";
  const isCompleted = appointment.status === "COMPLETED";
  const isPending = appointment.status === "PENDING";

  async function handleStatus(status: UpdatableAppointmentStatus) {
    if (!appointment) return;
    setBusy(true);
    try {
      await onUpdateStatus(appointment.id, status);
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!appointment) return;
    if (!confirm("Remover este agendamento? Essa ação não pode ser desfeita.")) {
      return;
    }
    setBusy(true);
    try {
      await onDelete(appointment.id);
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-raised border border-border text-foreground max-w-sm p-0 gap-0">
        <div
          className={cn("h-1 w-full rounded-t-lg")}
          style={{ backgroundColor: appointment.service.hex ?? "#f5b82e" }}
        />
        <DialogHeader className="px-6 pt-4 pb-4 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="size-2 rounded-full"
                style={{
                  backgroundColor: appointment.service.hex ?? "#f5b82e",
                }}
              />
              <DialogTitle className="text-base font-bold">
                {appointment.service.name}
              </DialogTitle>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="mt-2">
            <StatusBadge tone={STATUS_TONE[appointment.status]}>
              {STATUS_LABEL[appointment.status]}
            </StatusBadge>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-3">
          <InfoRow
            icon={<User className="size-3.5" />}
            label="Cliente"
            value={appointment.client.name}
          />
          <InfoRow
            icon={<Mail className="size-3.5" />}
            label="E-mail"
            value={appointment.client.email}
          />
          <InfoRow
            icon={<Scissors className="size-3.5" />}
            label="Serviço"
            value={`${appointment.service.name} · ${appointment.service.durationMin} min`}
          />
          <InfoRow
            icon={<Clock className="size-3.5" />}
            label="Data / Hora"
            value={`${date} às ${time}`}
          />
          <div className="pt-1 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Valor do serviço</span>
            <span className="text-sm font-bold text-emerald-400">
              {(appointment.service.priceInCents / 100).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </span>
          </div>
        </div>

        {!isCancelled && (
          <div className="px-6 pb-6 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {isPending && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleStatus("CONFIRMED")}
                  className="h-9 px-4 rounded-md border border-info/40 bg-info/10 text-xs font-semibold text-info-foreground hover:bg-info/20 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle2 className="size-3.5" />
                  Confirmar
                </button>
              )}
              {!isCompleted && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleStatus("COMPLETED")}
                  className="h-9 px-4 rounded-md border border-success/40 bg-success/10 text-xs font-semibold text-success-foreground hover:bg-success/20 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <CheckSquare className="size-3.5" />
                  Concluir
                </button>
              )}
              <button
                type="button"
                disabled={busy}
                onClick={() => handleStatus("CANCELLED")}
                className="h-9 px-4 rounded-md border border-warning/40 bg-warning/10 text-xs font-semibold text-warning-foreground hover:bg-warning/20 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <XCircle className="size-3.5" />
                Cancelar
              </button>
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={handleDelete}
              className="w-full h-9 px-4 rounded-md border border-danger/30 bg-transparent text-xs font-semibold text-danger-foreground hover:bg-danger/10 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Trash2 className="size-3.5" />
              Remover
            </button>
          </div>
        )}
        {isCancelled && (
          <div className="px-6 pb-6">
            <button
              type="button"
              disabled={busy}
              onClick={handleDelete}
              className="w-full h-9 px-4 rounded-md border border-danger/30 bg-transparent text-xs font-semibold text-danger-foreground hover:bg-danger/10 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Trash2 className="size-3.5" />
              Remover definitivamente
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
