"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader, Loading } from "@/components/shared";
import { useAuth } from "@/hooks/useAuth";
import { useExpensePaymentMethods } from "@/hooks/useExpensePaymentMethods";
import { ExpensePaymentMethodForm } from "@/components/financial/ExpensePaymentMethodForm";
import type { ExpensePaymentMethod } from "@/types/expense-payment-method.types";

export default function EditarFormaPagamentoDespesaPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const isView = searchParams.get("mode") === "view";

  const { barbershop } = useAuth();
  const { methods, isLoading, update } = useExpensePaymentMethods(barbershop?.id);
  const [saving, setSaving] = useState(false);
  const [method, setMethod] = useState<ExpensePaymentMethod | null>(null);

  useEffect(() => {
    const found = methods.find((m) => m.id === params.id);
    if (found) setMethod(found);
  }, [methods, params.id]);

  async function handleSubmit(values: {
    name: string;
    bankAccountId: string;
    autoMarkAsPaid: boolean;
    status: "ACTIVE" | "INACTIVE";
  }) {
    setSaving(true);
    const updated = await update(params.id, {
      name: values.name,
      bankAccountId: values.bankAccountId || null,
      autoMarkAsPaid: values.autoMarkAsPaid,
      status: values.status,
    });
    setSaving(false);
    if (updated) router.push("/financial/formas-pagamento-despesa");
  }

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground max-w-xl">
      <PageHeader
        title={isView ? "Visualizar forma de pagamento" : "Editar forma de pagamento"}
        subtitle={method?.name}
        actions={
          <Link
            href="/financial/formas-pagamento-despesa"
            className="h-9 px-4 rounded-md border border-border bg-surface-raised text-sm text-foreground hover:bg-surface-elevated transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="size-3.5" />
            Voltar
          </Link>
        }
      />

      {isLoading && !method ? (
        <Loading />
      ) : (
        <ExpensePaymentMethodForm
          mode={isView ? "view" : "edit"}
          method={method}
          saving={saving}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
