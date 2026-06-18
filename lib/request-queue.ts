/**
 * Fila global de requisições HTTP (semáforo) compartilhada pelos clients axios
 * do dono (`api`) e do cliente (`clientApi`).
 *
 * Motivo: ao abrir o dashboard, vários hooks disparam GETs em paralelo
 * (branches, services, employees, clients, appointments…) e a API (Render)
 * responde 429 "Too many requests". Serializando as chamadas — uma de cada vez
 * — evitamos o pico e o rate limit, com carregamento "lazy" progressivo.
 *
 * `MAX_CONCURRENT` controla quantas requisições podem estar em voo ao mesmo
 * tempo. Aumente caso o backend suporte mais paralelismo.
 */

const MAX_CONCURRENT = 1;

let active = 0;
const waiting: Array<() => void> = [];

/** Aguarda um espaço livre na fila. Resolve quando a requisição pode seguir. */
export function acquireSlot(): Promise<void> {
  if (active < MAX_CONCURRENT) {
    active += 1;
    return Promise.resolve();
  }
  return new Promise<void>((resolve) => waiting.push(resolve));
}

/** Libera o espaço ocupado, passando a vez para o próximo da fila (se houver). */
export function releaseSlot(): void {
  const next = waiting.shift();
  if (next) {
    // O espaço é transferido direto ao próximo — `active` não muda.
    next();
  } else {
    active = Math.max(0, active - 1);
  }
}
