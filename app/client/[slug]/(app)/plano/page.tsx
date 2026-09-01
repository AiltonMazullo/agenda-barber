"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Crown,
  Calendar,
  Clock,
  AlertCircle,
  Star,
  Flame,
  CreditCard,
} from "lucide-react";
import { Loading } from "@/components/shared/Loading";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { SelectField } from "@/components/shared";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CompleteCheckoutProfileForm } from "@/components/client/CompleteCheckoutProfileForm";
import { clientPlansService } from "@/services/client-plans.service";
import { usePublicBarbershop } from "@/contexts/PublicBarbershopContext";
import { useClientAuth } from "@/hooks/useClientAuth";
import { useClientSubscription } from "@/hooks/useClientSubscription";
import { formatBRL, formatDate } from "@/utils/format";
import { formatDiscountLabel, formatWeekdays } from "@/utils/plan-pricing";
import { computeScheduledCancelDate } from "@/utils/subscription-cancel";
import { CANCEL_REASON_OPTIONS, type CancelReasonCode } from "@/types/pre-cancelled-client.types";
import type { Plan } from "@/types/plan.types";
import type { Client } from "@/types/client.types";

/**
 * Dados exigidos pela ASAAS para gerar a cobrança (cadastro do pagador,
 * antifraude — ver `pre-approved-clients.service.ts`/`asaas.client.ts` no
 * backend). Sem eles o checkout falha com erro de campos obrigatórios.
 */
function isProfileCompleteForCheckout(client: Client): boolean {
  return Boolean(
    client.cpf &&
      client.phone &&
      client.cep &&
      client.street &&
      client.number &&
      client.neighborhood &&
      client.city &&
      client.uf,
  );
}

function formatCents(cents: number): string {
  return formatBRL(cents / 100);
}

interface PlanCardProps {
  plan: Plan;
  isCurrentPlan: boolean;
  hasOtherActivePlan: boolean;
  subscribing: boolean;
  onSubscribe: () => void;
  onCancel: () => void;
}

