"use client";

import { useState } from "react";
import {
  Plus,
  Minus,
  Lock,
  ChevronDown,
  History,
  FolderOpen,
  DollarSign,
  X,
  CreditCard,
  Banknote,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PageHeader, StatusBadge } from "@/components/shared";
import { formatBRL } from "@/utils/format";

// ─── Tipos locais ─────────────────────────────────────────────────────────────

type CaixaStatus = "fechado" | "aberto";
type MovimentoTipo = "Entrada" | "Saída";

interface Movimentacao {
  id: string;
  tipo: MovimentoTipo;
  descricao: string;
  valor: number;
  hora: string;
}

interface CaixaData {
  abertura: string;
  filial: string;
  valorInicial: number;
  movimentacoes: Movimentacao[];
}

// ─── Cálculos ─────────────────────────────────────────────────────────────────

function calcValorAtual(caixa: CaixaData): number {
  return caixa.movimentacoes.reduce(
    (acc, m) => (m.tipo === "Entrada" ? acc + m.valor : acc - m.valor),
    caixa.valorInicial,
  );
}

function calcTotalFaturado(caixa: CaixaData): number {
  return caixa.movimentacoes
    .filter((m) => m.tipo === "Entrada")
    .reduce((acc, m) => acc + m.valor, 0);
}

function somaPorTipo(caixa: CaixaData, tipo: MovimentoTipo): number {
  return caixa.movimentacoes
    .filter((m) => m.tipo === tipo)
    .reduce((acc, m) => acc + m.valor, 0);
}

// ─── Dialog: Abrir Caixa ──────────────────────────────────────────────────────

interface DialogAbrirCaixaProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: (valorInicial: number) => void;
}

