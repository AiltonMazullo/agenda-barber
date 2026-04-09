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
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";
import Link from "next/link";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type CaixaStatus = "fechado" | "aberto";

type Movimentacao = {
  id: string;
  tipo: "Entrada" | "Saída";
  descricao: string;
  valor: string;
  hora: string;
};

// ─── Mock ─────────────────────────────────────────────────────────────────────

const MOVIMENTACOES_MOCK: Movimentacao[] = [
  {
    id: "#001",
    tipo: "Entrada",
    descricao: "Serviço de corte",
    valor: "R$ 50,00",
    hora: "19:30",
  },
  {
    id: "#002",
    tipo: "Saída",
    descricao: "Compra de produto",
    valor: "R$ 30,00",
    hora: "20:00",
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

// ─── Página ───────────────────────────────────────────────────────────────────

export default function CaixaPage() {
  const [status, setStatus] = useState<CaixaStatus>("aberto");
  const [filial, setFilial] = useState("Todas as filiais");
  const [movimentacoes, setMovimentacoes] =
    useState<Movimentacao[]>(MOVIMENTACOES_MOCK);

  const handleAbrirCaixa = () => {
    setStatus("aberto");
    toast.success("Caixa aberto com sucesso!");
  };

  const handleFecharCaixa = () => {
    setStatus("fechado");
    toast.success("Caixa fechado com sucesso!");
  };

  const handleEntrada = () => {
    toast.success("Entrada registrada!");
  };

  const handleSaida = () => {
    toast.error("Saída registrada!");
  };

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
          {/* Select filial */}
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

          {/* Histórico */}
          <Link href="/cashier/history">
            <button
              type="button"
              className="cursor-pointer h-9 px-3 rounded-md border border-[#30363d] bg-[#161b22] text-sm text-white flex items-center gap-2 hover:border-[#f5b82e]/40 transition-colors"
            >
              <History className="size-3.5 text-[#8b949e]" />
              Histórico
            </button>
          </Link>
        </div>
      </div>

      {/* ── Caixa fechado ── */}
      {status === "fechado" && (
        <div className="flex flex-col items-center justify-center py-24 gap-5">
          <div className="size-20 rounded-full bg-[#161b22] border border-[#30363d] flex items-center justify-center">
            <FolderOpen className="size-9 text-[#4d5562]" />
          </div>
          <p className="text-[#8b949e] text-sm">Nenhum caixa aberto</p>
          <button
            type="button"
            onClick={handleAbrirCaixa}
            className="
              h-10 px-6 rounded-md text-sm font-bold
              bg-[#f5b82e] text-black
              hover:bg-[#d9a326] hover:shadow-[0_0_16px_rgba(245,184,46,0.35)]
              transition-all flex items-center gap-2
            "
          >
            <Plus className="size-4" />
            Abrir Caixa
          </button>
        </div>
      )}

      {/* ── Caixa aberto ── */}
      {status === "aberto" && (
        <div className="space-y-5">
          {/* Cards de status */}
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
                    Abertura: 09/04/2026, 19:26:54
                  </p>
                  <p className="text-[11px] text-[#8b949e]">Filial: Matriz</p>
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
                  R$ 1.000,00
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
                  R$ 1.000,00
                </div>
              </CardContent>
            </Card>

            {/* Ações */}
            <Card className="bg-[#161b22] border-[#30363d] shadow-none">
              <CardContent className="p-4 flex flex-col gap-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleEntrada}
                    className="
                      h-9 rounded-md text-xs font-bold
                      bg-emerald-500/15 text-emerald-400
                      border border-emerald-500/30
                      hover:bg-emerald-500/25 transition-colors
                      flex items-center justify-center gap-1.5
                    "
                  >
                    <Plus className="size-3.5" />
                    Entrada
                  </button>
                  <button
                    type="button"
                    onClick={handleSaida}
                    className="
                      h-9 rounded-md text-xs font-bold
                      bg-red-500/15 text-red-400
                      border border-red-500/30
                      hover:bg-red-500/25 transition-colors
                      flex items-center justify-center gap-1.5
                    "
                  >
                    <Minus className="size-3.5" />
                    Saída
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleFecharCaixa}
                  className="
                    w-full h-9 rounded-md text-xs font-bold
                    bg-red-600 text-white
                    hover:bg-red-700 transition-colors
                    flex items-center justify-center gap-1.5
                  "
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
                  Movimentações ({movimentacoes.length})
                </h2>
              </div>

              {movimentacoes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-[#8b949e]">
                  <DollarSign className="size-10 opacity-30" />
                  <p className="text-sm">Nenhuma movimentação registrada</p>
                </div>
              ) : (
                <>
                  {/* Desktop */}
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
                        {movimentacoes.map((m, i) => (
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
                                ? `- ${m.valor}`
                                : `+ ${m.valor}`}
                            </TableCell>
                            <TableCell className="px-4 py-4 text-[#8b949e] text-sm">
                              {m.hora}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile */}
                  <div className="md:hidden px-4 pb-4 space-y-3 pt-3">
                    {movimentacoes.map((m, i) => (
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
                              ? `- ${m.valor}`
                              : `+ ${m.valor}`}
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
    </div>
  );
}
