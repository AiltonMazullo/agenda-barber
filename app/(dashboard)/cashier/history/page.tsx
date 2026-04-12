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
  X,
  CreditCard,
  Banknote,
  RotateCcw,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

type Movimentacao = {
  id: string;
  tipo: "Entrada" | "Saída";
  descricao: string;
  valor: number;
  hora: string;
};

type CaixaHistorico = {
  data: string;
  filial: string;
  status: "Aberto" | "Fechado";
  abertura: string;
  fechamento: string;
  vInicial: number;
  vFechamento: number | null;
  valorContado: number | null;
  observacoes: string;
  movimentacoes: Movimentacao[];
};

// ─── Formatação ───────────────────────────────────────────────────────────────

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ─── Mock ─────────────────────────────────────────────────────────────────────

const HISTORICO: CaixaHistorico[] = [
  {
    data: "09/04/2026",
    filial: "Matriz",
    status: "Aberto",
    abertura: "19:26",
    fechamento: "—",
    vInicial: 1000,
    vFechamento: null,
    valorContado: null,
    observacoes: "",
    movimentacoes: [
      {
        id: "#001",
        tipo: "Entrada",
        descricao: "Serviço de corte",
        valor: 50,
        hora: "19:45",
      },
      {
        id: "#002",
        tipo: "Saída",
        descricao: "Compra de produto",
        valor: 30,
        hora: "20:10",
      },
    ],
  },
  {
    data: "08/04/2026",
    filial: "Matriz",
    status: "Fechado",
    abertura: "09:00",
    fechamento: "18:30",
    vInicial: 500,
    vFechamento: 2340,
    valorContado: 2320,
    observacoes: "Fechamento normal do dia.",
    movimentacoes: [
      {
        id: "#001",
        tipo: "Entrada",
        descricao: "Corte + barba",
        valor: 90,
        hora: "09:30",
      },
      {
        id: "#002",
        tipo: "Entrada",
        descricao: "Corte simples",
        valor: 50,
        hora: "11:00",
      },
      {
        id: "#003",
        tipo: "Saída",
        descricao: "Compra de material",
        valor: 80,
        hora: "14:00",
      },
    ],
  },
  {
    data: "07/04/2026",
    filial: "Filial Norte",
    status: "Fechado",
    abertura: "08:45",
    fechamento: "19:00",
    vInicial: 300,
    vFechamento: 1780,
    valorContado: 1780,
    observacoes: "",
    movimentacoes: [
      {
        id: "#001",
        tipo: "Entrada",
        descricao: "Serviços gerais",
        valor: 1480,
        hora: "17:00",
      },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function TipoBadge({ tipo }: { tipo: "Entrada" | "Saída" }) {
  if (tipo === "Entrada")
    return (
      <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 text-[10px] font-semibold px-2 py-0.5">
        Entrada
      </Badge>
    );
  return (
    <Badge className="bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/20 text-[10px] font-semibold px-2 py-0.5">
      Saída
    </Badge>
  );
}

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
  const formatted = date ? date.toLocaleDateString("pt-BR") : null;

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
            className={`group w-full h-10 px-3 rounded-md border text-sm flex items-center justify-between gap-2 transition-all duration-200 outline-none bg-[#0d1117] ${open ? "border-[#f5b82e]/70 shadow-[0_0_0_3px_rgba(245,184,46,0.08)]" : "border-[#30363d] hover:border-[#f5b82e]/40"}`}
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

// ─── Dialog: Visualizar Caixa ─────────────────────────────────────────────────

function DialogVisualizarCaixa({
  open,
  onOpenChange,
  caixa,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  caixa: CaixaHistorico | null;
}) {
  if (!caixa) return null;

  const entradasManuais = caixa.movimentacoes
    .filter((m) => m.tipo === "Entrada")
    .reduce((a, m) => a + m.valor, 0);
  const saidasManuais = caixa.movimentacoes
    .filter((m) => m.tipo === "Saída")
    .reduce((a, m) => a + m.valor, 0);
  const esperado = caixa.vInicial + entradasManuais - saidasManuais;
  const diferenca =
    caixa.valorContado !== null ? caixa.valorContado - esperado : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#161b22] border border-[#30363d] text-white max-w-xl p-0 gap-0 max-h-[90vh] overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#21262d] sticky top-0 bg-[#161b22] z-10">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-base font-bold">
                Caixa {caixa.data}
              </DialogTitle>
              <p className="text-xs text-[#8b949e] mt-0.5">{caixa.filial}</p>
            </div>
            <div className="flex items-center gap-2">
              {caixa.status === "Aberto" ? (
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
                onClick={() => onOpenChange(false)}
                className="size-7 rounded-md flex items-center justify-center text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4">
          {/* Resumo */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#8b949e] mb-1">
                Valor Inicial
              </p>
              <p className="text-base font-bold text-white">
                {formatBRL(caixa.vInicial)}
              </p>
            </div>
            <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#8b949e] mb-1">
                {caixa.status === "Fechado"
                  ? "Valor de Fechamento"
                  : "Valor Atual"}
              </p>
              <p className="text-base font-bold text-[#f5b82e]">
                {caixa.vFechamento !== null
                  ? formatBRL(caixa.vFechamento)
                  : formatBRL(caixa.vInicial + entradasManuais - saidasManuais)}
              </p>
            </div>
          </div>
          {/* Dinheiro em Caixa */}
          <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Banknote className="size-3.5 text-[#8b949e]" />
              <p className="text-xs font-bold text-white">Dinheiro em Caixa</p>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#8b949e]">Abertura</span>
                <span className="text-white">{formatBRL(caixa.vInicial)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#8b949e]">Pagamentos em Dinheiro</span>
                <span className="text-emerald-400">+{formatBRL(0)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#8b949e]">Entradas Manuais</span>
                <span className="text-emerald-400">
                  +{formatBRL(entradasManuais)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#8b949e]">Saídas Manuais</span>
                <span className="text-red-400">
                  -{formatBRL(saidasManuais)}
                </span>
              </div>
              <div className="flex justify-between text-xs pt-2 border-t border-[#21262d]">
                <span className="text-white font-bold">Esperado</span>
                <span className="text-white font-bold">
                  {formatBRL(esperado)}
                </span>
              </div>
              {caixa.valorContado !== null && (
                <>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#8b949e]">Valor Contado</span>
                    <span className="text-white">
                      {formatBRL(caixa.valorContado)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#8b949e]">Diferença</span>
                    <span
                      className={
                        diferenca === 0
                          ? "text-emerald-400"
                          : diferenca! < 0
                            ? "text-red-400"
                            : "text-emerald-400"
                      }
                    >
                      {diferenca! >= 0 ? "+" : ""}
                      {formatBRL(diferenca!)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Observações */}
          {caixa.observacoes && (
            <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4">
              <p className="text-xs font-bold text-white mb-2">Observações</p>
              <p className="text-xs text-[#8b949e]">{caixa.observacoes}</p>
            </div>
          )}

          {/* Movimentações */}
          <div className="bg-[#0d1117] border border-[#30363d] rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-[#21262d]">
              <p className="text-xs font-bold text-white">
                Movimentações ({caixa.movimentacoes.length})
              </p>
            </div>
            {caixa.movimentacoes.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-[#4d5562]">
                Nenhuma movimentação registrada
              </div>
            ) : (
              <div className="divide-y divide-[#21262d]">
                {caixa.movimentacoes.map((m, i) => (
                  <div
                    key={i}
                    className="px-4 py-3 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <TipoBadge tipo={m.tipo} />
                      <span className="text-sm text-white truncate">
                        {m.descricao}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span
                        className={`text-sm font-semibold ${m.tipo === "Entrada" ? "text-emerald-400" : "text-red-400"}`}
                      >
                        {m.tipo === "Saída"
                          ? `- ${formatBRL(m.valor)}`
                          : `+ ${formatBRL(m.valor)}`}
                      </span>
                      <span className="text-xs text-[#8b949e]">{m.hora}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 pb-6 flex justify-end">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 px-5 rounded-md border border-[#30363d] bg-transparent text-sm text-white hover:bg-[#21262d] transition-colors"
          >
            Fechar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function CaixaHistoricoPage() {
  const [dataInicial, setDataInicial] = useState<Date | undefined>();
  const [dataFinal, setDataFinal] = useState<Date | undefined>();
  const [filial, setFilial] = useState("Todas as filiais");
  const [caixaSelecionado, setCaixaSelecionado] =
    useState<CaixaHistorico | null>(null);
  const [dialogVisualizar, setDialogVisualizar] = useState(false);

  const handleVisualizar = (caixa: CaixaHistorico) => {
    setCaixaSelecionado(caixa);
    setDialogVisualizar(true);
  };

  const handleReabrir = (caixa: CaixaHistorico) => {
    toast.success(`Caixa de ${caixa.data} reaberto!`);
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
            className="h-9 px-4 rounded-md border border-[#30363d] bg-[#161b22] text-sm text-white flex items-center gap-2 hover:border-[#f5b82e]/40 transition-colors"
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
                    className="w-full h-10 px-3 rounded-md border border-[#30363d] bg-[#0d1117] text-sm text-white flex items-center justify-between gap-2 hover:border-[#f5b82e]/40 transition-colors outline-none"
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

            <div className="flex flex-col justify-end">
              <div className="h-[22px]" />
              <button
                type="button"
                className="h-10 px-4 rounded-md border border-[#30363d] bg-[#0d1117] text-sm text-[#8b949e] flex items-center gap-2 hover:border-[#f5b82e]/40 hover:text-white transition-colors"
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
                        {formatBRL(c.vInicial)}
                      </TableCell>
                      <TableCell
                        className={`px-4 py-4 font-semibold text-sm ${c.vFechamento !== null ? "text-emerald-400" : "text-[#8b949e]"}`}
                      >
                        {c.vFechamento !== null
                          ? formatBRL(c.vFechamento)
                          : "—"}
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {/* Visualizar */}
                          <button
                            type="button"
                            onClick={() => handleVisualizar(c)}
                            className="size-8 rounded-md border border-[#30363d] bg-[#0d1117] text-[#8b949e] flex items-center justify-center hover:border-[#f5b82e]/40 hover:text-[#f5b82e] transition-colors"
                            title="Visualizar"
                          >
                            <Eye className="size-3.5" />
                          </button>
                          {/* Reabrir (só fechados) */}
                          {c.status === "Fechado" && (
                            <button
                              type="button"
                              onClick={() => handleReabrir(c)}
                              className="size-8 rounded-md border border-[#30363d] bg-[#0d1117] text-[#8b949e] flex items-center justify-center hover:border-emerald-500/40 hover:text-emerald-400 transition-colors"
                              title="Reabrir caixa"
                            >
                              <RotateCcw className="size-3.5" />
                            </button>
                          )}
                        </div>
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
                    {c.status === "Fechado" && (
                      <button
                        type="button"
                        onClick={() => handleReabrir(c)}
                        className="size-7 rounded-md border border-[#30363d] bg-[#161b22] text-[#8b949e] flex items-center justify-center hover:border-emerald-500/40 hover:text-emerald-400 transition-colors"
                      >
                        <RotateCcw className="size-3" />
                      </button>
                    )}
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
                    {formatBRL(c.vInicial)}
                  </span>
                  <span
                    className={
                      c.vFechamento !== null ? "text-emerald-400 font-bold" : ""
                    }
                  >
                    <span className="text-[#4d5562]">V. Final: </span>
                    {c.vFechamento !== null ? formatBRL(c.vFechamento) : "—"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Dialog Visualizar ── */}
      <DialogVisualizarCaixa
        open={dialogVisualizar}
        onOpenChange={setDialogVisualizar}
        caixa={caixaSelecionado}
      />
    </div>
  );
}
