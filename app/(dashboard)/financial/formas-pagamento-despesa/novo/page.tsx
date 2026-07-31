"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { PageHeader, SelectField } from "@/components/shared";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useBankAccounts } from "@/hooks/useBankAccounts";
import { useExpensePaymentMethods } from "@/hooks/useExpensePaymentMethods";

export default function NovaFormaPagamentoDespesaPage() {
  const router = useRouter();
  const { barbershop } = useAuth();
  const { accounts } = useBankAccounts(barbershop?.id);
  const { create } = useExpensePaymentMethods(barbershop?.id);

  const [name, setName] = useState("");
  const [bankAccountId, setBankAccountId] = useState("");
  const [autoMarkAsPaid, setAutoMarkAsPaid] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!name) return;
    setSaving(true);
    const created = await create({
      name,
      autoMarkAsPaid,
      bankAccountId: bankAccountId || undefined,
    });
    setSaving(false);
    if (created) router.push("/financial/formas-pagamento-despesa");
  }

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Nova forma de pagamento de despesa"
        subtitle="Cadastro simples com nome e opção de marcar como pago automaticamente"
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

      <div className="rounded-xl border border-border bg-surface-raised p-5 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Field className="flex-1">
            <FieldLabel className="text-[10px] font-bold uppercase tracking-widest text-brand">
              Nome *
            </FieldLabel>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-surface-base border-border text-foreground" />
          </Field>
          <SelectField
            id="bankAccount"
            label="Conta bancária"
            value={bankAccountId}
            onChange={setBankAccountId}
            placeholder="Nenhuma"
            options={accounts.map((a) => ({ value: a.id, label: a.name }))}
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={autoMarkAsPaid}
            onChange={(e) => setAutoMarkAsPaid(e.target.checked)}
          />
          Marcar como pago automaticamente
        </label>

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
