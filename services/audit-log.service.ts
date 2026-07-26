import { api } from "@/lib/api";
import type { AuditLog, AuditLogFilters } from "@/types/audit-log.types";

export const auditLogService = {
  async list(
    barbershopId: string,
    filters?: AuditLogFilters,
  ): Promise<AuditLog[]> {
    const { data } = await api.get<AuditLog[]>(
      `/barbershops/${barbershopId}/audit-logs`,
      { params: filters },
    );
    return data;
  },
};
