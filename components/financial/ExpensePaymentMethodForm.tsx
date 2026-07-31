"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { SelectField } from "@/components/shared";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useBankAccounts } from "@/hooks/useBankAccounts";
import type {
  ExpensePaymentMethod,
  ExpensePaymentMethodStatus,
} from "@/types/expense-payment-method.types";

const STATUS_OPTIONS: { value: ExpensePaymentMethodStatus; label: string }[] = [
  { value: "ACTIVE", label: "Ativo" },
  { value: "INACTIVE", label: "Inativo" },
];

export type ExpensePaymentMethodFormMode = "create" | "edit" | "view";

export interface ExpensePaymentMethodFormValues {
  name: string;
  bankAccountId: string;
  autoMarkAsPaid: boolean;
  status: ExpensePaymentMethodStatus;
}

export function ExpensePaymentMethodForm({
  mode,
  method,
  saving,
  onSubmit,
}: {
  mode: ExpensePaymentMethodFormMode;
  method?: ExpensePaymentMethod | null;
  saving: boolean;
  onSubmit: (values: ExpensePaymentMethodFormValues) => void;
}) {
  const readOnly = mode === "view";
  const { barbershop } = useAuth();
  const { accounts } = useBankAccounts(barbershop?.id);

  const [name, setName] = useState("");
  const [bankAccountId, setBankAccountId] = useState("");
  const [autoMarkAsPaid, setAutoMarkAsPaid] = useState(false);
  const [status, setStatus] = useState<ExpensePaymentMethodStatus>("ACTIVE");

  useEffect(() => {
    if (method) {
      setName(method.name);
      setBankAccountId(method.bankAccountId ?? "");
      setAutoMarkAsPaid(method.autoMarkAsPaid);
      setStatus(method.status);
    }
  }, [method]);

  return (
    <div className="rounded-xl border border-border bg-surface-raised p-5 space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Field className="flex-1">
          <FieldLabel className="text-[10px] font-bold uppercase tracking-widest text-brand">
            Nome *
          </FieldLabel>
          <Input
            value={name}
            disabled={readOnly}
            onChange={(e) => setName(e.target.value)}
            className="bg-surface-base border-border text-foreground"
          />
        </Field>
        <SelectField
          id="bankAccount"
          label="Conta bancária"
          value={bankAccountId}
          onChange={setBankAccountId}
          placeholder="Nenhuma"
          options={accounts.map((a) => ({ value: a.id, label: a.name }))}
          disabled={readOnly}
        />
        {mode !== "create" && (
          <SelectField
            id="status"
            label="Status *"
            value={status}
            onChange={setStatus}
            options={STATUS_OPTIONS}
            disabled={readOnly}
          />
        )}
      </div>

      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          disabled={readOnly}
          checked={autoMarkAsPaid}
          onChange={(e) => setAutoMarkAsPaid(e.target.checked)}
        />
        Marcar como pago automaticamente
      </label>

      {!readOnly && (
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => onSubmit({ name, bankAccountId, autoMarkAsPaid, status })}
            disabled={!name || saving}
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
