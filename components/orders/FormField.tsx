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
        className="text-xs font-medium text-muted-foreground"
      >
        {label}
        {required ? " *" : ""}
      </Label>
      {children}
    </div>
  );
}

interface LabeledSelectOption {
  value: string;
  label: string;
}

interface LabeledSelectProps {
  label: string;
  required?: boolean;
  placeholder?: string;
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  options: LabeledSelectOption[];
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
        certo no trigger (sem isso ele mostra o value cru, tipo "ag-3").
      */}
      <Select
        items={options}
        value={value || null}
        onValueChange={(val) => onValueChange((val as string) ?? "")}
        disabled={disabled}
      >
        <SelectTrigger className="w-full cursor-pointer">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        {/*
          alignItemWithTrigger=false: sem isso o popup abre alinhando o
          item selecionado por cima do trigger (estilo <select> nativo),
          que foi o "negócio estranho" sobreposto nos prints.
        */}
        <SelectContent
          alignItemWithTrigger={false}
          className="border border-border bg-surface-raised text-foreground shadow-xl"
        >
          {options.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              className="cursor-pointer"
            >
              {opt.label}
            </SelectItem>
          ))}
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
  ...props
}: LabeledInputProps) {
  return (
    <LabeledFieldWrapper label={label} required={required} htmlFor={id}>
      <Input id={id} {...props} />
    </LabeledFieldWrapper>
  );
}
