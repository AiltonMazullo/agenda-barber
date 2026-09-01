"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useClientAuth } from "@/hooks/useClientAuth";
import { usePublicBarbershop } from "@/contexts/PublicBarbershopContext";
import { clientReviewsService } from "@/services/client-reviews.service";
import { formatDate, formatTime, toWallClockDate } from "@/utils/format";
import type { PendingReviewAppointment } from "@/types/review.types";

const DISMISSED_KEY = "agendle:review-prompt-dismissed";

function loadDismissed(): string[] {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function markDismissed(appointmentId: string) {
  try {
    const current = loadDismissed();
    localStorage.setItem(
      DISMISSED_KEY,
      JSON.stringify([...current, appointmentId].slice(-50)),
    );
  } catch {
    // localStorage indisponível (modo privado etc.) — só significa que o
    // modal pode reaparecer no próximo acesso, sem impacto funcional.
  }
}

/**
 * Modal global "como foi seu atendimento" — dispara quando existe um
 * `Appointment COMPLETED` recente sem `Review` vinculada (ver
 * spec-ajustes-escopo-4.md §5). Fica montado no shell do cliente autenticado.
 */
export function ReviewPromptModal() {
  const { client, isAuthenticated } = useClientAuth();
  const { barbershop } = usePublicBarbershop();
  const [pending, setPending] = useState<PendingReviewAppointment | null>(null);
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !barbershop?.id) return;
    let active = true;
    clientReviewsService
      .pending(barbershop.id)
      .then((appt) => {
        if (!active || !appt) return;
        if (loadDismissed().includes(appt.id)) return;
        setPending(appt);
        setOpen(true);
      })
      .catch(() => {
        // Falha silenciosa — o modal é um plus, não deve travar navegação.
      });
    return () => {
      active = false;
    };
  }, [isAuthenticated, barbershop?.id, client?.id]);

  function handleClose() {
    if (pending) markDismissed(pending.id);
    setOpen(false);
    setRating(0);
    setComment("");
  }

  async function handleSubmit() {
    if (!pending || !barbershop?.id || rating === 0) {
      if (rating === 0) toast.error("Selecione uma nota de 1 a 5 estrelas.");
      return;
    }
    setSubmitting(true);
    try {
      await clientReviewsService.create(barbershop.id, {
        appointmentId: pending.id,
        rating,
        comment: comment.trim() || undefined,
      });
      toast.success("Obrigado pela avaliação!");
      markDismissed(pending.id);
      setOpen(false);
      setRating(0);
      setComment("");
    } catch {
      toast.error("Não foi possível enviar sua avaliação. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!pending) return null;

  const scheduled = toWallClockDate(pending.scheduledAt);
  const prof = pending.employee?.appName ?? pending.employee?.name ?? null;

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : handleClose())}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Como foi seu atendimento?</DialogTitle>
          <DialogDescription>
            {pending.service?.name ?? "Atendimento"} em{" "}
            {formatDate(scheduled)} às {formatTime(scheduled)}
            {prof ? ` com ${prof}` : ""}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                onMouseEnter={() => setHoverRating(n)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-0.5"
                aria-label={`${n} estrela${n > 1 ? "s" : ""}`}
              >
                <Star
                  className={`size-8 transition-colors ${
                    n <= (hoverRating || rating)
                      ? "fill-warning-foreground text-warning-foreground"
                      : "text-border"
                  }`}
                />
              </button>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Conte um pouco sobre sua experiência (opcional)"
            rows={3}
            className="w-full rounded-md border border-border bg-surface-base text-sm text-foreground placeholder:text-text-faint p-2 outline-none focus:border-brand transition-colors resize-none"
          />
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={handleClose}
            className="h-9 px-4 rounded-md border border-border bg-transparent text-sm text-foreground hover:bg-surface-elevated transition-colors"
          >
            Agora não
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={submitting || rating === 0}
            className="h-9 px-4 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors disabled:opacity-60"
          >
            {submitting ? "Enviando…" : "Enviar avaliação"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
