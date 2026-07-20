"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader, Loading, EmptyState, StatusBadge, SelectField } from "@/components/shared";
import { useAuth } from "@/hooks/useAuth";
import { useSubscriptionContracts } from "@/hooks/useSubscriptionContracts";
import { formatBRL, formatDate } from "@/utils/format";

const BILLING_TYPE_OPTIONS = [
  { value: "TODOS", label: "Todos" },
  { value: "GATEWAY", label: "Cel Cash" },
  { value: "MANUAL", label: "Manual" },
] as const;

const STATUS_OPTIONS = [
  { value: "TODOS", label: "Todos" },
  { value: "REGULAR", label: "Regular" },
  { value: "ATRASADO", label: "Atrasado" },
] as const;

export default function ContratosAtivosPage() {
  const { barbershop } = useAuth();
  const [billingType, setBillingType] = useState<(typeof BILLING_TYPE_OPTIONS)[number]["value"]>(
    "TODOS",
  );
  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]["value"]>("TODOS");

  const { contracts, totals, isLoading } = useSubscriptionContracts(barbershop?.id, {
    billingType: billingType === "TODOS" ? undefined : billingType,
    status: status === "TODOS" ? undefined : status,
  });

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Contratos ativos"
        subtitle="Painel de receita recorrente em tempo real"
        actions={
          <Link
            href="/subscriptions"
            className="h-9 px-4 rounded-md border border-border bg-surface-raised text-sm text-foreground hover:bg-surface-elevated transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="size-3.5" />
            Voltar
          </Link>
        }
      />

      <div className="flex flex-wrap gap-3">
        <SelectField
          id="billingType"
          label="Tipo de cobrança"
          value={billingType}
          onChange={setBillingType}
          options={BILLING_TYPE_OPTIONS}
        />
        <SelectField
          id="status"
          label="Status"
          value={status}
          onChange={setStatus}
          options={STATUS_OPTIONS}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-surface-raised p-4">
          <p className="text-xs text-muted-foreground">Totalizado Cel Cash</p>
          <p className="text-lg font-bold text-foreground">{formatBRL(totals.gateway / 100)}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface-raised p-4">
          <p className="text-xs text-muted-foreground">Totalizado manual</p>
          <p className="text-lg font-bold text-foreground">{formatBRL(totals.manual / 100)}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface-raised p-4">
          <p className="text-xs text-muted-foreground">Totalizado geral</p>
          <p className="text-lg font-bold text-brand">{formatBRL(totals.total / 100)}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface-raised divide-y divide-border-subtle">
        {isLoading ? (
          <Loading />
        ) : contracts.length === 0 ? (
          <div className="py-6">
            <EmptyState message="Nenhum contrato encontrado." />
          </div>
        ) : (
          contracts.map((c) => (
            <div
              key={c.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-5 py-4"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{c.client.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {c.plan.name} · {c.billingType === "GATEWAY" ? "Cel Cash" : "Manual"} ·{" "}
                  {formatBRL((c.priceOverrideInCents ?? c.plan.priceInCents) / 100)}
                  {c.charges[0] && ` · vencimento ${formatDate(c.charges[0].dueDate)}`}
                </p>
              </div>
              <StatusBadge tone={c.contractStatus === "REGULAR" ? "success" : "danger"}>
                {c.contractStatus === "REGULAR" ? "Regular" : "Atrasado"}
              </StatusBadge>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
