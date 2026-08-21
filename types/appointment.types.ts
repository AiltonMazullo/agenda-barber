import type { Service } from "@/types/service.types";

/**
 * Tipos espelhando o modelo `Appointment` do backend.
 */

export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED"
  | "NO_SHOW";

/** Quem criou o agendamento: o cliente (reserva online) ou a equipe (painel). */
export type AppointmentOrigin = "CLIENT" | "INTERNAL";

/** Cliente como vem populado no `GET /appointments` (campos parciais). */
export interface AppointmentClient {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
}

/** Profissional como vem populado no `GET /appointments` (campos parciais). */
export interface AppointmentEmployee {
  id: string;
  name: string;
  appName: string;
}

/** Appointment crú (sem includes). */
export interface AppointmentRaw {
  id: string;
  scheduledAt: string;
  status: AppointmentStatus;
  origin: AppointmentOrigin;
  clientId: string;
  serviceId: string;
  employeeId: string | null;
  /** Filial do agendamento. Null em registros legados criados antes do campo existir. */
  branchId: string | null;
  barbershopId: string;
  /** Agrupa agendamentos criados na mesma reserva combo (múltiplos serviços). Null = serviço único. */
  groupId: string | null;
  /** Sobrescreve a duração padrão do serviço (resize na agenda, ver §5.3). Null = usa `service.durationMin`. */
  durationOverrideMin: number | null;
  /** Observação livre digitada na criação/edição (spec-revisao-cliente-4.md §2.3). */
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Appointment como vem do `GET /appointments` com client + service populados. */
export interface Appointment extends AppointmentRaw {
  client: AppointmentClient;
  service: Service;
  employee?: AppointmentEmployee | null;
}

/** Produto vendido na comanda vinculada a um agendamento (ver `GET /clients/:id/appointments`). */
export interface AppointmentProduct {
  id: string;
  nome: string;
  quantidade: number;
  valorUnitarioInCents: number;
}

/** Agendamento como vem de `GET /clients/:id/appointments` (histórico do modal de detalhe) — traz os produtos vendidos na comanda vinculada. */
export interface AppointmentWithProducts extends Appointment {
  products: AppointmentProduct[];
}

/** Barbearia como vem aninhada em `GET /clients/me/appointments`. */
export interface AppointmentBarbershopRef {
  id: string;
  name: string;
  slug: string;
}

/**
 * Agendamento como vem de `GET /clients/me/appointments` (visão do cliente):
 * traz `service` e `barbershop` aninhados, sem o `client` (é o próprio).
 */
export interface ClientAppointment extends AppointmentRaw {
  service: Service;
  barbershop: AppointmentBarbershopRef;
  employee?: AppointmentEmployee | null;
}

export interface CreateAppointmentPayload {
  /**
   * Obrigatório quando o dono cria o agendamento (escolhe o cliente da lista).
   * No fluxo público do cliente é omitido — o backend usa `req.user.sub`.
   */
  clientId?: string;
  /** Um ou mais serviços — a barbearia recebe um único agendamento (card) com a duração somada. */
  serviceIds: string[];
  /** Profissional que vai atender. */
  employeeId?: string;
  /** ISO datetime string (UTC). */
  scheduledAt: string;
  /** Confirma a criação mesmo com o aviso de conflito de plano (§1.1). */
  force?: boolean;
  /** Observação livre (spec-revisao-cliente-4.md §2.3). */
  notes?: string;
}

/** Resposta de `POST /appointments` quando há um conflito não bloqueante (regra dos 30 min por plano). */
export interface CreateAppointmentWarning {
  requiresConfirmation: true;
  warning: string;
}

export type UpdatableAppointmentStatus = Exclude<AppointmentStatus, "PENDING">;

export interface UpdateAppointmentStatusPayload {
  status: UpdatableAppointmentStatus;
}

/** Body de `PATCH /appointments/:id/reschedule` — usado pelo drag-and-drop da agenda. */
export interface RescheduleAppointmentPayload {
  /** ISO datetime string (UTC). */
  scheduledAt: string;
  employeeId?: string;
}

/** Body de `PATCH /appointments/:id/transfer` — troca o cliente do agendamento (cascateia pro grupo, ver backend). */
export interface TransferAppointmentPayload {
  clientId: string;
  /** ISO datetime string (UTC) — opcional, reagenda junto com a troca de cliente. */
  scheduledAt?: string;
}

/**
 * Body do endpoint unificado `PATCH /appointments/:id` (modal de detalhe,
 * `DialogDetalhe`) — todos os campos são opcionais, envie só o que mudou.
 * `employeeId: null` explícito limpa o profissional ("sem preferência");
 * omitir a chave mantém o profissional atual.
 */
export interface UpdateAppointmentPayload {
  serviceIds?: string[];
  /** ISO datetime string (UTC). */
  startAt?: string;
  /** ISO datetime string (UTC) — equivalente a um resize. */
  endAt?: string;
  branchId?: string | null;
  employeeId?: string | null;
  /** Observação livre (spec-revisao-cliente-4.md §2.3). `null` explícito limpa a observação. */
  notes?: string | null;
}
