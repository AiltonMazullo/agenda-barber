/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import { employeesService } from "@/services/employees.service";
import type {
  EmployeeBreak,
  EmployeeSchedule,
  EmployeeTimeOff,
} from "@/types/employee.types";

/**
 * Horários de atendimento, intervalos e folgas de todos os profissionais
 * informados — usado pra renderizar as indisponibilidades na agenda (ver
 * `buildIndisponibilidades`). Busca sempre os dados atuais do backend (sem
 * cache), então uma mudança na configuração do profissional aparece na
 * agenda assim que a página é revisitada.
 */
export function useEmployeeAvailability(
  barbershopId: string | undefined,
  employeeIds: string[],
) {
  const [schedulesByEmployee, setSchedulesByEmployee] = useState<
    Map<string, EmployeeSchedule[]>
  >(new Map());
  const [breaksByEmployee, setBreaksByEmployee] = useState<
    Map<string, EmployeeBreak[]>
  >(new Map());
  const [timeOffByEmployee, setTimeOffByEmployee] = useState<
    Map<string, EmployeeTimeOff[]>
  >(new Map());
  const [isLoading, setIsLoading] = useState(true);

  // Chave estável — evita refetch quando o array de ids é recriado com o
  // mesmo conteúdo (ex.: `profissionais` recalculado em cada render).
  const idsKey = employeeIds.slice().sort().join(",");

  useEffect(() => {
    const ids = idsKey ? idsKey.split(",") : [];
    if (!barbershopId || ids.length === 0) {
      setSchedulesByEmployee(new Map());
      setBreaksByEmployee(new Map());
      setTimeOffByEmployee(new Map());
      setIsLoading(false);
      return;
    }
    let active = true;
    setIsLoading(true);

    Promise.all(
      ids.map(async (id) => {
        const [schedules, breaks, timeOff] = await Promise.all([
          employeesService.getSchedules(barbershopId, id),
          employeesService.getBreaks(barbershopId, id),
          employeesService.getTimeOff(barbershopId, id),
        ]);
        return { id, schedules, breaks, timeOff };
      }),
    )
      .then((results) => {
        if (!active) return;
        setSchedulesByEmployee(new Map(results.map((r) => [r.id, r.schedules])));
        setBreaksByEmployee(new Map(results.map((r) => [r.id, r.breaks])));
        setTimeOffByEmployee(new Map(results.map((r) => [r.id, r.timeOff])));
      })
      .catch(() => {
        // silencioso — a agenda simplesmente não mostra indisponibilidades
        // derivadas até a próxima tentativa (não bloqueia a página).
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [barbershopId, idsKey]);

  return useMemo(
    () => ({ schedulesByEmployee, breaksByEmployee, timeOffByEmployee, isLoading }),
    [schedulesByEmployee, breaksByEmployee, timeOffByEmployee, isLoading],
  );
}
