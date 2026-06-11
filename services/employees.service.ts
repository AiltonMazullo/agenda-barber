import { api } from "@/lib/api";
import type {
  CreateEmployeePayload,
  Employee,
  UpdateEmployeePayload,
} from "@/types/employee.types";

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
};
