import { StatusBadge } from "@/components/shared";
import type { ClientSubscriptionStatus } from "@/types/client.types";

interface SubscriptionBadgeProps {
  status: ClientSubscriptionStatus;
  planoNome?: string;
}

const STATUS_LABELS: Record<ClientSubscriptionStatus, string> = {
  ativo: "Ativo",
  inadimplente: "Inadimplente",
  cancelado: "Cancelado",
  nenhum: "Não",
};

export function SubscriptionBadge({
  status,
  planoNome,
}: SubscriptionBadgeProps) {
  if (status === "nenhum") {
    return <StatusBadge tone="neutral">Não</StatusBadge>;
  }

  const tone =
    status === "ativo"
      ? "success"
      : status === "inadimplente"
        ? "danger"
        : "neutral";

  const label = planoNome
    ? `${planoNome} · ${STATUS_LABELS[status]}`
    : STATUS_LABELS[status];

  return <StatusBadge tone={tone}>{label}</StatusBadge>;
}
