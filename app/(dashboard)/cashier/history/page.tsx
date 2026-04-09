/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { useState } from "react";
import {
  ArrowLeft,
  Download,
  ChevronDown,
  Eye,
  CalendarIcon,
  DollarSign,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import Link from "next/link";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type CaixaHistorico = {
  data: string;
  filial: string;
  status: "Aberto" | "Fechado";
  abertura: string;
  fechamento: string;
  vInicial: string;
  vFechamento: string;
};

// ─── Mock ─────────────────────────────────────────────────────────────────────

const HISTORICO: CaixaHistorico[] = [
  {
    data: "09/04/2026",
    filial: "Matriz",
    status: "Aberto",
    abertura: "19:26",
    fechamento: "—",
    vInicial: "R$ 1.000,00",
    vFechamento: "—",
  },
  {
    data: "08/04/2026",
    filial: "Matriz",
    status: "Fechado",
    abertura: "09:00",
    fechamento: "18:30",
    vInicial: "R$ 500,00",
    vFechamento: "R$ 2.340,00",
  },
  {
    data: "07/04/2026",
    filial: "Filial Norte",
    status: "Fechado",
    abertura: "08:45",
    fechamento: "19:00",
    vInicial: "R$ 300,00",
    vFechamento: "R$ 1.780,00",
  },
];

// ─── DatePickerField ──────────────────────────────────────────────────────────

function DatePickerField({
  id,
  label,
  date,
  onSelect,
}: {
  id: string;
  label: string;
  date: Date | undefined;
  onSelect: (d: Date | undefined) => void;
}) {
  const [open, setOpen] = React.useState(false);

  const formatted = date
    ? date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : null;

  return (
    <Field className="flex-1 min-w-[150px]">
      <FieldLabel
        htmlFor={id}
        className="text-[10px] font-bold uppercase tracking-widest text-[#f5b82e]"
      >
        {label}
      </FieldLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger>
          <button
            id={id}
            type="button"
            className={`
              group w-full h-10 px-3 rounded-md border text-sm
              flex items-center justify-between gap-2
              transition-all duration-200 outline-none bg-[#0d1117]
              ${
                open
                  ? "border-[#f5b82e]/70 shadow-[0_0_0_3px_rgba(245,184,46,0.08)]"
                  : "border-[#30363d] hover:border-[#f5b82e]/40"
              }
            `}
          >
            <span
              className={date ? "text-white font-medium" : "text-[#4d5562]"}
            >
              {formatted ?? "dd/mm/aaaa"}
            </span>
            <CalendarIcon
              className={`size-3.5 shrink-0 transition-colors ${open ? "text-[#f5b82e]" : "text-[#4d5562] group-hover:text-[#8b949e]"}`}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={6}
          className="w-auto p-0 overflow-hidden bg-[#161b22] border border-[#30363d] rounded-xl shadow-[0_16px_48px_rgba(0,0,0,0.6)]"
        >
          <div className="px-4 pt-4 pb-3 border-b border-[#21262d]">
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
          <div className="p-3">
            <CalendarComponent
              mode="single"
              selected={date}
              defaultMonth={date}
              captionLayout="dropdown"
              locale={ptBR}
              onSelect={(d) => {
                onSelect(d);
                setOpen(false);
              }}
              classNames={{
                root: "",
                months: "text-white",
                month_caption: "flex items-center gap-2 mb-3 px-1",
                caption_label: "hidden",
                dropdowns: "flex items-center gap-2 flex-1",
                dropdown:
                  "bg-[#0d1117] border border-[#30363d] text-white text-xs rounded-md px-2 py-1.5 font-medium focus:outline-none focus:border-[#f5b82e]/60 cursor-pointer hover:border-[#f5b82e]/40 transition-colors",
                nav: "flex items-center gap-1",
                button_previous:
                  "size-7 flex items-center justify-center rounded-md text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors border border-transparent hover:border-[#30363d]",
                button_next:
                  "size-7 flex items-center justify-center rounded-md text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors border border-transparent hover:border-[#30363d]",
                weeks: "mt-1 space-y-0.5",
                weekdays: "flex mb-2",
                weekday:
                  "flex-1 text-center text-[10px] font-bold uppercase text-[#4d5562] py-1",
                week: "flex gap-0.5",
                day: "flex-1 flex items-center justify-center",
                day_button:
                  "size-8 text-xs font-medium rounded-md text-[#8b949e] hover:bg-[#21262d] hover:text-white transition-colors focus:outline-none",
                selected:
                  "!bg-[#f5b82e] !text-black !font-bold rounded-md hover:!bg-[#d9a326] shadow-[0_0_12px_rgba(245,184,46,0.3)]",
                today: "!text-[#f5b82e] !font-bold",
                outside: "opacity-20",
                disabled: "opacity-20 cursor-not-allowed",
              }}
            />
          </div>
          {date && (
            <div className="px-4 pb-3 border-t border-[#21262d] pt-3">
              <button
                type="button"
                onClick={() => {
                  onSelect(undefined);
                  setOpen(false);
                }}
                className="w-full text-xs font-semibold text-[#8b949e] hover:text-red-400 transition-colors py-1 rounded-md hover:bg-red-500/5"
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

// ─── Página ───────────────────────────────────────────────────────────────────

export default function CaixaHistoricoPage() {
  const [dataInicial, setDataInicial] = useState<Date | undefined>();
  const [dataFinal, setDataFinal] = useState<Date | undefined>();
  const [filial, setFilial] = useState("Todas as filiais");

  const handleVisualizar = (caixa: CaixaHistorico) => {
    if (caixa.status === "Aberto") {
      toast.success("Caixa reaberto!");
    } else {
      toast.success(`Visualizando caixa de ${caixa.data}`);
    }
  };

  return (
    <div className="space-y-5 p-4 md:p-6 bg-[#0d1117] min-h-screen text-white">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Histórico de Caixas
          </h1>
          <p className="text-[#8b949e] text-sm mt-1">
            Consulte caixas anteriores
          </p>
        </div>

        <Link href="/cashier">
          <button
            type="button"
            className="
              h-9 px-4 rounded-md border border-[#30363d]
              bg-[#161b22] text-sm text-white
              flex items-center gap-2
              hover:border-[#f5b82e]/40 hover:text-white transition-colors
            "
          >
            <ArrowLeft className="size-3.5 text-[#8b949e]" />
            Voltar
          </button>
        </Link>
      </div>

      {/* ── Filtros ── */}
      <Card className="bg-[#161b22] border-[#30363d]">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <DatePickerField
              id="hist-data-inicial"
              label="Data Inicial"
              date={dataInicial}
              onSelect={setDataInicial}
            />

            <DatePickerField
              id="hist-data-final"
              label="Data Final"
              date={dataFinal}
              onSelect={setDataFinal}
            />

            {/* Filial */}
            <Field className="flex-1 min-w-[160px]">
              <FieldLabel
                htmlFor="hist-filial"
                className="text-[10px] font-bold uppercase tracking-widest text-[#f5b82e]"
              >
                Filial
              </FieldLabel>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <button
                    id="hist-filial"
                    type="button"
                    className="
                      w-full h-10 px-3 rounded-md border border-[#30363d]
                      bg-[#0d1117] text-sm text-white
                      flex items-center justify-between gap-2
                      hover:border-[#f5b82e]/40 transition-colors outline-none
                    "
                  >
                    <span className="truncate">{filial}</span>
                    <ChevronDown className="size-3.5 text-[#8b949e] shrink-0" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#161b22] border-[#30363d] text-white min-w-[180px]">
                  {[
                    "Todas as filiais",
                    "Matriz",
                    "Filial Norte",
                    "Filial Sul",
                  ].map((f) => (
                    <DropdownMenuItem
                      key={f}
                      onClick={() => setFilial(f)}
                      className="text-xs hover:bg-[#21262d] cursor-pointer"
                    >
                      {f}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </Field>

            {/* CSV */}
            <div className="flex flex-col justify-end">
              <div className="h-[22px]" />
              <button
                type="button"
                className="
                  h-10 px-4 rounded-md border border-[#30363d]
                  bg-[#0d1117] text-sm text-[#8b949e]
                  flex items-center gap-2 shrink-0
                  hover:border-[#f5b82e]/40 hover:text-white transition-colors
                "
              >
                <Download className="size-3.5" />
                CSV
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Tabela ── */}
      <Card className="bg-[#161b22] border-[#30363d]">
        <CardContent className="p-0">
          {/* Desktop */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="border-[#30363d] hover:bg-transparent">
                  {[
                    "Data",
                    "Filial",
                    "Status",
                    "Abertura",
                    "Fechamento",
                    "V. Inicial",
                    "V. Fechamento",
                    "Ações",
                  ].map((col) => (
                    <TableHead
                      key={col}
                      className="text-[#8b949e] text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto"
                    >
                      {col}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {HISTORICO.length === 0 ? (
                  <TableRow className="border-[#30363d] hover:bg-transparent">
                    <TableCell colSpan={8} className="py-16">
                      <div className="flex flex-col items-center justify-center gap-3 text-[#8b949e]">
                        <DollarSign className="size-10 opacity-30" />
                        <p className="text-sm">Nenhum caixa encontrado.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  HISTORICO.map((c, i) => (
                    <TableRow
                      key={i}
                      className="border-[#30363d] hover:bg-[#21262d]/50 transition-colors"
                    >
                      <TableCell className="px-4 py-4 font-semibold text-white text-sm">
                        {c.data}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-[#8b949e] text-sm">
                        {c.filial}
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        {c.status === "Aberto" ? (
                          <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 text-[10px] font-semibold px-2 py-0.5">
                            Aberto
                          </Badge>
                        ) : (
                          <Badge className="bg-[#30363d]/60 text-[#8b949e] border border-[#30363d] hover:bg-[#30363d] text-[10px] font-semibold px-2 py-0.5">
                            Fechado
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-[#8b949e] text-sm">
                        {c.abertura}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-[#8b949e] text-sm">
                        {c.fechamento}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-white font-semibold text-sm">
                        {c.vInicial}
                      </TableCell>
                      <TableCell
                        className={`px-4 py-4 font-semibold text-sm ${c.vFechamento !== "—" ? "text-emerald-400" : "text-[#8b949e]"}`}
                      >
                        {c.vFechamento}
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => handleVisualizar(c)}
                          className="
                            size-8 rounded-md border border-[#30363d]
                            bg-[#0d1117] text-[#8b949e]
                            flex items-center justify-center
                            hover:border-[#f5b82e]/40 hover:text-[#f5b82e]
                            transition-colors
                          "
                        >
                          <Eye className="size-3.5" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile */}
          <div className="md:hidden px-4 py-4 space-y-3">
            {HISTORICO.map((c, i) => (
              <div
                key={i}
                className="bg-[#0d1117] rounded-lg p-4 border border-[#30363d] space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-semibold text-white text-sm">
                      {c.data}
                    </span>
                    <span className="text-[#4d5562] text-xs ml-2">
                      {c.filial}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {c.status === "Aberto" ? (
                      <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold px-2 py-0.5">
                        Aberto
                      </Badge>
                    ) : (
                      <Badge className="bg-[#30363d]/60 text-[#8b949e] border border-[#30363d] text-[10px] font-semibold px-2 py-0.5">
                        Fechado
                      </Badge>
                    )}
                    <button
                      type="button"
                      onClick={() => handleVisualizar(c)}
                      className="size-7 rounded-md border border-[#30363d] bg-[#161b22] text-[#8b949e] flex items-center justify-center hover:border-[#f5b82e]/40 hover:text-[#f5b82e] transition-colors"
                    >
                      <Eye className="size-3" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-[#8b949e]">
                  <span>
                    <span className="text-[#4d5562]">Abertura: </span>
                    {c.abertura}
                  </span>
                  <span>
                    <span className="text-[#4d5562]">Fechamento: </span>
                    {c.fechamento}
                  </span>
                  <span>
                    <span className="text-[#4d5562]">V. Inicial: </span>
                    {c.vInicial}
                  </span>
                  <span
                    className={
                      c.vFechamento !== "—" ? "text-emerald-400 font-bold" : ""
                    }
                  >
                    <span className="text-[#4d5562]">V. Final: </span>
                    {c.vFechamento}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
