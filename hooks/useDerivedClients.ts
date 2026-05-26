"use client";

import { useMemo } from "react";
import { useAppointments } from "@/hooks/useAppointments";
import { useClients } from "@/hooks/useClients";
import type { Appointment } from "@/types/appointment.types";
import type { Client } from "@/types/client.types";

/**
 * Cliente enriquecido com estatísticas dos agendamentos.
 *
 * A lista oficial vem do `useClients` (rota /clients). As estatísticas
 * (total gasto, visitas, próxima visita) são calculadas a partir dos
 * `useAppointments`. Clientes sem agendamento ainda aparecem na lista —
 * apenas com stats zeradas.
 */
export interface DerivedClient {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  totalAppointments: number;
  completedAppointments: number;
  totalSpent: number;
  lastVisit: string | null;
  upcomingVisit: string | null;
}

function statsFor(clientId: string, appts: Appointment[]) {
  const filtered = appts.filter((a) => a.clientId === clientId);
  const completed = filtered.filter((a) => a.status === "COMPLETED");
  const totalSpent = completed.reduce(
    (acc, a) => acc + a.service.priceInCents / 100,
    0,
  );
  const now = new Date();
  const past = filtered
    .filter((a) => new Date(a.scheduledAt) < now)
    .sort(
      (a, b) =>
        new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
    );
  const future = filtered
    .filter(
      (a) => new Date(a.scheduledAt) >= now && a.status !== "CANCELLED",
    )
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    );

  return {
    totalAppointments: filtered.length,
    completedAppointments: completed.length,
    totalSpent,
    lastVisit: past[0]?.scheduledAt ?? null,
    upcomingVisit: future[0]?.scheduledAt ?? null,
  };
}

export function useDerivedClients(barbershopId: string | undefined) {
  const { clients, isLoading: loadingClients } = useClients(barbershopId);
  const { appointments, isLoading: loadingAppts } = useAppointments(barbershopId);

  const derived = useMemo<DerivedClient[]>(() => {
    return clients
      .map((c: Client) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        ...statsFor(c.id, appointments),
      }))
      .sort(
        (a, b) =>
          b.completedAppointments - a.completedAppointments ||
          a.name.localeCompare(b.name),
      );
  }, [clients, appointments]);

  return {
    clients: derived,
    isLoading: loadingClients || loadingAppts,
    appointments,
  };
}
