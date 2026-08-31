/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { clientsService } from "@/services/clients.service";
import { PAGE_SIZE_OPTIONS, type PageSize } from "@/hooks/usePagination";
import type { AppointmentWithProducts } from "@/types/appointment.types";

/**
 * Histórico de agendamentos de um cliente, paginado no servidor —
 * spec-ajustes-escopo-3 §7: antes a aba "Agendamentos" do painel do cliente
 * usava `useAppointments` (todos os agendamentos da barbearia, filtrados
 * client-side), sem paginação nenhuma.
 */
export function useClientAppointmentsPaginated(
  barbershopId: string | undefined,
  clientId: string | undefined,
) {
  const [data, setData] = useState<AppointmentWithProducts[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(PAGE_SIZE_OPTIONS[0]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!barbershopId || !clientId) {
      setData([]);
      setTotal(0);
      setIsLoading(false);
      return;
    }
    let active = true;
    setIsLoading(true);
    clientsService
      .getAppointmentsPaginated(barbershopId, clientId, page, pageSize)
      .then((result) => {
        if (!active) return;
        setData(result.data);
        setTotal(result.total);
      })
      .catch(() => {
        if (active) {
          setData([]);
          setTotal(0);
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [barbershopId, clientId, page, pageSize]);

  // Reseta pra primeira página sempre que o cliente muda (evita ficar preso
  // numa página que não existe mais pro novo cliente).
  useEffect(() => {
    setPage(1);
  }, [clientId]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  function changePageSize(size: number) {
    setPageSize(size as PageSize);
    setPage(1);
  }

  return {
    appointments: data,
    isLoading,
    page,
    pageSize,
    total,
    totalPages,
    from,
    to,
    setPage,
    changePageSize,
  };
}
