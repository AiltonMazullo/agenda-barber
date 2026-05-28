"use client";

import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { ptBR } from "date-fns/locale";
import type { Matcher } from "react-day-picker";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface DatePickerFieldProps {
  id: string;
  label?: string;
  date: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  /** Datas desabilitadas (ex.: `{ before: hoje }` ou `{ after: hoje }`). */
  disabled?: Matcher | Matcher[];
  /** Limite inicial de navegação (controla o range do dropdown de ano). */
  startMonth?: Date;
  /** Limite final de navegação. */
  endMonth?: Date;
  /** Mês exibido ao abrir quando não há data selecionada. */
  defaultMonth?: Date;
}

/** classNames que deixam os dropdowns de mês/ano com o tema escuro do app. */
const calendarClassNames = {
  months: "text-foreground",
  month_caption: "flex items-center gap-2 mb-2 px-1",
  caption_label: "hidden",
  dropdowns: "flex items-center gap-2 flex-1",
  dropdown_root: "relative",
  dropdown:
    "bg-surface-base border border-border text-foreground text-xs rounded-md px-2 py-1.5 font-medium outline-none focus:border-brand/60 cursor-pointer appearance-none hover:border-brand/40 transition-colors",
  nav: "flex items-center gap-1",
  weekdays: "flex mb-1",
  weekday:
    "flex-1 text-center text-[10px] font-bold uppercase text-text-faint py-1",
  today: "text-brand font-bold",
  outside: "opacity-30",
  disabled: "opacity-25 cursor-not-allowed",
} as const;

export function DatePickerField({
  id,
  label,
  date,
  onChange,
  placeholder = "dd/mm/aaaa",
  className,
  disabled,
  startMonth,
  endMonth,
  defaultMonth,
}: DatePickerFieldProps) {
  const [open, setOpen] = React.useState(false);

  const formatted = date
    ? date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : null;

  return (
    <Field className={cn("flex-1 min-w-[160px]", className)}>
      {label && (
        <FieldLabel
          htmlFor={id}
          className="text-[10px] font-bold uppercase tracking-widest text-brand"
        >
          {label}
        </FieldLabel>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger>
          <button
            id={id}
            type="button"
            className={cn(
              "group w-full h-10 px-3 rounded-md border text-sm flex items-center justify-between gap-2 transition-all duration-200 outline-none bg-surface-base",
              open
                ? "border-brand/70 shadow-[0_0_0_3px_rgba(245,184,46,0.08)]"
                : "border-border hover:border-brand/40",
            )}
          >
            <span
              className={
                date ? "text-foreground font-medium" : "text-text-faint"
              }
            >
              {formatted ?? placeholder}
            </span>
            <CalendarIcon
              className={cn(
                "size-3.5 shrink-0 transition-colors",
                open
                  ? "text-brand"
                  : "text-text-faint group-hover:text-muted-foreground",
              )}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={6}
          className="w-auto p-0 overflow-hidden bg-surface-raised border border-border rounded-xl shadow-[0_16px_48px_rgba(0,0,0,0.6)]"
        >
          <div className="p-3">
            <Calendar
              mode="single"
              selected={date}
              defaultMonth={date ?? defaultMonth}
              captionLayout="dropdown"
              locale={ptBR}
              disabled={disabled}
              startMonth={startMonth}
              endMonth={endMonth}
              classNames={calendarClassNames}
              onSelect={(d) => {
                onChange(d);
                setOpen(false);
              }}
            />
          </div>
          {date && (
            <div className="px-4 pb-3 border-t border-border-subtle pt-3">
              <button
                type="button"
                onClick={() => {
                  onChange(undefined);
                  setOpen(false);
                }}
                className="w-full text-xs font-semibold text-muted-foreground hover:text-danger-foreground transition-colors py-1 rounded-md hover:bg-danger/10"
              >
                Limpar data
              </button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </Field>
  );
}
