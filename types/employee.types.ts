/**
 * Tipos espelhando o modelo `Employee` do backend.
 */

export interface EmployeeSchedule {
  id: string;
  employeeId: string;
  dayOfWeek: number;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
}

export interface EmployeeService {
  serviceId: string;
  commissionPercent: number;
}

export interface EmployeeTimeOff {
  id: string;
  startDate: string; // "YYYY-MM-DD"
  endDate: string;   // "YYYY-MM-DD"
}

export interface Employee {
  id: string;
  name: string;
  appName: string;
  email: string;
  phone: string;
  accessGroupId: string | null;
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
  /** Profissional marcado como destaque (aparece primeiro e com badge). */
  featured: boolean;
  /** Quando true, o profissional não aparece para clientes no app. */
  hidden: boolean;
  /** Caminho relativo da foto de perfil (ex.: "/uploads/.../foto.jpg"). */
  avatarUrl?: string | null;
  barbershopId: string;
  createdAt: string;
  updatedAt: string;
  /** Serviços que este profissional realiza (incluso no catálogo público). */
  employeeServices?: { serviceId: string }[];
}

export interface CreateEmployeePayload {
  name: string;
  appName: string;
  email: string;
  password: string;
  phone: string;
  accessGroupId: string;
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
  accessGroupId?: string;
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
