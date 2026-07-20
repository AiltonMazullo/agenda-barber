"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/shared";
import { FinancialEntryForm } from "@/components/financial/FinancialEntryForm";

export default function AdicionarReceitaPage() {
  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground max-w-2xl">
      <PageHeader
        title="Adicionar receita"
        subtitle="Formulário de lançamento manual de receita com categoria, forma de pagamento, conta e vencimento"
        actions={
          <Link
            href="/financial/contas-a-receber"
            className="h-9 px-4 rounded-md border border-border bg-surface-raised text-sm text-foreground hover:bg-surface-elevated transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="size-3.5" />
            Voltar
          </Link>
        }
      />
      <FinancialEntryForm type="RECEIVABLE" redirectTo="/financial/contas-a-receber" />
    </div>
  );
}
