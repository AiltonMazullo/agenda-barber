/**
 * Configuração estendida do profissional — persistência **local** (localStorage).
 *
 * Guardada por barbearia → profissional. Merge sobre os defaults para tolerar
 * novos campos adicionados ao tipo ao longo do tempo.
 */

import {
  defaultProfessionalConfig,
  type ProfessionalConfig,
} from "@/types/professional-config.types";

const KEY = "sm_professional_configs";

type ConfigMap = Record<string, Record<string, Partial<ProfessionalConfig>>>;

function readAll(): ConfigMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}") as ConfigMap;
  } catch {
    return {};
  }
}

function writeAll(map: ConfigMap): boolean {
  if (typeof window === "undefined") return false;
  try {
    localStorage.setItem(KEY, JSON.stringify(map));
    return true;
  } catch {
    // Cota excedida (ex.: foto base64 muito grande).
    return false;
  }
}

function merge(stored: Partial<ProfessionalConfig> | undefined): ProfessionalConfig {
  const base = defaultProfessionalConfig();
  if (!stored) return base;
  return {
    ...base,
    ...stored,
    productCommission: {
      ...base.productCommission,
      ...(stored.productCommission ?? {}),
    },
    differentiated: { ...base.differentiated, ...(stored.differentiated ?? {}) },
    workingHours: stored.workingHours ?? base.workingHours,
    services: stored.services ?? base.services,
    intervals: stored.intervals ?? base.intervals,
    timeOff: stored.timeOff ?? base.timeOff,
  };
}

export const professionalConfigStore = {
  get(barbershopId: string, employeeId: string): ProfessionalConfig {
    return merge(readAll()[barbershopId]?.[employeeId]);
  },

  /** Salva a config. Retorna false se o localStorage recusou (cota). */
  set(
    barbershopId: string,
    employeeId: string,
    config: ProfessionalConfig,
  ): boolean {
    const map = readAll();
    map[barbershopId] = { ...(map[barbershopId] ?? {}), [employeeId]: config };
    return writeAll(map);
  },
};
