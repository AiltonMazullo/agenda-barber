"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/shared";
import { FinancialEntriesList } from "@/components/financial/FinancialEntriesList";
import { useAuth } from "@/hooks/useAuth";

export default function ContasAPagarPage() {
  const { barbershop } = useAuth();

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
      <FinancialEntriesList
        barbershopId={barbershop?.id}
        type="PAYABLE"
        newHref="/financial/despesas/nova"
      />
    </div>
  );
}
