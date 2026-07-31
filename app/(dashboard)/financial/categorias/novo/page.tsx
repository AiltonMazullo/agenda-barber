"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { PageHeader, SelectField } from "@/components/shared";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useFinancialCategories } from "@/hooks/useFinancialCategories";
import type { FinancialCategoryType } from "@/types/financial-category.types";

const TYPE_OPTIONS: { value: FinancialCategoryType; label: string }[] = [
  { value: "PAYABLE", label: "Contas a pagar" },
  { value: "RECEIVABLE", label: "Contas a receber" },
];

export default function NovaCategoriaFinanceiraPage() {
  const router = useRouter();
  const { barbershop } = useAuth();
  const { categories, create } = useFinancialCategories(barbershop?.id);

  const [name, setName] = useState("");
  const [type, setType] = useState<FinancialCategoryType>("PAYABLE");
  const [parentCategoryId, setParentCategoryId] = useState("");
  const [saving, setSaving] = useState(false);

  const primaryOptions = categories.filter((c) => c.type === type && !c.parentCategoryId);

  async function handleSubmit() {
    if (!name) return;
    setSaving(true);
    const created = await create({
      name,
      type,
      parentCategoryId: parentCategoryId || undefined,
    });
    setSaving(false);
    if (created) router.push("/financial/categorias");
  }

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Nova categoria financeira"
        subtitle="Formulário de categoria com nome, tipo e categoria primária"
        actions={
          <Link
            href="/financial/categorias"
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
            Nome *
          </FieldLabel>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-surface-base border-border text-foreground" />
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
          />
          <SelectField
            id="parent"
            label="Categoria primária"
            value={parentCategoryId}
            onChange={setParentCategoryId}
            placeholder="Nenhuma"
            options={primaryOptions.map((c) => ({ value: c.id, label: c.name }))}
          />
        </div>

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
