import { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SelectOption } from "@/types/common.types";

interface WrapperProps {
  label: string;
  required?: boolean;
  htmlFor?: string;
  children: ReactNode;
}

function LabeledFieldWrapper({
  label,
  required,
  htmlFor,
  children,
}: WrapperProps) {
  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={htmlFor}
        className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
      >
        {label}
        {required ? " *" : ""}
      </Label>
      {children}
    </div>
  );
}

interface LabeledSelectProps {
  label: string;
  required?: boolean;
  placeholder?: string;
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  options: SelectOption<string>[];
}

export function LabeledSelect({
  label,
  required,
  placeholder = "Selecione...",
  value,
  onValueChange,
  disabled,
  options,
}: LabeledSelectProps) {
  return (
    <LabeledFieldWrapper label={label} required={required}>
      {/*
        `items` é o que faz o Select.Value do Base UI resolver o label
        certo no trigger (sem isso ele mostra o value cru).
      */}
      <Select
        items={options}
        value={value || null}
        onValueChange={(val) => onValueChange((val as string) ?? "")}
        disabled={disabled}
      >
        <SelectTrigger className="h-10 w-full cursor-pointer bg-surface-base border-border text-sm data-disabled:opacity-50">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        {/*
          alignItemWithTrigger=false: sem isso o popup abre alinhando o item
          selecionado por cima do trigger (estilo <select> nativo).
        */}
        <SelectContent
          alignItemWithTrigger={false}
          className="border border-border bg-surface-raised text-foreground shadow-xl"
        >
          {options.length === 0 ? (
            <p className="px-3 py-2 text-xs text-muted-foreground">
              Nenhuma opção disponível.
            </p>
          ) : (
            options.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                className="cursor-pointer"
              >
                {opt.label}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </LabeledFieldWrapper>
  );
}

type InputElProps = React.ComponentProps<typeof Input>;

interface LabeledInputProps extends InputElProps {
  label: string;
  required?: boolean;
}

export function LabeledInput({
  label,
  required,
  id,
  className,
  ...props
}: LabeledInputProps) {
  return (
    <LabeledFieldWrapper label={label} required={required} htmlFor={id}>
      <Input
        id={id}
        className={`h-10 bg-surface-base border-border placeholder:text-text-faint focus-visible:ring-brand/30 ${className ?? ""}`}
        {...props}
      />
    </LabeledFieldWrapper>
  );
}
