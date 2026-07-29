import type { ClientAppointment } from "@/types/appointment.types";

/**
 * Agendamentos combo (múltiplos serviços escolhidos numa mesma reserva)
 * compartilham `groupId` — ver `buildGroupItems` no backend
 * (`appointments.service.ts`). Aqui juntamos esses membros num único VM pra
 * renderizar um card por reserva, com a duração somada de todos os serviços.
 */
export interface AppointmentGroup {
  /** Membro mais antigo do grupo — usado como âncora para ações (cancelar/remarcar). */
  primary: ClientAppointment;
  members: ClientAppointment[];
  totalDurationMin: number;
  services: ClientAppointment["service"][];
}

export function groupAppointments(
  appointments: ClientAppointment[],
): AppointmentGroup[] {
  const groups = new Map<string, ClientAppointment[]>();
  for (const a of appointments) {
    const key = a.groupId ?? a.id;
    const list = groups.get(key) ?? [];
    list.push(a);
    groups.set(key, list);
  }

  return Array.from(groups.values()).map((members) => {
    const sorted = [...members].sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    );
    const primary = sorted[0];
    const totalDurationMin = sorted.reduce(
      (sum, m) => sum + m.service.durationMin,
      0,
    );
    return {
      primary,
      members: sorted,
      totalDurationMin,
      services: sorted.map((m) => m.service),
    };
  });
}
