/**
 * Grupos de acesso de funcionários.
 * Cada grupo guarda uma lista de chaves de permissão do catálogo do sistema.
 */

export interface PermissionCatalogItem {
  /** Chave estável da permissão (ex.: "usuario.listar"). */
  key: string;
  /** Módulo/entidade a que a permissão pertence (ex.: "Usuário"). */
  module: string;
  name: string;
  description: string;
}

export interface PermissionCatalogModule {
  module: string;
  items: PermissionCatalogItem[];
}

export interface AccessGroup {
  id: string;
  name: string;
  permissions: string[];
  /** Grupo pessoal gerado automaticamente para um profissional (ver
   * PermissoesProfissional/ProfessionalForm) — não aparece em Controle de
   * Acesso nem no seletor genérico de grupo. */
  isManaged: boolean;
  barbershopId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccessGroupPayload {
  name: string;
  permissions: string[];
  isManaged?: boolean;
}

export type UpdateAccessGroupPayload = Partial<CreateAccessGroupPayload>;
