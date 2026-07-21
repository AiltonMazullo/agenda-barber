"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { DatePickerField, SelectField } from "@/components/shared";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useBranches } from "@/hooks/useBranches";
import { useFinancialCategories } from "@/hooks/useFinancialCategories";
import { useBankAccounts } from "@/hooks/useBankAccounts";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import { useExpensePaymentMethods } from "@/hooks/useExpensePaymentMethods";
import { useFinancialEntries } from "@/hooks/useFinancialEntries";
import { maskBRLInput, parseBRL } from "@/utils/format";
import type { FinancialEntryType } from "@/types/financial-entry.types";

const PAYMENT_CONDITION_OPTIONS = [
  { value: "AVISTA", label: "À vista" },
  { value: "PARCELADO", label: "Parcelado" },
] as const;

export function FinancialEntryForm({
  type,
  redirectTo,
}: {
  type: FinancialEntryType;
  redirectTo: string;
}) {
  const router = useRouter();
  const { barbershop } = useAuth();
  const { branches } = useBranches(barbershop?.id);
  const { categories } = useFinancialCategories(barbershop?.id, type);
  const { accounts } = useBankAccounts(barbershop?.id);
  const { methods: paymentMethods } = usePaymentMethods(barbershop?.id);
  const { methods: expenseMethods } = useExpensePaymentMethods(barbershop?.id);
  const { create } = useFinancialEntries(barbershop?.id);

  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [parentCategoryId, setParentCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [interestPercent, setInterestPercent] = useState("");
  const [observations, setObservations] = useState("");
  const [repeatEntry, setRepeatEntry] = useState(false);
  const [paymentCondition, setPaymentCondition] = useState<"AVISTA" | "PARCELADO">("AVISTA");
  const [installmentsTotal, setInstallmentsTotal] = useState("2");
  const [recurrenceDay, setRecurrenceDay] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [expensePaymentMethodId, setExpensePaymentMethodId] = useState("");
  const [bankAccountId, setBankAccountId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(new Date());
  const [saving, setSaving] = useState(false);

  // Categoria-pai = sem parentCategoryId; subcategoria = filha da categoria
  // escolhida acima (§4.1). O lançamento é salvo com a subcategoria quando
  // houver uma selecionada, senão com a categoria-pai.
  const parentCategories = categories.filter((c) => !c.parentCategoryId);
  const subCategories = categories.filter((c) => c.parentCategoryId === parentCategoryId);
  const effectiveCategoryId = subCategoryId || parentCategoryId;

  function handleParentCategoryChange(nextId: string) {
    setParentCategoryId(nextId);
    setSubCategoryId("");
  }

  const valid = description && value && dueDate;

  async function handleSubmit() {
    if (!valid || !dueDate) return;
    setSaving(true);
    const created = await create({
      type,
      description,
      valueInCents: Math.round(parseBRL(value) * 100),
      categoryId: effectiveCategoryId || undefined,
      discountPercent: discountPercent ? Number(discountPercent) : undefined,
      interestPercent: interestPercent ? Number(interestPercent) : undefined,
      observations: observations || undefined,
      paymentCondition: repeatEntry ? "RECORRENTE" : paymentCondition,
      installmentsTotal: paymentCondition === "PARCELADO" ? Number(installmentsTotal) : undefined,
      isRecurring: repeatEntry,
      recurrenceDay: repeatEntry && recurrenceDay ? Number(recurrenceDay) : undefined,
      paymentMethodId: type === "RECEIVABLE" ? paymentMethodId || undefined : undefined,
      expensePaymentMethodId: type === "PAYABLE" ? expensePaymentMethodId || undefined : undefined,
      bankAccountId: bankAccountId || undefined,
      branchId: branchId || undefined,
      dueDate: dueDate.toISOString(),
    });
    setSaving(false);
    if (created) router.push(redirectTo);
  }

  return (
    <div className="rounded-xl border border-border bg-surface-raised p-5 space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Field className="flex-1">
          <FieldLabel className="text-[10px] font-bold uppercase tracking-widest text-brand">
            Descrição *
          </FieldLabel>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-surface-base border-border text-foreground"
          />
        </Field>
        <Field className="w-40">
          <FieldLabel className="text-[10px] font-bold uppercase tracking-widest text-brand">
            Valor *
          </FieldLabel>
          <Input
            value={value}
            onChange={(e) => setValue(maskBRLInput(e.target.value))}
            placeholder="R$ 0,00"
            className="bg-surface-base border-border text-foreground"
          />
        </Field>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <SelectField
          id="category"
          label="Categoria"
          value={parentCategoryId}
          onChange={handleParentCategoryChange}
          placeholder="Selecione"
          options={parentCategories.map((c) => ({ value: c.id, label: c.name }))}
        />
        {subCategories.length > 0 && (
          <SelectField
            id="subCategory"
            label="Subcategoria"
            value={subCategoryId}
            onChange={setSubCategoryId}
            placeholder="Nenhuma"
            options={subCategories.map((c) => ({ value: c.id, label: c.name }))}
          />
        )}
        <SelectField
          id="branch"
          label="Filial"
          value={branchId}
          onChange={setBranchId}
          placeholder="Selecione"
          options={branches.map((b) => ({ value: b.id, label: b.name }))}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Field className="w-32">
          <FieldLabel className="text-[10px] font-bold uppercase tracking-widest text-brand">
            Desconto (%)
          </FieldLabel>
          <Input
            value={discountPercent}
            onChange={(e) => setDiscountPercent(e.target.value)}
            className="bg-surface-base border-border text-foreground"
          />
        </Field>
        <Field className="w-32">
          <FieldLabel className="text-[10px] font-bold uppercase tracking-widest text-brand">
            Juros (%)
          </FieldLabel>
          <Input
            value={interestPercent}
            onChange={(e) => setInterestPercent(e.target.value)}
            className="bg-surface-base border-border text-foreground"
          />
        </Field>
      </div>

      <Field>
        <FieldLabel className="text-[10px] font-bold uppercase tracking-widest text-brand">
          Observações
        </FieldLabel>
        <Input
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          className="bg-surface-base border-border text-foreground"
        />
      </Field>

      <div className="pt-2 space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Condição de pagamento
        </p>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={repeatEntry}
            onChange={(e) => setRepeatEntry(e.target.checked)}
          />
          Repetir lançamento?
        </label>

        <div className="flex flex-col sm:flex-row gap-3">
          {!repeatEntry && (
            <SelectField
              id="paymentCondition"
              label="Condição de pagamento *"
              value={paymentCondition}
              onChange={setPaymentCondition}
              options={PAYMENT_CONDITION_OPTIONS}
            />
          )}
          {!repeatEntry && paymentCondition === "PARCELADO" && (
            <Field className="w-32">
              <FieldLabel className="text-[10px] font-bold uppercase tracking-widest text-brand">
                Parcelas
              </FieldLabel>
              <Input
                type="number"
                min={2}
                value={installmentsTotal}
                onChange={(e) => setInstallmentsTotal(e.target.value)}
                className="bg-surface-base border-border text-foreground"
              />
            </Field>
          )}
          {repeatEntry && (
            <Field className="w-40">
              <FieldLabel className="text-[10px] font-bold uppercase tracking-widest text-brand">
                Dia de vencimento
              </FieldLabel>
              <Input
                value={recurrenceDay}
                onChange={(e) => setRecurrenceDay(e.target.value.replace(/\D/g, ""))}
                placeholder="1-28"
                className="bg-surface-base border-border text-foreground"
              />
            </Field>
          )}
          {type === "RECEIVABLE" ? (
            <SelectField
              id="paymentMethod"
              label="Forma de pagamento *"
              value={paymentMethodId}
              onChange={setPaymentMethodId}
              placeholder="Selecione"
              options={paymentMethods.map((m) => ({ value: m.id, label: m.name }))}
            />
          ) : (
            <SelectField
              id="expensePaymentMethod"
              label="Forma de pagamento *"
              value={expensePaymentMethodId}
              onChange={setExpensePaymentMethodId}
              placeholder="Selecione"
              options={expenseMethods.map((m) => ({ value: m.id, label: m.name }))}
            />
          )}
          <SelectField
            id="bankAccount"
            label="Conta bancária"
            value={bankAccountId}
            onChange={setBankAccountId}
            placeholder="Nenhuma"
            options={accounts.map((a) => ({ value: a.id, label: a.name }))}
          />
          <DatePickerField id="dueDate" label="Data de vencimento *" date={dueDate} onChange={setDueDate} />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
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
  );
}
