/**
 * Persistência **local** (localStorage) do status de 2FA do cliente. Mock até o
 * backend expor autenticação em dois fatores de verdade. Keyed por clientId.
 */

const KEY = "sm_client_2fa";

function readAll(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}") as Record<
      string,
      boolean
    >;
  } catch {
    return {};
  }
}

function writeAll(map: Record<string, boolean>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(map));
}

export const client2faStore = {
  get(clientId: string): boolean {
    return readAll()[clientId] ?? false;
  },
  set(clientId: string, enabled: boolean): void {
    const map = readAll();
    map[clientId] = enabled;
    writeAll(map);
  },
};
