/**
 * Tipos espelhando o modelo `Employee` do backend.
 */

export interface Employee {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  barbershopId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeePayload {
  name: string;
  email?: string;
  phone?: string;
}

export interface UpdateEmployeePayload {
  name?: string;
  email?: string;
  phone?: string;
}
