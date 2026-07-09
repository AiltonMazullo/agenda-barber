"use client";

import { useEffect, useState } from "react";
import {
  Crown,
  Users,
  Scissors,
  Package,
  Calendar,
  Lock,
  Repeat2,
  AlertCircle,
} from "lucide-react";
import { Loading } from "@/components/shared/Loading";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { clientPlansService } from "@/services/client-plans.service";
import { usePublicBarbershop } from "@/contexts/PublicBarbershopContext";
import { useClientSubscription } from "@/hooks/useClientSubscription";
import { formatBRL } from "@/utils/format";
import type { Plan } from "@/types/plan.types";

const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

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

  const freeDayLabels =
    plan.freeDays.length > 0
      ? plan.freeDays.map((d) => DAY_NAMES[d] ?? String(d)).join(", ")
      : null;

  return (
    <div className="rounded-xl border border-border-subtle bg-surface-raised overflow-hidden flex flex-col">
      {/* Color bar */}
      <div className="h-1.5 w-full" style={{ backgroundColor: accentColor }} />

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

          {freeDayLabels && (
            <div className="col-span-2 rounded-lg bg-surface-base border border-border-subtle px-3 py-2 flex items-center gap-2">
              <Calendar className="size-3.5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground">Dias livres</p>
                <p className="text-xs font-semibold text-foreground">
                  {freeDayLabels}
                </p>
              </div>
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
              {plan.planServices.map((ps) => (
                <div
                  key={ps.id}
                  className="flex items-center justify-between gap-2 rounded-md border border-border-subtle bg-surface-base px-3 py-1.5"
                >
                  <span className="text-xs text-foreground truncate flex-1">
                    {ps.service.name}
                  </span>
                  <span className="text-xs font-semibold text-green-500 whitespace-nowrap">
                    {ps.discountPercent === 100
                      ? "Incluso"
                      : `${ps.discountPercent}% off`}
                  </span>
                </div>
              ))}
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
  const { barbershop } = usePublicBarbershop();
  const { mySubscription, subscribe, cancel } = useClientSubscription(barbershop?.id);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscribingId, setSubscribingId] = useState<string | null>(null);
  const [switchTarget, setSwitchTarget] = useState<Plan | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Plan | null>(null);

  const activePlanId = mySubscription?.subscription.planId ?? null;

  async function handleSubscribe(planId: string) {
    setSubscribingId(planId);
    await subscribe(planId);
    setSubscribingId(null);
  }

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
                onSubscribe={() =>
                  hasOtherActivePlan ? setSwitchTarget(plan) : handleSubscribe(plan.id)
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
          if (switchTarget) void handleSubscribe(switchTarget.id);
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
    </div>
  );
}
