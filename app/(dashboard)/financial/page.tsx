/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  TrendingUp,
  Plus,
  Search,
  RefreshCw,
  SlidersHorizontal,
  AlertCircle,
  Clock,
  CheckCircle2,
  Wallet,
  Scale,
  ChevronDown,
  Calendar,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { DatePickerSimple } from "@/components/ui/date-picker";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { ptBR } from "date-fns/locale";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type TabKey = "contas_pagar" | "contas_receber" | "categorias";

type Conta = {
  descricao: string;
  categoria: string;
  vencimento: string;
  forma: string;
  valor: string;
  status: "Pendente" | "Pago" | "Atrasado";
};

// ─── Dados mock ───────────────────────────────────────────────────────────────

const TABS: { key: TabKey; label: string }[] = [
  { key: "contas_pagar", label: "Contas a Pagar" },
  { key: "contas_receber", label: "Contas a Receber" },
  { key: "categorias", label: "Categorias" },
];

const CONTAS_PAGAR: Conta[] = [
  {
    descricao: "Aluguel março",
    categoria: "Aluguel",
    vencimento: "29/03/2026",
    forma: "Boleto",
    valor: "R$ 3.500,00",
    status: "Pendente",
  },
  {
    descricao: "Fornecedor produtos",
    categoria: "Fornecedores",
    vencimento: "24/03/2026",
    forma: "Pix",
    valor: "R$ 1.200,00",
    status: "Pendente",
  },
  {
    descricao: "Energia elétrica",
    categoria: "Despesas fixas",
    vencimento: "19/03/2026",
    forma: "Débito auto",
    valor: "R$ 450,00",
    status: "Pago",
  },
  {
    descricao: "Comissão Carlos",
    categoria: "Comissões",
    vencimento: "14/03/2026",
    forma: "Pix",
    valor: "R$ 2.080,00",
    status: "Pago",
  },
];

const CONTAS_RECEBER: Conta[] = [
  {
    descricao: "Pacote mensal Ana Lima",
    categoria: "Assinaturas",
    vencimento: "10/04/2026",
    forma: "Pix",
    valor: "R$ 199,90",
    status: "Pendente",
  },
  {
    descricao: "Serviço avulso João",
    categoria: "Serviços",
    vencimento: "05/04/2026",
    forma: "Cartão",
    valor: "R$ 199,90",
    status: "Pago",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Conta["status"] }) {
  if (status === "Pago")
    return (
      <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 text-[10px] font-semibold px-2 py-0.5">
        Pago
      </Badge>
    );
  if (status === "Atrasado")
    return (
      <Badge className="bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/20 text-[10px] font-semibold px-2 py-0.5">
        Atrasado
      </Badge>
    );
  return (
    <Badge className="bg-[#f5b82e]/15 text-[#f5b82e] border border-[#f5b82e]/30 hover:bg-[#f5b82e]/20 text-[10px] font-semibold px-2 py-0.5">
      Pendente
    </Badge>
  );
}

// ─── Componente: DatePickerField ───────────────────────────────────────────────
// Segue exatamente o padrão do componente DatePickerSimple do projeto

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

  return (
    <Field className="flex-1 min-w-[180px]">
      <FieldLabel
        htmlFor={id}
        className="text-[10px] font-bold uppercase tracking-widest text-[#f5b82e]"
      >
        {label}
      </FieldLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger>
          <Button
            id={id}
            variant="outline"
            className="w-full justify-between font-normal bg-[#0d1117] border-[#30363d] text-white hover:bg-[#0d1117] hover:border-[#f5b82e]/50 hover:text-white h-10 text-sm"
          >
            <span className={date ? "text-white" : "text-[#8b949e]"}>
              {date ? date.toLocaleDateString("pt-BR") : "dd/mm/aaaa"}
            </span>
            <Calendar className="size-3.5 text-[#8b949e] shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto overflow-hidden p-0 bg-[#161b22] border-[#30363d]"
          align="start"
        >
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
              months: "text-white",
              caption: "text-white",
              caption_label: "text-white font-semibold",
              nav_button:
                "text-[#8b949e] hover:text-white hover:bg-[#21262d] rounded-md",
              head_cell: "text-[#8b949e] text-xs font-medium",
              day: "text-white hover:bg-[#21262d] rounded-md transition-colors",
              day_selected:
                "bg-[#f5b82e] !text-black font-bold hover:bg-[#d9a326] rounded-md",
              day_today: "text-[#f5b82e] font-bold",
              day_outside: "text-[#4d5562]",
            }}
          />
        </PopoverContent>
      </Popover>
    </Field>
  );
}

