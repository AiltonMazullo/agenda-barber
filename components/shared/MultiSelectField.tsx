"use client";

import { ChevronDown } from "lucide-react";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { SelectOption } from "@/types/common.types";

interface MultiSelectFieldProps<T extends string> {
  id: string;
  label?: string;
  values: T[];
  options: ReadonlyArray<SelectOption<T> | T>;
  onChange: (values: T[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

function normalize<T extends string>(opt: SelectOption<T> | T): SelectOption<T> {
  return typeof opt === "string" ? { value: opt as T, label: opt } : opt;
}

/**
 * Igual ao `SelectField`, mas permite marcar mais de um valor — spec-ajustes-
 * escopo-5.md §9.2 (filtros de relatório que hoje só aceitam 1 escolha).
 * Usa checkboxes simples dentro do dropdown (não o primitivo de Item do
 * menu) de propósito: o primitivo fecha o menu ao clicar, o que impediria
 * marcar mais de uma opção por abertura.
 */
export function MultiSelectField<T extends string>({
  id,
  label,
  values,
  options,
  onChange,
  placeholder,
  className,
  disabled,
}: MultiSelectFieldProps<T>) {
  const items = options.map(normalize);

  function toggle(value: T) {
    if (values.includes(value)) onChange(values.filter((v) => v !== value));
    else onChange([...values, value]);
  }

  const summary =
    values.length === 0
      ? (placeholder ?? "Todos")
      : values.length === 1
        ? (items.find((i) => i.value === values[0])?.label ?? values[0])
        : `${values.length} selecionados`;

  return (
    <Field className={cn("flex-1 min-w-[140px]", className)}>
      {label && (
        <FieldLabel
          htmlFor={id}
          className="text-[10px] font-bold uppercase tracking-widest text-brand"
        >
          {label}
        </FieldLabel>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger
          id={id}
          disabled={disabled}
          className="w-full h-10 px-3 rounded-md border border-border bg-surface-base text-sm text-foreground flex items-center justify-between gap-2 hover:border-brand/40 transition-colors outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border"
        >
          <span className="truncate">{summary}</span>
          <ChevronDown className="size-3.5 text-muted-foreground shrink-0" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-surface-raised border-border text-foreground min-w-[200px] max-h-72 overflow-y-auto p-1">
          {items.length === 0 ? (
            <p className="px-2 py-1.5 text-xs text-muted-foreground">Nada para selecionar.</p>
          ) : (
            items.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-foreground hover:bg-surface-elevated cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={values.includes(opt.value)}
                  onChange={() => toggle(opt.value)}
                  className="size-3.5 accent-brand"
                />
                <span className="truncate">{opt.label}</span>
              </label>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </Field>
  );
}
