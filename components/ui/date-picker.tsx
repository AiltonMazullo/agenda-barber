"use client";

import * as React from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DatePickerSimple() {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(undefined);

  const formatted = date
    ? date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <Field className="w-52">
      <FieldLabel
        htmlFor="date"
        className="text-[10px] font-bold uppercase tracking-widest text-[#f5b82e]"
      >
        Data de nascimento
      </FieldLabel>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger>
          <button
            id="date"
            type="button"
            className={`
              group w-full h-10 px-4 rounded-md border text-sm
              flex items-center justify-between gap-2
              transition-all duration-200 outline-none
              bg-[#0d1117]
              ${
                open
                  ? "border-[#f5b82e]/70 shadow-[0_0_0_3px_rgba(245,184,46,0.08)]"
                  : "border-[#30363d] hover:border-[#f5b82e]/40 hover:shadow-[0_0_0_3px_rgba(245,184,46,0.05)]"
              }
            `}
          >
            <span
              className={date ? "text-white font-medium" : "text-[#4d5562]"}
            >
              {formatted ?? "dd / mm / aaaa"}
            </span>

            <CalendarDays
              className={`
                size-4 shrink-0 transition-colors duration-200
                ${open ? "text-[#f5b82e]" : "text-[#4d5562] group-hover:text-[#8b949e]"}
              `}
            />
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={6}
          className="
            w-auto p-0 overflow-hidden
            bg-[#161b22] border border-[#30363d]
            rounded-xl shadow-[0_16px_48px_rgba(0,0,0,0.6)]
          "
        >
          {/* Cabeçalho decorativo */}
          <div className="px-4 pt-3 border-b border-[#21262d]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#f5b82e]">
              Selecionar data
            </p>
            <p className="text-base font-bold text-white mt-0.5">
              {date
                ? date.toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                : "Nenhuma data selecionada"}
            </p>
          </div>

          <div className="">
            <Calendar
              mode="single"
              selected={date}
              defaultMonth={date}
              captionLayout="dropdown"
              onSelect={(d) => {
                setDate(d);
                setOpen(false);
              }}
              classNames={{
                root: "",
                months: "text-white",
                month_caption: "flex items-center gap-2 mb-3 px-1",
                caption_label: "hidden",
                dropdowns: "flex items-center gap-2 flex-1",
                dropdown: `
                  bg-[#0d1117] border border-[#30363d] text-white text-xs
                  rounded-md px-2 py-1.5 font-medium
                  focus:outline-none focus:border-[#f5b82e]/60
                  cursor-pointer appearance-none
                  hover:border-[#f5b82e]/40 transition-colors
                `,
                nav: "flex items-center gap-1",
                button_previous: `
                  size-7 flex items-center justify-center rounded-md
                  text-[#8b949e] hover:text-white hover:bg-[#21262d]
                  transition-colors border border-transparent
                  hover:border-[#30363d]
                `,
                button_next: `
                  size-7 flex items-center justify-center rounded-md
                  text-[#8b949e] hover:text-white hover:bg-[#21262d]
                  transition-colors border border-transparent
                  hover:border-[#30363d]
                `,
                weeks: "mt-1 space-y-0.5",
                weekdays: "flex mb-2",
                weekday:
                  "flex-1 text-center text-[10px] font-bold uppercase text-[#4d5562] py-1",
                week: "flex gap-0.5",
                day: "flex-1 flex items-center justify-center",
                day_button: `
                  size-8 text-xs font-medium rounded-md text-[#8b949e]
                  hover:bg-[#21262d] hover:text-white
                  transition-colors focus:outline-none
                `,
                selected: `
                  !bg-[#f5b82e] !text-black !font-bold rounded-md
                  hover:!bg-[#d9a326] shadow-[0_0_12px_rgba(245,184,46,0.3)]
                `,
                today: "!text-[#f5b82e] !font-bold",
                outside: "opacity-20",
                disabled: "opacity-20 cursor-not-allowed",
              }}
            />
          </div>

          {/* Rodapé com ação de limpar */}
          {date && (
            <div className="px-4 pb-3 border-t border-[#21262d] pt-3">
              <button
                type="button"
                onClick={() => {
                  setDate(undefined);
                  setOpen(false);
                }}
                className="
                  w-full text-xs font-semibold text-[#8b949e]
                  hover:text-red-400 transition-colors py-1
                  rounded-md hover:bg-red-500/5
                "
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
