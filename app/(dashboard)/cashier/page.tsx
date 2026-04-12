/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { toast } from "sonner";
import Link from "next/link";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type CaixaStatus = "fechado" | "aberto";

type Movimentacao = {
  id: string;
  tipo: "Entrada" | "Saída";
  descricao: string;
  valor: number;
  hora: string;
};

type CaixaData = {
  abertura: string;
  filial: string;
  valorInicial: number;
  movimentacoes: Movimentacao[];
};

// ─── Formatação ───────────────────────────────────────────────────────────────

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function calcValorAtual(caixa: CaixaData) {
  return caixa.movimentacoes.reduce((acc, m) => {
    return m.tipo === "Entrada" ? acc + m.valor : acc - m.valor;
  }, caixa.valorInicial);
}

function calcTotalFaturado(caixa: CaixaData) {
  return caixa.movimentacoes
    .filter((m) => m.tipo === "Entrada")
    .reduce((acc, m) => acc + m.valor, 0);
}

function calcEntradasManuais(caixa: CaixaData) {
  return caixa.movimentacoes
    .filter((m) => m.tipo === "Entrada")
    .reduce((acc, m) => acc + m.valor, 0);
}

function calcSaidasManuais(caixa: CaixaData) {
  return caixa.movimentacoes
    .filter((m) => m.tipo === "Saída")
    .reduce((acc, m) => acc + m.valor, 0);
}

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

// ─── Dialog: Abrir Caixa ──────────────────────────────────────────────────────

