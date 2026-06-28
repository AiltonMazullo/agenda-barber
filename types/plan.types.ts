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
  status: "ACTIVE" | "INACTIVE";
  barbershopId: string;
  createdAt: string;
  updatedAt: string;
  planServices: PlanService[];
  planEmployees: PlanEmployee[];
  planProducts: PlanProduct[];
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
  services?: PlanServiceInput[];
  employees?: PlanEmployeeInput[];
  products?: PlanProductInput[];
}

export type UpdatePlanPayload = Partial<CreatePlanPayload>;

export interface UpdatePlanStatusPayload {
  status: "ACTIVE" | "INACTIVE";
}
