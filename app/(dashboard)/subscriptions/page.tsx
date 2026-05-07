"use client";

import { useState, type ReactNode } from "react";
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
import { PageHeader, EmptyState } from "@/components/shared";
import { CONTRATOS_MOCK } from "@/mock/subscriptions";

// ─── Tipos ────────────────────────────────────────────────────────────────────

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

// ─── Página ───────────────────────────────────────────────────────────────────

export default function AssinaturasPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("contratos");
  const [search, setSearch] = useState("");
  const [plano, setPlano] = useState("Todos planos");
  const [status, setStatus] = useState("Todos");

  return (
    <div className="space-y-6 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Assinaturas"
        subtitle="Gestão de contratos e recorrências"
        actions={
          <>
            <Button
              variant="outline"
              className="bg-surface-raised border-border text-foreground hover:bg-surface-elevated h-9 text-xs"
            >
              <LayoutList className="size-3.5 mr-1.5" />
              Planos
            </Button>
            <Button
              variant="outline"
              className="bg-surface-raised border-border text-foreground hover:bg-surface-elevated h-9 text-xs"
            >
              <Pencil className="size-3.5 mr-1.5" />
              Massa
            </Button>
            <Button className="bg-brand hover:bg-brand-hover text-brand-foreground font-bold h-9 text-xs">
              <Plus className="size-3.5 mr-1.5" />
              Nova Assinatura
            </Button>
          </>
        }
      />

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <SummaryCardCustom
          label="Ativos"
          value="0"
          valueColor="text-success-foreground"
          bgColor="bg-surface-raised"
          icon={<CheckCircle2 className="size-3.5" />}
          iconColor="text-success-foreground"
        />
        <SummaryCardCustom
          label="Inadimplentes"
          value="0"
          valueColor="text-danger-foreground"
          bgColor="bg-surface-raised"
          icon={<XOctagon className="size-3.5" />}
          iconColor="text-danger-foreground"
        />
        <SummaryCardCustom
          label="Total"
          value="0"
          valueColor="text-foreground"
          bgColor="bg-surface-raised"
          icon={<Users className="size-3.5" />}
          iconColor="text-muted-foreground"
        />
        <SummaryCardCustom
          label="Gateway"
          value="R$ 0,00"
          valueColor="text-info-foreground"
          bgColor="bg-surface-raised"
          icon={<Globe className="size-3.5" />}
          iconColor="text-brand"
        />
        <SummaryCardCustom
          label="Manual"
          value="R$ 0,00"
          valueColor="text-brand"
          bgColor="bg-surface-raised"
          icon={<Edit className="size-3.5" />}
          iconColor="text-brand"
        />
        <SummaryCardCustom
          label="Total Geral"
          value="R$ 0,00"
          valueColor="text-brand"
          bgColor="bg-warning-bg"
          icon={<ArrowUpRight className="size-3.5" />}
          iconColor="text-brand"
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
          <div className="p-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cliente..."
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
                  {plano}
                  <ChevronDown className="size-3.5 text-muted-foreground ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-surface-raised border-border text-foreground">
                {["Todos planos", "Essential", "Pro", "Max"].map((p) => (
                  <DropdownMenuItem
                    key={p}
                    onClick={() => setPlano(p)}
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
                  {status}
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
                ].map((s) => (
                  <DropdownMenuItem
                    key={s}
                    onClick={() => setStatus(s)}
                    className="text-xs hover:bg-surface-elevated cursor-pointer"
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
                  ].map((col, idx) => (
                    <TableHead
                      key={col}
                      className={`text-muted-foreground text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto ${
                        idx === 6 ? "text-right" : ""
                      }`}
                    >
                      {col}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {CONTRATOS_MOCK.length === 0 ? (
                  <TableRow className="border-border hover:bg-transparent">
                    <TableCell colSpan={7} className="py-16">
                      <EmptyState
                        message="Nenhum contrato encontrado"
                        icon={<LayoutList className="size-10" />}
                      />
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>

          {/* Lista – Mobile */}
          <div className="md:hidden px-4 pb-4">
            <EmptyState
              message="Nenhum contrato encontrado"
              icon={<LayoutList className="size-10" />}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Sub-componente local: SummaryCardCustom ──────────────────────────────────

interface SummaryCardCustomProps {
  label: string;
  value: string;
  valueColor: string;
  bgColor: string;
  icon: ReactNode;
  iconColor: string;
}

function SummaryCardCustom({
  label,
  value,
  valueColor,
  bgColor,
  icon,
  iconColor,
}: SummaryCardCustomProps) {
  return (
    <Card className={`${bgColor} border-border shadow-none`}>
      <CardContent className="p-3 md:p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none">
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
