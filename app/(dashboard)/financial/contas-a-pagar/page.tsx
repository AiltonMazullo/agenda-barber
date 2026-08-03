"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/shared";
import { FinancialEntriesList } from "@/components/financial/FinancialEntriesList";
import { FinancialFilters, type FinancialFiltersValue } from "@/components/financial/FinancialFilters";
import { useAuth } from "@/hooks/useAuth";

export default function ContasAPagarPage() {
  const { barbershop } = useAuth();
  const [filters, setFilters] = useState<FinancialFiltersValue>({ categoryIds: [] });

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
