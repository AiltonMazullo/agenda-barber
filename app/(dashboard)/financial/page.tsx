"use client";

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
  CheckCheck,
  Pencil,
  Trash2,
  Tag,
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  PageHeader,
  EmptyState,
  StatusBadge,
  DatePickerField,
} from "@/components/shared";
import {
  SummaryRow,
  ContaDialog,
  CategoriaDialog,
  GerarComissoesDialog,
} from "@/components/financial";
import { formatBRL, formatDate } from "@/utils/format";
import { useFinancial } from "@/hooks/useFinancial";
import type { Conta, ContaStatus, ContaTipo } from "@/types/financial.types";
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

// ─── Página ───────────────────────────────────────────────────────────────────

export default function FinanceiroPage() {
  const {
    contasPagar,
    contasReceber,
    categorias,
    comissoesPendentes,
    resumoPagar,
    resumoReceber,
    balanco,
    criarConta,
    atualizarConta,
    removerConta,
    marcarComoPago,
    criarCategoria,
    removerCategoria,
    gerarComissoesSelecionadas,
  } = useFinancial();

  const [activeTab, setActiveTab] = useState<TabKey>("contas_pagar");
  const [search, setSearch] = useState("");
  const [filial, setFilial] = useState("Todas as filiais");
  const [dataInicial, setDataInicial] = useState<Date | undefined>();
  const [dataFinal, setDataFinal] = useState<Date | undefined>();

  // Dialogs
  const [dialogConta, setDialogConta] = useState(false);
  const [tipoNovaConta, setTipoNovaConta] = useState<ContaTipo>("pagar");
  const [contaEdicao, setContaEdicao] = useState<Conta | null>(null);
  const [dialogCategoria, setDialogCategoria] = useState(false);
  const [dialogComissoes, setDialogComissoes] = useState(false);

  const contas: Conta[] =
    activeTab === "contas_pagar"
      ? contasPagar
      : activeTab === "contas_receber"
        ? contasReceber
        : [];

  const filtered = contas.filter(
    (c) =>
      c.descricao.toLowerCase().includes(search.toLowerCase()) ||
      c.categoria.toLowerCase().includes(search.toLowerCase()),
  );

  function abrirNovaConta(tipo: ContaTipo) {
    setTipoNovaConta(tipo);
    setContaEdicao(null);
    setDialogConta(true);
  }

  function abrirEdicaoConta(conta: Conta) {
    setTipoNovaConta(conta.tipo);
    setContaEdicao(conta);
    setDialogConta(true);
  }

  function handleSaveConta(dados: Omit<Conta, "id">, id?: string) {
    if (id) {
      atualizarConta(id, dados);
      toast.success("Lançamento atualizado.");
    } else {
      criarConta(dados);
      toast.success(
        dados.tipo === "pagar" ? "Despesa criada." : "Receita criada.",
      );
    }
  }

  function handleRemoverConta(id: string) {
    removerConta(id);
    toast.success("Lançamento removido.");
  }

  function handleMarcarPago(c: Conta) {
    marcarComoPago(c.id);
    toast.success(c.tipo === "pagar" ? "Conta paga." : "Conta recebida.");
  }

  function handleSaveCategoria(dados: Parameters<typeof criarCategoria>[0]) {
    criarCategoria(dados);
    toast.success(`Categoria "${dados.nome}" criada.`);
  }

  function handleRemoverCategoria(id: string, nome: string) {
    removerCategoria(id);
    toast.success(`Categoria "${nome}" removida.`);
  }

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
              onClick={() => setDialogComissoes(true)}
              className="bg-surface-raised border-border text-foreground hover:bg-surface-elevated h-9 text-xs"
            >
              <RefreshCw className="size-3.5 mr-1.5" />
              Gerar Comissões
              {comissoesPendentes.length > 0 && (
                <span className="ml-1.5 bg-brand/20 text-brand text-[10px] font-bold px-1.5 py-0.5 rounded">
                  {comissoesPendentes.length}
                </span>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => abrirNovaConta("pagar")}
              className="bg-surface-raised border-border text-foreground hover:bg-surface-elevated h-9 text-xs"
            >
              <Plus className="size-3.5 mr-1.5" />
              Despesa
            </Button>
            <Button
              onClick={() => abrirNovaConta("receber")}
              className="bg-brand hover:bg-brand-hover text-brand-foreground font-bold h-9 text-xs"
            >
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
            value: formatBRL(resumoPagar.vencidos),
            valueColor: "text-danger-foreground",
            icon: <AlertCircle className="size-3.5" />,
            iconColor: "text-danger-foreground",
            bg: "bg-danger-bg",
          },
          {
            label: "A Vencer",
            value: formatBRL(resumoPagar.aVencer),
            valueColor: "text-brand",
            icon: <Clock className="size-3.5" />,
            iconColor: "text-brand",
            bg: "bg-warning-bg",
          },
          {
            label: "Pagos",
            value: formatBRL(resumoPagar.pagos),
            valueColor: "text-success-foreground",
            icon: <CheckCircle2 className="size-3.5" />,
            iconColor: "text-success-foreground",
            bg: "bg-success-bg",
          },
          {
            label: "Total a Pagar",
            value: formatBRL(resumoPagar.total),
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
            value: formatBRL(resumoReceber.naoRecebidos),
            valueColor: "text-danger-foreground",
            icon: <AlertCircle className="size-3.5" />,
            iconColor: "text-danger-foreground",
            bg: "bg-danger-bg",
          },
          {
            label: "A Receber",
            value: formatBRL(resumoReceber.aReceber),
            valueColor: "text-brand",
            icon: <Clock className="size-3.5" />,
            iconColor: "text-brand",
            bg: "bg-warning-bg",
          },
          {
            label: "Recebido",
            value: formatBRL(resumoReceber.recebidos),
            valueColor: "text-success-foreground",
            icon: <CheckCircle2 className="size-3.5" />,
            iconColor: "text-success-foreground",
            bg: "bg-success-bg",
          },
          {
            label: "Total a Receber",
            value: formatBRL(resumoReceber.total),
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
            label: "Balanço (realizado)",
            value: formatBRL(balanco.atual),
            valueColor:
              balanco.atual >= 0 ? "text-success-foreground" : "text-brand",
            icon: <DollarSign className="size-3.5" />,
            iconColor: "text-brand",
            bg: "bg-warning-bg",
          },
          {
            label: "Balanço Projetado",
            value: formatBRL(balanco.projetado),
            valueColor:
              balanco.projetado >= 0
                ? "text-success-foreground"
                : "text-info-foreground",
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
            <div className="px-4 pb-6 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {categorias.length} categoria
                  {categorias.length !== 1 ? "s" : ""} cadastrada
                  {categorias.length !== 1 ? "s" : ""}
                </p>
                <Button
                  onClick={() => setDialogCategoria(true)}
                  className="bg-brand hover:bg-brand-hover text-brand-foreground font-bold h-9 text-xs"
                >
                  <Plus className="size-3.5 mr-1.5" />
                  Nova Categoria
                </Button>
              </div>

              {categorias.length === 0 ? (
                <EmptyState
                  message="Nenhuma categoria cadastrada."
                  icon={<Tag className="size-10" />}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {categorias.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between px-3 py-2.5 rounded-md border border-border bg-surface-base group hover:border-brand/40 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Tag
                          className={`size-3.5 shrink-0 ${cat.tipo === "pagar" ? "text-danger-foreground" : "text-success-foreground"}`}
                        />
                        <span className="text-sm text-foreground truncate">
                          {cat.nome}
                        </span>
                        <StatusBadge
                          tone={cat.tipo === "pagar" ? "danger" : "success"}
                        >
                          {cat.tipo === "pagar" ? "Despesa" : "Receita"}
                        </StatusBadge>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoverCategoria(cat.id, cat.nome)
                        }
                        className="size-7 rounded flex items-center justify-center text-text-subtle hover:text-danger-foreground hover:bg-danger/10 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
                        "Ações",
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
                        <TableCell colSpan={7} className="py-16">
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
                          <TableCell
                            className={`px-4 py-4 font-semibold text-sm ${
                              conta.tipo === "pagar"
                                ? "text-danger-foreground"
                                : "text-success-foreground"
                            }`}
                          >
                            {formatBRL(conta.valor)}
                          </TableCell>
                          <TableCell className="px-4 py-4">
                            <StatusBadge tone={STATUS_TONE[conta.status]}>
                              {STATUS_LABELS[conta.status]}
                            </StatusBadge>
                          </TableCell>
                          <TableCell className="px-4 py-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger>
                                <div
                                  role="button"
                                  tabIndex={0}
                                  className="size-8 rounded-md border border-border bg-surface-base text-muted-foreground flex items-center justify-center hover:border-brand/40 hover:text-brand transition-colors cursor-pointer"
                                >
                                  <ChevronDown className="size-3.5" />
                                </div>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="bg-surface-raised border-border text-foreground"
                              >
                                {conta.status !== "pago" && (
                                  <DropdownMenuItem
                                    onClick={() => handleMarcarPago(conta)}
                                    className="text-xs hover:bg-surface-elevated cursor-pointer gap-2"
                                  >
                                    <CheckCheck className="size-3.5 text-success-foreground" />
                                    {conta.tipo === "pagar"
                                      ? "Marcar como pago"
                                      : "Marcar como recebido"}
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() => abrirEdicaoConta(conta)}
                                  className="text-xs hover:bg-surface-elevated cursor-pointer gap-2"
                                >
                                  <Pencil className="size-3.5" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-border-subtle" />
                                <DropdownMenuItem
                                  onClick={() => handleRemoverConta(conta.id)}
                                  className="text-xs hover:bg-danger/10 text-danger-foreground cursor-pointer gap-2"
                                >
                                  <Trash2 className="size-3.5" />
                                  Remover
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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
                        <span
                          className={`font-bold ${
                            conta.tipo === "pagar"
                              ? "text-danger-foreground"
                              : "text-success-foreground"
                          }`}
                        >
                          {formatBRL(conta.valor)}
                        </span>
                      </div>
                      <div className="flex gap-2 pt-1 border-t border-border-subtle">
                        {conta.status !== "pago" && (
                          <button
                            type="button"
                            onClick={() => handleMarcarPago(conta)}
                            className="flex-1 h-8 rounded-md border border-success/30 bg-success/10 text-[10px] font-semibold text-success-foreground hover:bg-success/20 transition-colors flex items-center justify-center gap-1"
                          >
                            <CheckCheck className="size-3" />
                            {conta.tipo === "pagar" ? "Pagar" : "Receber"}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => abrirEdicaoConta(conta)}
                          className="size-8 rounded-md border border-border bg-surface-raised text-muted-foreground flex items-center justify-center hover:text-brand hover:border-brand/40 transition-colors"
                        >
                          <Pencil className="size-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoverConta(conta.id)}
                          className="size-8 rounded-md border border-border bg-surface-raised text-muted-foreground flex items-center justify-center hover:text-danger-foreground hover:border-danger/40 transition-colors"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Dialogs ── */}
      <ContaDialog
        open={dialogConta}
        onOpenChange={setDialogConta}
        tipo={tipoNovaConta}
        categorias={categorias}
        contaEdicao={contaEdicao}
        onSave={handleSaveConta}
      />

      <CategoriaDialog
        open={dialogCategoria}
        onOpenChange={setDialogCategoria}
        onSave={handleSaveCategoria}
      />

      <GerarComissoesDialog
        open={dialogComissoes}
        onOpenChange={setDialogComissoes}
        comissoes={comissoesPendentes}
        onConfirm={gerarComissoesSelecionadas}
      />
    </div>
  );
}
