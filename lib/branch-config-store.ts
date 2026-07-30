/**
 * Persistência **local** (localStorage) do CNPJ da filial — único campo de
 * `DialogFilial` que o backend ainda não armazena (`model Branch` não tem
 * coluna própria para isso). `isReceivingBranch`/`isHidden` já são persistidos
 * de verdade pelo backend e não passam mais por aqui.
 *
 * Mescla o CNPJ nas filiais carregadas/criadas/atualizadas, para que a UI
 * exiba e mantenha o dado entre reloads. Quando o backend passar a persistir
 * esse campo, basta remover esta camada.
 */

import type { Branch } from "@/types/branch.types";

const KEY = "sm_branch_config";

export type BranchConfigExtras = Pick<Branch, "cnpj">;

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
