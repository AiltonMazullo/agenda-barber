"use client";

import { useMemo } from "react";
import { useAppointments } from "@/hooks/useAppointments";
import type { Appointment } from "@/types/appointment.types";

/**
 * Cliente "derivado" — extraído dos appointments retornados pela API.
 * Enquanto o backend não expõe rotas /clients, esta é a única forma
 * de listar clientes que já interagiram com a barbearia.
 */
export interface DerivedClient {
  id: string;
  name: string;
  email: string;
  totalAppointments: number;
  completedAppointments: number;
  totalSpent: number;
  lastVisit: string | null;
  upcomingVisit: string | null;
}

function buildClient(id: string, appts: Appointment[]): DerivedClient {
  const first = appts[0];
  const completed = appts.filter((a) => a.status === "COMPLETED");
  const totalSpent = completed.reduce(
    (acc, a) => acc + a.service.priceInCents / 100,
    0,
  );

  const past = appts
    .filter((a) => new Date(a.scheduledAt) < new Date())
    .sort(
      (a, b) =>
        new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
    );

  const future = appts
    .filter(
      (a) =>
        new Date(a.scheduledAt) >= new Date() && a.status !== "CANCELLED",
    )
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    );

  return {
    id,
    name: first.client.name,
    email: first.client.email,
    totalAppointments: appts.length,
    completedAppointments: completed.length,
    totalSpent,
    lastVisit: past[0]?.scheduledAt ?? null,
    upcomingVisit: future[0]?.scheduledAt ?? null,
  };
}

export function useDerivedClients(barbershopId: string | undefined) {
  const { appointments, isLoading } = useAppointments(barbershopId);

  const clients = useMemo<DerivedClient[]>(() => {
    const byClient = new Map<string, Appointment[]>();
    for (const a of appointments) {
      const list = byClient.get(a.clientId) ?? [];
      list.push(a);
      byClient.set(a.clientId, list);
    }
    return Array.from(byClient.entries())
      .map(([id, list]) => buildClient(id, list))
      .sort((a, b) => b.completedAppointments - a.completedAppointments);
  }, [appointments]);

  return { clients, isLoading, appointments };
}
