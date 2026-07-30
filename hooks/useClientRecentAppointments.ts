/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { clientsService } from "@/services/clients.service";
import type { AppointmentWithProducts } from "@/types/appointment.types";

/**
 * Últimos agendamentos de um cliente numa barbearia — usado no modal "Editar
 * agendamento" (histórico rápido de "últimos 3 agendamentos"). Só busca
 * quando `enabled` é true (ex.: o dialog está aberto) para não disparar uma
 * chamada por card renderizado na agenda.
 */
export function useClientRecentAppointments(
  barbershopId: string | undefined,
  clientId: string | undefined,
  enabled: boolean,
  limit = 3,
) {
  const [appointments, setAppointments] = useState<AppointmentWithProducts[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!barbershopId || !clientId || !enabled) {
      setAppointments([]);
      return;
    }
    let active = true;
    setIsLoading(true);
    clientsService
      .getRecentAppointments(barbershopId, clientId, limit)
      .then((data) => {
        if (active) setAppointments(data);
      })
      .catch(() => {
        // silencioso — o histórico simplesmente não aparece
        if (active) setAppointments([]);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [barbershopId, clientId, enabled, limit]);

  return { appointments, isLoading };
}
