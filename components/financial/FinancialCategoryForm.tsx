"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { SelectField } from "@/components/shared";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type {
  FinancialCategory,
  FinancialCategoryStatus,
  FinancialCategoryType,
} from "@/types/financial-category.types";

const TYPE_OPTIONS: { value: FinancialCategoryType; label: string }[] = [
  { value: "PAYABLE", label: "Contas a pagar" },
  { value: "RECEIVABLE", label: "Contas a receber" },
];

const STATUS_OPTIONS: { value: FinancialCategoryStatus; label: string }[] = [
  { value: "ACTIVE", label: "Ativo" },
  { value: "INACTIVE", label: "Inativo" },
];

export type FinancialCategoryFormMode = "create" | "edit" | "view";

export interface FinancialCategoryFormValues {
  name: string;
  type: FinancialCategoryType;
  parentCategoryId: string;
  status: FinancialCategoryStatus;
}

export function FinancialCategoryForm({
  mode,
  category,
  categories,
  saving,
  onSubmit,
}: {
  mode: FinancialCategoryFormMode;
  category?: FinancialCategory | null;
  categories: FinancialCategory[];
  saving: boolean;
  onSubmit: (values: FinancialCategoryFormValues) => void;
}) {
  const readOnly = mode === "view";
  const [name, setName] = useState("");
  const [type, setType] = useState<FinancialCategoryType>("PAYABLE");
  const [parentCategoryId, setParentCategoryId] = useState("");
  const [status, setStatus] = useState<FinancialCategoryStatus>("ACTIVE");

  useEffect(() => {
    if (category) {
      setName(category.name);
      setType(category.type);
      setParentCategoryId(category.parentCategoryId ?? "");
      setStatus(category.status);
    }
  }, [category]);

  const primaryOptions = categories.filter(
    (c) => c.type === type && !c.parentCategoryId && c.id !== category?.id,
  );

  return (
    <div className="rounded-xl border border-border bg-surface-raised p-5 space-y-4">
      <Field>
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

      <div className="flex flex-col sm:flex-row gap-3">
        <SelectField
          id="type"
          label="Tipo *"
          value={type}
          onChange={(v) => {
            setType(v);
            setParentCategoryId("");
          }}
          options={TYPE_OPTIONS}
          disabled={readOnly || mode === "edit"}
        />
        <SelectField
          id="parent"
          label="Categoria primária"
          value={parentCategoryId}
          onChange={setParentCategoryId}
          placeholder="Nenhuma"
          options={primaryOptions.map((c) => ({ value: c.id, label: c.name }))}
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

      {!readOnly && (
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => onSubmit({ name, type, parentCategoryId, status })}
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
