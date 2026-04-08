/* eslint-disable @typescript-eslint/no-explicit-any */
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
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

// ─── Página ───────────────────────────────────────────────────────────────────

export default function FinanceiroPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("contas_pagar");
  const [search, setSearch] = useState("");

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
    <div className="space-y-6 p-4 md:p-6 bg-[#0d1117] min-h-screen text-white">
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

      {/* ── Cards de resumo ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard
          label="A Pagar"
          value="R$ 4.700,00"
          valueColor="text-red-500"
          icon={<ArrowDownRight className="size-4" />}
          iconColor="text-red-500"
        />
        <SummaryCard
          label="A Receber"
          value="R$ 399,80"
          valueColor="text-emerald-500"
          icon={<ArrowUpRight className="size-4" />}
          iconColor="text-emerald-500"
        />
        <SummaryCard
          label="Saldo Atual"
          value="-R$ 2.422,00"
          valueColor="text-[#f5b82e]"
          icon={<DollarSign className="size-4" />}
          iconColor="text-[#f5b82e]"
        />
        <SummaryCard
          label="Saldo Projetado"
          value="-R$ 6.722,20"
          valueColor="text-blue-400"
          icon={<TrendingUp className="size-4" />}
          iconColor="text-blue-400"
        />
      </div>

      {/* ── Painel principal ── */}
      <Card className="bg-[#161b22] border-[#30363d]">
        <CardContent className="p-0">
          {/* Tabs */}
          <div className="px-4 pt-4 flex gap-1">
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

          {/* Busca */}
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

          {/* Conteúdo da tab Categorias */}
          {activeTab === "categorias" && (
            <div className="px-4 pb-6">
              <EmptyState message="Nenhuma categoria cadastrada." />
            </div>
          )}

          {/* Tabela – Desktop */}
          {activeTab !== "categorias" && (
            <>
              <div className="hidden md:block">
                <Table>
                  <TableHeader className="border-t border-[#30363d]">
                    <TableRow className="border-[#30363d] hover:bg-transparent">
                      <TableHead className="text-[#8b949e] text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto">
                        Descrição
                      </TableHead>
                      <TableHead className="text-[#8b949e] text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto">
                        Categoria
                      </TableHead>
                      <TableHead className="text-[#8b949e] text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto">
                        Vencimento
                      </TableHead>
                      <TableHead className="text-[#8b949e] text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto">
                        Forma
                      </TableHead>
                      <TableHead className="text-[#8b949e] text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto">
                        Valor
                      </TableHead>
                      <TableHead className="text-[#8b949e] text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto">
                        Status
                      </TableHead>
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

              {/* Lista – Mobile */}
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

function SummaryCard({ label, value, valueColor, icon, iconColor }: any) {
  return (
    <Card className="bg-[#161b22] border-[#30363d] shadow-none">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold text-[#8b949e] uppercase tracking-wider">
            {label}
          </p>
          <span className={iconColor}>{icon}</span>
        </div>
        <div className={`text-xl md:text-2xl font-bold ${valueColor}`}>
          {value}
        </div>
      </CardContent>
    </Card>
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
