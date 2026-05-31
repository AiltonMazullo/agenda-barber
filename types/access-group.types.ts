/**
 * Grupos de acesso de funcionários.
 * Cada grupo tem permissões CRUD por módulo do sistema.
 */

export interface AccessModulePermission {
  /** Chave do módulo (ex.: "appointments", "clients"). */
  module: string;
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

export interface AccessGroup {
  id: string;
  name: string;
  modules: AccessModulePermission[];
  barbershopId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccessGroupPayload {
  name: string;
  modules: AccessModulePermission[];
}

export type UpdateAccessGroupPayload = Partial<CreateAccessGroupPayload>;
