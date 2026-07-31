export interface PlanService {
  id: string;
  planId: string;
  serviceId: string;
  discountPercent: number;
  monthlyLimit: number | null;
  service: {
    id: string;
    name: string;
    priceInCents: number;
    durationMin: number;
  };
}

export interface PlanEmployee {
  id: string;
  planId: string;
  employeeId: string;
  employee: {
    id: string;
    name: string;
    appName: string;
    avatarUrl: string | null;
  };
}

export interface PlanProduct {
  id: string;
  planId: string;
  productId: string;
  priceInCents: number;
  product: {
    id: string;
    name: string;
    priceInCents: number;
  };
}

export interface PlanCategory {
  id: string;
  planId: string;
  categoryId: string;
  discountPercent: number;
  category: {
    id: string;
    name: string;
  };
}

export interface Plan {
  id: string;
  name: string;
  priceInCents: number;
  labelColor: string;
  galaxId: string | null;
  availableQuantity: number | null;
  subscriptionLockDays: number;
  maxSimultaneousServices: number;
  serviceFrequencyDays: number;
  hidden: boolean;
  freeDays: number[];
  /** Dias da semana (0=Dom..6=Sáb) em que o plano pode ser usado para agendar. Vazio = todos os dias. */
  availableWeekdays: number[];
  /** Vagas restantes (availableQuantity - assinantes ativos). `null` quando `availableQuantity` é ilimitado. */
  availableSlots?: number | null;
  status: "ACTIVE" | "INACTIVE";
  contractUrl: string | null;
  order: number;
  highlighted: boolean;
  barbershopId: string;
  createdAt: string;
  updatedAt: string;
  planServices: PlanService[];
  planEmployees: PlanEmployee[];
  planProducts: PlanProduct[];
  planCategories: PlanCategory[];
}

export interface PlanServiceInput {
  serviceId: string;
  discountPercent: number;
  monthlyLimit?: number;
}

export interface PlanEmployeeInput {
  employeeId: string;
}

export interface PlanProductInput {
  productId: string;
  priceInCents: number;
}

export interface CreatePlanPayload {
  name: string;
  priceInCents: number;
  labelColor: string;
  galaxId?: string;
  availableQuantity?: number | null;
  subscriptionLockDays?: number;
  maxSimultaneousServices?: number;
  serviceFrequencyDays?: number;
  hidden?: boolean;
  freeDays?: number[];
  availableWeekdays?: number[];
  services?: PlanServiceInput[];
  employees?: PlanEmployeeInput[];
  products?: PlanProductInput[];
}

export type UpdatePlanPayload = Partial<CreatePlanPayload>;

export interface UpdatePlanStatusPayload {
  status: "ACTIVE" | "INACTIVE";
}

export interface PlanReorderItem {
  id: string;
  order: number;
  highlighted: boolean;
}
