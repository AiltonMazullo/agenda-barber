import type { HolidayStatus } from "@/types/holiday.types";

export const HOLIDAY_STATUS_LABEL: Record<HolidayStatus, string> = {
  OPEN: "Aberto",
  CLOSED: "Fechado",
};

export const HOLIDAY_STATUS_COLOR: Record<HolidayStatus, string> = {
  OPEN: "#22c55e",
  CLOSED: "#ef4444",
};
