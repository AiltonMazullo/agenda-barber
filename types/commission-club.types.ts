export interface CommissionClubRun {
  id: string;
  barbershopId: string;
  branchId: string;
  periodStart: string;
  periodEnd: string;
  totalServicesByCategory: Record<string, number>;
  servicesByEmployee: Record<string, Record<string, number>>;
  subscriptionRevenueInCents: number;
  commissionPercent: number;
  totalPoolInCents: number;
  distributedAt: string | null;
  editedAt: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  branch: { id: string; name: string };
}

export interface CreateCommissionRunPayload {
  branchId: string;
  periodStart: string;
  periodEnd: string;
  totalServicesByCategory: Record<string, number>;
  servicesByEmployee: Record<string, Record<string, number>>;
  subscriptionRevenueInCents: number;
  commissionPercent: number;
}

export type UpdateCommissionRunPayload = Partial<CreateCommissionRunPayload>;

export interface EmployeePoolShare {
  employeeId: string;
  fichas: number;
  shareInCents: number;
}

export interface CommissionRunReport {
  run: CommissionClubRun;
  totalServicesByCategory: Record<string, number>;
  shares: EmployeePoolShare[];
}

export interface CommissionRunDistributeResult {
  run: CommissionClubRun;
  shares: EmployeePoolShare[];
}
