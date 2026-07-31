"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Crown,
  Users,
  Scissors,
  Package,
  Calendar,
  Lock,
  Repeat2,
  AlertCircle,
  Star,
  Flame,
  CreditCard,
  QrCode,
  Copy,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Loading } from "@/components/shared/Loading";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { clientPlansService } from "@/services/client-plans.service";
import { usePublicBarbershop } from "@/contexts/PublicBarbershopContext";
import { useClientSubscription } from "@/hooks/useClientSubscription";
import { formatBRL } from "@/utils/format";
import { formatDiscountLabel, formatWeekdays } from "@/utils/plan-pricing";
import type { Plan } from "@/types/plan.types";
import type {
  ServiceUsage,
  SubscribePixAuthorizationResult,
  SubscriptionPaymentMethod,
} from "@/types/subscription.types";

const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function formatCents(cents: number): string {
  return formatBRL(cents / 100);
}

interface PlanCardProps {
  plan: Plan;
  isCurrentPlan: boolean;
  hasOtherActivePlan: boolean;
  subscribing: boolean;
  usage?: ServiceUsage[];
  onSubscribe: () => void;
  onCancel: () => void;
}

function PlanCard({
  plan,
  isCurrentPlan,
  hasOtherActivePlan,
  subscribing,
  usage = [],
  onSubscribe,
  onCancel,
}: PlanCardProps) {
  const accentColor = plan.labelColor ?? "#f5b82e";

  const freeDayLabels =
    plan.freeDays.length > 0
      ? plan.freeDays.map((d) => DAY_NAMES[d] ?? String(d)).join(", ")
      : null;

  const availableWeekdaysLabel =
    plan.availableWeekdays.length > 0 ? formatWeekdays(plan.availableWeekdays) : "Todos os dias";

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

      {plan.availableSlots != null && plan.availableSlots > 0 && (
        <div className="mx-5 mt-4 -mb-1 rounded-lg bg-orange-500/10 border border-orange-500/30 px-3 py-2 flex items-center gap-2">
          <Flame className="size-4 text-orange-500 shrink-0" />
          <div>
            <p className="text-xs font-extrabold text-orange-500 uppercase tracking-wide">
              Restam {plan.availableSlots} {plan.availableSlots === 1 ? "vaga" : "vagas"}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Garanta já o seu e não fique de fora
            </p>
          </div>
        </div>
      )}

      <div className="p-5 flex flex-col flex-1 gap-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div
            className="size-10 rounded-xl grid place-items-center shrink-0"
            style={{ backgroundColor: `${accentColor}22` }}
          >
            <Crown className="size-5" style={{ color: accentColor }} />
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

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-surface-base border border-border-subtle px-3 py-2 flex items-center gap-2">
            <Repeat2 className="size-3.5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground">Uso a cada</p>
              <p className="text-xs font-semibold text-foreground">
                {plan.serviceFrequencyDays}d
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-surface-base border border-border-subtle px-3 py-2 flex items-center gap-2">
            <Lock className="size-3.5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground">Fidelidade</p>
              <p className="text-xs font-semibold text-foreground">
                {plan.subscriptionLockDays}d
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-surface-base border border-border-subtle px-3 py-2 flex items-center gap-2">
            <Calendar className="size-3.5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground">Serviços/vez</p>
              <p className="text-xs font-semibold text-foreground">
                {plan.maxSimultaneousServices}
              </p>
            </div>
          </div>

          <div className="col-span-2 rounded-lg bg-surface-base border border-border-subtle px-3 py-2 flex items-center gap-2">
            <Calendar className="size-3.5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground">Dias livres</p>
              <p className="text-xs font-semibold text-foreground">
                {availableWeekdaysLabel}
              </p>
            </div>
          </div>

          {freeDayLabels && (
            <div className="col-span-2 rounded-lg bg-surface-base border border-border-subtle px-3 py-2 flex items-center gap-2">
              <Calendar className="size-3.5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground">Dias de gratuidade</p>
                <p className="text-xs font-semibold text-foreground">
                  {freeDayLabels}
                </p>
              </div>
            </div>
          )}

          {plan.serviceFrequencyDays > 0 && (
            <div className="col-span-2 rounded-lg bg-surface-base border border-border-subtle px-3 py-2 flex items-center gap-2">
              <Repeat2 className="size-3.5 text-muted-foreground shrink-0" />
              <p className="text-xs font-semibold text-foreground">
                Agenda liberada com {plan.serviceFrequencyDays}{" "}
                {plan.serviceFrequencyDays === 1 ? "dia" : "dias"} de antecedência
              </p>
            </div>
          )}
        </div>

        {/* Services */}
        {plan.planServices.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Scissors className="size-3 text-muted-foreground" />
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Serviços
              </p>
            </div>
            <div className="space-y-1">
              {plan.planServices.map((ps) => {
                const svcUsage = usage.find((u) => u.serviceId === ps.serviceId);
                return (
                  <div
                    key={ps.id}
                    className="flex items-center justify-between gap-2 rounded-md border border-border-subtle bg-surface-base px-3 py-1.5"
                  >
                    <span className="text-xs text-foreground truncate flex-1">
                      {ps.service.name}
                    </span>
                    <span className="text-xs font-semibold text-green-500 whitespace-nowrap">
                      {formatDiscountLabel(
                        ps.discountPercent,
                        ps.monthlyLimit,
                        svcUsage?.used,
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Employees */}
        {plan.planEmployees.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Users className="size-3 text-muted-foreground" />
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Profissionais
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {plan.planEmployees.map((pe) => (
                <span
                  key={pe.id}
                  className="inline-flex items-center rounded-full border border-border-subtle bg-surface-base px-2.5 py-0.5 text-xs text-foreground"
                >
                  {pe.employee.appName || pe.employee.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Products */}
        {plan.planProducts.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Package className="size-3 text-muted-foreground" />
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Produtos
              </p>
            </div>
            <div className="space-y-1">
              {plan.planProducts.map((pp) => (
                <div
                  key={pp.id}
                  className="flex items-center justify-between gap-2 rounded-md border border-border-subtle bg-surface-base px-3 py-1.5"
                >
                  <span className="text-xs text-foreground truncate flex-1">
                    {pp.product.name}
                  </span>
                  <span className="text-xs font-semibold text-brand whitespace-nowrap">
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
              disabled={subscribing}
              className="w-full h-10 rounded-lg text-sm font-bold transition-opacity hover:opacity-90 text-white disabled:opacity-60"
              style={{ backgroundColor: accentColor }}
            >
              {subscribing
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
  const { mySubscription, subscribe, cancel, refresh } = useClientSubscription(barbershop?.id);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscribingId, setSubscribingId] = useState<string | null>(null);
  const [switchTarget, setSwitchTarget] = useState<Plan | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Plan | null>(null);

  // Fluxo de escolha de método de pagamento (cartão de crédito x Pix Automático).
  const [checkoutPlan, setCheckoutPlan] = useState<Plan | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<SubscriptionPaymentMethod>("CREDIT_CARD");
  const [pixResult, setPixResult] = useState<SubscribePixAuthorizationResult | null>(null);

  const activePlanId = mySubscription?.subscription.planId ?? null;

  function openPaymentDialog(plan: Plan) {
    setCheckoutPlan(plan);
    setSelectedMethod("CREDIT_CARD");
    setPixResult(null);
  }

  function closePaymentDialog() {
    setCheckoutPlan(null);
    setPixResult(null);
  }

  async function handleConfirmCheckout() {
    if (!checkoutPlan) return;
    setSubscribingId(checkoutPlan.id);
    const result = await subscribe(checkoutPlan.id, selectedMethod);
    setSubscribingId(null);
    if (result && typeof result === "object") {
      // Pix Automático: mantém o diálogo aberto para exibir o QR/link e
      // iniciar o polling de status (ver useEffect abaixo).
      setPixResult(result);
    }
    // CREDIT_CARD com sucesso já redireciona (window.location.href) dentro do
    // hook; se `result === false`, o erro já foi mostrado via toast e o
    // diálogo permanece aberto para o cliente tentar de novo.
  }

  // Polling do status da autorização Pix Automático — a cada 4s revalida
  // `GET /subscriptions/me` até o webhook confirmar `AUTHORIZED` (ver
  // WebhooksService no backend). Também revalida ao focar a aba de novo,
  // para o caso comum de o cliente voltar do app do banco.
  useEffect(() => {
    if (!pixResult) return;

    const isAuthorized =
      mySubscription?.subscription.id === pixResult.subscription.id &&
      mySubscription.subscription.paymentAuthorization?.status === "AUTHORIZED";

    if (isAuthorized) {
      toast.success("Pix Automático autorizado! Sua assinatura já está ativa.");
      closePaymentDialog();
      return;
    }

    const interval = setInterval(() => {
      void refresh();
    }, 4000);
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pixResult, mySubscription]);

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
                usage={isCurrentPlan ? mySubscription?.usage : undefined}
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

      <ConfirmDialog
        open={cancelTarget !== null}
        onOpenChange={(v) => !v && setCancelTarget(null)}
        title="Cancelar assinatura"
        description={`Tem certeza que deseja cancelar a assinatura do plano "${cancelTarget?.name}"?`}
        confirmLabel="Cancelar assinatura"
        tone="danger"
        onConfirm={() => void cancel()}
      />

      <Dialog
        open={checkoutPlan !== null}
        onOpenChange={(v) => !v && closePaymentDialog()}
      >
        <DialogContent className="bg-surface-raised border border-border text-foreground sm:max-w-md">
          {!pixResult ? (
            <>
              <DialogHeader>
                <DialogTitle>Como você quer pagar?</DialogTitle>
                <DialogDescription>
                  Escolha a forma de pagamento para assinar &quot;{checkoutPlan?.name}&quot;.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setSelectedMethod("CREDIT_CARD")}
                  className={`w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                    selectedMethod === "CREDIT_CARD"
                      ? "border-brand bg-brand/5"
                      : "border-border-subtle hover:bg-surface-base"
                  }`}
                >
                  <CreditCard className="size-5 shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">Cartão de crédito</p>
                    <p className="text-xs text-muted-foreground">
                      Cobrança recorrente automática todo mês.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod("PIX_AUTOMATICO")}
                  className={`w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                    selectedMethod === "PIX_AUTOMATICO"
                      ? "border-brand bg-brand/5"
                      : "border-border-subtle hover:bg-surface-base"
                  }`}
                >
                  <QrCode className="size-5 shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">Pix Automático</p>
                    <p className="text-xs text-muted-foreground">
                      Autorize uma vez e suas mensalidades serão pagas automaticamente pela sua
                      conta.
                    </p>
                  </div>
                </button>
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
          ) : (
            <PixAuthorizationStep result={pixResult} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * Etapa de autorização do Pix Automático: exibe o link/código retornado pelo
 * backend (`PaymentAuthorization.authorizationUrl`).
 *
 * ATENÇÃO — o formato exato desse valor não está confirmado (é um "melhor
 * esforço" do client ASAAS, ver `asaas.client.ts`): pode ser uma URL de
 * redirecionamento para o app do banco, ou o payload "Pix copia e cola" de um
 * QR Code. Por isso mostramos as duas opções (link clicável quando parece
 * uma URL, e o valor bruto copiável) em vez de tentar renderizar uma imagem
 * de QR Code — não há biblioteca de geração de QR Code instalada neste
 * projeto (`qrcode.react`/`react-qr-code`), e desenhar uma a partir de um
 * valor de formato incerto arriscaria mostrar um código inválido. Revalidar
 * contra sandbox real e, se for de fato um payload de Pix, considerar
 * instalar `qrcode.react` para renderizar a imagem escaneável.
 */
function PixAuthorizationStep({ result }: { result: SubscribePixAuthorizationResult }) {
  const authorizationUrl = result.paymentAuthorization.authorizationUrl ?? "";
  const looksLikeUrl = /^https?:\/\//i.test(authorizationUrl);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(authorizationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar. Copie manualmente o código abaixo.");
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Pix Automático</DialogTitle>
        <DialogDescription>
          Pix Automático — autorize uma vez e suas mensalidades serão pagas automaticamente pela
          sua conta.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3">
        {looksLikeUrl && (
          <a
            href={authorizationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors"
          >
            <ExternalLink className="size-4" />
            Abrir no app do banco
          </a>
        )}

        <div className="rounded-lg border border-border-subtle bg-surface-base p-3 space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {looksLikeUrl ? "Ou copie o link" : "Código de autorização"}
          </p>
          <p className="text-xs text-foreground break-all font-mono">{authorizationUrl}</p>
          <button
            type="button"
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-1.5 h-8 rounded-md text-xs font-semibold border border-border-subtle hover:bg-surface-raised transition-colors"
          >
            <Copy className="size-3.5" />
            {copied ? "Copiado!" : "Copiar código"}
          </button>
        </div>

        <div className="flex items-center gap-2 justify-center py-2 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          <p className="text-xs">Aguardando autorização no app do banco…</p>
        </div>
      </div>
    </>
  );
}
