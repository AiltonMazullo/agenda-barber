import { StatusBadge } from "@/components/shared";
import type { ContratoStatus } from "@/types/subscription.types";
import type { Tone } from "@/types/common.types";

const LABELS: Record<ContratoStatus, string> = {
  ativo: "Ativo",
  inadimplente: "Inadimplente",
  cancelado: "Cancelado",
  pre_aprovado: "Pré-Aprovado",
  pre_cancelado: "Pré-Cancelado",
};

const TONES: Record<ContratoStatus, Tone> = {
  ativo: "success",
  inadimplente: "danger",
  cancelado: "neutral",
  pre_aprovado: "info",
  pre_cancelado: "warning",
};

interface ContratoStatusBadgeProps {
  status: ContratoStatus;
}

export function ContratoStatusBadge({ status }: ContratoStatusBadgeProps) {
  return <StatusBadge tone={TONES[status]}>{LABELS[status]}</StatusBadge>;
}

export const CONTRATO_STATUS_LABELS = LABELS;
