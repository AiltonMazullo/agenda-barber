"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader, Loading } from "@/components/shared";
import { useAuth } from "@/hooks/useAuth";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import { PaymentMethodComandaForm } from "@/components/financial/PaymentMethodComandaForm";
import type { PaymentMethodConfig } from "@/types/payment-method.types";

export default function EditarFormaPagamentoComandaPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const isView = searchParams.get("mode") === "view";

  const { barbershop } = useAuth();
  const { methods, isLoading, update, updateBranchConfigs } = usePaymentMethods(barbershop?.id);
  const [saving, setSaving] = useState(false);
  const [method, setMethod] = useState<PaymentMethodConfig | null>(null);

  useEffect(() => {
    const found = methods.find((m) => m.id === params.id);
    if (found) setMethod(found);
  }, [methods, params.id]);

  async function handleSubmit(values: Parameters<
    Parameters<typeof PaymentMethodComandaForm>[0]["onSubmit"]
  >[0]) {
    setSaving(true);
    const updated = await update(params.id, {
      name: values.name,
      timing: values.timing,
      status: values.status,
    });
    if (updated) {
      await updateBranchConfigs(params.id, values.branchConfigs);
      router.push("/financial/formas-pagamento-comanda");
    }
    setSaving(false);
  }

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title={isView ? "Visualizar forma de pagamento" : "Editar forma de pagamento"}
        subtitle={method?.name}
        actions={
          <Link
            href="/financial/formas-pagamento-comanda"
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
        <PaymentMethodComandaForm
          mode={isView ? "view" : "edit"}
          method={method}
          saving={saving}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
