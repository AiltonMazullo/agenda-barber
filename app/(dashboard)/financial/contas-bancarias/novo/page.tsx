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
import type { BankAccountType } from "@/types/bank-account.types";

const ACCOUNT_TYPE_OPTIONS: { value: BankAccountType; label: string }[] = [
  { value: "CORRENTE", label: "Conta corrente" },
  { value: "POUPANCA", label: "Poupança" },
  { value: "OUTRO", label: "Outro" },
];

export default function NovaContaBancariaPage() {
  const router = useRouter();
  const { barbershop } = useAuth();
  const { create } = useBankAccounts(barbershop?.id);

  const [name, setName] = useState("");
  const [holderName, setHolderName] = useState("");
  const [holderDocument, setHolderDocument] = useState("");
  const [accountType, setAccountType] = useState<BankAccountType>("CORRENTE");
  const [bankCode, setBankCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [agency, setAgency] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [saving, setSaving] = useState(false);

  const valid =
    name && holderName && holderDocument && bankCode && bankName && agency && accountNumber;

  async function handleSubmit() {
    if (!valid) return;
    setSaving(true);
    const created = await create({
      name,
      holderName,
      holderDocument,
      accountType,
      bankCode,
      bankName,
      agency,
      accountNumber,
    });
    setSaving(false);
    if (created) router.push("/financial/contas-bancarias");
  }

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Nova conta bancária"
        subtitle="Cadastro de uma conta com titular, documento, banco, agência, número e tipo"
        actions={
          <Link
            href="/financial/contas-bancarias"
            className="h-9 px-4 rounded-md border border-border bg-surface-raised text-sm text-foreground hover:bg-surface-elevated transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="size-3.5" />
            Voltar
          </Link>
        }
      />

      <div className="rounded-xl border border-border bg-surface-raised p-5 space-y-4">
        <Field>
          <FieldLabel className="text-[10px] font-bold uppercase tracking-widest text-brand">
            Nome da conta *
          </FieldLabel>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-surface-base border-border text-foreground" />
        </Field>

        <div className="flex flex-col sm:flex-row gap-3">
          <Field className="flex-1">
            <FieldLabel className="text-[10px] font-bold uppercase tracking-widest text-brand">
              Nome do titular *
            </FieldLabel>
            <Input value={holderName} onChange={(e) => setHolderName(e.target.value)} className="bg-surface-base border-border text-foreground" />
          </Field>
          <Field className="flex-1">
            <FieldLabel className="text-[10px] font-bold uppercase tracking-widest text-brand">
              CPF/CNPJ do titular *
            </FieldLabel>
            <Input value={holderDocument} onChange={(e) => setHolderDocument(e.target.value)} className="bg-surface-base border-border text-foreground" />
          </Field>
          <SelectField
            id="accountType"
            label="Tipo da conta *"
            value={accountType}
            onChange={setAccountType}
            options={ACCOUNT_TYPE_OPTIONS}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Field className="flex-1">
            <FieldLabel className="text-[10px] font-bold uppercase tracking-widest text-brand">
              Banco *
            </FieldLabel>
            <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="ex.: ITAÚ" className="bg-surface-base border-border text-foreground" />
          </Field>
          <Field className="w-32">
            <FieldLabel className="text-[10px] font-bold uppercase tracking-widest text-brand">
              Código *
            </FieldLabel>
            <Input value={bankCode} onChange={(e) => setBankCode(e.target.value)} placeholder="341" className="bg-surface-base border-border text-foreground" />
          </Field>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Field className="flex-1">
            <FieldLabel className="text-[10px] font-bold uppercase tracking-widest text-brand">
              Agência *
            </FieldLabel>
            <Input value={agency} onChange={(e) => setAgency(e.target.value)} className="bg-surface-base border-border text-foreground" />
          </Field>
          <Field className="flex-1">
            <FieldLabel className="text-[10px] font-bold uppercase tracking-widest text-brand">
              Número da conta *
            </FieldLabel>
            <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="bg-surface-base border-border text-foreground" />
          </Field>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!valid || saving}
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