function DialogAbrirCaixa({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: (valorInicial: number) => void;
}) {
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
      <DialogContent className="bg-[#161b22] border border-[#30363d] text-white max-w-md p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#21262d]">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold">
              Abrir Caixa
            </DialogTitle>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="size-7 rounded-md flex items-center justify-center text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-5">
          {/* Valor inicial */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-[#f5b82e]">
              Valor Inicial (R$)
            </label>
            <Input
              type="number"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="bg-[#0d1117] border-[#f5b82e]/60 text-white focus-visible:ring-[#f5b82e]/30 h-11"
              placeholder="0,00"
            />
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-[#8b949e]">
              Observações
            </label>
            <Textarea
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              placeholder="Opcional"
              className="bg-[#0d1117] border-[#30363d] text-white placeholder:text-[#4d5562] focus-visible:ring-[#f5b82e]/30 resize-none min-h-[80px]"
            />
          </div>
        </div>

        <div className="px-6 pb-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 px-5 rounded-md border border-[#30363d] bg-transparent text-sm text-white hover:bg-[#21262d] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="h-9 px-5 rounded-md text-sm font-bold bg-[#f5b82e] text-black hover:bg-[#d9a326] transition-colors"
          >
            Abrir Caixa
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Dialog: Fechar Caixa ─────────────────────────────────────────────────────

function DialogFecharCaixa({
  open,
  onOpenChange,
  caixa,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  caixa: CaixaData;
  onConfirm: (valorContado: number, obs: string) => void;
}) {
  const [valorContado, setValorContado] = useState("0,00");
  const [obs, setObs] = useState("");

  const totalFaturado = calcTotalFaturado(caixa);
  const entradasManuais = calcEntradasManuais(caixa);
  const saidasManuais = calcSaidasManuais(caixa);
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
      <DialogContent className="bg-[#161b22] border border-[#30363d] text-white max-w-lg p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#21262d]">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold">
              Fechar Caixa
            </DialogTitle>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="size-7 rounded-md flex items-center justify-center text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4">
          {/* Resumo topo */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#8b949e] mb-1">
                Valor Inicial
              </p>
              <p className="text-base font-bold text-white">
                {formatBRL(caixa.valorInicial)}
              </p>
            </div>
            <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#8b949e] mb-1">
                Total Faturado
              </p>
              <p className="text-base font-bold text-[#f5b82e]">
                {formatBRL(totalFaturado)}
              </p>
            </div>
          </div>

          {/* Formas de pagamento */}
          <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="size-3.5 text-[#8b949e]" />
              <p className="text-xs font-bold text-white">
                Formas de Pagamento
              </p>
            </div>
            <p className="text-xs text-[#4d5562]">
              Nenhum pagamento registrado
            </p>
          </div>

          {/* Dinheiro em Caixa */}
          <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <Banknote className="size-3.5 text-[#8b949e]" />
              <p className="text-xs font-bold text-white">Dinheiro em Caixa</p>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#8b949e]">Abertura</span>
                <span className="text-white">
                  {formatBRL(caixa.valorInicial)}
                </span>
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
            </div>
          </div>

          {/* Valor contado e observações */}
          <div className="bg-[#0d1117] border border-[#f5b82e]/40 rounded-lg p-4 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-white">
                Valor Contado em Caixa (R$)
              </label>
              <Input
                type="number"
                value={valorContado}
                onChange={(e) => setValorContado(e.target.value)}
                className="bg-[#161b22] border-[#f5b82e]/60 text-white focus-visible:ring-[#f5b82e]/30 h-11"
                placeholder="0,00"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-white">
                Observações
              </label>
              <Textarea
                value={obs}
                onChange={(e) => setObs(e.target.value)}
                placeholder="Opcional"
                className="bg-[#161b22] border-[#30363d] text-white placeholder:text-[#4d5562] focus-visible:ring-[#f5b82e]/30 resize-none min-h-[80px]"
              />
            </div>
          </div>

          <p className="text-xs text-[#8b949e]">
            {comandas} comanda(s) no período
          </p>
        </div>

        <div className="px-6 pb-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 px-5 rounded-md border border-[#30363d] bg-transparent text-sm text-white hover:bg-[#21262d] transition-colors"
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

// ─── Dialog: Entrada / Saída ──────────────────────────────────────────────────

function DialogMovimentacao({
  open,
  onOpenChange,
  tipo,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  tipo: "Entrada" | "Saída";
  onConfirm: (valor: number, descricao: string) => void;
}) {
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
      <DialogContent className="bg-[#161b22] border border-[#30363d] text-white max-w-md p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#21262d]">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold">
              Nova {tipo}
            </DialogTitle>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="size-7 rounded-md flex items-center justify-center text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4 ">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-[#f5b82e]">
              Valor (R$)
            </label>
            <Input
              type="number"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="bg-[#0d1117] border-[#f5b82e]/60 text-white focus-visible:ring-[#f5b82e]/30 h-11"
              placeholder="0,00"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-[#8b949e]">
              Descrição
            </label>
            <Textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva a operação"
              className="bg-[#0d1117] border-[#30363d] text-white placeholder:text-[#4d5562] focus-visible:ring-[#f5b82e]/30 resize-none min-h-[100px]"
            />
          </div>
        </div>

        <div className="px-6 pb-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 px-5 rounded-md border border-[#30363d] bg-transparent text-sm text-white hover:bg-[#21262d] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`h-9 px-5 rounded-md text-sm font-bold transition-colors ${
              isEntrada
                ? "bg-[#f5b82e] text-black hover:bg-[#d9a326]"
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

  // Dialogs
  const [dialogAbrir, setDialogAbrir] = useState(false);
  const [dialogFechar, setDialogFechar] = useState(false);
  const [dialogMovimento, setDialogMovimento] = useState(false);
  const [tipoMovimento, setTipoMovimento] = useState<"Entrada" | "Saída">(
    "Entrada",
  );

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

  const handleFecharCaixa = (valorContado: number, obs: string) => {
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

  const abrirDialogMovimento = (tipo: "Entrada" | "Saída") => {
    setTipoMovimento(tipo);
    setDialogMovimento(true);
  };

  const valorAtual = caixa ? calcValorAtual(caixa) : 0;

  return (
    <div className="space-y-5 p-4 md:p-6 bg-[#0d1117] min-h-screen text-white">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Caixa
          </h1>
          <p className="text-[#8b949e] text-sm mt-1">
            Controle de caixa diário
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <button
                type="button"
                className="h-9 px-3 rounded-md border border-[#30363d] bg-[#161b22] text-sm text-white flex items-center gap-2 hover:border-[#f5b82e]/40 transition-colors min-w-[160px] justify-between"
              >
                <span>{filial}</span>
                <ChevronDown className="size-3.5 text-[#8b949e] shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#161b22] border-[#30363d] text-white">
              {["Todas as filiais", "Matriz", "Filial Norte", "Filial Sul"].map(
                (f) => (
                  <DropdownMenuItem
                    key={f}
                    onClick={() => setFilial(f)}
                    className="text-xs hover:bg-[#21262d] cursor-pointer"
                  >
                    {f}
                  </DropdownMenuItem>
                ),
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/cashier/history">
            <button
              type="button"
              className="h-9 px-3 rounded-md border border-[#30363d] bg-[#161b22] text-sm text-white flex items-center gap-2 hover:border-[#f5b82e]/40 transition-colors"
            >
              <History className="size-3.5 text-[#8b949e]" />
              Histórico
            </button>
          </Link>
        </div>
      </div>

      {/* ── Fechado ── */}
      {status === "fechado" && (
        <div className="flex flex-col items-center justify-center py-24 gap-5">
          <div className="size-20 rounded-full bg-[#161b22] border border-[#30363d] flex items-center justify-center">
            <FolderOpen className="size-9 text-[#4d5562]" />
          </div>
          <p className="text-[#8b949e] text-sm">Nenhum caixa aberto</p>
          <button
            type="button"
            onClick={() => setDialogAbrir(true)}
            className="h-10 px-6 rounded-md text-sm font-bold bg-[#f5b82e] text-black hover:bg-[#d9a326] hover:shadow-[0_0_16px_rgba(245,184,46,0.35)] transition-all flex items-center gap-2"
          >
            <Plus className="size-4" />
            Abrir Caixa
          </button>
        </div>
      )}

      {/* ── Aberto ── */}
      {status === "aberto" && caixa && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Status */}
            <Card className="bg-[#161b22] border-[#30363d] shadow-none">
              <CardContent className="p-4">
                <p className="text-[10px] font-bold text-[#8b949e] uppercase tracking-wider mb-3">
                  Status
                </p>
                <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-semibold px-2.5 py-1 mb-3">
                  Aberto
                </Badge>
                <div className="space-y-0.5 mt-2">
                  <p className="text-[11px] text-[#8b949e]">
                    Abertura: {caixa.abertura}
                  </p>
                  <p className="text-[11px] text-[#8b949e]">
                    Filial: {caixa.filial}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Valor Inicial */}
            <Card className="bg-[#161b22] border-[#30363d] shadow-none">
              <CardContent className="p-4">
                <p className="text-[10px] font-bold text-[#8b949e] uppercase tracking-wider mb-2">
                  Valor Inicial
                </p>
                <div className="text-xl md:text-2xl font-bold text-white">
                  {formatBRL(caixa.valorInicial)}
                </div>
              </CardContent>
            </Card>

            {/* Valor Atual */}
            <Card className="bg-[#241a06] border-[#30363d] shadow-none">
              <CardContent className="p-4">
                <p className="text-[10px] font-bold text-[#8b949e] uppercase tracking-wider mb-2">
                  Valor Atual
                </p>
                <div className="text-xl md:text-2xl font-bold text-[#f5b82e]">
                  {formatBRL(valorAtual)}
                </div>
              </CardContent>
            </Card>

            {/* Ações */}
            <Card className="bg-[#161b22] border-[#30363d] shadow-none">
              <CardContent className="p-4 flex flex-col gap-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => abrirDialogMovimento("Entrada")}
                    className="h-9 rounded-md text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Plus className="size-3.5" />
                    Entrada
                  </button>
                  <button
                    type="button"
                    onClick={() => abrirDialogMovimento("Saída")}
                    className="h-9 rounded-md text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 transition-colors flex items-center justify-center gap-1.5"
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
          <Card className="bg-[#161b22] border-[#30363d]">
            <CardContent className="p-0">
              <div className="px-4 py-4 border-b border-[#21262d]">
                <h2 className="text-sm font-bold text-white">
                  Movimentações ({caixa.movimentacoes.length})
                </h2>
              </div>

              {caixa.movimentacoes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-[#8b949e]">
                  <DollarSign className="size-10 opacity-30" />
                  <p className="text-sm">Nenhuma movimentação registrada</p>
                </div>
              ) : (
                <>
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-[#30363d] hover:bg-transparent">
                          {["ID", "Tipo", "Descrição", "Valor", "Hora"].map(
                            (col) => (
                              <TableHead
                                key={col}
                                className="text-[#8b949e] text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto"
                              >
                                {col}
                              </TableHead>
                            ),
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {caixa.movimentacoes.map((m, i) => (
                          <TableRow
                            key={i}
                            className="border-[#30363d] hover:bg-[#21262d]/50 transition-colors"
                          >
                            <TableCell className="px-4 py-4 text-[#8b949e] text-sm font-mono">
                              {m.id}
                            </TableCell>
                            <TableCell className="px-4 py-4">
                              <TipoBadge tipo={m.tipo} />
                            </TableCell>
                            <TableCell className="px-4 py-4 text-white font-medium text-sm">
                              {m.descricao}
                            </TableCell>
                            <TableCell
                              className={`px-4 py-4 font-semibold text-sm ${m.tipo === "Entrada" ? "text-emerald-400" : "text-red-400"}`}
                            >
                              {m.tipo === "Saída"
                                ? `- ${formatBRL(m.valor)}`
                                : `+ ${formatBRL(m.valor)}`}
                            </TableCell>
                            <TableCell className="px-4 py-4 text-[#8b949e] text-sm">
                              {m.hora}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="md:hidden px-4 pb-4 space-y-3 pt-3">
                    {caixa.movimentacoes.map((m, i) => (
                      <div
                        key={i}
                        className="bg-[#0d1117] rounded-lg p-4 border border-[#30363d] space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-semibold text-white text-sm">
                            {m.descricao}
                          </span>
                          <TipoBadge tipo={m.tipo} />
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-[#8b949e]">
                          <span>
                            <span className="text-[#4d5562]">ID: </span>
                            {m.id}
                          </span>
                          <span>
                            <span className="text-[#4d5562]">Hora: </span>
                            {m.hora}
                          </span>
                          <span
                            className={`font-bold ${m.tipo === "Entrada" ? "text-emerald-400" : "text-red-400"}`}
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

      {/* ── Dialogs ── */}
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
