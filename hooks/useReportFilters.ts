"use client";

import { useMemo, useState } from "react";
import type { ReportFilters } from "@/types/report.types";

export interface ReportFiltersState {
  startDate: Date | undefined;
  endDate: Date | undefined;
  branchId: string;
  employeeId: string;
  categoryId: string;
  serviceId: string;
  productId: string;
  /** spec-ajustes-escopo-5.md §8: filtro Assinante/Não assinante/Todos (relatório de frequência). */
  subscriberStatus: "" | "ASSINANTE" | "NAO_ASSINANTE";
  /** spec-ajustes-escopo-5.md §8: filtro por plano específico (relatório de frequência). */
  planId: string;
  // spec-ajustes-escopo-5.md §9.2: versões de múltipla seleção — hoje só
  // usadas pelo relatório de Vendas (`RelVendasPorItem`), via os campos
  // "employeeMulti"/"categoryMulti"/"serviceMulti"/"productMulti" do
  // `ReportFiltersBar`. As versões singulares acima continuam servindo os
  // demais relatórios sem mudança.
  employeeIds: string[];
  categoryIds: string[];
  serviceIds: string[];
  productIds: string[];
}

const EMPTY_STATE: ReportFiltersState = {
  startDate: undefined,
  endDate: undefined,
  branchId: "",
  employeeId: "",
  categoryId: "",
  serviceId: "",
  productId: "",
  subscriberStatus: "",
  planId: "",
  employeeIds: [],
  categoryIds: [],
  serviceIds: [],
  productIds: [],
};

/** Estado local dos filtros de relatório + serialização para query params da API. */
export function useReportFilters() {
  const [state, setState] = useState<ReportFiltersState>(EMPTY_STATE);

  const filters = useMemo<ReportFilters>(
    () => ({
      startDate: state.startDate?.toISOString(),
      endDate: state.endDate?.toISOString(),
      branchId: state.branchId || undefined,
      employeeId: state.employeeId || undefined,
      categoryId: state.categoryId || undefined,
      serviceId: state.serviceId || undefined,
      productId: state.productId || undefined,
      subscriberStatus: state.subscriberStatus || undefined,
      planId: state.planId || undefined,
      employeeIds: state.employeeIds.length > 0 ? state.employeeIds : undefined,
      categoryIds: state.categoryIds.length > 0 ? state.categoryIds : undefined,
      serviceIds: state.serviceIds.length > 0 ? state.serviceIds : undefined,
      productIds: state.productIds.length > 0 ? state.productIds : undefined,
    }),
    [state],
  );

  function reset() {
    setState(EMPTY_STATE);
  }

  return { state, setState, filters, reset };
}
