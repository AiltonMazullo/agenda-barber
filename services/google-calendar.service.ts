import { clientApi } from "@/lib/client-api";
import type { GoogleCalendarStatus } from "@/types/google-calendar.types";

/**
 * Integração contínua do cliente com o Google Agenda: conectar uma vez via
 * OAuth, depois só ligar/desligar. Enquanto ativa, todo agendamento do
 * cliente é espelhado automaticamente pelo backend (ver `appointments.service.ts`).
 */
export const googleCalendarService = {
  async status(): Promise<GoogleCalendarStatus> {
    const { data } = await clientApi.get<GoogleCalendarStatus>(
      "/clients/me/google-calendar/status",
    );
    return data;
  },

  /** Retorna a URL de autorização do Google — o chamador deve redirecionar (`window.location.href`). */
  async getAuthUrl(): Promise<string> {
    const { data } = await clientApi.get<{ url: string }>(
      "/clients/me/google-calendar/connect",
    );
    return data.url;
  },

  async setEnabled(enabled: boolean): Promise<GoogleCalendarStatus> {
    const { data } = await clientApi.patch<GoogleCalendarStatus>(
      "/clients/me/google-calendar",
      { enabled },
    );
    return data;
  },

  async disconnect(): Promise<void> {
    await clientApi.delete<void>("/clients/me/google-calendar");
  },
};
