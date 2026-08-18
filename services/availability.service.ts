import { clientApi } from "@/lib/client-api";
import type { AvailabilityQuery } from "@/types/availability.types";

/**
 * Normaliza um valor de horário para "HH:mm".
 * Aceita "HH:mm", "HH:mm:ss" ou ISO datetime ("2026-05-27T09:00:00Z").
 */
function toHHmm(value: string): string | null {
  if (/^\d{2}:\d{2}$/.test(value)) return value;
  if (/^\d{2}:\d{2}:\d{2}/.test(value)) return value.slice(0, 5);
  const d = new Date(value);
  if (!Number.isNaN(d.getTime())) {
    // Slots ISO vêm com a hora de parede "disfarçada" de UTC (mesma
    // convenção do scheduledAt de agendamentos) — usar getters UTC, não
    // locais, para não desalinhar pelo fuso real do browser.
    return `${String(d.getUTCHours()).padStart(2, "0")}:${String(
      d.getUTCMinutes(),
    ).padStart(2, "0")}`;
  }
  return null;
}

type RawSlot =
  | string
  | {
      time?: string;
      slot?: string;
      start?: string;
      hour?: string;
      available?: boolean;
      isAvailable?: boolean;
    };

/**
 * Extrai a lista de horários LIVRES (em "HH:mm") de formatos variados de
 * resposta. Concentra aqui toda a tolerância ao contrato real do backend.
 */
function normalizeSlots(data: unknown): string[] {
  // Resposta pode ser um array direto ou um objeto com a lista dentro.
  let arr: RawSlot[] = [];
  if (Array.isArray(data)) {
    arr = data as RawSlot[];
  } else if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    const candidate =
      obj.slots ?? obj.available ?? obj.availableSlots ?? obj.times;
    if (Array.isArray(candidate)) arr = candidate as RawSlot[];
  }

  const out: string[] = [];
  for (const item of arr) {
    if (typeof item === "string") {
      const hhmm = toHHmm(item);
      if (hhmm) out.push(hhmm);
      continue;
    }
    if (item && typeof item === "object") {
      // Se vier marcador de disponibilidade, respeita-o.
      const available =
        item.available ?? item.isAvailable ?? true;
      if (!available) continue;
      const raw = item.time ?? item.slot ?? item.start ?? item.hour;
      if (raw) {
        const hhmm = toHHmm(raw);
        if (hhmm) out.push(hhmm);
      }
    }
  }
  // Únicos + ordenados
  return Array.from(new Set(out)).sort();
}

export const availabilityService = {
  /** Horários livres ("HH:mm") de um profissional num dia. */
  async getAvailableSlots(
    barbershopId: string,
    query: AvailabilityQuery,
  ): Promise<string[]> {
    const { data } = await clientApi.get(
      `/barbershops/${barbershopId}/availability`,
      {
        params: {
          employeeId: query.employeeId || undefined,
          serviceIds: query.serviceIds.join(","),
          date: query.date,
          clientId: query.clientId || undefined,
        },
      },
    );
    return normalizeSlots(data);
  },
};
