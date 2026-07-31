"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { startOfToday } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DatePickerField } from "@/components/shared";
import { HoraGrid } from "@/components/client/HoraGrid";
import { availabilityService } from "@/services/availability.service";
import { clientAppointmentsService } from "@/services/client-appointments.service";
import type { ClientAppointment } from "@/types/appointment.types";

interface RescheduleDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  barbershopId: string;
  appointment: ClientAppointment | null;
  onRescheduled: () => void;
}

/** Formata uma data local como "YYYY-MM-DD" (mesma convenção de `agendar/page.tsx`). */
function toDateParam(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function RescheduleDialog({
  open,
  onOpenChange,
  barbershopId,
  appointment,
  onRescheduled,
}: RescheduleDialogProps) {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDate(undefined);
    setSlots([]);
    setSelectedSlot(null);
  }, [open]);

  useEffect(() => {
    if (!open || !date || !appointment) return;
    let active = true;
    setLoadingSlots(true);
    setSelectedSlot(null);
    availabilityService
      .getAvailableSlots(barbershopId, {
        employeeId: appointment.employeeId ?? "",
        serviceIds: [appointment.serviceId],
        date: toDateParam(date),
      })
      .then((data) => {
        if (active) setSlots(data);
      })
      .catch(() => {
        if (active) toast.error("Falha ao carregar horários disponíveis.");
      })
      .finally(() => {
        if (active) setLoadingSlots(false);
      });
    return () => {
      active = false;
    };
  }, [open, date, appointment, barbershopId]);

  const busy = useMemo(() => new Set<string>(), []);

  async function handleConfirm() {
    if (!appointment || !date || !selectedSlot) return;
    const [h, m] = selectedSlot.split(":").map(Number);
    const scheduledAt = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), h, m, 0),
    );

    setSaving(true);
    try {
      await clientAppointmentsService.reschedule(
        barbershopId,
        appointment.id,
        scheduledAt.toISOString(),
      );
      toast.success("Agendamento remarcado!");
      onRescheduled();
      onOpenChange(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Falha ao remarcar agendamento.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-raised border border-border text-foreground sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Remarcar agendamento</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <DatePickerField
            id="reschedule-date"
            label="Nova data"
            date={date}
            onChange={setDate}
            disabled={{ before: startOfToday() }}
          />

          {date &&
            (loadingSlots ? (
              <p className="text-sm text-muted-foreground">Carregando horários…</p>
            ) : (
              <HoraGrid
                slots={slots}
                busy={busy}
                selected={selectedSlot}
                onSelect={setSelectedSlot}
              />
            ))}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-10 px-4 rounded-lg text-sm font-semibold border border-border-subtle hover:bg-surface-base transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!date || !selectedSlot || saving}
            className="h-10 px-4 rounded-lg text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors disabled:opacity-60"
          >
            {saving ? "Remarcando…" : "Confirmar"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