function DialogAbrirCaixa({
  open,
  onOpenChange,
  onConfirm,
}: DialogAbrirCaixaProps) {
  const [valor, setValor] = useState("0,00");
  const [obs, setObs] = useState("");

  const handleConfirm = () => {
    const num = parseFloat(valor.replace(",", ".")) || 0;
    onConfirm(num);
    onOpenChange(false);
    setValor("0,00");
    setObs("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-raised border border-border text-foreground max-w-md p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold">
              Abrir Caixa
            </DialogTitle>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-brand">
              Valor Inicial (R$)
            </label>
            <Input
              type="number"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="bg-surface-base border-brand/60 text-foreground focus-visible:ring-brand/30 h-11"
              placeholder="0,00"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Observações
            </label>
            <Textarea
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              placeholder="Opcional"
              className="bg-surface-base border-border text-foreground placeholder:text-text-faint focus-visible:ring-brand/30 resize-none min-h-20"
            />
          </div>
        </div>

        <div className="px-6 pb-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 px-5 rounded-md border border-border bg-transparent text-sm text-foreground hover:bg-surface-elevated transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="h-9 px-5 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors"
          >
            Abrir Caixa
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Dialog: Fechar Caixa ─────────────────────────────────────────────────────

interface DialogFecharCaixaProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  caixa: CaixaData;
  onConfirm: (valorContado: number, obs: string) => void;
}

function DialogFecharCaixa({
  open,
  onOpenChange,
  caixa,
  onConfirm,
}: DialogFecharCaixaProps) {
  const [valorContado, setValorContado] = useState("0,00");
  const [obs, setObs] = useState("");

  const totalFaturado = calcTotalFaturado(caixa);
  const entradasManuais = somaPorTipo(caixa, "Entrada");
  const saidasManuais = somaPorTipo(caixa, "Saída");
  const esperado = caixa.valorInicial + entradasManuais - saidasManuais;
  const comandas = caixa.movimentacoes.length;

  const handleConfirm = () => {
    const num = parseFloat(String(valorContado).replace(",", ".")) || 0;
    onConfirm(num, obs);
    onOpenChange(false);
    setValorContado("0,00");
    setObs("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-raised border border-border text-foreground max-w-lg p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold">
              Fechar Caixa
            </DialogTitle>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-base border border-border rounded-lg p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Valor Inicial
              </p>
              <p className="text-base font-bold text-foreground">
                {formatBRL(caixa.valorInicial)}
              </p>
            </div>
            <div className="bg-surface-base border border-border rounded-lg p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Total Faturado
              </p>
              <p className="text-base font-bold text-brand">
                {formatBRL(totalFaturado)}
              </p>
            </div>
          </div>

          <div className="bg-surface-base border border-border rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="size-3.5 text-muted-foreground" />
              <p className="text-xs font-bold text-foreground">
                Formas de Pagamento
              </p>
            </div>
            <p className="text-xs text-text-faint">
              Nenhum pagamento registrado
            </p>
          </div>

          <div className="bg-surface-base border border-border rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <Banknote className="size-3.5 text-muted-foreground" />
              <p className="text-xs font-bold text-foreground">
                Dinheiro em Caixa
              </p>
            </div>
            <div className="space-y-1.5">
              <RowKV label="Abertura" value={formatBRL(caixa.valorInicial)} />
              <RowKV
                label="Pagamentos em Dinheiro"
                value={`+${formatBRL(0)}`}
                tone="success"
              />
              <RowKV
                label="Entradas Manuais"
                value={`+${formatBRL(entradasManuais)}`}
                tone="success"
              />
              <RowKV
                label="Saídas Manuais"
                value={`-${formatBRL(saidasManuais)}`}
                tone="danger"
              />
              <div className="flex justify-between text-xs pt-2 border-t border-border-subtle">
                <span className="text-foreground font-bold">Esperado</span>
                <span className="text-foreground font-bold">
                  {formatBRL(esperado)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-surface-base border border-brand/40 rounded-lg p-4 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">
                Valor Contado em Caixa (R$)
              </label>
              <Input
                type="number"
                value={valorContado}
                onChange={(e) => setValorContado(e.target.value)}
                className="bg-surface-raised border-brand/60 text-foreground focus-visible:ring-brand/30 h-11"
                placeholder="0,00"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">
                Observações
              </label>
              <Textarea
                value={obs}
                onChange={(e) => setObs(e.target.value)}
                placeholder="Opcional"
                className="bg-surface-raised border-border text-foreground placeholder:text-text-faint focus-visible:ring-brand/30 resize-none min-h-20"
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            {comandas} comanda(s) no período
          </p>
        </div>

        <div className="px-6 pb-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 px-5 rounded-md border border-border bg-transparent text-sm text-foreground hover:bg-surface-elevated transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="h-9 px-5 rounded-md text-sm font-bold bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Fechar Caixa
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface RowKVProps {
  label: string;
  value: string;
  tone?: "success" | "danger" | "neutral";
}

function RowKV({ label, value, tone = "neutral" }: RowKVProps) {
  const valueClass =
    tone === "success"
      ? "text-success-foreground"
      : tone === "danger"
        ? "text-danger-foreground"
        : "text-foreground";
  return (
    <div className="flex justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}

// ─── Dialog: Movimentação ─────────────────────────────────────────────────────

interface DialogMovimentacaoProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  tipo: MovimentoTipo;
  onConfirm: (valor: number, descricao: string) => void;
}

function DialogMovimentacao({
  open,
  onOpenChange,
  tipo,
  onConfirm,
}: DialogMovimentacaoProps) {
  const [valor, setValor] = useState("0,00");
  const [descricao, setDescricao] = useState("");
  const isEntrada = tipo === "Entrada";

  const handleConfirm = () => {
    const num = parseFloat(String(valor).replace(",", ".")) || 0;
    if (num <= 0) {
      toast.error("Informe um valor válido.");
      return;
    }
    onConfirm(num, descricao);
    onOpenChange(false);
    setValor("0,00");
    setDescricao("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-raised border border-border text-foreground max-w-md p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold">
              Nova {tipo}
            </DialogTitle>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-brand">
              Valor (R$)
            </label>
            <Input
              type="number"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="bg-surface-base border-brand/60 text-foreground focus-visible:ring-brand/30 h-11"
              placeholder="0,00"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Descrição
            </label>
            <Textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva a operação"
              className="bg-surface-base border-border text-foreground placeholder:text-text-faint focus-visible:ring-brand/30 resize-none min-h-25"
            />
          </div>
        </div>

        <div className="px-6 pb-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 px-5 rounded-md border border-border bg-transparent text-sm text-foreground hover:bg-surface-elevated transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`h-9 px-5 rounded-md text-sm font-bold transition-colors ${
              isEntrada
                ? "bg-brand text-brand-foreground hover:bg-brand-hover"
                : "bg-red-600 text-white hover:bg-red-700"
            }`}
          >
            Confirmar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function CaixaPage() {
  const [status, setStatus] = useState<CaixaStatus>("fechado");
  const [filial, setFilial] = useState("Todas as filiais");
  const [caixa, setCaixa] = useState<CaixaData | null>(null);

  const [dialogAbrir, setDialogAbrir] = useState(false);
  const [dialogFechar, setDialogFechar] = useState(false);
  const [dialogMovimento, setDialogMovimento] = useState(false);
  const [tipoMovimento, setTipoMovimento] = useState<MovimentoTipo>("Entrada");

  const handleAbrirCaixa = (valorInicial: number) => {
    const now = new Date();
    setCaixa({
      abertura: now.toLocaleString("pt-BR"),
      filial: filial === "Todas as filiais" ? "Matriz" : filial,
      valorInicial,
      movimentacoes: [],
    });
    setStatus("aberto");
    toast.success("Caixa aberto com sucesso!");
  };

  const handleFecharCaixa = () => {
    setStatus("fechado");
    setCaixa(null);
    toast.success("Caixa fechado com sucesso!");
  };

  const handleMovimento = (valor: number, descricao: string) => {
    if (!caixa) return;
    const now = new Date();
    const nova: Movimentacao = {
      id: `#${String(caixa.movimentacoes.length + 1).padStart(3, "0")}`,
      tipo: tipoMovimento,
      descricao,
      valor,
      hora: now.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setCaixa({ ...caixa, movimentacoes: [...caixa.movimentacoes, nova] });
    toast.success(`${tipoMovimento} registrada!`);
  };

  const abrirDialogMovimento = (tipo: MovimentoTipo) => {
    setTipoMovimento(tipo);
    setDialogMovimento(true);
  };

  const valorAtual = caixa ? calcValorAtual(caixa) : 0;

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Caixa"
        subtitle="Controle de caixa diário"
        actions={
          <>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <button
                  type="button"
                  className="h-9 px-3 rounded-md border border-border bg-surface-raised text-sm text-foreground flex items-center gap-2 hover:border-brand/40 transition-colors min-w-40 justify-between"
                >
                  <span>{filial}</span>
                  <ChevronDown className="size-3.5 text-muted-foreground shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-surface-raised border-border text-foreground">
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

            <Link href="/cashier/history">
              <button
                type="button"
                className="h-9 px-3 rounded-md border border-border bg-surface-raised text-sm text-foreground flex items-center gap-2 hover:border-brand/40 transition-colors"
              >
                <History className="size-3.5 text-muted-foreground" />
                Histórico
              </button>
            </Link>
          </>
        }
      />

      {status === "fechado" && (
        <div className="flex flex-col items-center justify-center py-24 gap-5">
          <div className="size-20 rounded-full bg-surface-raised border border-border flex items-center justify-center">
            <FolderOpen className="size-9 text-text-subtle" />
          </div>
          <p className="text-muted-foreground text-sm">Nenhum caixa aberto</p>
          <button
            type="button"
            onClick={() => setDialogAbrir(true)}
            className="h-10 px-6 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover hover:shadow-[0_0_16px_rgba(245,184,46,0.35)] transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="size-4" />
            Abrir Caixa
          </button>
        </div>
      )}

      {status === "aberto" && caixa && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Status */}
            <Card className="bg-surface-raised border-border shadow-none">
              <CardContent className="p-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  Status
                </p>
                <Badge className="bg-success/15 text-success-foreground border border-success/30 text-xs font-semibold px-2.5 py-1 mb-3">
                  Aberto
                </Badge>
                <div className="space-y-0.5 mt-2">
                  <p className="text-[11px] text-muted-foreground">
                    Abertura: {caixa.abertura}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Filial: {caixa.filial}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-surface-raised border-border shadow-none">
              <CardContent className="p-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Valor Inicial
                </p>
                <div className="text-xl md:text-2xl font-bold text-foreground">
                  {formatBRL(caixa.valorInicial)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-warning-bg border-border shadow-none">
              <CardContent className="p-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Valor Atual
                </p>
                <div className="text-xl md:text-2xl font-bold text-brand">
                  {formatBRL(valorAtual)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-surface-raised border-border shadow-none">
              <CardContent className="p-4 flex flex-col gap-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => abrirDialogMovimento("Entrada")}
                    className="h-9 rounded-md text-xs font-bold bg-success/15 text-success-foreground border border-success/30 hover:bg-success/25 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Plus className="size-3.5" />
                    Entrada
                  </button>
                  <button
                    type="button"
                    onClick={() => abrirDialogMovimento("Saída")}
                    className="h-9 rounded-md text-xs font-bold bg-danger/15 text-danger-foreground border border-danger/30 hover:bg-danger/25 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Minus className="size-3.5" />
                    Saída
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setDialogFechar(true)}
                  className="w-full h-9 rounded-md text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Lock className="size-3.5" />
                  Fechar Caixa
                </button>
              </CardContent>
            </Card>
          </div>

          {/* Movimentações */}
          <Card className="bg-surface-raised border-border">
            <CardContent className="p-0">
              <div className="px-4 py-4 border-b border-border-subtle">
                <h2 className="text-sm font-bold text-foreground">
                  Movimentações ({caixa.movimentacoes.length})
                </h2>
              </div>

              {caixa.movimentacoes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
                  <DollarSign className="size-10 opacity-30" />
                  <p className="text-sm">Nenhuma movimentação registrada</p>
                </div>
              ) : (
                <>
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border hover:bg-transparent">
                          {["ID", "Tipo", "Descrição", "Valor", "Hora"].map(
                            (col) => (
                              <TableHead
                                key={col}
                                className="text-muted-foreground text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto"
                              >
                                {col}
                              </TableHead>
                            ),
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {caixa.movimentacoes.map((m) => (
                          <TableRow
                            key={m.id}
                            className="border-border hover:bg-surface-elevated/50 transition-colors"
                          >
                            <TableCell className="px-4 py-4 text-muted-foreground text-sm font-mono">
                              {m.id}
                            </TableCell>
                            <TableCell className="px-4 py-4">
                              <StatusBadge
                                tone={m.tipo === "Entrada" ? "success" : "danger"}
                              >
                                {m.tipo}
                              </StatusBadge>
                            </TableCell>
                            <TableCell className="px-4 py-4 text-foreground font-medium text-sm">
                              {m.descricao}
                            </TableCell>
                            <TableCell
                              className={`px-4 py-4 font-semibold text-sm ${
                                m.tipo === "Entrada"
                                  ? "text-success-foreground"
                                  : "text-danger-foreground"
                              }`}
                            >
                              {m.tipo === "Saída"
                                ? `- ${formatBRL(m.valor)}`
                                : `+ ${formatBRL(m.valor)}`}
                            </TableCell>
                            <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                              {m.hora}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="md:hidden px-4 pb-4 space-y-3 pt-3">
                    {caixa.movimentacoes.map((m) => (
                      <div
                        key={m.id}
                        className="bg-surface-base rounded-lg p-4 border border-border space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-semibold text-foreground text-sm">
                            {m.descricao}
                          </span>
                          <StatusBadge
                            tone={m.tipo === "Entrada" ? "success" : "danger"}
                          >
                            {m.tipo}
                          </StatusBadge>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span>
                            <span className="text-text-subtle">ID: </span>
                            {m.id}
                          </span>
                          <span>
                            <span className="text-text-subtle">Hora: </span>
                            {m.hora}
                          </span>
                          <span
                            className={`font-bold ${
                              m.tipo === "Entrada"
                                ? "text-success-foreground"
                                : "text-danger-foreground"
                            }`}
                          >
                            {m.tipo === "Saída"
                              ? `- ${formatBRL(m.valor)}`
                              : `+ ${formatBRL(m.valor)}`}
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
      )}

      <DialogAbrirCaixa
        open={dialogAbrir}
        onOpenChange={setDialogAbrir}
        onConfirm={handleAbrirCaixa}
      />

      {caixa && (
        <DialogFecharCaixa
          open={dialogFechar}
          onOpenChange={setDialogFechar}
          caixa={caixa}
          onConfirm={handleFecharCaixa}
        />
      )}

      <DialogMovimentacao
        open={dialogMovimento}
        onOpenChange={setDialogMovimento}
        tipo={tipoMovimento}
        onConfirm={handleMovimento}
      />
    </div>
  );
}
