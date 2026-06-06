/**
 * Persistência **local** (localStorage) dos campos de configuração da filial
 * que o backend ainda não armazena (CNPJ, flags, taxas, prazo, conta bancária).
 *
 * Mescla esses extras nas filiais carregadas/criadas/atualizadas, para que a UI
 * exiba e mantenha os dados entre reloads. Quando o backend passar a persistir
 * esses campos, basta remover esta camada.
 */

import type { Branch } from "@/types/branch.types";

const KEY = "sm_branch_config";

export type BranchConfigExtras = Pick<
  Branch,
  | "cnpj"
  | "isReceivingBranch"
  | "isHidden"
  | "receiptDeadlineDays"
  | "bankAccount"
  | "paymentConfigs"
>;

function readAll(): Record<string, BranchConfigExtras> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}") as Record<
      string,
      BranchConfigExtras
    >;
  } catch {
    return {};
  }
}

function writeAll(map: Record<string, BranchConfigExtras>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(map));
}

export const branchConfigStore = {
  /** Salva/mescla os extras de uma filial. */
  set(id: string, extras: BranchConfigExtras): void {
    const map = readAll();
    map[id] = { ...map[id], ...extras };
    writeAll(map);
  },

  /** Remove os extras de uma filial. */
  remove(id: string): void {
    const map = readAll();
    delete map[id];
    writeAll(map);
  },

  /** Devolve a filial com os extras locais mesclados. */
  merge(branch: Branch): Branch {
    const extras = readAll()[branch.id];
    return extras ? { ...branch, ...extras } : branch;
  },
};
