"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/shared";
import { FinancialEntriesList } from "@/components/financial/FinancialEntriesList";
import { FinancialFilters, type FinancialFiltersValue } from "@/components/financial/FinancialFilters";
import { useAuth } from "@/hooks/useAuth";
import { useFinancialBalance } from "@/hooks/useFinancialBalance";
import { formatBRL } from "@/utils/format";

export default function ContasAPagarPage() {
  const { barbershop } = useAuth();
  const [filters, setFilters] = useState<FinancialFiltersValue>({ categoryIds: [] });
  const { balance, isLoading: isLoadingBalance } = useFinancialBalance(barbershop?.id, {
    branchId: filters.branchId,
    dueDateFrom: filters.dueDateFrom,
    dueDateTo: filters.dueDateTo,
    description: filters.search,
    categoryIds: filters.categoryIds,
  });

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Contas a pagar"
        subtitle="Despesas, vencimentos, pagamentos e filtros"
        actions={
          <Link
            href="/financial"
            className="h-9 px-4 rounded-md border border-border bg-surface-raised text-sm text-foreground hover:bg-surface-elevated transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="size-3.5" />
            Voltar
          </Link>
        }
      />

      <FinancialFilters type="PAYABLE" onFilter={setFilters} />

      <div className="grid grid-cols-2 gap-3 max-w-md">
        <div className="rounded-xl border border-border bg-surface-raised p-4">
          <p className="text-xs text-muted-foreground">Taxas</p>
          <p className="text-lg font-bold text-foreground">
            {isLoadingBalance ? "—" : formatBRL(balance.totalFeesInCents / 100)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface-raised p-4">
          <p className="text-xs text-muted-foreground">Total com taxas</p>
          <p className="text-lg font-bold text-brand">
            {isLoadingBalance
              ? "—"
              : formatBRL((balance.payable.total + balance.totalFeesInCents) / 100)}
          </p>
        </div>
      </div>

      <FinancialEntriesList
        barbershopId={barbershop?.id}
        type="PAYABLE"
        newHref="/financial/despesas/nova"
        branchId={filters.branchId}
        dueDateFrom={filters.dueDateFrom}
        dueDateTo={filters.dueDateTo}
        search={filters.search}
        categoryIds={filters.categoryIds}
      />
    </div>
  );
}
