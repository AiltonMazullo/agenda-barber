"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Download,
  ChevronDown,
  Eye,
  X,
  Banknote,
  RotateCcw,
  DollarSign,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
import { toast } from "sonner";
import Link from "next/link";
import {
  PageHeader,
  EmptyState,
  StatusBadge,
  DatePickerField,
} from "@/components/shared";
import { formatBRL } from "@/utils/format";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type MovimentoTipo = "Entrada" | "Saída";

interface Movimentacao {
  id: string;
  tipo: MovimentoTipo;
  descricao: string;
  valor: number;
  hora: string;
}

interface CaixaHistorico {
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

// ─── Dialog: Visualizar Caixa ─────────────────────────────────────────────────

interface DialogVisualizarCaixaProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  caixa: CaixaHistorico | null;
}

function DialogVisualizarCaixa({
  open,
  onOpenChange,
  caixa,
}: DialogVisualizarCaixaProps) {
  if (!caixa) return null;

  const entradas = caixa.movimentacoes
    .filter((m) => m.tipo === "Entrada")
    .reduce((a, m) => a + m.valor, 0);
  const saidas = caixa.movimentacoes
    .filter((m) => m.tipo === "Saída")
    .reduce((a, m) => a + m.valor, 0);

  const esperado = caixa.vInicial + entradas - saidas;
  const diferenca =
    caixa.valorContado !== null ? caixa.valorContado - esperado : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-raised border border-border text-foreground max-w-xl p-0 gap-0 max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        <DialogHeader className="px-6 py-4 border-b border-border-subtle shrink-0 bg-surface-raised z-10">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                Resumo do Caixa
                <span className="text-muted-foreground font-normal text-sm">
                  — {caixa.data}
                </span>
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {caixa.filial}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge
                tone={caixa.status === "Aberto" ? "success" : "neutral"}
              >
                {caixa.status}
              </StatusBadge>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="size-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin bg-surface-base/30">
          {/* Grid de Valores */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-base border border-border rounded-xl p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                Fundo Inicial
              </p>
              <p className="text-lg font-bold text-foreground tracking-tight">
                {formatBRL(caixa.vInicial)}
              </p>
            </div>
            <div className="bg-surface-base border border-border rounded-xl p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                {caixa.status === "Fechado"
                  ? "Total em Caixa (Físico)"
                  : "Saldo Estimado"}
              </p>
              <p className="text-lg font-bold text-brand tracking-tight">
                {caixa.valorContado !== null
                  ? formatBRL(caixa.valorContado)
                  : formatBRL(esperado)}
              </p>
            </div>
          </div>

          {/* Detalhamento */}
          <div className="bg-surface-base border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="px-4 py-3 bg-surface-raised border-b border-border flex items-center gap-2">
              <Banknote className="size-4 text-brand" />
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Detalhamento
              </h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Abertura de Caixa</span>
                <span className="text-foreground font-medium">
                  {formatBRL(caixa.vInicial)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total de Entradas</span>
                <span className="text-success-foreground font-medium">
                  +{formatBRL(entradas)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total de Saídas</span>
                <span className="text-danger-foreground font-medium">
                  -{formatBRL(saidas)}
                </span>
              </div>
              <div className="pt-2 border-t border-border-subtle flex justify-between items-center">
                <span className="text-xs font-bold text-foreground uppercase">
                  Saldo Esperado
                </span>
                <span className="text-base font-bold text-foreground">
                  {formatBRL(esperado)}
                </span>
              </div>

              {caixa.valorContado !== null && diferenca !== null && (
                <div className="pt-2 flex justify-between items-center">
                  <span className="text-xs font-bold text-muted-foreground uppercase">
                    Diferença
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      diferenca >= 0
                        ? "text-success-foreground"
                        : "text-danger-foreground"
                    }`}
                  >
                    {diferenca > 0 ? "+" : ""}
                    {formatBRL(diferenca)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {caixa.observacoes && (
            <div className="bg-brand/5 border border-brand/20 rounded-xl p-4">
              <p className="text-[10px] font-bold text-brand uppercase tracking-widest mb-1.5">
                Notas do Operador
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed italic">
                {caixa.observacoes}
              </p>
            </div>
          )}

          {/* Movimentações */}
          <div className="bg-surface-base border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-surface-raised border-b border-border">
              <p className="text-xs font-bold text-foreground uppercase tracking-wider">
                Fluxo de Caixa ({caixa.movimentacoes.length})
              </p>
            </div>
            <div className="divide-y divide-border-subtle">
              {caixa.movimentacoes.length === 0 ? (
                <div className="px-4 py-8 text-center text-xs text-text-subtle">
                  Nenhuma movimentação
                </div>
              ) : (
                caixa.movimentacoes.map((m) => (
                  <div
                    key={m.id}
                    className="px-4 py-3 flex items-center justify-between hover:bg-surface-raised/50 transition-colors"
                  >
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="text-sm font-medium text-foreground truncate">
                        {m.descricao}
                      </span>
                      <StatusBadge
                        tone={m.tipo === "Entrada" ? "success" : "danger"}
                      >
                        {m.tipo}
                      </StatusBadge>
                    </div>
                    <div className="text-right shrink-0">
                      <p
                        className={`text-sm font-bold ${
                          m.tipo === "Entrada"
                            ? "text-success-foreground"
                            : "text-danger-foreground"
                        }`}
                      >
                        {m.tipo === "Saída" ? "-" : "+"} {formatBRL(m.valor)}
                      </p>
                      <p className="text-[10px] text-text-subtle mt-0.5">
                        {m.hora}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border-subtle flex justify-end bg-surface-raised shrink-0">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 px-6 rounded-md bg-surface-elevated text-sm font-bold text-foreground hover:bg-border transition-all border border-border"
          >
            Fechar Relatório
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
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Histórico de Caixas"
        subtitle="Consulte caixas anteriores"
        actions={
          <Link href="/cashier">
            <button
              type="button"
              className="h-9 px-4 rounded-md border border-border bg-surface-raised text-sm text-foreground flex items-center gap-2 hover:border-brand/40 transition-colors"
            >
              <ArrowLeft className="size-3.5 text-muted-foreground" />
              Voltar
            </button>
          </Link>
        }
      />

      {/* Filtros */}
      <Card className="bg-surface-raised border-border">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <DatePickerField
              id="hist-data-inicial"
              label="Data Inicial"
              date={dataInicial}
              onChange={setDataInicial}
            />
            <DatePickerField
              id="hist-data-final"
              label="Data Final"
              date={dataFinal}
              onChange={setDataFinal}
            />

            <Field className="flex-1 min-w-40">
              <FieldLabel
                htmlFor="hist-filial"
                className="text-[10px] font-bold uppercase tracking-widest text-brand"
              >
                Filial
              </FieldLabel>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <button
                    id="hist-filial"
                    type="button"
                    className="w-full h-10 px-3 rounded-md border border-border bg-surface-base text-sm text-foreground flex items-center justify-between gap-2 hover:border-brand/40 transition-colors outline-none"
                  >
                    <span className="truncate">{filial}</span>
                    <ChevronDown className="size-3.5 text-muted-foreground shrink-0" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-surface-raised border-border text-foreground min-w-45">
                  {[
                    "Todas as filiais",
                    "Matriz",
                    "Filial Norte",
                    "Filial Sul",
                  ].map((f) => (
                    <DropdownMenuItem
                      key={f}
                      onClick={() => setFilial(f)}
                      className="text-xs hover:bg-surface-elevated cursor-pointer"
                    >
                      {f}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </Field>

            <div className="flex flex-col justify-end">
              <div className="h-5.5" />
              <button
                type="button"
                className="h-10 px-4 rounded-md border border-border bg-surface-base text-sm text-muted-foreground flex items-center gap-2 hover:border-brand/40 hover:text-foreground transition-colors"
              >
                <Download className="size-3.5" />
                CSV
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card className="bg-surface-raised border-border">
        <CardContent className="p-0">
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
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
                      className="text-muted-foreground text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto"
                    >
                      {col}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {HISTORICO.length === 0 ? (
                  <TableRow className="border-border hover:bg-transparent">
                    <TableCell colSpan={8} className="py-16">
                      <EmptyState
                        message="Nenhum caixa encontrado."
                        icon={<DollarSign className="size-10" />}
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  HISTORICO.map((c, i) => (
                    <TableRow
                      key={i}
                      className="border-border hover:bg-surface-elevated/50 transition-colors"
                    >
                      <TableCell className="px-4 py-4 font-semibold text-foreground text-sm">
                        {c.data}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                        {c.filial}
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        <StatusBadge
                          tone={c.status === "Aberto" ? "success" : "neutral"}
                        >
                          {c.status}
                        </StatusBadge>
                      </TableCell>
                      <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                        {c.abertura}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                        {c.fechamento}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-foreground font-semibold text-sm">
                        {formatBRL(c.vInicial)}
                      </TableCell>
                      <TableCell
                        className={`px-4 py-4 font-semibold text-sm ${
                          c.vFechamento !== null
                            ? "text-success-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {c.vFechamento !== null
                          ? formatBRL(c.vFechamento)
                          : "—"}
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleVisualizar(c)}
                            className="size-8 rounded-md border border-border bg-surface-base text-muted-foreground flex items-center justify-center hover:border-brand/40 hover:text-brand transition-colors"
                            title="Visualizar"
                          >
                            <Eye className="size-3.5" />
                          </button>
                          {c.status === "Fechado" && (
                            <button
                              type="button"
                              onClick={() => handleReabrir(c)}
                              className="size-8 rounded-md border border-border bg-surface-base text-muted-foreground flex items-center justify-center hover:border-success/40 hover:text-success-foreground transition-colors"
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
                className="bg-surface-base rounded-lg p-4 border border-border space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-semibold text-foreground text-sm">
                      {c.data}
                    </span>
                    <span className="text-text-subtle text-xs ml-2">
                      {c.filial}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge
                      tone={c.status === "Aberto" ? "success" : "neutral"}
                    >
                      {c.status}
                    </StatusBadge>
                    <button
                      type="button"
                      onClick={() => handleVisualizar(c)}
                      className="size-7 rounded-md border border-border bg-surface-raised text-muted-foreground flex items-center justify-center hover:border-brand/40 hover:text-brand transition-colors"
                    >
                      <Eye className="size-3" />
                    </button>
                    {c.status === "Fechado" && (
                      <button
                        type="button"
                        onClick={() => handleReabrir(c)}
                        className="size-7 rounded-md border border-border bg-surface-raised text-muted-foreground flex items-center justify-center hover:border-success/40 hover:text-success-foreground transition-colors"
                      >
                        <RotateCcw className="size-3" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>
                    <span className="text-text-subtle">Abertura: </span>
                    {c.abertura}
                  </span>
                  <span>
                    <span className="text-text-subtle">Fechamento: </span>
                    {c.fechamento}
                  </span>
                  <span>
                    <span className="text-text-subtle">V. Inicial: </span>
                    {formatBRL(c.vInicial)}
                  </span>
                  <span
                    className={
                      c.vFechamento !== null
                        ? "text-success-foreground font-bold"
                        : ""
                    }
                  >
                    <span className="text-text-subtle">V. Final: </span>
                    {c.vFechamento !== null ? formatBRL(c.vFechamento) : "—"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <DialogVisualizarCaixa
        open={dialogVisualizar}
        onOpenChange={setDialogVisualizar}
        caixa={caixaSelecionado}
      />
    </div>
  );
}
