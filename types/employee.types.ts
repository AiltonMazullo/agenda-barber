/**
 * Tipos espelhando o modelo `Employee` do backend.
 */

export interface Employee {
  id: string;
  name: string;
  appName: string;
  email: string;
  phone: string;
  group: string;
  branchId: string;
  pixKey: string;
  cpf: string | null;
  cnpj: string | null;
  birthDate: string | null;
  hasBranchAccess: boolean;
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

export interface CreateEmployeePayload {
  name: string;
  appName: string;
  email: string;
  password: string;
  phone: string;
  group: string;
  branchId: string;
  pixKey: string;
  cpf?: string;
  cnpj?: string;
  birthDate?: string;
  hasBranchAccess?: boolean;
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  uf: string;
  number: string;
  complement?: string;
}

export interface UpdateEmployeePayload {
  name?: string;
  appName?: string;
  email?: string;
  password?: string;
  phone?: string;
  group?: string;
  branchId?: string;
  pixKey?: string;
  cpf?: string;
  cnpj?: string;
  birthDate?: string;
  hasBranchAccess?: boolean;
  cep?: string;
  street?: string;
  neighborhood?: string;
  city?: string;
  uf?: string;
  number?: string;
  complement?: string;
}
