/**
 * Tipos espelhando o modelo `Client` do backend.
 *
 * Nota: a criação de cliente é feita por outro fluxo (público / via outro
 * endpoint). Aqui só temos list/get/update/delete.
 */

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  barbershopId: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateClientPayload {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
}
