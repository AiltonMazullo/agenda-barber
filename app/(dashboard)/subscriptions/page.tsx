/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
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
  Pencil,
} from "lucide-react";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─── Tipos ───────────────────────────────────────────────────────────────────

type TabKey =
  | "contratos"
  | "assinantes"
  | "vendas_novas"
  | "cancelados"
  | "por_origem"
  | "calendario"
  | "pre_aprovados"
  | "pre_cancelados";

// ─── Dados mock ───────────────────────────────────────────────────────────────

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

// ─── Página ───────────────────────────────────────────────────────────────────

export default function AssinaturasPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("contratos");
  const [search, setSearch] = useState("");
  const [plano, setPlano] = useState("Todos planos");
  const [status, setStatus] = useState("Todos");

  return (
    <div className="space-y-6 p-4 md:p-6 bg-[#0d1117] min-h-screen text-white">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Assinaturas
          </h1>
          <p className="text-[#8b949e] text-sm mt-1">
            Gestão de contratos e recorrências
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            className="bg-[#161b22] border-[#30363d] text-white hover:bg-[#21262d] h-9 text-xs"
          >
            <LayoutList className="size-3.5 mr-1.5" />
            Planos
          </Button>
          <Button
            variant="outline"
            className="bg-[#161b22] border-[#30363d] text-white hover:bg-[#21262d] h-9 text-xs"
          >
            <Pencil className="size-3.5 mr-1.5" />
            Massa
          </Button>
          <Button className="bg-[#f5b82e] hover:bg-[#d9a326] text-black font-bold h-9 text-xs">
            <Plus className="size-3.5 mr-1.5" />
            Nova Assinatura
          </Button>
        </div>
      </div>

      {/* ── Cards de resumo ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <SummaryCard
          label="Ativos"
          value="0"
          valueColor="text-emerald-500"
          bgColor="bg-[#161b22]"
          icon={<CheckCircle2 className="size-3.5" />}
          iconColor="text-emerald-500"
        />
        <SummaryCard
          label="Inadimplentes"
          value="0"
          valueColor="text-red-500"
          bgColor="bg-[#161b22]"
          icon={<XOctagon className="size-3.5" />}
          iconColor="text-red-500"
        />
        <SummaryCard
          label="Total"
          value="0"
          valueColor="text-white"
          bgColor="bg-[#161b22]"
          icon={<Users className="size-3.5" />}
          iconColor="text-[#8b949e]"
        />
        <SummaryCard
          label="Gateway"
          value="R$ 0,00"
          valueColor="text-[#2e6df5]"
          bgColor="bg-[#161b22]"
          icon={<Globe className="size-3.5" />}
          iconColor="text-[#f5b82e]"
        />
        <SummaryCard
          label="Manual"
          value="R$ 0,00"
          valueColor="text-[#f5b82e]"
          bgColor="bg-[#161b22]"
          icon={<Edit className="size-3.5" />}
          iconColor="text-[#f5b82e]"
        />
        <SummaryCard
          label="Total Geral"
          value="R$ 0,00"
          valueColor="text-[#f5b82e]"
          bgColor="bg-[#241a06]"
          icon={<ArrowUpRight className="size-3.5" />}
          iconColor="text-[#f5b82e]"
        />
      </div>

      {/* ── Painel principal ── */}
      <Card className="bg-[#161b22] border-[#30363d]">
        <CardContent className="p-0">
          {/* Tabs – scroll horizontal no mobile */}
          <div className="overflow-x-auto border-b border-[#30363d]">
            <div className="flex min-w-max">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors
                    ${
                      activeTab === tab.key
                        ? "text-[#f5b82e] border-b-2 border-[#f5b82e]"
                        : "text-[#8b949e] hover:text-white"
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filtros */}
          <div className="p-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8b949e]" />
              <Input
                placeholder="Buscar cliente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-[#0d1117] border-[#30363d] text-white placeholder:text-[#8b949e] h-9 text-sm focus-visible:ring-[#f5b82e]/40"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button
                  variant="outline"
                  className="bg-[#0d1117] border-[#30363d] text-white hover:bg-[#21262d] h-9 text-xs min-w-[140px] justify-between"
                >
                  {plano}
                  <ChevronDown className="size-3.5 text-[#8b949e] ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#161b22] border-[#30363d] text-white">
                {["Todos planos", "Essential", "Pro", "Max"].map((p) => (
                  <DropdownMenuItem
                    key={p}
                    onClick={() => setPlano(p)}
                    className="text-xs hover:bg-[#21262d] cursor-pointer"
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
                  className="bg-[#0d1117] border-[#30363d] text-white hover:bg-[#21262d] h-9 text-xs min-w-[120px] justify-between"
                >
                  {status}
                  <ChevronDown className="size-3.5 text-[#8b949e] ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#161b22] border-[#30363d] text-white">
                {[
                  "Todos",
                  "Ativo",
                  "Inadimplente",
                  "Cancelado",
                  "Pré-Aprovado",
                ].map((s) => (
                  <DropdownMenuItem
                    key={s}
                    onClick={() => setStatus(s)}
                    className="text-xs hover:bg-[#21262d] cursor-pointer"
                  >
                    {s}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Tabela – Desktop */}
          <div className="hidden md:block">
            <Table>
              <TableHeader className="border-t border-[#30363d]">
                <TableRow className="border-[#30363d] hover:bg-transparent">
                  <TableHead className="text-[#8b949e] text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto">
                    Cliente
                  </TableHead>
                  <TableHead className="text-[#8b949e] text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto">
                    Plano
                  </TableHead>
                  <TableHead className="text-[#8b949e] text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto">
                    Origem
                  </TableHead>
                  <TableHead className="text-[#8b949e] text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto">
                    Início
                  </TableHead>
                  <TableHead className="text-[#8b949e] text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto">
                    Valor
                  </TableHead>
                  <TableHead className="text-[#8b949e] text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto">
                    Status
                  </TableHead>
                  <TableHead className="text-[#8b949e] text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto text-right">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="border-[#30363d] hover:bg-transparent">
                  <TableCell colSpan={7} className="py-16">
                    <EmptyState />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Lista – Mobile */}
          <div className="md:hidden px-4 pb-4">
            <EmptyState />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  valueColor,
  bgColor,
  icon,
  iconColor,
}: any) {
  return (
    <Card className={`${bgColor} border-[#30363d] shadow-none`}>
      <CardContent className="p-3 md:p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold text-[#8b949e] uppercase tracking-wider leading-none">
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

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3 text-[#8b949e]">
      <LayoutList className="size-10 opacity-30" />
      <p className="text-sm">Nenhum contrato encontrado</p>
    </div>
  );
}
