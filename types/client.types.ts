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
}

export interface UpdateClientPayload {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
}
