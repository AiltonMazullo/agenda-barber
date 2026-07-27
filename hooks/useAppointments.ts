/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { appointmentsService } from "@/services/appointments.service";
import type {
  Appointment,
  CreateAppointmentPayload,
  RescheduleAppointmentPayload,
  UpdatableAppointmentStatus,
} from "@/types/appointment.types";

export function useAppointments(barbershopId: string | undefined) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!barbershopId) {
      setIsLoading(false);
      return;
    }
    let active = true;
    setIsLoading(true);
    appointmentsService
      .list(barbershopId)
      .then((data) => {
        if (active) setAppointments(data as unknown as Appointment[]);
      })
      .catch((err: unknown) => {
        if (!active) return;
        toast.error(
          err instanceof Error
            ? err.message
            : "Falha ao carregar agendamentos.",
        );
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [barbershopId]);

  /** Recarrega a lista do servidor (ex.: após criar). */
  const refetch = useCallback(async () => {
    if (!barbershopId) return;
    try {
      const data = await appointmentsService.list(barbershopId);
      setAppointments(data as unknown as Appointment[]);
    } catch {
      // silencioso — o estado atual permanece
    }
  }, [barbershopId]);

  const create = useCallback(
    async (payload: CreateAppointmentPayload) => {
      if (!barbershopId) return null;
      try {
        const created = await appointmentsService.create(barbershopId, payload);
        setAppointments((prev) => [...prev, ...(created as unknown as Appointment[])]);
        toast.success("Agendamento criado.");
        return created[0] ?? null;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao criar agendamento.",
        );
        return null;
      }
    },
    [barbershopId],
  );

  const updateStatus = useCallback(
    async (id: string, status: UpdatableAppointmentStatus) => {
      if (!barbershopId) return null;
      try {
        const updated = await appointmentsService.updateStatus(
          barbershopId,
          id,
          { status },
        );
        // O backend cascateia a mudança de status para todo o grupo (card
        // combo) — refletimos isso localmente pros irmãos não ficarem com
        // status desatualizado até o próximo refetch.
        setAppointments((prev) => {
          const groupId = prev.find((a) => a.id === id)?.groupId;
          return prev.map((a) =>
            a.id === id || (groupId && a.groupId === groupId)
              ? { ...a, status: updated.status }
              : a,
          );
        });
        toast.success(
          status === "CONFIRMED"
            ? "Agendamento confirmado."
            : status === "COMPLETED"
              ? "Atendimento concluído."
              : status === "NO_SHOW"
                ? "Falta registrada."
                : "Agendamento cancelado.",
        );
        return updated;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao atualizar status.",
        );
        return null;
      }
    },
    [barbershopId],
  );

  const cancel = useCallback(
    async (id: string) => {
      if (!barbershopId) return false;
      try {
        await appointmentsService.cancel(barbershopId, id);
        // O backend cascateia o cancelamento para todo o grupo (card combo)
        // — removemos todos os irmãos localmente também.
        setAppointments((prev) => {
          const groupId = prev.find((a) => a.id === id)?.groupId;
          return prev.filter(
            (a) => a.id !== id && !(groupId && a.groupId === groupId),
          );
        });
        toast.success("Agendamento removido.");
        return true;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao remover agendamento.",
        );
        return false;
      }
    },
    [barbershopId],
  );

  /**
   * Atualização puramente local, usada para enriquecer um agendamento recém
   * criado (client/employee) sem esperar um refetch completo da lista.
   */
  const replaceLocal = useCallback(
    (id: string, partial: Partial<Appointment>) => {
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...partial } : a)),
      );
    },
    [],
  );

  /**
   * Persiste o reagendamento (drag-and-drop): `PATCH /appointments/:id/reschedule`.
   * A checagem de conflito de horário é feita no backend (mesma lógica de
   * `GET /availability`) — em caso de 409/422 o request falha e quem chamou
   * (useSchedule) é responsável por reverter o overlay visual otimista.
   */
  const reschedule = useCallback(
    async (id: string, payload: RescheduleAppointmentPayload) => {
      if (!barbershopId) return null;
      try {
        const updated = await appointmentsService.reschedule(
          barbershopId,
          id,
          payload,
        );
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, ...updated } : a)),
        );
        // Card combo (`groupId`): o backend também desloca os irmãos, mas
        // não sabemos o novo horário de cada um localmente — refetch pra não
        // deixá-los com `scheduledAt` desatualizado (o que trocaria qual
        // membro vira o "primário" do card na próxima renderização).
        if (updated.groupId) void refetch();
        return updated;
      } catch (err) {
        toast.error(
          err instanceof Error
            ? err.message
            : "Falha ao reagendar. O horário foi restaurado.",
        );
        return null;
      }
    },
    [barbershopId, refetch],
  );

  return {
    appointments,
    isLoading,
    create,
    updateStatus,
    cancel,
    replaceLocal,
    reschedule,
    refetch,
  };
}
