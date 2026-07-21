"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader, SelectField, DatePickerField } from "@/components/shared";
import { FinancialEntriesList } from "@/components/financial/FinancialEntriesList";
import { useAuth } from "@/hooks/useAuth";
import { useBranches } from "@/hooks/useBranches";
import { useFinancialBalance } from "@/hooks/useFinancialBalance";
import { formatBRL } from "@/utils/format";

const QUICK_LINKS = [
  { href: "/financial/contas-a-pagar", label: "Contas a pagar" },
  { href: "/financial/contas-a-receber", label: "Contas a receber" },
  { href: "/financial/contas-bancarias", label: "Contas bancárias" },
  { href: "/financial/categorias", label: "Categorias financeiras" },
  { href: "/financial/formas-pagamento-comanda", label: "Formas de pagamento de comanda" },
  { href: "/financial/formas-pagamento-despesa", label: "Formas de pagamento de despesa" },
  { href: "/commissions", label: "Gerar comissões" },
] as const;

export default function FinanceiroPage() {
  const { barbershop } = useAuth();
  const { branches } = useBranches(barbershop?.id);
  const [branchId, setBranchId] = useState("");
  const [dueDateFrom, setDueDateFrom] = useState<Date | undefined>();
  const [dueDateTo, setDueDateTo] = useState<Date | undefined>();

  const { balance, isLoading } = useFinancialBalance(barbershop?.id, {
    branchId: branchId || undefined,
    dueDateFrom: dueDateFrom?.toISOString(),
    dueDateTo: dueDateTo?.toISOString(),
  });

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader title="Financeiro" subtitle="Balanço — contas a pagar, a receber e fluxo de caixa" />

      <div className="flex flex-wrap gap-2">
        {QUICK_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="h-8 px-3 rounded-md border border-border bg-surface-raised text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-brand/40 transition-colors flex items-center"
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <SelectField
          id="branch"
          label="Filial"
          value={branchId}
          onChange={setBranchId}
          placeholder="Todas"
          options={branches.map((b) => ({ value: b.id, label: b.name }))}
        />
        <DatePickerField id="from" label="Vencimento de" date={dueDateFrom} onChange={setDueDateFrom} />
        <DatePickerField id="to" label="Vencimento até" date={dueDateTo} onChange={setDueDateTo} />
      </div>

      <div className="space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Contas a pagar
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <BalanceCard label="Vencido" value={balance.payable.overdue} tone="danger" loading={isLoading} />
          <BalanceCard label="A vencer" value={balance.payable.upcoming} loading={isLoading} />
          <BalanceCard label="Pago" value={balance.payable.paid} tone="success" loading={isLoading} />
          <BalanceCard label="Total a pagar" value={balance.payable.total} loading={isLoading} />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Contas a receber
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <BalanceCard label="Não recebido" value={balance.receivable.notReceived} tone="danger" loading={isLoading} />
          <BalanceCard label="A receber" value={balance.receivable.upcoming} loading={isLoading} />
          <BalanceCard label="Recebido" value={balance.receivable.received} tone="success" loading={isLoading} />
          <BalanceCard label="Total a receber" value={balance.receivable.total} loading={isLoading} />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Balanço</p>
        <div className="grid grid-cols-2 gap-3 max-w-md">
          <BalanceCard label="Balanço" value={balance.balance} tone="brand" loading={isLoading} />
          <BalanceCard label="Balanço projetado" value={balance.projectedBalance} tone="brand" loading={isLoading} />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Movimentações do período
        </p>
        <FinancialEntriesList
          barbershopId={barbershop?.id}
          branchId={branchId || undefined}
          dueDateFrom={dueDateFrom?.toISOString()}
          dueDateTo={dueDateTo?.toISOString()}
          readOnly
          hideTotals
        />
      </div>
    </div>
  );
}

function BalanceCard({
  label,
  value,
  tone,
  loading,
}: {
  label: string;
  value: number;
  tone?: "danger" | "success" | "brand";
  loading: boolean;
}) {
  const toneClass =
    tone === "danger"
      ? "text-danger-foreground"
      : tone === "success"
        ? "text-success-foreground"
        : tone === "brand"
          ? "text-brand"
          : "text-foreground";
  return (
    <div className="rounded-xl border border-border bg-surface-raised p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-lg font-bold ${toneClass}`}>{loading ? "—" : formatBRL(value / 100)}</p>
    </div>
  );
}