// ─── Componente: FilialField ───────────────────────────────────────────────────

function FilialField({
  filial,
  onSelect,
}: {
  filial: string;
  onSelect: (f: string) => void;
}) {
  return (
    <Field className="flex-1 min-w-[180px]">
      <FieldLabel
        htmlFor="filial"
        className="text-[10px] font-bold uppercase tracking-widest text-[#f5b82e]"
      >
        Filial
      </FieldLabel>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button
            id="filial"
            variant="outline"
            className="w-full justify-between font-normal bg-[#0d1117] border-[#30363d] text-white hover:bg-[#0d1117] hover:border-[#f5b82e]/50 hover:text-white h-10 text-sm"
          >
            <span className="truncate">{filial}</span>
            <ChevronDown className="size-3.5 text-[#8b949e] shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-[#161b22] border-[#30363d] text-white min-w-[200px]">
          {[
            "Todas as filiais",
            "Filial Centro",
            "Filial Norte",
            "Filial Sul",
          ].map((f) => (
            <DropdownMenuItem
              key={f}
              onClick={() => onSelect(f)}
              className="text-xs hover:bg-[#21262d] cursor-pointer"
            >
              {f}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </Field>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function FinanceiroPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("contas_pagar");
  const [search, setSearch] = useState("");
  const [filial, setFilial] = useState("Todas as filiais");
  const [dataInicial, setDataInicial] = useState<Date | undefined>();
  const [dataFinal, setDataFinal] = useState<Date | undefined>();

  const contas =
    activeTab === "contas_pagar"
      ? CONTAS_PAGAR
      : activeTab === "contas_receber"
        ? CONTAS_RECEBER
        : [];

  const filtered = contas.filter(
    (c) =>
      c.descricao.toLowerCase().includes(search.toLowerCase()) ||
      c.categoria.toLowerCase().includes(search.toLowerCase()),
  );

  const searchPlaceholder =
    activeTab === "contas_pagar"
      ? "Buscar despesa..."
      : activeTab === "contas_receber"
        ? "Buscar receita..."
        : "Buscar categoria...";

  return (
    <div className="space-y-5 p-4 md:p-6 bg-[#0d1117] min-h-screen text-white">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Financeiro
          </h1>
          <p className="text-[#8b949e] text-sm mt-1">
            Controle financeiro completo
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            className="bg-[#161b22] border-[#30363d] text-white hover:bg-[#21262d] h-9 text-xs"
          >
            <RefreshCw className="size-3.5 mr-1.5" />
            Gerar Comissões
          </Button>
          <Button
            variant="outline"
            className="bg-[#161b22] border-[#30363d] text-white hover:bg-[#21262d] h-9 text-xs"
          >
            <Plus className="size-3.5 mr-1.5" />
            Despesa
          </Button>
          <Button className="bg-[#f5b82e] hover:bg-[#d9a326] text-black font-bold h-9 text-xs">
            <Plus className="size-3.5 mr-1.5" />
            Receita
          </Button>
        </div>
      </div>

      {/* ── Filtros ── */}
      <Card className="bg-[#161b22] border-[#30363d]">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <FilialField filial={filial} onSelect={setFilial} />

            <DatePickerSimple />

            <DatePickerSimple />

            {/* Botão Filtrar alinhado com os campos */}
            <div className="flex flex-col justify-end">
              {/* Espaço equivalente ao FieldLabel para alinhar verticalmente */}
              <div className="h-[22px]" />
              <Button
                className="
                  cursor-pointer h-10 px-5 text-xs font-bold uppercase tracking-widest
                  bg-[#f5b82e] text-black hover:bg-[#d9a326]
                  hover:shadow-[0_0_16px_rgba(245,184,46,0.35)]
                  transition-all gap-2
                "
              >
                <SlidersHorizontal className="size-3.5" />
                Filtrar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Row 1: Contas a Pagar ── */}
      <SummaryRow
        title="Contas a Pagar"
        icon={<ArrowDownRight className="size-4" />}
        iconColor="text-red-500"
        accentColor="border-red-500/30"
        cards={[
          {
            label: "Vencidos",
            value: "R$ 4.700,00",
            valueColor: "text-red-500",
            icon: <AlertCircle className="size-3.5" />,
            iconColor: "text-red-500",
            bg: "bg-[#20060a]",
          },
          {
            label: "A Vencer",
            value: "R$ 0,00",
            valueColor: "text-[#f5b82e]",
            icon: <Clock className="size-3.5" />,
            iconColor: "text-[#f5b82e]",
            bg: "bg-[#241a06]",
          },
          {
            label: "Pagos",
            value: "R$ 2.530,00",
            valueColor: "text-emerald-500",
            icon: <CheckCircle2 className="size-3.5" />,
            iconColor: "text-emerald-500",
            bg: "bg-[#062016]",
          },
          {
            label: "Total a Pagar",
            value: "R$ 7.230,00",
            valueColor: "text-white",
            icon: <Wallet className="size-3.5" />,
            iconColor: "text-[#8b949e]",
            bg: "bg-[#161b22]",
          },
        ]}
      />

      {/* ── Row 2: Contas a Receber ── */}
      <SummaryRow
        title="Contas a Receber"
        icon={<ArrowUpRight className="size-4" />}
        iconColor="text-emerald-500"
        accentColor="border-emerald-500/30"
        cards={[
          {
            label: "Não Recebidos",
            value: "R$ 0,00",
            valueColor: "text-red-500",
            icon: <AlertCircle className="size-3.5" />,
            iconColor: "text-red-500",
            bg: "bg-[#20060a]",
          },
          {
            label: "A Receber",
            value: "R$ 199,90",
            valueColor: "text-[#f5b82e]",
            icon: <Clock className="size-3.5" />,
            iconColor: "text-[#f5b82e]",
            bg: "bg-[#241a06]",
          },
          {
            label: "Recebido",
            value: "R$ 199,90",
            valueColor: "text-emerald-500",
            icon: <CheckCircle2 className="size-3.5" />,
            iconColor: "text-emerald-500",
            bg: "bg-[#062016]",
          },
          {
            label: "Total a Receber",
            value: "R$ 399,80",
            valueColor: "text-white",
            icon: <Wallet className="size-3.5" />,
            iconColor: "text-[#8b949e]",
            bg: "bg-[#161b22]",
          },
        ]}
      />

      {/* ── Row 3: Balanço ── */}
      <SummaryRow
        title="Balanço"
        icon={<Scale className="size-4" />}
        iconColor="text-blue-400"
        accentColor="border-blue-400/30"
        cards={[
          {
            label: "Balanço",
            value: "-R$ 2.422,00",
            valueColor: "text-[#f5b82e]",
            icon: <DollarSign className="size-3.5" />,
            iconColor: "text-[#f5b82e]",
            bg: "bg-[#241a06]",
          },
          {
            label: "Balanço Projetado",
            value: "-R$ 6.722,20",
            valueColor: "text-blue-400",
            icon: <TrendingUp className="size-3.5" />,
            iconColor: "text-blue-400",
            bg: "bg-[#060d20]",
          },
        ]}
      />

      {/* ── Tabela ── */}
      <Card className="bg-[#161b22] border-[#30363d]">
        <CardContent className="p-0">
          <div className="px-4 pt-4 flex gap-1 flex-wrap">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setSearch("");
                }}
                className={`
                  px-4 py-2 rounded-md text-xs font-semibold transition-colors
                  ${
                    activeTab === tab.key
                      ? "bg-[#f5b82e] text-black"
                      : "text-[#8b949e] hover:text-white hover:bg-[#21262d]"
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8b949e]" />
              <Input
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-[#0d1117] border-[#30363d] text-white placeholder:text-[#8b949e] h-9 text-sm focus-visible:ring-[#f5b82e]/40"
              />
            </div>
          </div>

          {activeTab === "categorias" && (
            <div className="px-4 pb-6">
              <EmptyState message="Nenhuma categoria cadastrada." />
            </div>
          )}

          {activeTab !== "categorias" && (
            <>
              <div className="hidden md:block">
                <Table>
                  <TableHeader className="border-t border-[#30363d]">
                    <TableRow className="border-[#30363d] hover:bg-transparent">
                      {[
                        "Descrição",
                        "Categoria",
                        "Vencimento",
                        "Forma",
                        "Valor",
                        "Status",
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
                    {filtered.length === 0 ? (
                      <TableRow className="border-[#30363d] hover:bg-transparent">
                        <TableCell colSpan={6} className="py-16">
                          <EmptyState message="Nenhum registro encontrado." />
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((conta, i) => (
                        <TableRow
                          key={i}
                          className="border-[#30363d] hover:bg-[#21262d]/50 transition-colors"
                        >
                          <TableCell className="px-4 py-4 font-semibold text-white text-sm">
                            {conta.descricao}
                          </TableCell>
                          <TableCell className="px-4 py-4 text-[#8b949e] text-sm">
                            {conta.categoria}
                          </TableCell>
                          <TableCell className="px-4 py-4 text-[#8b949e] text-sm">
                            {conta.vencimento}
                          </TableCell>
                          <TableCell className="px-4 py-4 text-[#8b949e] text-sm">
                            {conta.forma}
                          </TableCell>
                          <TableCell className="px-4 py-4 text-red-500 font-semibold text-sm">
                            {conta.valor}
                          </TableCell>
                          <TableCell className="px-4 py-4">
                            <StatusBadge status={conta.status} />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="md:hidden px-4 pb-4 space-y-3">
                {filtered.length === 0 ? (
                  <EmptyState message="Nenhum registro encontrado." />
                ) : (
                  filtered.map((conta, i) => (
                    <div
                      key={i}
                      className="bg-[#0d1117] rounded-lg p-4 border border-[#30363d] space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-white text-sm">
                          {conta.descricao}
                        </span>
                        <StatusBadge status={conta.status} />
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-[#8b949e]">
                        <span>
                          <span className="text-[#4d5562]">Categoria: </span>
                          {conta.categoria}
                        </span>
                        <span>
                          <span className="text-[#4d5562]">Forma: </span>
                          {conta.forma}
                        </span>
                        <span>
                          <span className="text-[#4d5562]">Vencimento: </span>
                          {conta.vencimento}
                        </span>
                        <span className="text-red-500 font-bold">
                          {conta.valor}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

type SummaryCardData = {
  label: string;
  value: string;
  valueColor: string;
  icon: React.ReactNode;
  iconColor: string;
  bg: string;
};

function SummaryRow({
  title,
  icon,
  iconColor,
  accentColor,
  cards,
}: {
  title: string;
  icon: React.ReactNode;
  iconColor: string;
  accentColor: string;
  cards: SummaryCardData[];
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 pl-1">
        <span className={iconColor}>{icon}</span>
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#8b949e] whitespace-nowrap">
          {title}
        </h2>
        <div className={`flex-1 h-px border-t ${accentColor}`} />
      </div>
      <div
        className={`grid gap-3 ${cards.length === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2 lg:grid-cols-4"}`}
      >
        {cards.map((card) => (
          <Card
            key={card.label}
            className={`${card.bg} border-[#30363d] shadow-none`}
          >
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold text-[#8b949e] uppercase tracking-wider leading-none">
                  {card.label}
                </p>
                <span className={card.iconColor}>{card.icon}</span>
              </div>
              <div
                className={`text-lg md:text-xl font-bold ${card.valueColor}`}
              >
                {card.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3 text-[#8b949e]">
      <DollarSign className="size-10 opacity-30" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
