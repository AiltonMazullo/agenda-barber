/** Tipos espelhando o modelo `Holiday` (feriado) do backend. */

export type HolidayStatus = "OPEN" | "CLOSED";

export interface Holiday {
  id: string;
  name: string;
  date: string; // "YYYY-MM-DD"
  status: HolidayStatus;
  startTime: string | null; // "HH:mm" — presente quando status = OPEN
  endTime: string | null; // "HH:mm" — presente quando status = OPEN
  branchId: string | null; // null = todas as filiais
  barbershopId: string;
  createdAt: string;
  updatedAt: string;
}

export interface HolidayPayload {
  name: string;
  date: string;
  status: HolidayStatus;
  startTime?: string;
  endTime?: string;
  branchId?: string | null;
}

export type CreateHolidayPayload = HolidayPayload;
export type UpdateHolidayPayload = HolidayPayload;
