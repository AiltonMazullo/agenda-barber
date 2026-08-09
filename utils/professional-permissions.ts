import type {
  AccessGroup,
  CreateAccessGroupPayload,
  PermissionCatalogModule,
  UpdateAccessGroupPayload,
} from "@/types/access-group.types";

/**
 * Mapeamento dos 7 itens de permissão do profissional (ver print "CASH" /
 * spec-revisao-cliente-1.md §7.3) para os pares módulo/nome reais do
 * catálogo de permissões. Cada rótulo pode cobrir mais de uma permissão do
 * catálogo (ex.: "Gerenciar produtos na comanda" liga/desliga adicionar E
 * remover produtos juntos).
 *
 * Usado tanto por `PermissoesProfissional` (checklist simplificado ao
 * criar/editar um profissional com agenda) quanto pelo preset "Profissional
 * com agenda" do editor genérico de grupo de acesso
 * (`DialogGrupoAcesso.applyProfissionalComAgendaPreset`).
 */
export const PROFISSIONAL_PERMISSION_GROUPS: {
  label: string;
  items: { module: string; name: string }[];
}[] = [
  {
    label: "Cadastro de agendamento",
    items: [{ module: "Agendamento", name: "Cadastrar" }],
  },
  {
    label: "Edição de agendamento",
    items: [
      { module: "Agendamento", name: "Atualizar" },
      { module: "Agendamento", name: "Alterar data e hora do agendamento." },
    ],
  },
  {
    label: "Gerenciar produtos na comanda",
    items: [
      { module: "Comanda", name: "Adicionar produtos" },
      { module: "Comanda", name: "Remover produtos" },
    ],
  },
  {
    label: "Gerenciar serviços na comanda",
    items: [
      { module: "Comanda", name: "Adicionar serviços" },
      { module: "Comanda", name: "Remover serviços" },
      { module: "Comanda", name: "Editar serviço" },
    ],
  },
  {
    label: "Cadastrar horário bloqueado",
    items: [{ module: "Agendamento", name: "Cancelar intervalo" }],
  },
  {
    label: "Remoção de folgas",
    items: [{ module: "Agendamento", name: "Cancelar folga" }],
  },
  {
    label: "Edição de notas",
    items: [{ module: "Cliente", name: "Editar notas" }],
  },
];

/** Acha as `key`s reais do catálogo para os pares módulo/nome informados. */
export function resolveGroupKeys(
  catalog: PermissionCatalogModule[],
  items: { module: string; name: string }[],
): string[] {
  const keys: string[] = [];
  for (const target of items) {
    const mod = catalog.find((m) => m.module === target.module);
    const item = mod?.items.find((i) => i.name === target.name);
    if (item) keys.push(item.key);
  }
  return keys;
}

/** Todos os pares módulo/nome dos 7 grupos, achatados (usado pelo preset). */
export function allProfissionalPermissionItems(): { module: string; name: string }[] {
  return PROFISSIONAL_PERMISSION_GROUPS.flatMap((g) => g.items);
}

/**
 * Resolve o `accessGroupId` a usar no payload do `Employee` ao salvar um
 * profissional: para o tipo "com agenda" (checklist de
 * `PermissoesProfissional`), cria ou atualiza o `AccessGroup` pessoal desse
 * profissional (marcado `isManaged`) a partir das `permissions` escolhidas;
 * pra qualquer outro tipo, devolve `currentAccessGroupId` sem mudar nada
 * (fluxo de `AccessGroupSelect` continua igual).
 *
 * Devolve `null` só quando é o tipo "com agenda" e a criação/atualização do
 * grupo falhou (toast de erro já é disparado pelo `useAccessGroups`) — quem
 * chama deve abortar o salvamento do profissional nesse caso.
 */
export async function resolveProfessionalAccessGroupId(params: {
  isProfissional: boolean;
  currentAccessGroupId: string;
  professionalName: string;
  permissions: string[];
  groups: AccessGroup[];
  createGroup: (
    payload: CreateAccessGroupPayload,
    options?: { silent?: boolean },
  ) => Promise<AccessGroup | null>;
  updateGroup: (
    id: string,
    payload: UpdateAccessGroupPayload,
    options?: { silent?: boolean },
  ) => Promise<AccessGroup | null>;
}): Promise<string | null> {
  const { isProfissional, currentAccessGroupId, professionalName, permissions, groups, createGroup, updateGroup } =
    params;

  if (!isProfissional) return currentAccessGroupId;

  const existingManaged = groups.find((g) => g.id === currentAccessGroupId && g.isManaged);
  if (existingManaged) {
    const updated = await updateGroup(existingManaged.id, { permissions }, { silent: true });
    return updated ? updated.id : null;
  }

  const created = await createGroup(
    { name: `Profissional: ${professionalName}`, permissions, isManaged: true },
    { silent: true },
  );
  return created ? created.id : null;
}
