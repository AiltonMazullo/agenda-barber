"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { SelectField } from "@/components/shared";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type {
  BankAccount,
  BankAccountStatus,
  BankAccountType,
  CreateBankAccountPayload,
} from "@/types/bank-account.types";

const ACCOUNT_TYPE_OPTIONS: { value: BankAccountType; label: string }[] = [
  { value: "CORRENTE", label: "Conta corrente" },
  { value: "POUPANCA", label: "Poupança" },
  { value: "OUTRO", label: "Outro" },
];

const STATUS_OPTIONS: { value: BankAccountStatus; label: string }[] = [
  { value: "ACTIVE", label: "Ativo" },
  { value: "INACTIVE", label: "Inativo" },
];

export type BankAccountFormMode = "create" | "edit" | "view";

interface FormState {
  name: string;
  holderName: string;
  holderDocument: string;
  accountType: BankAccountType;
  bankCode: string;
  bankName: string;
  agency: string;
  accountNumber: string;
  status: BankAccountStatus;
}

const EMPTY_STATE: FormState = {
  name: "",
  holderName: "",
  holderDocument: "",
  accountType: "CORRENTE",
  bankCode: "",
  bankName: "",
  agency: "",
  accountNumber: "",
  status: "ACTIVE",
};

export function BankAccountForm({
  mode,
  account,
  saving,
  onSubmit,
}: {
  mode: BankAccountFormMode;
  account?: BankAccount | null;
  saving: boolean;
  onSubmit: (payload: CreateBankAccountPayload & { status?: BankAccountStatus }) => void;
}) {
  const readOnly = mode === "view";
  const [form, setForm] = useState<FormState>(EMPTY_STATE);

  useEffect(() => {
    if (account) {
      setForm({
        name: account.name,
        holderName: account.holderName,
        holderDocument: account.holderDocument,
        accountType: account.accountType,
        bankCode: account.bankCode,
        bankName: account.bankName,
        agency: account.agency,
        accountNumber: account.accountNumber,
        status: account.status,
      });
    }
  }, [account]);

  const valid =
    form.name &&
    form.holderName &&
    form.holderDocument &&
    form.bankCode &&
    form.bankName &&
    form.agency &&
    form.accountNumber;

  return (
    <div className="rounded-xl border border-border bg-surface-raised p-5 space-y-4">
      <Field>
        <FieldLabel className="text-[10px] font-bold uppercase tracking-widest text-brand">
          Nome da conta *
        </FieldLabel>
        <Input
          value={form.name}
          disabled={readOnly}
          onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
          className="bg-surface-base border-border text-foreground"
        />
      </Field>

      <div className="flex flex-col sm:flex-row gap-3">
        <Field className="flex-1">
          <FieldLabel className="text-[10px] font-bold uppercase tracking-widest text-brand">
            Nome do titular *
          </FieldLabel>
          <Input
            value={form.holderName}
            disabled={readOnly}
            onChange={(e) => setForm((s) => ({ ...s, holderName: e.target.value }))}
            className="bg-surface-base border-border text-foreground"
          />
        </Field>
        <Field className="flex-1">
          <FieldLabel className="text-[10px] font-bold uppercase tracking-widest text-brand">
            CPF/CNPJ do titular *
          </FieldLabel>
          <Input
            value={form.holderDocument}
            disabled={readOnly}
            onChange={(e) => setForm((s) => ({ ...s, holderDocument: e.target.value }))}
            className="bg-surface-base border-border text-foreground"
          />
        </Field>
        <SelectField
          id="accountType"
          label="Tipo da conta *"
          value={form.accountType}
          onChange={(v) => setForm((s) => ({ ...s, accountType: v as BankAccountType }))}
          options={ACCOUNT_TYPE_OPTIONS}
          disabled={readOnly}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Field className="flex-1">
          <FieldLabel className="text-[10px] font-bold uppercase tracking-widest text-brand">
            Banco *
          </FieldLabel>
          <Input
            value={form.bankName}
            disabled={readOnly}
            onChange={(e) => setForm((s) => ({ ...s, bankName: e.target.value }))}
            placeholder="ex.: ITAÚ"
            className="bg-surface-base border-border text-foreground"
          />
        </Field>
        <Field className="w-32">
          <FieldLabel className="text-[10px] font-bold uppercase tracking-widest text-brand">
            Código *
          </FieldLabel>
          <Input
            value={form.bankCode}
            disabled={readOnly}
            onChange={(e) => setForm((s) => ({ ...s, bankCode: e.target.value }))}
            placeholder="341"
            className="bg-surface-base border-border text-foreground"
          />
        </Field>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Field className="flex-1">
          <FieldLabel className="text-[10px] font-bold uppercase tracking-widest text-brand">
            Agência *
          </FieldLabel>
          <Input
            value={form.agency}
            disabled={readOnly}
            onChange={(e) => setForm((s) => ({ ...s, agency: e.target.value }))}
            className="bg-surface-base border-border text-foreground"
          />
        </Field>
        <Field className="flex-1">
          <FieldLabel className="text-[10px] font-bold uppercase tracking-widest text-brand">
            Número da conta *
          </FieldLabel>
          <Input
            value={form.accountNumber}
            disabled={readOnly}
            onChange={(e) => setForm((s) => ({ ...s, accountNumber: e.target.value }))}
            className="bg-surface-base border-border text-foreground"
          />
        </Field>
        {mode !== "create" && (
          <SelectField
            id="status"
            label="Status *"
            value={form.status}
            onChange={(v) => setForm((s) => ({ ...s, status: v as BankAccountStatus }))}
            options={STATUS_OPTIONS}
            disabled={readOnly}
          />
        )}
      </div>

      {!readOnly && (
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => onSubmit(form)}
            disabled={!valid || saving}
            className="h-10 px-5 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save className="size-3.5" />
            {mode === "edit" ? "Salvar" : "Enviar"}
          </button>
        </div>
      )}
    </div>
  );
}
