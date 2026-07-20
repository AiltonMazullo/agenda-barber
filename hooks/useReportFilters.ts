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
}

const EMPTY_STATE: ReportFiltersState = {
  startDate: undefined,
  endDate: undefined,
  branchId: "",
  employeeId: "",
  categoryId: "",
  serviceId: "",
  productId: "",
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
    }),
    [state],
  );

  function reset() {
    setState(EMPTY_STATE);
  }

  return { state, setState, filters, reset };
}
