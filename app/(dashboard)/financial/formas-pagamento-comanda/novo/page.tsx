"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { PageHeader, SelectField } from "@/components/shared";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useBranches } from "@/hooks/useBranches";
import { useBankAccounts } from "@/hooks/useBankAccounts";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import type { PaymentMethodTiming } from "@/types/payment-method.types";

const TIMING_OPTIONS: { value: PaymentMethodTiming; label: string }[] = [
  { value: "AVISTA", label: "À vista" },
  { value: "APRAZO", label: "A prazo" },
];

export default function NovaFormaPagamentoComandaPage() {
  const router = useRouter();
  const { barbershop } = useAuth();
  const { branches } = useBranches(barbershop?.id);
  const { accounts } = useBankAccounts(barbershop?.id);
  const { create, updateBranchConfigs } = usePaymentMethods(barbershop?.id);

  const [name, setName] = useState("");
  const [timing, setTiming] = useState<PaymentMethodTiming>("AVISTA");
  const [branchConfigs, setBranchConfigs] = useState<
    Record<string, { bankAccountId: string; feePercent: string; autoMarkAsReceived: boolean }>
  >({});
  const [saving, setSaving] = useState(false);

  function updateBranchConfig(
    branchId: string,
    patch: Partial<{ bankAccountId: string; feePercent: string; autoMarkAsReceived: boolean }>,
  ) {
    setBranchConfigs((prev) => ({
      ...prev,
      [branchId]: {
        bankAccountId: prev[branchId]?.bankAccountId ?? "",
        feePercent: prev[branchId]?.feePercent ?? "0",
        autoMarkAsReceived: prev[branchId]?.autoMarkAsReceived ?? false,
        ...patch,
      },
    }));
  }

  async function handleSubmit() {
    if (!name) return;
    setSaving(true);
    const created = await create({ name, timing });
    if (created) {
      const configs = branches.map((b) => ({
        branchId: b.id,
        bankAccountId: branchConfigs[b.id]?.bankAccountId || null,
        feePercent: Number(branchConfigs[b.id]?.feePercent ?? 0) || 0,
        autoMarkAsReceived: branchConfigs[b.id]?.autoMarkAsReceived ?? false,
      }));
      await updateBranchConfigs(created.id, configs);
      router.push("/financial/formas-pagamento-comanda");
    }
    setSaving(false);
  }

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground max-w-2xl">
      <PageHeader
        title="Nova forma de pagamento de comanda"
        subtitle="Cadastro de forma de pagamento com configuração por filial"
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

      <div className="rounded-xl border border-border bg-surface-raised p-5 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Field className="flex-1">
            <FieldLabel className="text-[10px] font-bold uppercase tracking-widest text-brand">
              Nome *
            </FieldLabel>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-surface-base border-border text-foreground" />
          </Field>
          <SelectField id="timing" label="Tipo *" value={timing} onChange={setTiming} options={TIMING_OPTIONS} />
        </div>

        {branches.length > 0 && (
          <div className="space-y-3 pt-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Filiais — adicione as configurações da forma de pagamento às filiais
            </p>
            {branches.map((b) => (
              <div key={b.id} className="rounded-md border border-border p-3 space-y-2">
                <p className="text-sm font-semibold text-foreground">{b.name}</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <SelectField
                    id={`bank-${b.id}`}
                    label="Conta bancária"
                    value={branchConfigs[b.id]?.bankAccountId ?? ""}
                    onChange={(v) => updateBranchConfig(b.id, { bankAccountId: v })}
                    placeholder="Nenhuma"
                    options={accounts.map((a) => ({ value: a.id, label: a.name }))}
                  />
                  <Field className="w-28">
                    <FieldLabel className="text-[10px] font-bold uppercase tracking-widest text-brand">
                      Taxa (%)
                    </FieldLabel>
                    <Input
                      value={branchConfigs[b.id]?.feePercent ?? "0"}
                      onChange={(e) => updateBranchConfig(b.id, { feePercent: e.target.value })}
                      className="bg-surface-base border-border text-foreground"
                    />
                  </Field>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground h-10">
                    <input
                      type="checkbox"
                      checked={branchConfigs[b.id]?.autoMarkAsReceived ?? false}
                      onChange={(e) =>
                        updateBranchConfig(b.id, { autoMarkAsReceived: e.target.checked })
                      }
                    />
                    Marcar como recebido automaticamente
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!name || saving}
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
