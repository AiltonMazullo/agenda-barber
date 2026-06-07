import { ChevronDown } from "lucide-react";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { SelectOption } from "@/types/common.types";

interface SelectFieldProps<T extends string> {
  id: string;
  label?: string;
  value: T;
  options: ReadonlyArray<SelectOption<T> | T>;
  onChange: (value: T) => void;
  placeholder?: string;
  className?: string;
}

function normalize<T extends string>(
  opt: SelectOption<T> | T,
): SelectOption<T> {
  return typeof opt === "string" ? { value: opt as T, label: opt } : opt;
}

export function SelectField<T extends string>({
  id,
  label,
  value,
  options,
  onChange,
  placeholder,
  className,
}: SelectFieldProps<T>) {
  const items = options.map(normalize);
  const selected = items.find((opt) => opt.value === value);

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
          className="w-full h-10 px-3 rounded-md border border-border bg-surface-base text-sm text-foreground flex items-center justify-between gap-2 hover:border-brand/40 transition-colors outline-none cursor-pointer"
        >
          <span className="truncate">
            {selected?.label ?? placeholder ?? "Selecione"}
          </span>
          <ChevronDown className="size-3.5 text-muted-foreground shrink-0" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-surface-raised border-border text-foreground min-w-[160px]">
          {items.map((opt) => (
            <DropdownMenuItem
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className="text-xs hover:bg-surface-elevated cursor-pointer"
            >
              {opt.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </Field>
  );
}
