"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  ReceiptText,
} from "lucide-react";
import {
  ConfirmDialog,
  EmptyState,
  Loading,
  PageHeader,
  StatusBadge,
} from "@/components/shared";
import { usePlatformSubscription } from "@/hooks/usePlatformSubscription";
import { platformSubscriptionService } from "@/services/platform-subscription.service";
import { formatBRL, formatDate } from "@/utils/format";
import type {
  PlatformSubscriptionStatus,
} from "@/types/platform-subscription.types";
import type { Tone } from "@/types/common.types";

const STATUS_META: Record<PlatformSubscriptionStatus, { label: string; tone: Tone }> = {
  TRIALING: { label: "Período de teste", tone: "brand" },
  ACTIVE: { label: "Ativa", tone: "success" },
  PAST_DUE: { label: "Pagamento pendente", tone: "danger" },
  CANCELED: { label: "Cancelada", tone: "danger" },
};

const CHARGE_STATUS_LABEL: Record<string, string> = {
  PAID: "Pago",
  PENDING: "Pendente",
  OVERDUE: "Atrasado",
};

function BillingContent() {
  const { subscription, isLoading, refetch } = usePlatformSubscription();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  useEffect(() => {
    const checkout = searchParams.get("checkout");
    if (!checkout) return;
    if (checkout === "sucesso") {
      toast.success("Pagamento confirmado! Assim que o Asaas processar, seu plano é ativado.");
      refetch();
    } else if (checkout === "cancelado") {
      toast.info("Checkout cancelado.");
    }
    router.replace("/billing");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  async function handleSubscribe() {
    setIsRedirecting(true);
    try {
      const { checkoutUrl } = await platformSubscriptionService.checkout();
      window.location.assign(checkoutUrl);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível iniciar o checkout.");
      setIsRedirecting(false);
    }
  }

  async function handleCancel() {
    setIsCanceling(true);
    try {
      await platformSubscriptionService.cancel();
      toast.success("Assinatura cancelada.");
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível cancelar a assinatura.");
    } finally {
      setIsCanceling(false);
    }
  }

  if (isLoading || !subscription) {
    return (
      <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
        <PageHeader title="Meu Plano" subtitle="Assinatura do Agendle e faturamento" />
        <Loading label="Carregando assinatura" />
      </div>
    );
  }

  const meta = STATUS_META[subscription.status];
  const pendingCharge = subscription.charges.find((c) => c.status !== "PAID" && c.invoiceUrl);
  const showSubscribeAction =
    subscription.status === "TRIALING" ||
    (subscription.status === "CANCELED" && !subscription.isActive) ||
    (subscription.status === "PAST_DUE" && !pendingCharge);

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader title="Meu Plano" subtitle="Assinatura do Agendle e faturamento" />

      {/* Status */}
      <div className="rounded-xl border border-border bg-surface-raised p-4 space-y-3">
        <div className="flex items-center gap-2">
          <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
          {subscription.status === "TRIALING" && (
            <span className="text-sm text-muted-foreground">
              {subscription.trialDaysLeft > 0
                ? `${subscription.trialDaysLeft} dia${subscription.trialDaysLeft === 1 ? "" : "s"} restante${subscription.trialDaysLeft === 1 ? "" : "s"} de teste grátis`
                : "Seu teste grátis acabou"}
            </span>
          )}
          {subscription.status === "ACTIVE" && subscription.nextDueDate && (
            <span className="text-sm text-muted-foreground">
              Próxima cobrança em {formatDate(subscription.nextDueDate)}
            </span>
          )}
          {subscription.status === "CANCELED" && subscription.isActive && subscription.nextDueDate && (
            <span className="text-sm text-muted-foreground">
              Acesso garantido até {formatDate(subscription.nextDueDate)}
            </span>
          )}
        </div>

        {subscription.status === "PAST_DUE" && (
          <div className="flex items-start gap-2 rounded-lg bg-danger/10 border border-danger/30 p-3 text-sm text-danger-foreground">
            <AlertTriangle className="size-4 shrink-0 mt-0.5" />
            <p>
              Identificamos um problema no pagamento da sua assinatura. Regularize para continuar
              usando o painel sem interrupções.
            </p>
          </div>
        )}
      </div>

      {/* Plano */}
      <div className="rounded-xl border border-border bg-surface-raised p-4 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-brand/15 text-brand grid place-items-center">
              <CreditCard className="size-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Plano Mensal Agendle</p>
              <p className="text-sm text-muted-foreground">
                {formatBRL(subscription.price)} / mês — cartão, PIX ou boleto
              </p>
            </div>
          </div>

          {pendingCharge?.invoiceUrl && (
            <a
              href={pendingCharge.invoiceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 px-4 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors flex items-center gap-1.5"
            >
              <ReceiptText className="size-4" />
              Pagar fatura pendente
              <ExternalLink className="size-3.5" />
            </a>
          )}

          {showSubscribeAction && !pendingCharge && (
            <button
              type="button"
              onClick={handleSubscribe}
              disabled={isRedirecting}
              className="h-10 px-4 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors disabled:opacity-50"
            >
              {isRedirecting
                ? "Redirecionando…"
                : subscription.status === "CANCELED"
                  ? "Reativar assinatura"
                  : "Assinar agora"}
            </button>
          )}

          {subscription.status === "ACTIVE" && (
            <button
              type="button"
              onClick={() => setConfirmCancelOpen(true)}
              disabled={isCanceling}
              className="h-10 px-4 rounded-md text-sm font-bold border border-border text-muted-foreground hover:bg-surface-elevated transition-colors disabled:opacity-50"
            >
              Cancelar assinatura
            </button>
          )}
        </div>

        {subscription.status === "ACTIVE" && (
          <div className="flex items-center gap-2 text-sm text-success-foreground">
            <CheckCircle2 className="size-4" />
            <span>Sua assinatura está em dia.</span>
          </div>
        )}
      </div>

      {/* Histórico de cobranças */}
      <div className="rounded-xl border border-border bg-surface-raised p-4 space-y-3">
        <h2 className="font-semibold text-foreground">Histórico de cobranças</h2>

        {subscription.charges.length === 0 ? (
          <EmptyState message="Nenhuma cobrança ainda." icon={<ReceiptText className="size-10" />} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="py-2 pr-4 font-medium">Vencimento</th>
                  <th className="py-2 pr-4 font-medium">Valor</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 pr-4 font-medium">Fatura</th>
                </tr>
              </thead>
              <tbody>
                {subscription.charges.map((charge) => (
                  <tr key={charge.id} className="border-b border-border last:border-0">
                    <td className="py-2 pr-4">{formatDate(charge.dueDate)}</td>
                    <td className="py-2 pr-4">{formatBRL(charge.value)}</td>
                    <td className="py-2 pr-4">
                      {CHARGE_STATUS_LABEL[charge.status] ?? charge.status}
                    </td>
                    <td className="py-2 pr-4">
                      {charge.invoiceUrl ? (
                        <a
                          href={charge.invoiceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand hover:underline inline-flex items-center gap-1"
                        >
                          Ver fatura <ExternalLink className="size-3.5" />
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmCancelOpen}
        onOpenChange={setConfirmCancelOpen}
        title="Cancelar assinatura?"
        description="Você continuará com acesso até o fim do período já pago. Depois disso, o painel fica bloqueado até uma nova assinatura."
        confirmLabel="Cancelar assinatura"
        tone="danger"
        onConfirm={handleCancel}
      />
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<Loading />}>
      <BillingContent />
    </Suspense>
  );
}
