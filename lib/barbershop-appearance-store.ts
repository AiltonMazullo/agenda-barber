/**
 * Persistência **local** (localStorage) de preferências de exibição da
 * vitrine pública. Mantida no frontend até o backend expor esses campos.
 * Keyed por barbershopId.
 */

const KEY = "sm_barbershop_appearance";

export interface BarbershopAppearance {
  /** Exibe a logo centralizada no topo da vitrine, sem fundo/borda. */
  logoCentered: boolean;
}

const DEFAULT: BarbershopAppearance = { logoCentered: false };

function readAll(): Record<string, BarbershopAppearance> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}") as Record<
      string,
      BarbershopAppearance
    >;
  } catch {
    return {};
  }
}

function writeAll(map: Record<string, BarbershopAppearance>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(map));
}

export const barbershopAppearanceStore = {
  get(barbershopId: string): BarbershopAppearance {
    return { ...DEFAULT, ...readAll()[barbershopId] };
  },
  set(barbershopId: string, patch: Partial<BarbershopAppearance>): void {
    const map = readAll();
    map[barbershopId] = { ...DEFAULT, ...map[barbershopId], ...patch };
    writeAll(map);
  },
};
