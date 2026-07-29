/** Status da integração contínua do cliente com o Google Agenda. */
export interface GoogleCalendarStatus {
  connected: boolean;
  enabled: boolean;
  googleEmail: string | null;
}
