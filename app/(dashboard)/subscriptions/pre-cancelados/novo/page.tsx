"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { PageHeader, DatePickerField, SelectField, Loading } from "@/components/shared";
import { useAuth } from "@/hooks/useAuth";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { usePreCancelledClients } from "@/hooks/usePreCancelledClients";
import { CANCEL_REASON_OPTIONS, type CancelReasonCode } from "@/types/pre-cancelled-client.types";
import { computeScheduledCancelDate } from "@/utils/subscription-cancel";

function NovoPreCanceladoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { barbershop } = useAuth();
  const { activeSubscriptions } = useSubscriptions(barbershop?.id);
  const { create } = usePreCancelledClients(barbershop?.id);

  const [subscriptionId, setSubscriptionId] = useState("");
  const [cancelDate, setCancelDate] = useState<Date | undefined>(new Date());
  const [reason, setReason] = useState<CancelReasonCode | "">("");
  const [saving, setSaving] = useState(false);

  // Pré-seleciona a assinatura quando chega do botão "Cancelar assinatura"
  // da lista de assinantes (spec-revisao-cliente-4.md §5.2 — o botão de lá
  // agora aponta pra cá em vez de cancelar imediatamente) e sugere a data
  // fim como o próximo vencimento da assinatura (fim do ciclo já pago).
  useEffect(() => {
    const fromQuery = searchParams.get("subscriptionId");
    if (!fromQuery) return;
    setSubscriptionId(fromQuery);
    const sub = activeSubscriptions.find((s) => s.id === fromQuery);
    if (sub?.billingDay) {
      setCancelDate(computeScheduledCancelDate(sub.billingDay));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, activeSubscriptions.length]);

  async function handleSubmit() {
    if (!subscriptionId || !cancelDate || !reason) return;
    setSaving(true);
    const created = await create({
      subscriptionId,
      cancelDate: cancelDate.toISOString(),
      reason,
    });
    setSaving(false);
    if (created) router.push("/subscriptions/pre-cancelados");
  }

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Novo cliente pré-cancelado"
        subtitle="Agendar o cancelamento de uma assinatura ativa"
        actions={
          <Link
            href="/subscriptions/pre-cancelados"
            className="h-9 px-4 rounded-md border border-border bg-surface-raised text-sm text-foreground hover:bg-surface-elevated transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="size-3.5" />
            Voltar
          </Link>
        }
      />

      <div className="rounded-xl border border-border bg-surface-raised p-5 space-y-4">
        <SelectField
          id="subscription"
          label="Cliente *"
          value={subscriptionId}
          onChange={setSubscriptionId}
          placeholder="Selecione a assinatura ativa"
          options={activeSubscriptions.map((s) => ({
            value: s.id,
            label: `${s.client.name} — ${s.plan.name}`,
          }))}
        />

        <div className="flex flex-col sm:flex-row gap-3">
          <DatePickerField
            id="cancelDate"
            label="Data fim *"
            date={cancelDate}
            onChange={setCancelDate}
          />
          <SelectField
            id="reason"
            label="Motivo de cancelamento *"
            value={reason}
            onChange={(v) => setReason(v as CancelReasonCode)}
            placeholder="Selecione o motivo"
            options={CANCEL_REASON_OPTIONS}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!subscriptionId || !cancelDate || !reason || saving}
            className="h-10 px-5 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save className="size-3.5" />
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NovoPreCanceladoPage() {
  return (
    <Suspense fallback={<Loading />}>
      <NovoPreCanceladoContent />
    </Suspense>
  );
}