function PlanCard({
  plan,
  isCurrentPlan,
  hasOtherActivePlan,
  subscribing,
  onSubscribe,
  onCancel,
}: PlanCardProps) {
  const accentColor = plan.labelColor ?? "#f5b82e";

  const availableWeekdaysLabel =
    plan.availableWeekdays.length > 0 ? formatWeekdays(plan.availableWeekdays) : "Todos os dias";

  // `availableQuantity` vazio → sem limite p/ novas contratações, não exibe
  // nada no card. Preenchido → mostra quantos ainda restam (já descontadas
  // as assinaturas ativas, calculado em `PlansService.list`); ao chegar em 0
  // exibe "Esgotado" e bloqueia a contratação (backend também recusa, ver
  // `SubscriptionsService.subscribe`).
  const isSoldOut = plan.availableSlots === 0;

  return (
    <div className="relative rounded-xl border border-border-subtle bg-surface-raised overflow-hidden flex flex-col">
      {/* Color bar */}
      <div className="h-1.5 w-full" style={{ backgroundColor: accentColor }} />

      {plan.highlighted && (
        <div className="absolute top-3 right-3 h-6 px-2.5 rounded-full bg-brand text-brand-foreground text-[10px] font-bold flex items-center gap-1 shadow-sm">
          <Star className="size-3 fill-current" />
          Mais vendido
        </div>
      )}

      <div className="p-5 flex flex-col flex-1 gap-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div
            className="size-10 rounded-xl grid place-items-center shrink-0"
            style={{ backgroundColor: `${accentColor}22` }}
          >
            <Star className="size-5 fill-current" style={{ color: accentColor }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground text-base leading-tight">
              {plan.name}
            </h3>
            <p className="text-2xl font-extrabold text-foreground mt-1">
              {formatCents(plan.priceInCents)}
              <span className="text-sm font-normal text-muted-foreground">
                /mês
              </span>
            </p>
          </div>
        </div>

        {/* Vagas restantes */}
        {plan.availableSlots != null && (
          <div
            className={`rounded-lg px-3 py-2 flex items-center gap-2 ${
              isSoldOut
                ? "bg-danger/10 border border-danger/30"
                : "bg-green-500/10 border border-green-500/30"
            }`}
          >
            <Flame className={`size-4 shrink-0 ${isSoldOut ? "text-danger-foreground" : "text-green-500"}`} />
            <div>
              <p
                className={`text-xs font-extrabold uppercase tracking-wide ${
                  isSoldOut ? "text-danger-foreground" : "text-green-500"
                }`}
              >
                {isSoldOut
                  ? "Restam 0 planos"
                  : `Restam ${plan.availableSlots} ${plan.availableSlots === 1 ? "plano" : "planos"}`}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {isSoldOut
                  ? "Todas as vagas foram preenchidas."
                  : "Garanta já o seu e não fique de fora."}
              </p>
            </div>
          </div>
        )}

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-surface-base border border-border-subtle px-3 py-2 flex items-center gap-2">
            <Calendar className="size-3.5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground">Serviços/vez</p>
              <p className="text-xs font-semibold text-foreground">
                {plan.maxSimultaneousServices}
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-surface-base border border-border-subtle px-3 py-2 flex items-center gap-2">
            <Calendar className="size-3.5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground">Permitido para</p>
              <p className="text-xs font-semibold text-foreground">
                {availableWeekdaysLabel}
              </p>
            </div>
          </div>

          {plan.serviceFrequencyDays > 0 && (
            <div className="col-span-2 rounded-lg bg-surface-base border border-border-subtle px-3 py-2 flex items-center gap-2">
              <Clock className="size-3.5 text-muted-foreground shrink-0" />
              <p className="text-xs text-foreground">
                Agenda liberada com{" "}
                <span className="font-bold">
                  {plan.serviceFrequencyDays}{" "}
                  {plan.serviceFrequencyDays === 1 ? "dia" : "dias"}
                </span>{" "}
                de antecedência
              </p>
            </div>
          )}
        </div>

        {/* Serviços / Produtos */}
        {(plan.planServices.length > 0 || plan.planProducts.length > 0) && (
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Serviços / Produtos
            </p>
            <div className="space-y-1">
              {plan.planServices.map((ps) => (
                <div
                  key={ps.id}
                  className="rounded-md border border-border-subtle bg-surface-base px-3 py-1.5 space-y-1"
                >
                  <p className="text-xs text-foreground truncate">{ps.service.name}</p>
                  <span className="inline-flex items-center rounded-md border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-[11px] font-bold uppercase text-green-500">
                    {formatDiscountLabel(ps.discountPercent, ps.monthlyLimit)}
                  </span>
                </div>
              ))}
              {plan.planProducts.map((pp) => (
                <div
                  key={pp.id}
                  className="flex items-center justify-between gap-2 rounded-md border border-border-subtle bg-surface-base px-3 py-1.5"
                >
                  <span className="text-xs text-foreground truncate flex-1">
                    {pp.product.name}
                  </span>
                  <span className="shrink-0 rounded-md border border-brand/30 bg-brand/10 px-2 py-0.5 text-[11px] font-bold text-brand whitespace-nowrap">
                    {formatCents(pp.priceInCents)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-auto pt-1 space-y-2">
          {isCurrentPlan ? (
            <>
              <button
                type="button"
                disabled
                className="w-full h-10 rounded-lg text-sm font-bold text-white opacity-60 cursor-not-allowed"
                style={{ backgroundColor: accentColor }}
              >
                Plano atual
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="w-full h-9 rounded-lg text-xs font-semibold text-danger-foreground border border-danger/30 hover:bg-danger/10 transition-colors"
              >
                Cancelar assinatura
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onSubscribe}
              disabled={subscribing || isSoldOut}
              className={`w-full h-10 rounded-lg text-sm font-bold transition-opacity hover:opacity-90 disabled:cursor-not-allowed ${
                isSoldOut
                  ? "bg-surface-elevated text-muted-foreground disabled:opacity-100"
                  : "text-white disabled:opacity-60"
              }`}
              style={isSoldOut ? undefined : { backgroundColor: accentColor }}
            >
              {isSoldOut
                ? "Esgotado"
                : subscribing
                  ? "Assinando…"
                  : hasOtherActivePlan
                    ? "Trocar para este plano"
                    : "Assinar plano"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PlanoClientePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { barbershop } = usePublicBarbershop();
  const { client } = useClientAuth();
  const { mySubscription, subscribe, cancel, refresh } = useClientSubscription(barbershop?.id);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscribingId, setSubscribingId] = useState<string | null>(null);
  const [switchTarget, setSwitchTarget] = useState<Plan | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Plan | null>(null);
  const [cancelReason, setCancelReason] = useState<CancelReasonCode | "">("");
  const [cancelling, setCancelling] = useState(false);

  // Fluxo de confirmação do plano antes de redirecionar pro checkout de cartão.
  const [checkoutPlan, setCheckoutPlan] = useState<Plan | null>(null);

  const activePlanId = mySubscription?.subscription.planId ?? null;

  function openPaymentDialog(plan: Plan) {
    setCheckoutPlan(plan);
  }

  function closePaymentDialog() {
    setCheckoutPlan(null);
  }

  async function handleConfirmCheckout() {
    if (!checkoutPlan) return;
    setSubscribingId(checkoutPlan.id);
    await subscribe(checkoutPlan.id, "CREDIT_CARD");
    setSubscribingId(null);
    // Sucesso já redireciona (window.location.href) dentro do hook; se falhar,
    // o erro já foi mostrado via toast e o diálogo permanece aberto para o
    // cliente tentar de novo.
  }

  // Retorno do checkout externo (gateway) — o pagamento é confirmado por
  // webhook, então aqui só avisamos e limpamos a URL; se o webhook ainda não
  // processou, a assinatura pode levar alguns segundos para aparecer.
  useEffect(() => {
    const checkout = searchParams.get("checkout");
    if (!checkout) return;
    if (checkout === "success") {
      toast.success("Pagamento recebido! Sua assinatura será ativada em instantes.");
      void refresh();
    } else if (checkout === "cancel") {
      toast.error("Checkout cancelado — nenhuma cobrança foi feita.");
    }
    router.replace(window.location.pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (!barbershop) return;
    let active = true;
    setLoading(true);
    setError(null);
    clientPlansService
      .list(barbershop.id)
      .then((list) => {
        if (active) setPlans(list.filter((p) => !p.hidden));
      })
      .catch(() => {
        if (active) setError("Não foi possível carregar os planos.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [barbershop]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Planos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Assine para ter serviços inclusos, descontos e prioridade no
          agendamento.
        </p>
      </div>

      {/* Inadimplência (spec-ajustes-escopo-3 §6) — antes não havia nenhuma
          menção a atraso/cancelamento automático na tela do próprio
          cliente. `autoCancelAt` é a data explícita (item 6.3) em que a
          assinatura é cancelada automaticamente se o atraso persistir. */}
      {mySubscription?.delinquency.isOverdue && (
        <div className="rounded-lg border border-danger/30 bg-danger/5 p-4 flex items-start gap-3">
          <AlertCircle className="size-5 text-danger-foreground shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            Sua assinatura está com pagamento em atraso.
            {mySubscription.delinquency.autoCancelAt && (
              <>
                {" "}
                Se não for regularizado, ela será cancelada automaticamente em{" "}
                <span className="font-semibold text-danger-foreground">
                  {formatDate(mySubscription.delinquency.autoCancelAt)}
                </span>
                .
              </>
            )}
          </p>
        </div>
      )}

      {loading && <Loading />}

      {error && !loading && (
        <div className="rounded-lg border border-danger/30 bg-danger/5 p-8 text-center space-y-2">
          <AlertCircle className="size-7 text-danger-foreground mx-auto" />
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      )}

      {!loading && !error && plans.length === 0 && (
        <div className="rounded-xl border border-border-subtle bg-surface-raised p-8 text-center space-y-2">
          <Crown className="size-7 text-text-faint mx-auto" />
          <p className="text-sm text-muted-foreground">
            Esta barbearia ainda não possui planos disponíveis.
          </p>
        </div>
      )}

      {!loading && plans.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map((plan) => {
            const isCurrentPlan = activePlanId === plan.id;
            const hasOtherActivePlan = activePlanId !== null && !isCurrentPlan;
            return (
              <PlanCard
                key={plan.id}
                plan={plan}
                isCurrentPlan={isCurrentPlan}
                hasOtherActivePlan={hasOtherActivePlan}
                subscribing={subscribingId === plan.id}
                onSubscribe={() =>
                  hasOtherActivePlan ? setSwitchTarget(plan) : openPaymentDialog(plan)
                }
                onCancel={() => setCancelTarget(plan)}
              />
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={switchTarget !== null}
        onOpenChange={(v) => !v && setSwitchTarget(null)}
        title="Trocar de plano"
        description={`Sua assinatura atual será cancelada e você passará a assinar "${switchTarget?.name}". Deseja continuar?`}
        confirmLabel="Trocar plano"
        onConfirm={() => {
          if (switchTarget) openPaymentDialog(switchTarget);
        }}
      />

      <Dialog
        open={cancelTarget !== null}
        onOpenChange={(v) => {
          if (!v) {
            setCancelTarget(null);
            setCancelReason("");
          }
        }}
      >
        <DialogContent className="bg-surface-raised border border-border text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancelar assinatura</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja cancelar a assinatura do plano &quot;
              {cancelTarget?.name}&quot;?
              {mySubscription && (
                <>
                  {" "}
                  Você continua com acesso aos benefícios do plano até{" "}
                  <span className="font-semibold text-foreground">
                    {formatDate(
                      computeScheduledCancelDate(mySubscription.subscription.billingDay),
                    )}
                  </span>
                  — o cancelamento não é imediato.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="py-1">
            <SelectField
              id="cancelReason"
              label="Motivo do cancelamento"
              value={cancelReason}
              onChange={(v) => setCancelReason(v as CancelReasonCode)}
              placeholder="Selecione o motivo"
              options={CANCEL_REASON_OPTIONS}
            />
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => {
                setCancelTarget(null);
                setCancelReason("");
              }}
              className="h-9 px-4 rounded-md border border-border bg-transparent text-sm text-foreground hover:bg-surface-elevated transition-colors"
            >
              Voltar
            </button>
            <button
              type="button"
              disabled={!cancelReason || cancelling}
              onClick={async () => {
                if (!cancelReason) return;
                setCancelling(true);
                const result = await cancel(cancelReason);
                setCancelling(false);
                if (result) {
                  setCancelTarget(null);
                  setCancelReason("");
                }
              }}
              className="h-9 px-4 rounded-md text-sm font-bold bg-danger text-white hover:bg-danger/90 transition-colors disabled:opacity-60"
            >
              {cancelling ? "Cancelando…" : "Confirmar cancelamento"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={checkoutPlan !== null}
        onOpenChange={(v) => !v && closePaymentDialog()}
      >
        <DialogContent
          className={
            client && !isProfileCompleteForCheckout(client)
              ? "bg-surface-raised border border-border text-foreground sm:max-w-xl max-h-[85vh] overflow-y-auto"
              : "bg-surface-raised border border-border text-foreground sm:max-w-md"
          }
        >
          {client && !isProfileCompleteForCheckout(client) ? (
            <>
              <DialogHeader>
                <DialogTitle>Complete seu cadastro</DialogTitle>
                <DialogDescription>
                  Para gerar a cobrança de &quot;{checkoutPlan?.name}&quot; precisamos de mais
                  alguns dados: CPF, telefone e endereço completo.
                </DialogDescription>
              </DialogHeader>
              <CompleteCheckoutProfileForm
                client={client}
                onCancel={closePaymentDialog}
                onSaved={() => {
                  /* `client` do contexto já é atualizado por `updateProfile` — ao
                     salvar os campos que faltavam, este diálogo re-renderiza
                     direto na etapa de confirmação abaixo. */
                }}
              />
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Confirmar assinatura</DialogTitle>
                <DialogDescription>
                  Assine &quot;{checkoutPlan?.name}&quot; com cobrança recorrente automática no
                  cartão de crédito, todo mês.
                </DialogDescription>
              </DialogHeader>

              <div className="rounded-lg border border-border-subtle bg-surface-base p-3 flex items-center gap-3">
                <CreditCard className="size-5 shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">Cartão de crédito</p>
                  <p className="text-xs text-muted-foreground">
                    Cobrança recorrente automática todo mês.
                  </p>
                </div>
              </div>

              {checkoutPlan?.contractUrl && (
                <a
                  href={checkoutPlan.contractUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-brand hover:underline"
                >
                  Ver contrato
                </a>
              )}

              <DialogFooter>
                <button
                  type="button"
                  onClick={closePaymentDialog}
                  className="h-10 px-4 rounded-lg text-sm font-semibold border border-border-subtle hover:bg-surface-base transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCheckout}
                  disabled={subscribingId === checkoutPlan?.id}
                  className="h-10 px-4 rounded-lg text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors disabled:opacity-60"
                >
                  {subscribingId === checkoutPlan?.id ? "Processando…" : "Continuar"}
                </button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
