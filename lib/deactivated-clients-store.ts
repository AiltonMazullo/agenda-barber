/**
 * Desativação de clientes — camada **local** (localStorage).
 *
 * O backend não tem um flag de "ativo/inativo" no cliente, então mantemos a
 * lista de IDs desativados por barbearia no frontend. "Desativar" NÃO exclui o
 * cliente — apenas o move para a listagem de Clientes Desativados, onde pode
 * ser reativado ou excluído permanentemente depois.
 */

const KEY = "sm_deactivated_clients";

function readAll(): Record<string, string[]> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}") as Record<
      string,
      string[]
    >;
  } catch {
    return {};
  }
}

function writeAll(map: Record<string, string[]>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(map));
}

export const deactivatedClientsStore = {
  list(barbershopId: string): string[] {
    return readAll()[barbershopId] ?? [];
  },

  isDeactivated(barbershopId: string, clientId: string): boolean {
    return (readAll()[barbershopId] ?? []).includes(clientId);
  },

  deactivate(barbershopId: string, clientId: string): void {
    const map = readAll();
    const set = new Set(map[barbershopId] ?? []);
    set.add(clientId);
    map[barbershopId] = [...set];
    writeAll(map);
  },

  reactivate(barbershopId: string, clientId: string): void {
    const map = readAll();
    map[barbershopId] = (map[barbershopId] ?? []).filter(
      (id) => id !== clientId,
    );
    writeAll(map);
  },
};
