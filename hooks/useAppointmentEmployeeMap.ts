/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Vínculo Appointment → Employee mantido em localStorage.
 *
 * O backend ainda não armazena `employeeId` em Appointment. Enquanto isso
 * não acontece, mantemos a relação **no navegador do usuário** para
 * permitir o kanban por profissional. Limitações conhecidas:
 *
 * - Quando o usuário acessa de outro dispositivo, a relação se perde.
 * - Outros funcionários da barbearia não veem essa atribuição.
 * - Se a barbearia tem múltiplas pessoas operando o sistema, sincronia falha.
 *
 * Quando o backend adicionar `employeeId` em Appointment, basta substituir
 * este hook por leitura/escrita via API.
 */

const STORAGE_KEY = "sm_appt_employee_map";

type Map = Record<string, string>;

function read(): Map {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Map;
  } catch {
    return {};
  }
}

function write(map: Map): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function useAppointmentEmployeeMap() {
  const [map, setMap] = useState<Map>({});

  useEffect(() => {
    setMap(read());

    // Sincroniza entre abas
    function onStorage(e: StorageEvent) {
      if (e.key !== STORAGE_KEY) return;
      setMap(read());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setEmployee = useCallback((appointmentId: string, employeeId: string) => {
    setMap((prev) => {
      const next = { ...prev, [appointmentId]: employeeId };
      write(next);
      return next;
    });
  }, []);

  const removeEmployee = useCallback((appointmentId: string) => {
    setMap((prev) => {
      const next = { ...prev };
      delete next[appointmentId];
      write(next);
      return next;
    });
  }, []);

  const getEmployee = useCallback(
    (appointmentId: string): string | undefined => map[appointmentId],
    [map],
  );

  return { map, setEmployee, removeEmployee, getEmployee };
}
