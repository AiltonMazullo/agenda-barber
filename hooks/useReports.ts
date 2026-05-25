/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { appointmentsService } from "@/services/appointments.service";
import { servicesService } from "@/services/services.service";
import type { Appointment } from "@/types/appointment.types";
import type { Service } from "@/types/service.types";

export interface FaturamentoMensal {
  /** YYYY-MM */
  mes: string;
  /** "Jan/25" */
  mesLabel: string;
  /** Total faturado em reais (soma dos services priceInCents/100). */
  total: number;
  /** Quantidade de atendimentos concluídos. */
  atendimentos: number;
}

export interface ServicoMaisVendido {
  service: Service;
  atendimentos: number;
  faturamento: number;
}

const MESES_PT = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
] as const;

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(d: Date): string {
  const yy = String(d.getFullYear()).slice(2);
  return `${MESES_PT[d.getMonth()]}/${yy}`;
}

export function useReports(barbershopId: string | undefined) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!barbershopId) {
      setIsLoading(false);
      return;
    }
    let active = true;
    setIsLoading(true);

    Promise.all([
      appointmentsService.list(barbershopId),
      servicesService.list(barbershopId),
    ])
      .then(([appts, svcs]) => {
        if (!active) return;
        setAppointments(appts);
        setServices(svcs);
      })
      .catch((err: unknown) => {
        if (!active) return;
        toast.error(
          err instanceof Error
            ? err.message
            : "Falha ao carregar relatórios.",
        );
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [barbershopId]);

  const completedAppointments = useMemo(
    () => appointments.filter((a) => a.status === "COMPLETED"),
    [appointments],
  );

  const faturamentoTotal = useMemo(
    () =>
      completedAppointments.reduce(
        (acc, a) => acc + a.service.priceInCents / 100,
        0,
      ),
    [completedAppointments],
  );

  const totalAtendimentos = completedAppointments.length;

  const ticketMedioGeral =
    totalAtendimentos > 0 ? faturamentoTotal / totalAtendimentos : 0;

  /** Últimos 6 meses (do mais antigo para o mais recente). */
  const faturamentoMensal = useMemo<FaturamentoMensal[]>(() => {
    const now = new Date();
    const buckets: FaturamentoMensal[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({
        mes: monthKey(d),
        mesLabel: monthLabel(d),
        total: 0,
        atendimentos: 0,
      });
    }
    const byKey = new Map(buckets.map((b) => [b.mes, b]));

    for (const a of completedAppointments) {
      const d = new Date(a.scheduledAt);
      const key = monthKey(d);
      const bucket = byKey.get(key);
      if (bucket) {
        bucket.total += a.service.priceInCents / 100;
        bucket.atendimentos += 1;
      }
    }

    return buckets;
  }, [completedAppointments]);

  const servicosMaisVendidos = useMemo<ServicoMaisVendido[]>(() => {
    const counts = new Map<
      string,
      { atendimentos: number; faturamento: number }
    >();
    for (const a of completedAppointments) {
      const prev = counts.get(a.service.id) ?? {
        atendimentos: 0,
        faturamento: 0,
      };
      counts.set(a.service.id, {
        atendimentos: prev.atendimentos + 1,
        faturamento: prev.faturamento + a.service.priceInCents / 100,
      });
    }
    return services
      .map((service) => {
        const stats = counts.get(service.id) ?? {
          atendimentos: 0,
          faturamento: 0,
        };
        return {
          service,
          atendimentos: stats.atendimentos,
          faturamento: stats.faturamento,
        };
      })
      .sort((a, b) => b.atendimentos - a.atendimentos);
  }, [completedAppointments, services]);

  return {
    isLoading,
    appointments,
    services,
    completedAppointments,
    faturamentoTotal,
    totalAtendimentos,
    ticketMedioGeral,
    faturamentoMensal,
    servicosMaisVendidos,
  };
}
