/**
 * Custo unitário dos produtos — camada **local** (localStorage).
 *
 * O modelo `Product` do backend só tem `priceInCents` (preço de venda), sem
 * campo de custo. Para o card "Custo do estoque" e o campo "Custo unitário"
 * guardamos o custo por produto (em centavos) no frontend, por barbearia.
 */

const KEY = "sm_product_costs";

type CostMap = Record<string, Record<string, number>>;

function readAll(): CostMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}") as CostMap;
  } catch {
    return {};
  }
}

function writeAll(map: CostMap): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(map));
}

export const productCostStore = {
  /** Mapa produtoId → custo (centavos) da barbearia. */
  all(barbershopId: string): Record<string, number> {
    return readAll()[barbershopId] ?? {};
  },

  get(barbershopId: string, productId: string): number {
    return readAll()[barbershopId]?.[productId] ?? 0;
  },

  set(barbershopId: string, productId: string, costInCents: number): void {
    const map = readAll();
    const forShop = { ...(map[barbershopId] ?? {}) };
    forShop[productId] = Math.max(0, Math.round(costInCents));
    map[barbershopId] = forShop;
    writeAll(map);
  },

  remove(barbershopId: string, productId: string): void {
    const map = readAll();
    if (!map[barbershopId]) return;
    const forShop = { ...map[barbershopId] };
    delete forShop[productId];
    map[barbershopId] = forShop;
    writeAll(map);
  },
};
