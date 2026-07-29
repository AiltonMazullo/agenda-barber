/**
 * Tipos espelhando o modelo `Client` do backend.
 *
 * A criação de cliente é feita via `POST /barbershops/:bid/clients` (pelo dono,
 * autenticado) ou pelo fluxo público de cadastro do cliente final.
 */

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  birthDate: string | null;
  howMet: string | null;
  cpf: string | null;
  cep: string | null;
  street: string | null;
  neighborhood: string | null;
  city: string | null;
  uf: string | null;
  number: string | null;
  complement: string | null;
  /** Observação interna da equipe — nunca visível/editável pelo próprio cliente. */
  notes: string | null;
  /** "Lembrar na agenda" — destaca o cliente na tela de Agenda. */
  remindInSchedule: boolean;
  photoUrl: string | null;
  /** Se o cliente tem um bloqueio ativo (`ClientBlock.blockedUntil` no futuro) — ver /clients/bloqueados. */
  isBlocked: boolean;
  barbershopId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientPayload {
  name: string;
  email: string;
  password: string;
  phone: string;
  /** ISO 8601 (ex.: "1995-06-15T00:00:00.000Z"). */
  birthDate: string;
  howMet: string;
  cpf?: string;
  cep?: string;
  street?: string;
  neighborhood?: string;
  city?: string;
  uf?: string;
  number?: string;
  complement?: string;
  notes?: string;
  remindInSchedule?: boolean;
}

export interface UpdateClientPayload {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  remindInSchedule?: boolean;
}

/**
 * Payload de `PUT /clients/me` — o próprio cliente atualiza seu cadastro.
 * Todos os campos são opcionais (envia só o que mudou).
 */
export interface UpdateMePayload {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  /** ISO 8601 (ex.: "2000-01-01T00:00:00.000Z"). */
  birthDate?: string;
  howMet?: string;
  cpf?: string;
  cep?: string;
  street?: string;
  neighborhood?: string;
  city?: string;
  uf?: string;
  number?: string;
  complement?: string;
  remindInSchedule?: boolean;
}
