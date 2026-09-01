import { clientApi } from "@/lib/client-api";
import type {
  CreateClientReviewPayload,
  PendingReviewAppointment,
  Review,
} from "@/types/review.types";

const base = (barbershopId: string) => `/barbershops/${barbershopId}/reviews`;

/**
 * Avaliação do próprio cliente final (autenticado como Client). O `clientId`
 * vem do token (`req.user.sub`), nunca do body — ver spec-ajustes-escopo-4.md §5.
 */
export const clientReviewsService = {
  /** Atendimento concluído mais recente ainda sem avaliação, ou `null`. */
  async pending(barbershopId: string): Promise<PendingReviewAppointment | null> {
    const { data } = await clientApi.get<PendingReviewAppointment | null>(
      `${base(barbershopId)}/me/pending`,
    );
    return data;
  },

  async create(barbershopId: string, payload: CreateClientReviewPayload): Promise<Review> {
    const { data } = await clientApi.post<Review>(`${base(barbershopId)}/me`, payload);
    return data;
  },
};
