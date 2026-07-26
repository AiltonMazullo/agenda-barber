"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { auditLogService } from "@/services/audit-log.service";
import type { AuditLog, AuditLogFilters } from "@/types/audit-log.types";

/**
 * Busca sob demanda (botão "Filtrar") — não carrega automaticamente ao
 * montar, já que a tela exige que o usuário escolha os filtros primeiro.
 */
export function useAuditLogs(barbershopId: string | undefined) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const search = useCallback(
    async (filters: AuditLogFilters) => {
      if (!barbershopId) return;
      setIsLoading(true);
      try {
        const data = await auditLogService.list(barbershopId, filters);
        setLogs(data);
        setHasSearched(true);
      } catch (err) {
        toast.error(
          err instanceof Error
            ? err.message
            : "Falha ao carregar auditorias.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [barbershopId],
  );

  return { logs, isLoading, hasSearched, search };
}
