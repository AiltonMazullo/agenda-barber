"use client";

import { useState } from "react";
import { ChevronDown, Play } from "lucide-react";
import { DatePickerField, SelectField } from "@/components/shared";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useBranches } from "@/hooks/useBranches";
import { useFinancialCategories } from "@/hooks/useFinancialCategories";
import type { FinancialEntryType } from "@/types/financial-entry.types";

export interface FinancialFiltersValue {
  branchId?: string;
  search?: string;
  categoryIds: string[];
  dueDateFrom?: string;
  dueDateTo?: string;
}

export function FinancialFilters({
  type,
  onFilter,
}: {
  type: FinancialEntryType;
  onFilter: (filters: FinancialFiltersValue) => void;
}) {
  const { barbershop } = useAuth();
  const { branches } = useBranches(barbershop?.id);
  const { categories } = useFinancialCategories(barbershop?.id, type);

  const [branchId, setBranchId] = useState("");
  const [description, setDescription] = useState("");
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [dueDateFrom, setDueDateFrom] = useState<Date | undefined>();
  const [dueDateTo, setDueDateTo] = useState<Date | undefined>();

  function toggleCategory(id: string) {
    setCategoryIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }

  function handleFilter() {
    onFilter({
      branchId: branchId || undefined,
      search: description || undefined,
      categoryIds,
      dueDateFrom: dueDateFrom ? dueDateFrom.toISOString() : undefined,
      dueDateTo: dueDateTo ? dueDateTo.toISOString() : undefined,
    });
  }

  return (
    <div className="rounded-xl border border-border bg-surface-raised p-4 space-y-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        Filtros — preencha os filtros abaixo
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <SelectField
          id="filterBranch"
          label="Filial"
          value={branchId}
          onChange={setBranchId}
          placeholder="Todas"
          options={branches.map((b) => ({ value: b.id, label: b.name }))}
        />
        <Field className="flex-1">
          <FieldLabel className="text-[10px] font-bold uppercase tracking-widest text-brand">
            Descrição
          </FieldLabel>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-surface-base border-border text-foreground"
          />
        </Field>
        <Field className="flex-1 min-w-[160px]">
          <FieldLabel className="text-[10px] font-bold uppercase tracking-widest text-brand">
            Categorias
          </FieldLabel>
          <DropdownMenu>
            <DropdownMenuTrigger className="w-full h-10 px-3 rounded-md border border-border bg-surface-base text-sm text-foreground flex items-center justify-between gap-2 hover:border-brand/40 transition-colors outline-none cursor-pointer">
              <span className="truncate">
                {categoryIds.length === 0
                  ? "Todas"
                  : `${categoryIds.length} selecionada(s)`}
              </span>
              <ChevronDown className="size-3.5 text-muted-foreground shrink-0" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-surface-raised border-border text-foreground min-w-[220px] max-h-64 overflow-y-auto">
              {categories.map((c) => (
                <DropdownMenuCheckboxItem
                  key={c.id}
                  checked={categoryIds.includes(c.id)}
                  onCheckedChange={() => toggleCategory(c.id)}
                  onSelect={(e) => e.preventDefault()}
                  className="text-xs hover:bg-surface-elevated cursor-pointer"
                >
                  {c.name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </Field>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-end">
        <DatePickerField
          id="filterDueDateFrom"
          label="Data inicial de vencimento"
          date={dueDateFrom}
          onChange={setDueDateFrom}
        />
        <DatePickerField
          id="filterDueDateTo"
          label="Data final de vencimento"
          date={dueDateTo}
          onChange={setDueDateTo}
        />
        <button
          type="button"
          onClick={handleFilter}
          className="h-10 px-4 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors flex items-center gap-1.5"
        >
          <Play className="size-3.5" />
          Filtrar
        </button>
      </div>
    </div>
  );
}
