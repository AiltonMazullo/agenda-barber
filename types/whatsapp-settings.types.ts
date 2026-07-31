/**
 * Tipos espelhando o modelo `WhatsappSettings` do backend.
 * Cada barbearia tem no máximo um conjunto de templates (get-or-create no backend).
 */

export interface WhatsappSettings {
  id: string;
  barbershopId: string;
  confirmationTemplate: string;
  preApprovedPlanTemplate: string;
  birthdayTemplate: string;
  reminderTemplate: string;
  /** Quantas horas antes do agendamento o lembrete é disparado. Default 24h. */
  reminderHoursBefore: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateWhatsappSettingsPayload {
  confirmationTemplate?: string;
  preApprovedPlanTemplate?: string;
  birthdayTemplate?: string;
  reminderTemplate?: string;
  reminderHoursBefore?: number;
}
