/**
 * Tipos espelhando o modelo `AuditLog` do backend.
 * Cada registro é uma entrada individual de auditoria (um campo alterado);
 * várias entradas com o mesmo `entityId` formam o histórico daquela entidade.
 */

export type AuditEntityType = "AGENDAMENTO" | "BLOQUEIO" | "ASSINATURA" | "COMANDA";

export interface AuditLog {
  id: string;
  barbershopId: string;
  entityType: AuditEntityType;
  entityId: string;
  clientId: string | null;
  action: string;
  field: string;
  oldValue: string | null;
  newValue: string | null;
  actorEmployeeId: string | null;
  actorName: string;
  createdAt: string;
}

export interface AuditLogFilters {
  entityType?: AuditEntityType;
  /** ISO 8601 datetime. */
  startDate?: string;
  /** ISO 8601 datetime. */
  endDate?: string;
  /** Um único id de entidade — usado pelo "Histórico do agendamento" do modal de detalhe. */
  entityId?: string;
  /** Vários ids separados por vírgula — agrega todos os membros de um `groupId` (card combo). */
  entityIds?: string;
}
