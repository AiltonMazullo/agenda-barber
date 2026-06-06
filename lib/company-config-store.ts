/**
 * Persistência **local** (localStorage) da "Configuração da filial" exibida na
 * aba Empresa (unidade principal): flags de recebimentos e visibilidade.
 *
 * Mantida no frontend até o backend expor esses campos. Keyed por barbershopId.
 */

const KEY = "sm_company_config";

export interface CompanyConfig {
  isReceivingBranch: boolean;
  isHidden: boolean;
}

const DEFAULT: CompanyConfig = { isReceivingBranch: false, isHidden: false };

function readAll(): Record<string, CompanyConfig> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}") as Record<
      string,
      CompanyConfig
    >;
  } catch {
    return {};
  }
}

function writeAll(map: Record<string, CompanyConfig>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(map));
}

export const companyConfigStore = {
  get(barbershopId: string): CompanyConfig {
    return { ...DEFAULT, ...readAll()[barbershopId] };
  },
  set(barbershopId: string, patch: Partial<CompanyConfig>): void {
    const map = readAll();
    map[barbershopId] = { ...DEFAULT, ...map[barbershopId], ...patch };
    writeAll(map);
  },
};
