"use client";

import Link from "next/link";
import { AlertTriangle, CreditCard } from "lucide-react";
import { usePlatformSubscription } from "@/hooks/usePlatformSubscription";
import type { PlatformSubscriptionStatus } from "@/types/platform-subscription.types";

const STATUS_COPY: Record<PlatformSubscriptionStatus, { label: string; className: string }> = {
  TRIALING: {
    label: "Teste grátis",
    className: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  },
  ACTIVE: {
    label: "Plano ativo",
    className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  },
  PAST_DUE: {
    label: "Pagamento pendente",
    className: "bg-red-500/10 text-red-500 border-red-500/30",
  },
  CANCELED: {
    label: "Assinatura cancelada",
    className: "bg-red-500/10 text-red-500 border-red-500/30",
  },
};

/** Badge no Header com o status do plano da barbearia; leva para "Meu Plano" (`/billing`). */
export function SubscriptionBadge() {
  const { subscription, isLoading } = usePlatformSubscription();

  if (isLoading || !subscription) return null;

  const copy = STATUS_COPY[subscription.status];
  const detail =
    subscription.status === "TRIALING"
      ? subscription.trialDaysLeft > 0
        ? `${subscription.trialDaysLeft} dia${subscription.trialDaysLeft === 1 ? "" : "s"} restante${subscription.trialDaysLeft === 1 ? "" : "s"}`
        : "expirado"
      : null;

  const isWarning = subscription.status === "PAST_DUE" || subscription.status === "CANCELED";

  return (
    <Link
      href="/billing"
      className={`hidden sm:flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-opacity hover:opacity-80 ${copy.className}`}
    >
      {isWarning ? <AlertTriangle className="size-3.5" /> : <CreditCard className="size-3.5" />}
      <span>{copy.label}</span>
      {detail && <span className="opacity-70">· {detail}</span>}
    </Link>
  );
}
