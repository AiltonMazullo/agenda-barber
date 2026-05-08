"use client";

import { useState, useMemo } from "react";
import {
  ArrowUpRight,
  Plus,
  Search,
  ChevronDown,
  LayoutList,
  Edit,
  Users,
  Globe,
  CheckCircle2,
  XOctagon,
  Calendar,
  Trash2,
  Pencil,
  CheckCheck,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  PageHeader,
  EmptyState,
  SummaryCard,
} from "@/components/shared";
import {
  ContratoStatusBadge,
  ContratoDialog,
} from "@/components/subscriptions";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { formatBRL, formatDate } from "@/utils/format";
import type { Contrato, ContratoStatus } from "@/types/subscription.types";

type TabKey =
  | "contratos"
  | "assinantes"
  | "vendas_novas"
  | "cancelados"
  | "por_origem"
  | "calendario"
  | "pre_aprovados"
  | "pre_cancelados";

const TABS: { key: TabKey; label: string }[] = [
  { key: "contratos", label: "Contratos" },
  { key: "assinantes", label: "Assinantes" },
  { key: "vendas_novas", label: "Vendas Novas" },
  { key: "cancelados", label: "Cancelados" },
  { key: "por_origem", label: "Por Origem" },
  { key: "calendario", label: "Calendário" },
  { key: "pre_aprovados", label: "Pré-Aprovados" },
  { key: "pre_cancelados", label: "Pré-Cancelados" },
];

function diasAtras(diasISO: string, dias: number): boolean {
  const target = new Date(diasISO);
  const ref = new Date();
  ref.setDate(ref.getDate() - dias);
  return target.getTime() >= ref.getTime();
}

function filtrarPorTab(contratos: Contrato[], tab: TabKey): Contrato[] {
  switch (tab) {
    case "contratos":
      return contratos;
    case "assinantes":
      return contratos.filter((c) => c.status === "ativo");
    case "vendas_novas":
      return contratos.filter((c) => diasAtras(c.inicio, 30));
    case "cancelados":
      return contratos.filter((c) => c.status === "cancelado");
    case "pre_aprovados":
      return contratos.filter((c) => c.status === "pre_aprovado");
    case "pre_cancelados":
      return contratos.filter((c) => c.status === "pre_cancelado");
    default:
      return contratos;
  }
}

