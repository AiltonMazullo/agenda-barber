/** Tipos do domínio de Avaliação (`Review`) — ver spec-ajustes-escopo-4.md §5. */

export interface PendingReviewAppointment {
  id: string;
  scheduledAt: string;
  service: { id: string; name: string } | null;
  employee: { id: string; name: string; appName: string | null } | null;
}

export interface CreateClientReviewPayload {
  appointmentId: string;
  rating: number;
  comment?: string;
}

export interface Review {
  id: string;
  rating: number;
  comment: string | null;
  clientId: string;
  employeeId: string | null;
  appointmentId: string | null;
  barbershopId: string;
  createdAt: string;
}
