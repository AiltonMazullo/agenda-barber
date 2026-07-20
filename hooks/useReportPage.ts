"use client";

import { useAuth } from "./useAuth";
import { useReportFilters } from "./useReportFilters";
import { useReportData } from "./useReportData";
import type { ReportFilters } from "@/types/report.types";

/** Combina auth + filtros + fetch para uma tela de relatório, respeitando as regras dos hooks. */
export function useReportPage<T>(
  fetchFn: (barbershopId: string, filters: ReportFilters) => Promise<T>,
) {
  const { barbershop } = useAuth();
  const rf = useReportFilters();
  const barbershopId = barbershop?.id;
  const filtersKey = JSON.stringify(rf.filters);

  const { data, isLoading } = useReportData(
    barbershopId ? () => fetchFn(barbershopId, rf.filters) : null,
    [barbershopId, filtersKey],
  );

  return { barbershopId, rf, data, isLoading };
}
