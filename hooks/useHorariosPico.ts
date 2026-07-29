/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { appointmentsService } from "@/services/appointments.service";
import { employeesService } from "@/services/employees.service";
import type { Appointment } from "@/types/appointment.types";
import type { Employee } from "@/types/employee.types";
import { toWallClockDate } from "@/utils/format";

/** Período fixo analisado (dias corridos para trás a partir de hoje). */
const PERIOD_DAYS = 30;

/** Faixa de horas exibida por padrão quando não há dados suficientes. */
const DEFAULT_MIN_HOUR = 8;
const DEFAULT_MAX_HOUR = 19;

export const DIAS_SEMANA = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"] as const;

/** `Date#getDay()` retorna 0=Domingo..6=Sábado; convertemos para 0=Segunda..6=Domingo. */
function weekdayIndex(date: Date): number {
  const d = date.getDay();
  return d === 0 ? 6 : d - 1;
}

export interface HeatmapGrid {
  /** Horas exibidas nas linhas, em ordem crescente. */
  hours: number[];
  /** Contagem de agendamentos por célula, chave `${dayIndex}-${hour}`. */
  counts: Map<string, number>;
  /** Maior contagem entre as células (base para o percentual de intensidade). */
  maxCount: number;
  /** Total de agendamentos considerados no grid. */
  total: number;
}

export function useHorariosPico(barbershopId: string | undefined) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
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
      employeesService.list(barbershopId),
    ])
      .then(([appts, emps]) => {
        if (!active) return;
        setAppointments(appts);
        setEmployees(emps);
      })
      .catch((err: unknown) => {
        if (!active) return;
        toast.error(
          err instanceof Error
            ? err.message
            : "Falha ao carregar horários de pico.",
        );
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [barbershopId]);

  /** Filial de cada profissional (o agendamento não guarda a filial diretamente). */
  const branchByEmployeeId = useMemo(
    () => new Map(employees.map((e) => [e.id, e.branchId])),
    [employees],
  );

  /**
   * Monta o grid dia-da-semana x hora para os últimos 30 dias, aplicando os
   * filtros de filial e profissional selecionados.
   */
  function buildGrid(branchId: string, employeeId: string): HeatmapGrid {
    const since = new Date();
    since.setDate(since.getDate() - PERIOD_DAYS);

    const filtered = appointments.filter((a) => {
      if (a.status === "CANCELLED") return false;
      if (toWallClockDate(a.scheduledAt) < since) return false;
      if (employeeId !== "todos" && a.employeeId !== employeeId) return false;
      if (branchId !== "todas") {
        const empBranch = a.employeeId
          ? branchByEmployeeId.get(a.employeeId)
          : undefined;
        if (empBranch !== branchId) return false;
      }
      return true;
    });

    let minHour = DEFAULT_MIN_HOUR;
    let maxHour = DEFAULT_MAX_HOUR;
    const counts = new Map<string, number>();

    for (const a of filtered) {
      const date = toWallClockDate(a.scheduledAt);
      const hour = date.getHours();
      minHour = Math.min(minHour, hour);
      maxHour = Math.max(maxHour, hour);
      const key = `${weekdayIndex(date)}-${hour}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    const hours: number[] = [];
    for (let h = minHour; h <= maxHour; h++) hours.push(h);

    const maxCount = counts.size > 0 ? Math.max(...counts.values()) : 0;

    return { hours, counts, maxCount, total: filtered.length };
  }

  /** Profissionais de uma filial (ou todos, se `branchId` for "todas"). */
  function employeesForBranch(branchId: string): Employee[] {
    if (branchId === "todas") return employees;
    return employees.filter((e) => e.branchId === branchId);
  }

  return {
    appointments,
    employees,
    isLoading,
    buildGrid,
    employeesForBranch,
  };
}
