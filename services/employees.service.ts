import { api } from "@/lib/api";
import type {
  CreateEmployeePayload,
  Employee,
  EmployeeDifferentiatedCommission,
  EmployeeProductCommissionRule,
  EmployeeSchedule,
  EmployeeService,
  EmployeeTimeOff,
  UpdateDifferentiatedCommissionPayload,
  UpdateEmployeePayload,
  UpdateProductCommissionRulePayload,
} from "@/types/employee.types";

type ScheduleInput = Pick<EmployeeSchedule, "dayOfWeek" | "startTime" | "endTime">;

export const employeesService = {
  async list(barbershopId: string): Promise<Employee[]> {
    const { data } = await api.get<Employee[]>(
      `/barbershops/${barbershopId}/employees`,
    );
    return data;
  },

  async create(
    barbershopId: string,
    payload: CreateEmployeePayload,
  ): Promise<Employee> {
    const { data } = await api.post<Employee>(
      `/barbershops/${barbershopId}/employees`,
      payload,
    );
    return data;
  },

  async update(
    barbershopId: string,
    id: string,
    payload: UpdateEmployeePayload,
  ): Promise<Employee> {
    const { data } = await api.put<Employee>(
      `/barbershops/${barbershopId}/employees/${id}`,
      payload,
    );
    return data;
  },

  async remove(barbershopId: string, id: string): Promise<void> {
    await api.delete<void>(`/barbershops/${barbershopId}/employees/${id}`);
  },

  async setFeatured(
    barbershopId: string,
    id: string,
    featured: boolean,
  ): Promise<Employee> {
    const { data } = await api.patch<Employee>(
      `/barbershops/${barbershopId}/employees/${id}/featured`,
      { featured },
    );
    return data;
  },

  async setHidden(
    barbershopId: string,
    id: string,
    hidden: boolean,
  ): Promise<Employee> {
    const { data } = await api.patch<Employee>(
      `/barbershops/${barbershopId}/employees/${id}/hidden`,
      { hidden },
    );
    return data;
  },

  async reorder(
    barbershopId: string,
    orderedIds: string[],
  ): Promise<void> {
    const items = orderedIds.map((id, order) => ({ id, order }));
    await api.patch<void>(`/barbershops/${barbershopId}/employees/reorder`, { items });
  },

  async getSchedules(barbershopId: string, id: string): Promise<EmployeeSchedule[]> {
    const { data } = await api.get<EmployeeSchedule[]>(
      `/barbershops/${barbershopId}/employees/${id}/schedules`,
    );
    return data;
  },

  async updateSchedules(
    barbershopId: string,
    id: string,
    schedules: ScheduleInput[],
  ): Promise<void> {
    await api.put<void>(
      `/barbershops/${barbershopId}/employees/${id}/schedules`,
      { schedules },
    );
  },

  async getServices(barbershopId: string, id: string): Promise<EmployeeService[]> {
    const { data } = await api.get<EmployeeService[]>(
      `/barbershops/${barbershopId}/employees/${id}/services`,
    );
    return data;
  },

  async updateServices(
    barbershopId: string,
    id: string,
    services: EmployeeService[],
  ): Promise<void> {
    await api.put<void>(
      `/barbershops/${barbershopId}/employees/${id}/services`,
      { services },
    );
  },

  async getProductCommissionRule(
    barbershopId: string,
    id: string,
  ): Promise<EmployeeProductCommissionRule | null> {
    const { data } = await api.get<EmployeeProductCommissionRule | null>(
      `/barbershops/${barbershopId}/employees/${id}/product-commission`,
    );
    return data;
  },

  async updateProductCommissionRule(
    barbershopId: string,
    id: string,
    payload: UpdateProductCommissionRulePayload,
  ): Promise<EmployeeProductCommissionRule> {
    const { data } = await api.put<EmployeeProductCommissionRule>(
      `/barbershops/${barbershopId}/employees/${id}/product-commission`,
      payload,
    );
    return data;
  },

  async getDifferentiatedCommission(
    barbershopId: string,
    id: string,
  ): Promise<EmployeeDifferentiatedCommission | null> {
    const { data } = await api.get<EmployeeDifferentiatedCommission | null>(
      `/barbershops/${barbershopId}/employees/${id}/differentiated-commission`,
    );
    return data;
  },

  async updateDifferentiatedCommission(
    barbershopId: string,
    id: string,
    payload: UpdateDifferentiatedCommissionPayload,
  ): Promise<EmployeeDifferentiatedCommission> {
    const { data } = await api.put<EmployeeDifferentiatedCommission>(
      `/barbershops/${barbershopId}/employees/${id}/differentiated-commission`,
      payload,
    );
    return data;
  },

  async getTimeOff(barbershopId: string, id: string): Promise<EmployeeTimeOff[]> {
    const { data } = await api.get<EmployeeTimeOff[]>(
      `/barbershops/${barbershopId}/employees/${id}/time-off`,
    );
    return data;
  },

  async updateTimeOff(
    barbershopId: string,
    id: string,
    timeOff: { startDate: string; endDate: string }[],
  ): Promise<void> {
    await api.put<void>(
      `/barbershops/${barbershopId}/employees/${id}/time-off`,
      { timeOff },
    );
  },

  /** Envia a foto de perfil (campo `avatar`, JPEG/PNG/WebP até 2MB). */
  async uploadAvatar(
    barbershopId: string,
    id: string,
    file: File,
  ): Promise<Employee> {
    const formData = new FormData();
    formData.append("avatar", file);
    const { data } = await api.patch<Employee>(
      `/barbershops/${barbershopId}/employees/${id}/avatar`,
      formData,
      // Sobrescreve o Content-Type JSON default da instância; o axios
      // completa o boundary do multipart automaticamente.
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data;
  },
};