export default function AssinaturasPage() {
  const {
    planos,
    contratos,
    resumo,
    criarContrato,
    atualizarContrato,
    removerContrato,
    alterarStatus,
  } = useSubscriptions();

  const [activeTab, setActiveTab] = useState<TabKey>("contratos");
  const [search, setSearch] = useState("");
  const [planoFiltro, setPlanoFiltro] = useState("Todos planos");
  const [statusFiltro, setStatusFiltro] = useState("Todos");

  const [dialogContrato, setDialogContrato] = useState(false);
  const [contratoEdicao, setContratoEdicao] = useState<Contrato | null>(null);

  const planosNomes = ["Todos planos", ...planos.map((p) => p.nome)];

  const visiveis = useMemo(() => {
    let lista = filtrarPorTab(contratos, activeTab);

    if (search) {
      const q = search.toLowerCase();
      lista = lista.filter(
        (c) =>
          c.clienteNome.toLowerCase().includes(q) ||
          c.planoNome.toLowerCase().includes(q),
      );
    }

    if (planoFiltro !== "Todos planos") {
      lista = lista.filter((c) => c.planoNome === planoFiltro);
    }

    if (statusFiltro !== "Todos") {
      const map: Record<string, ContratoStatus> = {
        Ativo: "ativo",
        Inadimplente: "inadimplente",
        Cancelado: "cancelado",
        "Pré-Aprovado": "pre_aprovado",
        "Pré-Cancelado": "pre_cancelado",
      };
      const target = map[statusFiltro];
      if (target) lista = lista.filter((c) => c.status === target);
    }

    return lista.sort(
      (a, b) => new Date(b.inicio).getTime() - new Date(a.inicio).getTime(),
    );
  }, [contratos, activeTab, search, planoFiltro, statusFiltro]);

  function abrirNovo() {
    setContratoEdicao(null);
    setDialogContrato(true);
  }

  function abrirEdicao(c: Contrato) {
    setContratoEdicao(c);
    setDialogContrato(true);
  }

  function handleSave(dados: Omit<Contrato, "id">, id?: string) {
    if (id) {
      atualizarContrato(id, dados);
      toast.success("Contrato atualizado.");
    } else {
      criarContrato(dados);
      toast.success(`Assinatura criada para ${dados.clienteNome}.`);
    }
  }

  function handleAlterarStatus(c: Contrato, novo: ContratoStatus) {
    alterarStatus(c.id, novo);
    toast.success(`Status alterado para ${novo.replace("_", " ")}.`);
  }

  function handleRemover(c: Contrato) {
    removerContrato(c.id);
    toast.success(`Contrato de ${c.clienteNome} removido.`);
  }

  // KAN-137 Calendário de recebimentos: agrupar contratos ativos por dia do mês
  const calendarioMes = useMemo(() => {
    if (activeTab !== "calendario") return null;
    const ativos = contratos.filter((c) => c.status === "ativo");
    const map: Record<number, Contrato[]> = {};
    ativos.forEach((c) => {
      const dia = new Date(c.inicio).getDate();
      if (!map[dia]) map[dia] = [];
      map[dia].push(c);
    });
    return map;
  }, [contratos, activeTab]);

  return (
    <div className="space-y-6 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Assinaturas"
        subtitle="Gestão de contratos e recorrências"
        actions={
          <>
            <Link href="/subscriptions/planos">
              <Button
                variant="outline"
                className="bg-surface-raised border-border text-foreground hover:bg-surface-elevated h-9 text-xs"
              >
                <LayoutList className="size-3.5 mr-1.5" />
                Planos
                <span className="ml-1.5 bg-brand/20 text-brand text-[10px] font-bold px-1.5 py-0.5 rounded">
                  {planos.length}
                </span>
              </Button>
            </Link>
            <Button
              onClick={abrirNovo}
              className="bg-brand hover:bg-brand-hover text-brand-foreground font-bold h-9 text-xs"
            >
              <Plus className="size-3.5 mr-1.5" />
              Nova Assinatura
            </Button>
          </>
        }
      />

      {/* Cards de resumo (computados) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <SummaryCard
          label="Ativos"
          value={String(resumo.ativos)}
          icon={<CheckCircle2 className="size-3.5" />}
          tone="success"
        />
        <SummaryCard
          label="Inadimplentes"
          value={String(resumo.inadimplentes)}
          icon={<XOctagon className="size-3.5" />}
          tone="danger"
        />
        <SummaryCard
          label="Total"
          value={String(resumo.total)}
          icon={<Users className="size-3.5" />}
        />
        <SummaryCard
          label="Gateway"
          value={formatBRL(resumo.totalGateway)}
          icon={<Globe className="size-3.5" />}
          tone="info"
        />
        <SummaryCard
          label="Manual"
          value={formatBRL(resumo.totalManual)}
          icon={<Edit className="size-3.5" />}
          tone="brand"
        />
        <SummaryCard
          label="Total Geral"
          value={formatBRL(resumo.totalGeral)}
          icon={<ArrowUpRight className="size-3.5" />}
          tone="brand"
          emphasized
        />
      </div>

      {/* Painel principal */}
      <Card className="bg-surface-raised border-border">
        <CardContent className="p-0">
          {/* Tabs */}
          <div className="overflow-x-auto border-b border-border">
            <div className="flex min-w-max">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors ${
                    activeTab === tab.key
                      ? "text-brand border-b-2 border-brand"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filtros */}
          {activeTab !== "calendario" && activeTab !== "por_origem" && (
            <div className="p-4 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar cliente ou plano..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-surface-base border-border text-foreground placeholder:text-muted-foreground h-9 text-sm focus-visible:ring-brand/40"
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button
                    variant="outline"
                    className="bg-surface-base border-border text-foreground hover:bg-surface-elevated h-9 text-xs min-w-35 justify-between"
                  >
                    {planoFiltro}
                    <ChevronDown className="size-3.5 text-muted-foreground ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-surface-raised border-border text-foreground">
                  {planosNomes.map((p) => (
                    <DropdownMenuItem
                      key={p}
                      onClick={() => setPlanoFiltro(p)}
                      className="text-xs hover:bg-surface-elevated cursor-pointer"
                    >
                      {p}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button
                    variant="outline"
                    className="bg-surface-base border-border text-foreground hover:bg-surface-elevated h-9 text-xs min-w-30 justify-between"
                  >
                    {statusFiltro}
                    <ChevronDown className="size-3.5 text-muted-foreground ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-surface-raised border-border text-foreground">
                  {[
                    "Todos",
                    "Ativo",
                    "Inadimplente",
                    "Cancelado",
                    "Pré-Aprovado",
                    "Pré-Cancelado",
                  ].map((s) => (
                    <DropdownMenuItem
                      key={s}
                      onClick={() => setStatusFiltro(s)}
                      className="text-xs hover:bg-surface-elevated cursor-pointer"
                    >
                      {s}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Conteúdo das tabs */}
          {activeTab === "calendario" ? (
            <CalendarioView calendario={calendarioMes ?? {}} />
          ) : activeTab === "por_origem" ? (
            <PorOrigemView contratos={contratos} />
          ) : (
            <ContratosTabela
              contratos={visiveis}
              onEditar={abrirEdicao}
              onAlterarStatus={handleAlterarStatus}
              onRemover={handleRemover}
            />
          )}
        </CardContent>
      </Card>

      <ContratoDialog
        open={dialogContrato}
        onOpenChange={setDialogContrato}
        planos={planos}
        contratoEdicao={contratoEdicao}
        onSave={handleSave}
      />
    </div>
  );
}

// ─── Vistas locais (orquestração da página) ──────────────────────────────────

interface ContratosTabelaProps {
  contratos: Contrato[];
  onEditar: (c: Contrato) => void;
  onAlterarStatus: (c: Contrato, status: ContratoStatus) => void;
  onRemover: (c: Contrato) => void;
}

function ContratosTabela({
  contratos,
  onEditar,
  onAlterarStatus,
  onRemover,
}: ContratosTabelaProps) {
  if (contratos.length === 0) {
    return (
      <div className="px-4 py-12">
        <EmptyState
          message="Nenhum contrato encontrado."
          icon={<LayoutList className="size-10" />}
        />
      </div>
    );
  }

  return (
    <>
      <div className="hidden md:block">
        <Table>
          <TableHeader className="border-t border-border">
            <TableRow className="border-border hover:bg-transparent">
              {[
                "Cliente",
                "Plano",
                "Origem",
                "Início",
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
            {contratos.map((c) => (
              <TableRow
                key={c.id}
                className="border-border hover:bg-surface-elevated/50 transition-colors"
              >
                <TableCell className="px-4 py-4 font-semibold text-foreground text-sm">
                  {c.clienteNome}
                </TableCell>
                <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                  {c.planoNome}
                </TableCell>
                <TableCell className="px-4 py-4">
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    {c.origem === "gateway" ? (
                      <Globe className="size-3 text-info-foreground" />
                    ) : (
                      <Edit className="size-3 text-brand" />
                    )}
                    {c.origem === "gateway" ? "Gateway" : "Manual"}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                  {formatDate(c.inicio)}
                </TableCell>
                <TableCell className="px-4 py-4 text-success-foreground font-semibold text-sm">
                  {formatBRL(c.valor)}
                </TableCell>
                <TableCell className="px-4 py-4">
                  <ContratoStatusBadge status={c.status} />
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
                      <DropdownMenuItem
                        onClick={() => onEditar(c)}
                        className="text-xs hover:bg-surface-elevated cursor-pointer gap-2"
                      >
                        <Pencil className="size-3.5" />
                        Editar
                      </DropdownMenuItem>
                      {c.status === "pre_aprovado" && (
                        <DropdownMenuItem
                          onClick={() => onAlterarStatus(c, "ativo")}
                          className="text-xs hover:bg-surface-elevated cursor-pointer gap-2"
                        >
                          <CheckCheck className="size-3.5 text-success-foreground" />
                          Ativar
                        </DropdownMenuItem>
                      )}
                      {c.status === "ativo" && (
                        <DropdownMenuItem
                          onClick={() => onAlterarStatus(c, "pre_cancelado")}
                          className="text-xs hover:bg-surface-elevated cursor-pointer gap-2"
                        >
                          <XCircle className="size-3.5 text-warning-foreground" />
                          Pré-cancelar
                        </DropdownMenuItem>
                      )}
                      {(c.status === "ativo" ||
                        c.status === "pre_cancelado" ||
                        c.status === "inadimplente") && (
                        <DropdownMenuItem
                          onClick={() => onAlterarStatus(c, "cancelado")}
                          className="text-xs hover:bg-surface-elevated cursor-pointer gap-2"
                        >
                          <XCircle className="size-3.5 text-danger-foreground" />
                          Cancelar definitivamente
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator className="bg-border-subtle" />
                      <DropdownMenuItem
                        onClick={() => onRemover(c)}
                        className="text-xs hover:bg-danger/10 text-danger-foreground cursor-pointer gap-2"
                      >
                        <Trash2 className="size-3.5" />
                        Remover
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile */}
      <div className="md:hidden px-4 pb-4 space-y-3">
        {contratos.map((c) => (
          <div
            key={c.id}
            className="bg-surface-base rounded-lg p-4 border border-border space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-foreground text-sm">
                  {c.clienteNome}
                </p>
                <p className="text-[10px] text-text-subtle">{c.planoNome}</p>
              </div>
              <ContratoStatusBadge status={c.status} />
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>
                <span className="text-text-subtle">Origem: </span>
                {c.origem === "gateway" ? "Gateway" : "Manual"}
              </span>
              <span>
                <span className="text-text-subtle">Início: </span>
                {formatDate(c.inicio)}
              </span>
              <span className="text-success-foreground font-bold col-span-2">
                {formatBRL(c.valor)}
              </span>
            </div>
            <div className="flex gap-2 pt-1 border-t border-border-subtle">
              <button
                type="button"
                onClick={() => onEditar(c)}
                className="flex-1 h-8 rounded-md border border-border bg-surface-raised text-[10px] font-semibold text-foreground hover:text-brand hover:border-brand/40 transition-colors flex items-center justify-center gap-1"
              >
                <Pencil className="size-3" />
                Editar
              </button>
              <button
                type="button"
                onClick={() => onRemover(c)}
                className="size-8 rounded-md border border-border bg-surface-raised text-muted-foreground flex items-center justify-center hover:text-danger-foreground hover:border-danger/40 transition-colors"
              >
                <Trash2 className="size-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

interface PorOrigemViewProps {
  contratos: Contrato[];
}

function PorOrigemView({ contratos }: PorOrigemViewProps) {
  const ativos = contratos.filter((c) => c.status === "ativo");
  const gateway = ativos.filter((c) => c.origem === "gateway");
  const manual = ativos.filter((c) => c.origem === "manual");
  const totalGateway = gateway.reduce((acc, c) => acc + c.valor, 0);
  const totalManual = manual.reduce((acc, c) => acc + c.valor, 0);

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="bg-info-bg border-border shadow-none">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="size-4 text-info-foreground" />
              <h3 className="text-sm font-bold text-foreground">Gateway</h3>
            </div>
            <span className="text-[10px] text-muted-foreground">
              {gateway.length} contrato{gateway.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="text-2xl font-bold text-info-foreground">
            {formatBRL(totalGateway)}
          </div>
          <div className="space-y-1">
            {gateway.slice(0, 5).map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between text-xs text-muted-foreground"
              >
                <span className="truncate">{c.clienteNome}</span>
                <span className="text-success-foreground font-semibold">
                  {formatBRL(c.valor)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-warning-bg border-border shadow-none">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Edit className="size-4 text-brand" />
              <h3 className="text-sm font-bold text-foreground">Manual</h3>
            </div>
            <span className="text-[10px] text-muted-foreground">
              {manual.length} contrato{manual.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="text-2xl font-bold text-brand">
            {formatBRL(totalManual)}
          </div>
          <div className="space-y-1">
            {manual.slice(0, 5).map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between text-xs text-muted-foreground"
              >
                <span className="truncate">{c.clienteNome}</span>
                <span className="text-success-foreground font-semibold">
                  {formatBRL(c.valor)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface CalendarioViewProps {
  calendario: Record<number, Contrato[]>;
}

function CalendarioView({ calendario }: CalendarioViewProps) {
  const dias = Array.from({ length: 31 }, (_, i) => i + 1);
  const totalCobrancas = Object.values(calendario).flat().length;

  if (totalCobrancas === 0) {
    return (
      <div className="px-4 py-12">
        <EmptyState
          message="Nenhuma cobrança programada para este mês."
          icon={<Calendar className="size-10" />}
        />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Calendar className="size-3.5 text-brand" />
        Cobranças programadas no mês — {totalCobrancas} contrato
        {totalCobrancas !== 1 ? "s" : ""} ativo
        {totalCobrancas !== 1 ? "s" : ""}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {dias.map((dia) => {
          const itens = calendario[dia] ?? [];
          const total = itens.reduce((acc, c) => acc + c.valor, 0);
          return (
            <div
              key={dia}
              className={`min-h-20 rounded-md border p-2 text-xs ${
                itens.length > 0
                  ? "bg-brand/10 border-brand/30"
                  : "bg-surface-base border-border-subtle"
              }`}
            >
              <div className="font-bold text-foreground">{dia}</div>
              {itens.length > 0 && (
                <>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {itens.length}×
                  </div>
                  <div className="text-[10px] text-success-foreground font-semibold mt-0.5">
                    {formatBRL(total)}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
