"use client";

import { useState, type ReactNode } from "react";
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
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  PageHeader,
  EmptyState,
  StatusBadge,
  DatePickerField,
} from "@/components/shared";
import { formatBRL, formatDate } from "@/utils/format";
import {
  CONTAS_PAGAR_MOCK,
  CONTAS_RECEBER_MOCK,
} from "@/mock/financial";
import type { Conta, ContaStatus } from "@/types/financial.types";
import type { Tone } from "@/types/common.types";

// ─── Configuração ─────────────────────────────────────────────────────────────

type TabKey = "contas_pagar" | "contas_receber" | "categorias";

const TABS: { key: TabKey; label: string }[] = [
  { key: "contas_pagar", label: "Contas a Pagar" },
  { key: "contas_receber", label: "Contas a Receber" },
  { key: "categorias", label: "Categorias" },
];

const STATUS_LABELS: Record<ContaStatus, string> = {
  pendente: "Pendente",
  pago: "Pago",
  atrasado: "Atrasado",
};

const STATUS_TONE: Record<ContaStatus, Tone> = {
  pendente: "warning",
  pago: "success",
  atrasado: "danger",
};

// ─── Filial ────────────────────────────────────────────────────────────────────

function FilialField({
  filial,
  onSelect,
}: {
  filial: string;
  onSelect: (f: string) => void;
}) {
  return (
    <Field className="flex-1 min-w-45">
      <FieldLabel
        htmlFor="filial"
        className="text-[10px] font-bold uppercase tracking-widest text-brand"
      >
        Filial
      </FieldLabel>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button
            id="filial"
            variant="outline"
            className="w-full justify-between font-normal bg-surface-base border-border text-foreground hover:bg-surface-base hover:border-brand/50 hover:text-foreground h-10 text-sm"
          >
            <span className="truncate">{filial}</span>
            <ChevronDown className="size-3.5 text-muted-foreground shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-surface-raised border-border text-foreground min-w-50">
          {[
            "Todas as filiais",
            "Filial Centro",
            "Filial Norte",
            "Filial Sul",
          ].map((f) => (
            <DropdownMenuItem
              key={f}
              onClick={() => onSelect(f)}
              className="text-xs hover:bg-surface-elevated cursor-pointer"
            >
              {f}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </Field>
  );
}

// ─── SummaryRow ────────────────────────────────────────────────────────────────

interface SummaryCardData {
  label: string;
  value: string;
  valueColor: string;
  icon: ReactNode;
  iconColor: string;
  bg: string;
}

function SummaryRow({
  title,
  icon,
  iconColor,
  accentColor,
  cards,
}: {
  title: string;
  icon: ReactNode;
  iconColor: string;
  accentColor: string;
  cards: SummaryCardData[];
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 pl-1">
        <span className={iconColor}>{icon}</span>
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
          {title}
        </h2>
        <div className={`flex-1 h-px border-t ${accentColor}`} />
      </div>
      <div
        className={`grid gap-3 ${
          cards.length === 2
            ? "grid-cols-1 sm:grid-cols-2"
            : "grid-cols-2 lg:grid-cols-4"
        }`}
      >
        {cards.map((card) => (
          <Card
            key={card.label}
            className={`${card.bg} border-border shadow-none`}
          >
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none">
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

// ─── Página ───────────────────────────────────────────────────────────────────

export default function FinanceiroPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("contas_pagar");
  const [search, setSearch] = useState("");
  const [filial, setFilial] = useState("Todas as filiais");
  const [dataInicial, setDataInicial] = useState<Date | undefined>();
  const [dataFinal, setDataFinal] = useState<Date | undefined>();

  const contas: Conta[] =
    activeTab === "contas_pagar"
      ? CONTAS_PAGAR_MOCK
      : activeTab === "contas_receber"
        ? CONTAS_RECEBER_MOCK
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
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Financeiro"
        subtitle="Controle financeiro completo"
        actions={
          <>
            <Button
              variant="outline"
              className="bg-surface-raised border-border text-foreground hover:bg-surface-elevated h-9 text-xs"
            >
              <RefreshCw className="size-3.5 mr-1.5" />
              Gerar Comissões
            </Button>
            <Button
              variant="outline"
              className="bg-surface-raised border-border text-foreground hover:bg-surface-elevated h-9 text-xs"
            >
              <Plus className="size-3.5 mr-1.5" />
              Despesa
            </Button>
            <Button className="bg-brand hover:bg-brand-hover text-brand-foreground font-bold h-9 text-xs">
              <Plus className="size-3.5 mr-1.5" />
              Receita
            </Button>
          </>
        }
      />

      {/* Filtros */}
      <Card className="bg-surface-raised border-border">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <FilialField filial={filial} onSelect={setFilial} />

            <DatePickerField
              id="financial-data-inicial"
              label="Data Inicial"
              date={dataInicial}
              onChange={setDataInicial}
            />
            <DatePickerField
              id="financial-data-final"
              label="Data Final"
              date={dataFinal}
              onChange={setDataFinal}
            />

            <div className="flex flex-col justify-end">
              <div className="h-5.5" />
              <Button className="cursor-pointer h-10 px-5 text-xs font-bold uppercase tracking-widest bg-brand text-brand-foreground hover:bg-brand-hover hover:shadow-[0_0_16px_rgba(245,184,46,0.35)] transition-all gap-2">
                <SlidersHorizontal className="size-3.5" />
                Filtrar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Row 1: Contas a Pagar */}
      <SummaryRow
        title="Contas a Pagar"
        icon={<ArrowDownRight className="size-4" />}
        iconColor="text-danger-foreground"
        accentColor="border-danger/30"
        cards={[
          {
            label: "Vencidos",
            value: "R$ 4.700,00",
            valueColor: "text-danger-foreground",
            icon: <AlertCircle className="size-3.5" />,
            iconColor: "text-danger-foreground",
            bg: "bg-danger-bg",
          },
          {
            label: "A Vencer",
            value: "R$ 0,00",
            valueColor: "text-brand",
            icon: <Clock className="size-3.5" />,
            iconColor: "text-brand",
            bg: "bg-warning-bg",
          },
          {
            label: "Pagos",
            value: "R$ 2.530,00",
            valueColor: "text-success-foreground",
            icon: <CheckCircle2 className="size-3.5" />,
            iconColor: "text-success-foreground",
            bg: "bg-success-bg",
          },
          {
            label: "Total a Pagar",
            value: "R$ 7.230,00",
            valueColor: "text-foreground",
            icon: <Wallet className="size-3.5" />,
            iconColor: "text-muted-foreground",
            bg: "bg-surface-raised",
          },
        ]}
      />

      {/* Row 2: Contas a Receber */}
      <SummaryRow
        title="Contas a Receber"
        icon={<ArrowUpRight className="size-4" />}
        iconColor="text-success-foreground"
        accentColor="border-success/30"
        cards={[
          {
            label: "Não Recebidos",
            value: "R$ 0,00",
            valueColor: "text-danger-foreground",
            icon: <AlertCircle className="size-3.5" />,
            iconColor: "text-danger-foreground",
            bg: "bg-danger-bg",
          },
          {
            label: "A Receber",
            value: "R$ 199,90",
            valueColor: "text-brand",
            icon: <Clock className="size-3.5" />,
            iconColor: "text-brand",
            bg: "bg-warning-bg",
          },
          {
            label: "Recebido",
            value: "R$ 199,90",
            valueColor: "text-success-foreground",
            icon: <CheckCircle2 className="size-3.5" />,
            iconColor: "text-success-foreground",
            bg: "bg-success-bg",
          },
          {
            label: "Total a Receber",
            value: "R$ 399,80",
            valueColor: "text-foreground",
            icon: <Wallet className="size-3.5" />,
            iconColor: "text-muted-foreground",
            bg: "bg-surface-raised",
          },
        ]}
      />

      {/* Row 3: Balanço */}
      <SummaryRow
        title="Balanço"
        icon={<Scale className="size-4" />}
        iconColor="text-info-foreground"
        accentColor="border-info/30"
        cards={[
          {
            label: "Balanço",
            value: "-R$ 2.422,00",
            valueColor: "text-brand",
            icon: <DollarSign className="size-3.5" />,
            iconColor: "text-brand",
            bg: "bg-warning-bg",
          },
          {
            label: "Balanço Projetado",
            value: "-R$ 6.722,20",
            valueColor: "text-info-foreground",
            icon: <TrendingUp className="size-3.5" />,
            iconColor: "text-info-foreground",
            bg: "bg-info-bg",
          },
        ]}
      />

      {/* Tabela */}
      <Card className="bg-surface-raised border-border">
        <CardContent className="p-0">
          <div className="px-4 pt-4 flex gap-1 flex-wrap">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setSearch("");
                }}
                className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors ${
                  activeTab === tab.key
                    ? "bg-brand text-brand-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-surface-base border-border text-foreground placeholder:text-muted-foreground h-9 text-sm focus-visible:ring-brand/40"
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
                  <TableHeader className="border-t border-border">
                    <TableRow className="border-border hover:bg-transparent">
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
                          className="text-muted-foreground text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto"
                        >
                          {col}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow className="border-border hover:bg-transparent">
                        <TableCell colSpan={6} className="py-16">
                          <EmptyState message="Nenhum registro encontrado." />
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((conta) => (
                        <TableRow
                          key={conta.id}
                          className="border-border hover:bg-surface-elevated/50 transition-colors"
                        >
                          <TableCell className="px-4 py-4 font-semibold text-foreground text-sm">
                            {conta.descricao}
                          </TableCell>
                          <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                            {conta.categoria}
                          </TableCell>
                          <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                            {formatDate(conta.vencimento)}
                          </TableCell>
                          <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                            {conta.forma}
                          </TableCell>
                          <TableCell className="px-4 py-4 text-danger-foreground font-semibold text-sm">
                            {formatBRL(conta.valor)}
                          </TableCell>
                          <TableCell className="px-4 py-4">
                            <StatusBadge tone={STATUS_TONE[conta.status]}>
                              {STATUS_LABELS[conta.status]}
                            </StatusBadge>
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
                  filtered.map((conta) => (
                    <div
                      key={conta.id}
                      className="bg-surface-base rounded-lg p-4 border border-border space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-foreground text-sm">
                          {conta.descricao}
                        </span>
                        <StatusBadge tone={STATUS_TONE[conta.status]}>
                          {STATUS_LABELS[conta.status]}
                        </StatusBadge>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>
                          <span className="text-text-subtle">Categoria: </span>
                          {conta.categoria}
                        </span>
                        <span>
                          <span className="text-text-subtle">Forma: </span>
                          {conta.forma}
                        </span>
                        <span>
                          <span className="text-text-subtle">Vencimento: </span>
                          {formatDate(conta.vencimento)}
                        </span>
                        <span className="text-danger-foreground font-bold">
                          {formatBRL(conta.valor)}
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
