/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { useState } from "react";
import {
  Plus,
  Search,
  Download,
  Package,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  CalendarIcon,
  FileText,
  ShoppingCart,
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
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { ptBR } from "date-fns/locale";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type TabKey = "estoque_atual" | "entrada_saida" | "relatorio" | "vendas";

type Produto = {
  nome: string;
  qtdAtual: number;
  qtdMinima: number;
  valorEstoque: string;
  potVenda: string;
  status: "Ok" | "Baixo" | "Crítico";
};

type Movimentacao = {
  id: string;
  produto: string;
  tipo: "Entrada" | "Saída";
  qtd: number;
  criadoEm: string;
  observacao: string;
};

type RelatorioItem = {
  produto: string;
  qtd: number;
  valorUnit: string;
  tipo: "Entrada" | "Saída";
  observacao: string;
  data: string;
};

type VendaItem = {
  produto: string;
  cliente: string;
  telefone: string;
  profissional: string;
  data: string;
};

// ─── Mock data ────────────────────────────────────────────────────────────────

const TABS: { key: TabKey; label: string }[] = [
  { key: "estoque_atual", label: "Estoque Atual" },
  { key: "entrada_saida", label: "Entrada/Saída" },
  { key: "relatorio", label: "Relatório" },
  { key: "vendas", label: "Vendas" },
];

const PRODUTOS: Produto[] = [
  {
    nome: "Pomada Modeladora",
    qtdAtual: 12,
    qtdMinima: 5,
    valorEstoque: "R$ 360,00",
    potVenda: "R$ 600,00",
    status: "Ok",
  },
  {
    nome: "Shampoo Antiqueda",
    qtdAtual: 3,
    qtdMinima: 5,
    valorEstoque: "R$ 120,00",
    potVenda: "R$ 210,00",
    status: "Baixo",
  },
  {
    nome: "Óleo de Barba",
    qtdAtual: 1,
    qtdMinima: 4,
    valorEstoque: "R$ 45,00",
    potVenda: "R$ 90,00",
    status: "Crítico",
  },
  {
    nome: "Cera Matte",
    qtdAtual: 8,
    qtdMinima: 3,
    valorEstoque: "R$ 280,00",
    potVenda: "R$ 480,00",
    status: "Ok",
  },
];

const MOVIMENTACOES: Movimentacao[] = [
  {
    id: "#001",
    produto: "Pomada Modeladora",
    tipo: "Entrada",
    qtd: 10,
    criadoEm: "08/04/2026",
    observacao: "Reposição mensal",
  },
  {
    id: "#002",
    produto: "Shampoo Antiqueda",
    tipo: "Saída",
    qtd: 2,
    criadoEm: "07/04/2026",
    observacao: "Uso interno",
  },
  {
    id: "#003",
    produto: "Óleo de Barba",
    tipo: "Saída",
    qtd: 3,
    criadoEm: "06/04/2026",
    observacao: "Venda balcão",
  },
];

const RELATORIO: RelatorioItem[] = [
  {
    produto: "Pomada Modeladora",
    qtd: 10,
    valorUnit: "R$ 30,00",
    tipo: "Entrada",
    observacao: "Reposição mensal",
    data: "08/04/2026",
  },
  {
    produto: "Shampoo Antiqueda",
    qtd: 2,
    valorUnit: "R$ 40,00",
    tipo: "Saída",
    observacao: "Uso interno",
    data: "07/04/2026",
  },
];

const VENDAS: VendaItem[] = [
  {
    produto: "Pomada Modeladora",
    cliente: "João Silva",
    telefone: "(81) 99999-0001",
    profissional: "Carlos",
    data: "08/04/2026",
  },
  {
    produto: "Óleo de Barba",
    cliente: "Pedro Lima",
    telefone: "(81) 99999-0002",
    profissional: "Marcus",
    data: "06/04/2026",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Produto["status"] }) {
  if (status === "Ok")
    return (
      <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 text-[10px] font-semibold px-2 py-0.5">
        Ok
      </Badge>
    );
  if (status === "Crítico")
    return (
      <Badge className="bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/20 text-[10px] font-semibold px-2 py-0.5">
        Crítico
      </Badge>
    );
  return (
    <Badge className="bg-[#f5b82e]/15 text-[#f5b82e] border border-[#f5b82e]/30 hover:bg-[#f5b82e]/20 text-[10px] font-semibold px-2 py-0.5">
      Baixo
    </Badge>
  );
}

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

  const formatted = date
    ? date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : null;

  return (
    <Field className="flex-1 min-w-[160px]">
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

// ─── SelectField ──────────────────────────────────────────────────────────────

function SelectField({
  id,
  label,
  value,
  options,
  onSelect,
}: {
  id: string;
  label: string;
  value: string;
  options: string[];
  onSelect: (v: string) => void;
}) {
  return (
    <Field className="flex-1 min-w-[140px]">
      <FieldLabel
        htmlFor={id}
        className="text-[10px] font-bold uppercase tracking-widest text-[#f5b82e]"
      >
        {label}
      </FieldLabel>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <button
            id={id}
            type="button"
            className="
              w-full h-10 px-3 rounded-md border border-[#30363d]
              bg-[#0d1117] text-sm text-white
              flex items-center justify-between gap-2
              hover:border-[#f5b82e]/40 transition-colors outline-none
            "
          >
            <span className="truncate">{value}</span>
            <ChevronDown className="size-3.5 text-[#8b949e] shrink-0" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-[#161b22] border-[#30363d] text-white min-w-[160px]">
          {options.map((opt) => (
            <DropdownMenuItem
              key={opt}
              onClick={() => onSelect(opt)}
              className="text-xs hover:bg-[#21262d] cursor-pointer"
            >
              {opt}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </Field>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

function EmptyState({
  message,
  icon,
}: {
  message: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-3 text-[#8b949e]">
      <div className="opacity-30">
        {icon ?? <Package className="size-10" />}
      </div>
      <p className="text-sm">{message}</p>
    </div>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function EstoquePage() {
  const [activeTab, setActiveTab] = useState<TabKey>("estoque_atual");
  const [search, setSearch] = useState("");

  // Estoque Atual
  const [filtroStatus, setFiltroStatus] = useState("Todos");

  // Entrada/Saída
  const [searchMovimento, setSearchMovimento] = useState("");

  // Relatório
  const [relDataInicial, setRelDataInicial] = useState<Date | undefined>();
  const [relDataFinal, setRelDataFinal] = useState<Date | undefined>();
  const [relProduto, setRelProduto] = useState("Todos");
  const [relTipo, setRelTipo] = useState("Todos");

  // Vendas
  const [vendDataInicial, setVendDataInicial] = useState<Date | undefined>();
  const [vendDataFinal, setVendDataFinal] = useState<Date | undefined>();
  const [vendProduto, setVendProduto] = useState("Todos");
  const [vendProfissional, setVendProfissional] = useState("Todos");

  const produtosNomes = ["Todos", ...PRODUTOS.map((p) => p.nome)];

  const filteredProdutos = PRODUTOS.filter((p) => {
    const matchSearch = p.nome.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filtroStatus === "Todos" || p.status === filtroStatus;
    return matchSearch && matchStatus;
  });

  const filteredMovimentos = MOVIMENTACOES.filter((m) =>
    m.produto.toLowerCase().includes(searchMovimento.toLowerCase()),
  );

  return (
    <div className="space-y-5 p-4 md:p-6 bg-[#0d1117] min-h-screen text-white">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Estoque
          </h1>
          <p className="text-[#8b949e] text-sm mt-1">
            Controle de produtos e movimentações
          </p>
        </div>
        <Button className="cursor-pointer bg-[#f5b82e] hover:bg-[#d9a326] hover:shadow-[0_0_16px_rgba(245,184,46,0.35)] text-black font-bold h-9 text-xs transition-all self-start sm:self-auto">
          <Plus className="size-3.5 mr-1.5" />
          Nova Movimentação
        </Button>
      </div>

      {/* ── Cards de resumo ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="bg-[#161b22] border-[#30363d] shadow-none">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-[#8b949e] uppercase tracking-wider">
                Total em Estoque
              </p>
              <Package className="size-3.5 text-[#f5b82e]" />
            </div>
            <div className="text-xl md:text-2xl font-bold text-white">
              0 un.
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#161b22] border-[#30363d] shadow-none">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-[#8b949e] uppercase tracking-wider">
                Valor do Estoque
              </p>
              <TrendingUp className="size-3.5 text-blue-400" />
            </div>
            <div className="text-xl md:text-2xl font-bold text-blue-400">
              R$ 0,00
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#161b22] border-[#30363d] shadow-none">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-[#8b949e] uppercase tracking-wider">
                Potencial de Venda
              </p>
              <TrendingUp className="size-3.5 text-emerald-500" />
            </div>
            <div className="text-xl md:text-2xl font-bold text-emerald-500">
              R$ 0,00
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#20060a] border-[#30363d] shadow-none">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-[#8b949e] uppercase tracking-wider">
                Estoque Baixo
              </p>
              <AlertTriangle className="size-3.5 text-red-500" />
            </div>
            <div className="text-xl md:text-2xl font-bold text-red-500">0</div>
          </CardContent>
        </Card>
      </div>

      {/* ── Painel principal ── */}
      <Card className="bg-[#161b22] border-[#30363d]">
        <CardContent className="p-0">
          {/* Tabs */}
          <div className="px-4 pt-4 flex gap-1 flex-wrap border-b border-[#21262d] pb-0">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setSearch("");
                  setSearchMovimento("");
                }}
                className={`
                  px-4 py-2.5 text-xs font-semibold transition-colors rounded-t-md -mb-px
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

          {/* ── Tab: Estoque Atual ── */}
          {activeTab === "estoque_atual" && (
            <>
              <div className="p-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8b949e]" />
                  <Input
                    placeholder="Buscar produto..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 bg-[#0d1117] border-[#30363d] text-white placeholder:text-[#8b949e] h-9 text-sm focus-visible:ring-[#f5b82e]/40"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <button
                      type="button"
                      className="h-9 px-3 rounded-md border border-[#30363d] bg-[#0d1117] text-sm text-white flex items-center gap-2 hover:border-[#f5b82e]/40 transition-colors min-w-[110px]"
                    >
                      <span>{filtroStatus}</span>
                      <ChevronDown className="size-3.5 text-[#8b949e]" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-[#161b22] border-[#30363d] text-white">
                    {["Todos", "Ok", "Baixo", "Crítico"].map((s) => (
                      <DropdownMenuItem
                        key={s}
                        onClick={() => setFiltroStatus(s)}
                        className="text-xs hover:bg-[#21262d] cursor-pointer"
                      >
                        {s}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <button
                  type="button"
                  className="h-9 px-3 rounded-md border border-[#30363d] bg-[#0d1117] text-sm text-[#8b949e] flex items-center gap-2 hover:border-[#f5b82e]/40 hover:text-white transition-colors"
                >
                  <Download className="size-3.5" />
                  CSV
                </button>
              </div>

              <div className="hidden md:block">
                <Table>
                  <TableHeader className="border-t border-[#30363d]">
                    <TableRow className="border-[#30363d] hover:bg-transparent">
                      {[
                        "Produto",
                        "Qtd. Atual",
                        "Qtd. Mínima",
                        "Valor Estoque",
                        "Pot. Venda",
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
                    {filteredProdutos.length === 0 ? (
                      <TableRow className="border-[#30363d] hover:bg-transparent">
                        <TableCell colSpan={6} className="py-4">
                          <EmptyState message="Nenhum produto encontrado." />
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProdutos.map((p, i) => (
                        <TableRow
                          key={i}
                          className="border-[#30363d] hover:bg-[#21262d]/50 transition-colors"
                        >
                          <TableCell className="px-4 py-4 font-semibold text-white text-sm">
                            {p.nome}
                          </TableCell>
                          <TableCell className="px-4 py-4 text-[#8b949e] text-sm">
                            {p.qtdAtual}
                          </TableCell>
                          <TableCell className="px-4 py-4 text-[#8b949e] text-sm">
                            {p.qtdMinima}
                          </TableCell>
                          <TableCell className="px-4 py-4 text-[#8b949e] text-sm">
                            {p.valorEstoque}
                          </TableCell>
                          <TableCell className="px-4 py-4 text-emerald-500 font-semibold text-sm">
                            {p.potVenda}
                          </TableCell>
                          <TableCell className="px-4 py-4">
                            <StatusBadge status={p.status} />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile */}
              <div className="md:hidden px-4 pb-4 space-y-3">
                {filteredProdutos.length === 0 ? (
                  <EmptyState message="Nenhum produto encontrado." />
                ) : (
                  filteredProdutos.map((p, i) => (
                    <div
                      key={i}
                      className="bg-[#0d1117] rounded-lg p-4 border border-[#30363d] space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-white text-sm">
                          {p.nome}
                        </span>
                        <StatusBadge status={p.status} />
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-[#8b949e]">
                        <span>
                          <span className="text-[#4d5562]">Qtd. Atual: </span>
                          {p.qtdAtual}
                        </span>
                        <span>
                          <span className="text-[#4d5562]">Qtd. Mín.: </span>
                          {p.qtdMinima}
                        </span>
                        <span>
                          <span className="text-[#4d5562]">Valor Est.: </span>
                          {p.valorEstoque}
                        </span>
                        <span className="text-emerald-500 font-bold">
                          {p.potVenda}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {/* ── Tab: Entrada/Saída ── */}
          {activeTab === "entrada_saida" && (
            <>
              <div className="p-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8b949e]" />
                  <Input
                    placeholder="Buscar movimentação..."
                    value={searchMovimento}
                    onChange={(e) => setSearchMovimento(e.target.value)}
                    className="pl-9 bg-[#0d1117] border-[#30363d] text-white placeholder:text-[#8b949e] h-9 text-sm focus-visible:ring-[#f5b82e]/40"
                  />
                </div>
                <Button className="bg-[#f5b82e] hover:bg-[#d9a326] text-black font-bold h-9 text-xs shrink-0">
                  <Plus className="size-3.5 mr-1.5" />
                  Novo
                </Button>
                <button
                  type="button"
                  className="h-9 px-3 rounded-md border border-[#30363d] bg-[#0d1117] text-sm text-[#8b949e] flex items-center gap-2 hover:border-[#f5b82e]/40 hover:text-white transition-colors"
                >
                  <Download className="size-3.5" />
                  CSV
                </button>
              </div>

              <div className="hidden md:block">
                <Table>
                  <TableHeader className="border-t border-[#30363d]">
                    <TableRow className="border-[#30363d] hover:bg-transparent">
                      {[
                        "ID",
                        "Produto",
                        "Tipo",
                        "Qtd.",
                        "Criado em",
                        "Observação",
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
                    {filteredMovimentos.length === 0 ? (
                      <TableRow className="border-[#30363d] hover:bg-transparent">
                        <TableCell colSpan={6} className="py-4">
                          <EmptyState message="Nenhuma movimentação." />
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredMovimentos.map((m, i) => (
                        <TableRow
                          key={i}
                          className="border-[#30363d] hover:bg-[#21262d]/50 transition-colors"
                        >
                          <TableCell className="px-4 py-4 text-[#8b949e] text-sm font-mono">
                            {m.id}
                          </TableCell>
                          <TableCell className="px-4 py-4 font-semibold text-white text-sm">
                            {m.produto}
                          </TableCell>
                          <TableCell className="px-4 py-4">
                            <TipoBadge tipo={m.tipo} />
                          </TableCell>
                          <TableCell className="px-4 py-4 text-[#8b949e] text-sm">
                            {m.qtd}
                          </TableCell>
                          <TableCell className="px-4 py-4 text-[#8b949e] text-sm">
                            {m.criadoEm}
                          </TableCell>
                          <TableCell className="px-4 py-4 text-[#8b949e] text-sm">
                            {m.observacao}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile */}
              <div className="md:hidden px-4 pb-4 space-y-3">
                {filteredMovimentos.map((m, i) => (
                  <div
                    key={i}
                    className="bg-[#0d1117] rounded-lg p-4 border border-[#30363d] space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-white text-sm">
                        {m.produto}
                      </span>
                      <TipoBadge tipo={m.tipo} />
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-[#8b949e]">
                      <span>
                        <span className="text-[#4d5562]">ID: </span>
                        {m.id}
                      </span>
                      <span>
                        <span className="text-[#4d5562]">Qtd.: </span>
                        {m.qtd}
                      </span>
                      <span>
                        <span className="text-[#4d5562]">Data: </span>
                        {m.criadoEm}
                      </span>
                      <span>
                        <span className="text-[#4d5562]">Obs.: </span>
                        {m.observacao}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── Tab: Relatório ── */}
          {activeTab === "relatorio" && (
            <>
              <div className="p-4 flex flex-wrap gap-4 items-end">
                <DatePickerField
                  id="rel-data-inicial"
                  label="Data Inicial"
                  date={relDataInicial}
                  onSelect={setRelDataInicial}
                />
                <DatePickerField
                  id="rel-data-final"
                  label="Data Final"
                  date={relDataFinal}
                  onSelect={setRelDataFinal}
                />
                <SelectField
                  id="rel-produto"
                  label="Produto"
                  value={relProduto}
                  options={produtosNomes}
                  onSelect={setRelProduto}
                />
                <SelectField
                  id="rel-tipo"
                  label="Tipo"
                  value={relTipo}
                  options={["Todos", "Entrada", "Saída"]}
                  onSelect={setRelTipo}
                />
              </div>

              <div className="hidden md:block">
                <Table>
                  <TableHeader className="border-t border-[#30363d]">
                    <TableRow className="border-[#30363d] hover:bg-transparent">
                      {[
                        "Produto",
                        "Qtd.",
                        "Valor Unit.",
                        "Tipo",
                        "Observação",
                        "Data",
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
                    {RELATORIO.length === 0 ? (
                      <TableRow className="border-[#30363d] hover:bg-transparent">
                        <TableCell colSpan={6} className="py-4">
                          <EmptyState
                            message="Nenhum dado encontrado."
                            icon={<FileText className="size-10" />}
                          />
                        </TableCell>
                      </TableRow>
                    ) : (
                      RELATORIO.map((r, i) => (
                        <TableRow
                          key={i}
                          className="border-[#30363d] hover:bg-[#21262d]/50 transition-colors"
                        >
                          <TableCell className="px-4 py-4 font-semibold text-white text-sm">
                            {r.produto}
                          </TableCell>
                          <TableCell className="px-4 py-4 text-[#8b949e] text-sm">
                            {r.qtd}
                          </TableCell>
                          <TableCell className="px-4 py-4 text-[#8b949e] text-sm">
                            {r.valorUnit}
                          </TableCell>
                          <TableCell className="px-4 py-4">
                            <TipoBadge tipo={r.tipo} />
                          </TableCell>
                          <TableCell className="px-4 py-4 text-[#8b949e] text-sm">
                            {r.observacao}
                          </TableCell>
                          <TableCell className="px-4 py-4 text-[#8b949e] text-sm">
                            {r.data}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile */}
              <div className="md:hidden px-4 pb-4 space-y-3">
                {RELATORIO.map((r, i) => (
                  <div
                    key={i}
                    className="bg-[#0d1117] rounded-lg p-4 border border-[#30363d] space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-white text-sm">
                        {r.produto}
                      </span>
                      <TipoBadge tipo={r.tipo} />
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-[#8b949e]">
                      <span>
                        <span className="text-[#4d5562]">Qtd.: </span>
                        {r.qtd}
                      </span>
                      <span>
                        <span className="text-[#4d5562]">Valor Unit.: </span>
                        {r.valorUnit}
                      </span>
                      <span>
                        <span className="text-[#4d5562]">Data: </span>
                        {r.data}
                      </span>
                      <span>
                        <span className="text-[#4d5562]">Obs.: </span>
                        {r.observacao}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── Tab: Vendas ── */}
          {activeTab === "vendas" && (
            <>
              <div className="p-4 flex flex-wrap gap-4 items-end">
                <DatePickerField
                  id="vend-data-inicial"
                  label="Data Inicial"
                  date={vendDataInicial}
                  onSelect={setVendDataInicial}
                />
                <DatePickerField
                  id="vend-data-final"
                  label="Data Final"
                  date={vendDataFinal}
                  onSelect={setVendDataFinal}
                />
                <SelectField
                  id="vend-produto"
                  label="Produto"
                  value={vendProduto}
                  options={produtosNomes}
                  onSelect={setVendProduto}
                />
                <SelectField
                  id="vend-profissional"
                  label="Profissional"
                  value={vendProfissional}
                  options={["Todos", "Carlos", "Marcus"]}
                  onSelect={setVendProfissional}
                />
              </div>

              <div className="hidden md:block">
                <Table>
                  <TableHeader className="border-t border-[#30363d]">
                    <TableRow className="border-[#30363d] hover:bg-transparent">
                      {[
                        "Produto",
                        "Cliente",
                        "Telefone",
                        "Profissional",
                        "Data",
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
                    {VENDAS.length === 0 ? (
                      <TableRow className="border-[#30363d] hover:bg-transparent">
                        <TableCell colSpan={5} className="py-4">
                          <EmptyState
                            message="Nenhuma venda encontrada."
                            icon={<ShoppingCart className="size-10" />}
                          />
                        </TableCell>
                      </TableRow>
                    ) : (
                      VENDAS.map((v, i) => (
                        <TableRow
                          key={i}
                          className="border-[#30363d] hover:bg-[#21262d]/50 transition-colors"
                        >
                          <TableCell className="px-4 py-4 font-semibold text-white text-sm">
                            {v.produto}
                          </TableCell>
                          <TableCell className="px-4 py-4 text-[#8b949e] text-sm">
                            {v.cliente}
                          </TableCell>
                          <TableCell className="px-4 py-4 text-[#8b949e] text-sm">
                            {v.telefone}
                          </TableCell>
                          <TableCell className="px-4 py-4 text-[#8b949e] text-sm">
                            {v.profissional}
                          </TableCell>
                          <TableCell className="px-4 py-4 text-[#8b949e] text-sm">
                            {v.data}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile */}
              <div className="md:hidden px-4 pb-4 space-y-3">
                {VENDAS.map((v, i) => (
                  <div
                    key={i}
                    className="bg-[#0d1117] rounded-lg p-4 border border-[#30363d] space-y-2"
                  >
                    <span className="font-semibold text-white text-sm">
                      {v.produto}
                    </span>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-[#8b949e]">
                      <span>
                        <span className="text-[#4d5562]">Cliente: </span>
                        {v.cliente}
                      </span>
                      <span>
                        <span className="text-[#4d5562]">Tel.: </span>
                        {v.telefone}
                      </span>
                      <span>
                        <span className="text-[#4d5562]">Prof.: </span>
                        {v.profissional}
                      </span>
                      <span>
                        <span className="text-[#4d5562]">Data: </span>
                        {v.data}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
