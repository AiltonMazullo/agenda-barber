/**
 * Tipos espelhando o modelo `Branch` (filial) do backend.
 */

export interface Branch {
  id: string;
  email: string;
  phone: string;
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  uf: string;
  number: string;
  complement: string | null;
  barbershopId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBranchPayload {
  email: string;
  phone: string;
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  uf: string;
  number: string;
  complement?: string;
}

export interface UpdateBranchPayload {
  email?: string;
  phone?: string;
  cep?: string;
  street?: string;
  neighborhood?: string;
  city?: string;
  uf?: string;
  number?: string;
  complement?: string;
}
