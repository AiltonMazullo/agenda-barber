"use client";

import { useMemo, useState } from "react";
import {
  ChevronRight,
  DollarSign,
  Users,
  Package,
  TrendingUp,
  Megaphone,
  CreditCard,
  Receipt,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader, EmptyState, StatusBadge, Loading } from "@/components/shared";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useReports } from "@/hooks/useReports";
import { useAppointments } from "@/hooks/useAppointments";
import { useProducts } from "@/hooks/useProducts";
import { useDerivedClients } from "@/hooks/useDerivedClients";
import { formatBRL, formatDate } from "@/utils/format";
import type { Appointment, AppointmentStatus } from "@/types/appointment.types";
import type { Tone } from "@/types/common.types";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type ReportSource = "api" | "missing";

interface ReportItem {
  key: string;
  label: string;
  description: string;
  source: ReportSource;
}

interface ReportGroup {
  key: string;
  label: string;
  icon: React.ReactNode;
  items: ReportItem[];
}

// ─── Configuração ────────────────────────────────────────────────────────────

const REPORT_GROUPS: ReportGroup[] = [
  {
    key: "financeiros",
    label: "Financeiros",
    icon: <DollarSign className="size-3.5" />,
    items: [
      {
        key: "vendas",
        label: "Vendas",
        description:
          "Relatório por item vendido, com filtros por período, filial, profissional, categoria, produto e serviço.",
        source: "missing",
      },
      {
        key: "formas_pagamento",
        label: "Formas de pagamento",
        description:
          "Distribui o faturamento por meio de pagamento, indicando quantidade e valor por método.",
        source: "missing",
      },
      {
        key: "faturamento_visao",
        label: "Faturamento - visão geral",
        description:
          "Consolidação macro que separa assinaturas (gateway), assinaturas manuais e comandas.",
        source: "api",
      },
      {
        key: "faturamento_detalhes",
        label: "Faturamento - detalhes",
        description:
          "Tabela detalhada com cliente, profissional, tipo de receita, valor e data/hora.",
        source: "api",
      },
      {
        key: "historico_movimentacoes",
        label: "Histórico de movimentações",
        description:
          "Extrato financeiro detalhado com cliente, profissional, operação, forma de pagamento, valor e data.",
        source: "missing",
      },
    ],
  },
  {
    key: "gestao",
    label: "Gestão",
    icon: <Users className="size-3.5" />,
    items: [
      {
        key: "frequencia_cliente",
        label: "Frequência do cliente",
        description: "Mede recorrência de retorno dos clientes em um período.",
        source: "api",
      },
      {
        key: "frequencia_kpis",
        label: "Frequência do cliente - KPIs",
        description:
          "Blocos de indicadores (visitas, clientes distintos, taxa média).",
        source: "api",
      },
      {
        key: "cliente_periodo_servico",
        label: "Cliente por período e serviço",
        description: "Segmentação de clientes conforme o serviço e período.",
        source: "api",
      },
      {
        key: "servicos_vendidos",
        label: "Serviços vendidos",
        description:
          "Relatório por serviço, mostrando valor unitário, faturado e quantidade realizada.",
        source: "api",
      },
      {
        key: "historico_agendamentos",
        label: "Histórico de agendamentos",
        description: "Base analítica com origem, status e auditoria.",
        source: "api",
      },
      {
        key: "historico_venda_produtos",
        label: "Histórico de venda de produtos",
        description:
          "Listagem de compras de produtos por cliente, profissional e data.",
        source: "missing",
      },
    ],
  },
  {
    key: "estoque",
    label: "Estoque",
    icon: <Package className="size-3.5" />,
    items: [
      {
        key: "entrada_saida",
        label: "Entrada e saída de estoque",
        description:
          "Histórico de movimentações com quantidade, valor unitário, tipo e observação.",
        source: "missing",
      },
      {
        key: "estoque_atual",
        label: "Estoque atual",
        description:
          "Snapshot com quantidade atual e mínima por produto e filial.",
        source: "api",
      },
    ],
  },
  {
    key: "profissionais",
    label: "Profissionais",
    icon: <TrendingUp className="size-3.5" />,
    items: [
      {
        key: "tm_atendimento",
        label: "Ticket médio por atendimento",
        description:
          "Faturamento por produto, serviço, assinaturas e ticket médio total por profissional.",
        source: "api",
      },
      {
        key: "tm_clientes_distintos",
        label: "Ticket médio de clientes distintos",
        description:
          "Ticket calculado por cliente único, em vez de por número de comandas.",
        source: "api",
      },
      {
        key: "comissoes_servicos",
        label: "Comissões de serviços",
        description:
          "Produção e comissão por serviço, diferenciando clube e sem clube.",
        source: "missing",
      },
      {
        key: "comissoes_produtos",
        label: "Comissões de produtos",
        description:
          "Venda de produtos por profissional, categoria e comissão.",
        source: "missing",
      },
    ],
  },
  {
    key: "marketing",
    label: "Marketing de Experiência",
    icon: <Megaphone className="size-3.5" />,
    items: [
      {
        key: "captacao",
        label: "Captação de clientes",
        description:
          "Painel de origem de aquisição com total por canal e lista de clientes.",
        source: "missing",
      },
      {
        key: "novos_clientes",
        label: "Novos clientes",
        description:
          "Relatório de primeira visita agrupado por profissional, com dados de contato.",
        source: "api",
      },
      {
        key: "ausentes",
        label: "Clientes ausentes",
        description:
          "Lista de clientes que não retornaram dentro de uma janela de tempo específica.",
        source: "api",
      },
      {
        key: "avaliacoes",
        label: "Avaliações",
        description:
          "Painel com total de avaliações, média e comentários vinculados a profissionais e clientes.",
        source: "missing",
      },
      {
        key: "aniversariantes",
        label: "Aniversariantes por período",
        description:
          "Lista de aniversariantes com telefone, e-mail e data de nascimento.",
        source: "missing",
      },
      {
        key: "sem_preferencia",
        label: "Clientes sem preferência",
        description: "Clientes sem vínculo com um profissional específico.",
        source: "api",
      },
    ],
  },
  {
    key: "assinaturas",
    label: "Assinaturas",
    icon: <CreditCard className="size-3.5" />,
    items: [
      {
        key: "qtd_assinantes",
        label: "Quantidade de assinantes",
        description: "Listagem da base por plano, status e data de criação.",
        source: "missing",
      },
      {
        key: "cancelados",
        label: "Cancelados por período",
        description: "Relatório de churn com plano, cliente, datas e motivo.",
        source: "missing",
      },
      {
        key: "vendas_novas",
        label: "Vendas novas por período",
        description: "Novas assinaturas vendidas no período.",
        source: "missing",
      },
      {
        key: "vendas_por_origem",
        label: "Vendas por origem",
        description: "Agrupa vendas de plano por vendedor/origem.",
        source: "missing",
      },
    ],
  },
  {
    key: "ticket_medio",
    label: "Ticket Médio",
    icon: <Receipt className="size-3.5" />,
    items: [
      {
        key: "tm_profissional",
        label: "Por profissional",
        description: "Faturamento médio por profissional no período.",
        source: "missing",
      },
      {
        key: "tm_cliente",
        label: "Por cliente",
        description:
          "Faturamento total, clientes distintos e ticket médio por cliente.",
        source: "api",
      },
      {
        key: "tm_agendamento",
        label: "Por agendamento",
        description:
          "Faturamento total, número de atendimentos e ticket médio por agendamento.",
        source: "api",
      },
    ],
  },
];

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
};

const STATUS_TONE: Record<AppointmentStatus, Tone> = {
  PENDING: "warning",
  CONFIRMED: "info",
  COMPLETED: "success",
  CANCELLED: "danger",
};

// ─── Sub-relatórios ───────────────────────────────────────────────────────────

function SemDados({ motivo }: { motivo?: string }) {
  return (
    <div className="py-12 flex flex-col items-center gap-2 text-center">
      <AlertCircle className="size-8 text-text-faint" />
      <p className="text-sm text-muted-foreground">
        Sem dados disponíveis no momento
      </p>
      {motivo && <p className="text-xs text-text-faint max-w-md">{motivo}</p>}
    </div>
  );
}

function LoadingState() {
  return <Loading />;
}

function RelFaturamentoVisao() {
  const { barbershop } = useAuth();
  const { faturamentoMensal, faturamentoTotal, totalAtendimentos, isLoading } =
    useReports(barbershop?.id);

  if (isLoading) return <LoadingState />;

  const max = Math.max(...faturamentoMensal.map((m) => m.total), 1);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-surface-base border border-border-subtle p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Faturamento acumulado
          </p>
          <p className="text-2xl font-bold text-brand mt-1">
            {formatBRL(faturamentoTotal)}
          </p>
        </div>
        <div className="rounded-lg bg-surface-base border border-border-subtle p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Atendimentos concluídos
          </p>
          <p className="text-2xl font-bold text-foreground mt-1">
            {totalAtendimentos}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-6 gap-3 items-end h-40">
        {faturamentoMensal.map((m) => {
          const altura = (m.total / max) * 100;
          return (
            <div
              key={m.mes}
              className="flex flex-col items-center gap-1.5 h-full"
            >
              <div className="text-[10px] font-bold text-foreground">
                {m.total > 0 ? formatBRL(m.total).replace("R$ ", "") : "—"}
              </div>
              <div className="w-full flex-1 flex items-end">
                <div
                  className="w-full bg-brand/80 hover:bg-brand transition-colors rounded-t-md min-h-1"
                  style={{ height: `${altura}%` }}
                />
              </div>
              <div className="text-[10px] text-muted-foreground">
                {m.mesLabel}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RelFaturamentoDetalhes() {
  const { barbershop } = useAuth();
  const { appointments, isLoading } = useAppointments(barbershop?.id);

  if (isLoading) return <LoadingState />;

  const completed = appointments
    .filter((a) => a.status === "COMPLETED")
    .sort(
      (a, b) =>
        new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
    );

  if (completed.length === 0)
    return <EmptyState message="Sem atendimentos concluídos." />;

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-border hover:bg-transparent">
          {["Data", "Cliente", "Serviço", "Valor"].map((c) => (
            <TableHead
              key={c}
              className="text-muted-foreground text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto"
            >
              {c}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {completed.map((a) => (
          <TableRow
            key={a.id}
            className="border-border hover:bg-surface-elevated/50"
          >
            <TableCell className="px-4 py-3 text-muted-foreground text-sm font-mono">
              {new Date(a.scheduledAt).toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </TableCell>
            <TableCell className="px-4 py-3 text-foreground font-semibold">
              {a.client.name}
            </TableCell>
            <TableCell className="px-4 py-3">
              <div className="flex items-center gap-1.5">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: a.service.hex ?? "#f5b82e" }}
                />
                <span className="text-sm text-foreground">
                  {a.service.name}
                </span>
              </div>
            </TableCell>
            <TableCell className="px-4 py-3 text-brand font-semibold">
              {formatBRL(a.service.priceInCents / 100)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function RelHistoricoAgendamentos() {
  const { barbershop } = useAuth();
  const { appointments, isLoading } = useAppointments(barbershop?.id);

  if (isLoading) return <LoadingState />;

  const ordered = [...appointments].sort(
    (a, b) =>
      new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
  );

  if (ordered.length === 0) return <EmptyState message="Sem agendamentos." />;

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-border hover:bg-transparent">
          {["Data", "Cliente", "Serviço", "Valor", "Status"].map((c) => (
            <TableHead
              key={c}
              className="text-muted-foreground text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto"
            >
              {c}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {ordered.map((a: Appointment) => (
          <TableRow
            key={a.id}
            className="border-border hover:bg-surface-elevated/50"
          >
            <TableCell className="px-4 py-3 text-muted-foreground text-sm font-mono">
              {new Date(a.scheduledAt).toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </TableCell>
            <TableCell className="px-4 py-3 text-foreground font-semibold">
              {a.client.name}
            </TableCell>
            <TableCell className="px-4 py-3">
              <div className="flex items-center gap-1.5">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: a.service.hex ?? "#f5b82e" }}
                />
                <span className="text-sm text-foreground">
                  {a.service.name}
                </span>
              </div>
            </TableCell>
            <TableCell className="px-4 py-3 text-brand font-semibold">
              {formatBRL(a.service.priceInCents / 100)}
            </TableCell>
            <TableCell className="px-4 py-3">
              <StatusBadge tone={STATUS_TONE[a.status]}>
                {STATUS_LABEL[a.status]}
              </StatusBadge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function RelServicosVendidos() {
  const { barbershop } = useAuth();
  const { servicosMaisVendidos, isLoading } = useReports(barbershop?.id);

  if (isLoading) return <LoadingState />;

  if (servicosMaisVendidos.length === 0)
    return <EmptyState message="Sem serviços vendidos." />;

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-border hover:bg-transparent">
          {["Serviço", "Valor unit.", "Quantidade", "Faturamento"].map((c) => (
            <TableHead
              key={c}
              className="text-muted-foreground text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto"
            >
              {c}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {servicosMaisVendidos.map((row) => (
          <TableRow
            key={row.service.id}
            className="border-border hover:bg-surface-elevated/50"
          >
            <TableCell className="px-4 py-3">
              <div className="flex items-center gap-2">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: row.service.hex ?? "#f5b82e" }}
                />
                <span className="font-semibold text-foreground text-sm">
                  {row.service.name}
                </span>
              </div>
            </TableCell>
            <TableCell className="px-4 py-3 text-muted-foreground">
              {formatBRL(row.service.priceInCents / 100)}
            </TableCell>
            <TableCell className="px-4 py-3 text-info-foreground font-semibold">
              {row.atendimentos}
            </TableCell>
            <TableCell className="px-4 py-3 text-brand font-bold">
              {formatBRL(row.faturamento)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function RelFrequenciaCliente() {
  const { barbershop } = useAuth();
  const { clients, isLoading } = useDerivedClients(barbershop?.id);

  if (isLoading) return <LoadingState />;
  if (clients.length === 0) return <EmptyState message="Sem clientes." />;

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-border hover:bg-transparent">
          {["Cliente", "Visitas", "Última visita", "Próxima"].map((c) => (
            <TableHead
              key={c}
              className="text-muted-foreground text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto"
            >
              {c}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((c) => (
          <TableRow
            key={c.id}
            className="border-border hover:bg-surface-elevated/50"
          >
            <TableCell className="px-4 py-3 text-foreground font-semibold">
              {c.name}
            </TableCell>
            <TableCell className="px-4 py-3 text-info-foreground font-semibold">
              {c.completedAppointments}
            </TableCell>
            <TableCell className="px-4 py-3 text-muted-foreground">
              {c.lastVisit ? formatDate(c.lastVisit) : "—"}
            </TableCell>
            <TableCell className="px-4 py-3 text-muted-foreground">
              {c.upcomingVisit ? formatDate(c.upcomingVisit) : "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function RelFrequenciaKPIs() {
  const { barbershop } = useAuth();
  const { clients, isLoading } = useDerivedClients(barbershop?.id);
  const { totalAtendimentos } = useReports(barbershop?.id);

  if (isLoading) return <LoadingState />;

  const total = clients.length;
  const ativos = clients.filter((c) => c.upcomingVisit).length;
  const ausentes = clients.filter(
    (c) => !c.upcomingVisit && c.lastVisit,
  ).length;
  const recorrentes = clients.filter(
    (c) => c.completedAppointments >= 2,
  ).length;
  const taxa =
    total > 0 ? Math.round((totalAtendimentos / total) * 10) / 10 : 0;

  const cards = [
    { label: "Total de clientes", value: total },
    { label: "Visitas (atendimentos concluídos)", value: totalAtendimentos },
    { label: "Com agenda futura", value: ativos, tone: "success" as const },
    { label: "Sem agenda atual", value: ausentes, tone: "warning" as const },
    { label: "Recorrentes (≥2 visitas)", value: recorrentes },
    { label: "Taxa média de visitas/cliente", value: taxa },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-lg bg-surface-base border border-border-subtle p-4"
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {c.label}
          </p>
          <p
            className={cn(
              "text-2xl font-bold mt-1",
              c.tone === "success"
                ? "text-success-foreground"
                : c.tone === "warning"
                  ? "text-warning-foreground"
                  : "text-foreground",
            )}
          >
            {c.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function RelClientesPorServico() {
  const { barbershop } = useAuth();
  const { appointments, isLoading } = useAppointments(barbershop?.id);

  if (isLoading) return <LoadingState />;

  const map = new Map<
    string,
    {
      serviceName: string;
      hex: string | null;
      clients: Set<string>;
      total: number;
    }
  >();
  for (const a of appointments) {
    const entry = map.get(a.serviceId) ?? {
      serviceName: a.service.name,
      hex: a.service.hex,
      clients: new Set<string>(),
      total: 0,
    };
    entry.clients.add(a.clientId);
    entry.total += 1;
    map.set(a.serviceId, entry);
  }

  const rows = Array.from(map.values()).sort(
    (a, b) => b.clients.size - a.clients.size,
  );

  if (rows.length === 0) return <EmptyState message="Sem dados." />;

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-border hover:bg-transparent">
          {["Serviço", "Clientes únicos", "Total de atendimentos"].map((c) => (
            <TableHead
              key={c}
              className="text-muted-foreground text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto"
            >
              {c}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow
            key={r.serviceName}
            className="border-border hover:bg-surface-elevated/50"
          >
            <TableCell className="px-4 py-3">
              <div className="flex items-center gap-2">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: r.hex ?? "#f5b82e" }}
                />
                <span className="font-semibold text-foreground text-sm">
                  {r.serviceName}
                </span>
              </div>
            </TableCell>
            <TableCell className="px-4 py-3 text-info-foreground font-semibold">
              {r.clients.size}
            </TableCell>
            <TableCell className="px-4 py-3 text-muted-foreground">
              {r.total}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function RelEstoqueAtual() {
  const { barbershop } = useAuth();
  const { products, isLoading } = useProducts(barbershop?.id);

  if (isLoading) return <LoadingState />;
  if (products.length === 0)
    return <EmptyState message="Sem produtos cadastrados." />;

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-border hover:bg-transparent">
          {[
            "Produto",
            "Qtd atual",
            "Mínimo",
            "Preço unit.",
            "Valor estoque",
          ].map((c) => (
            <TableHead
              key={c}
              className="text-muted-foreground text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto"
            >
              {c}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((p) => (
          <TableRow
            key={p.id}
            className="border-border hover:bg-surface-elevated/50"
          >
            <TableCell className="px-4 py-3 text-foreground font-semibold">
              {p.name}
            </TableCell>
            <TableCell className="px-4 py-3 text-muted-foreground">
              {p.totalCurrent}
            </TableCell>
            <TableCell className="px-4 py-3 text-muted-foreground">
              {p.totalMin}
            </TableCell>
            <TableCell className="px-4 py-3 text-muted-foreground">
              {formatBRL(p.priceInCents / 100)}
            </TableCell>
            <TableCell className="px-4 py-3 text-brand font-semibold">
              {formatBRL((p.totalCurrent * p.priceInCents) / 100)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function RelTicketMedioAtendimento() {
  const { barbershop } = useAuth();
  const { ticketMedioGeral, totalAtendimentos, faturamentoTotal, isLoading } =
    useReports(barbershop?.id);

  if (isLoading) return <LoadingState />;

  return (
    <div className="flex flex-col items-center text-center gap-4 py-6">
      <DollarSign className="size-12 text-brand" />
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
          Ticket Médio por Atendimento
        </p>
        <p className="text-4xl font-bold text-brand">
          {formatBRL(ticketMedioGeral)}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 w-full max-w-md mt-4">
        <div className="bg-surface-base border border-border rounded-lg p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
            Atendimentos
          </p>
          <p className="text-2xl font-bold text-foreground">
            {totalAtendimentos}
          </p>
        </div>
        <div className="bg-surface-base border border-border rounded-lg p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
            Faturamento Total
          </p>
          <p className="text-2xl font-bold text-success-foreground">
            {formatBRL(faturamentoTotal)}
          </p>
        </div>
      </div>
    </div>
  );
}

function RelTicketMedioCliente() {
  const { barbershop } = useAuth();
  const { clients, isLoading } = useDerivedClients(barbershop?.id);

  if (isLoading) return <LoadingState />;

  const withSpend = clients.filter((c) => c.completedAppointments > 0);
  if (withSpend.length === 0)
    return <EmptyState message="Sem clientes com atendimento concluído." />;

  const sorted = [...withSpend].sort(
    (a, b) =>
      b.totalSpent / b.completedAppointments -
      a.totalSpent / a.completedAppointments,
  );

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-border hover:bg-transparent">
          {["Cliente", "Atendimentos", "Total gasto", "Ticket médio"].map(
            (c) => (
              <TableHead
                key={c}
                className="text-muted-foreground text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto"
              >
                {c}
              </TableHead>
            ),
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((c) => {
          const tm = c.totalSpent / c.completedAppointments;
          return (
            <TableRow
              key={c.id}
              className="border-border hover:bg-surface-elevated/50"
            >
              <TableCell className="px-4 py-3 text-foreground font-semibold">
                {c.name}
              </TableCell>
              <TableCell className="px-4 py-3 text-muted-foreground">
                {c.completedAppointments}
              </TableCell>
              <TableCell className="px-4 py-3 text-success-foreground font-semibold">
                {formatBRL(c.totalSpent)}
              </TableCell>
              <TableCell className="px-4 py-3 text-brand font-bold">
                {formatBRL(tm)}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

function RelNovosClientes() {
  const { barbershop } = useAuth();
  const { clients, isLoading } = useDerivedClients(barbershop?.id);

  if (isLoading) return <LoadingState />;

  const novos = clients.filter((c) => c.completedAppointments <= 1);
  if (novos.length === 0)
    return <EmptyState message="Sem novos clientes no período." />;

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-border hover:bg-transparent">
          {["Cliente", "E-mail", "Status", "Próxima visita"].map((c) => (
            <TableHead
              key={c}
              className="text-muted-foreground text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto"
            >
              {c}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {novos.map((c) => (
          <TableRow
            key={c.id}
            className="border-border hover:bg-surface-elevated/50"
          >
            <TableCell className="px-4 py-3 text-foreground font-semibold">
              {c.name}
            </TableCell>
            <TableCell className="px-4 py-3 text-muted-foreground">
              {c.email}
            </TableCell>
            <TableCell className="px-4 py-3">
              <StatusBadge
                tone={c.completedAppointments === 0 ? "neutral" : "info"}
              >
                {c.completedAppointments === 0 ? "Sem visita" : "1ª visita"}
              </StatusBadge>
            </TableCell>
            <TableCell className="px-4 py-3 text-muted-foreground">
              {c.upcomingVisit ? formatDate(c.upcomingVisit) : "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function RelAusentes() {
  const { barbershop } = useAuth();
  const { clients, isLoading } = useDerivedClients(barbershop?.id);

  if (isLoading) return <LoadingState />;

  const ausentes = clients.filter((c) => c.lastVisit && !c.upcomingVisit);
  if (ausentes.length === 0)
    return <EmptyState message="Nenhum cliente ausente." />;

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-border hover:bg-transparent">
          {["Cliente", "Última visita", "Total gasto"].map((c) => (
            <TableHead
              key={c}
              className="text-muted-foreground text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto"
            >
              {c}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {ausentes.map((c) => (
          <TableRow
            key={c.id}
            className="border-border hover:bg-surface-elevated/50"
          >
            <TableCell className="px-4 py-3 text-foreground font-semibold">
              {c.name}
            </TableCell>
            <TableCell className="px-4 py-3 text-muted-foreground">
              {c.lastVisit ? formatDate(c.lastVisit) : "—"}
            </TableCell>
            <TableCell className="px-4 py-3 text-success-foreground font-semibold">
              {formatBRL(c.totalSpent)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function RelSemPreferencia() {
  // Sem employeeId em Appointment, todos os clientes ficam sem preferência.
  // Listamos a base completa para o usuário ter visibilidade.
  const { barbershop } = useAuth();
  const { clients, isLoading } = useDerivedClients(barbershop?.id);

  if (isLoading) return <LoadingState />;
  if (clients.length === 0)
    return <EmptyState message="Sem clientes cadastrados." />;

  return (
    <>
      <div className="mb-3 px-3 py-2 rounded-md bg-info-bg border border-info/30 text-xs text-info-foreground">
        Enquanto o backend não vincular o profissional ao agendamento, todos os
        clientes aparecem aqui como &quot;sem preferência&quot;.
      </div>
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            {["Cliente", "E-mail", "Atendimentos"].map((c) => (
              <TableHead
                key={c}
                className="text-muted-foreground text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto"
              >
                {c}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((c) => (
            <TableRow
              key={c.id}
              className="border-border hover:bg-surface-elevated/50"
            >
              <TableCell className="px-4 py-3 text-foreground font-semibold">
                {c.name}
              </TableCell>
              <TableCell className="px-4 py-3 text-muted-foreground">
                {c.email}
              </TableCell>
              <TableCell className="px-4 py-3 text-info-foreground font-semibold">
                {c.completedAppointments}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}

// ─── Roteador de sub-relatórios ──────────────────────────────────────────────

function renderSubReport(key: string): React.ReactNode {
  switch (key) {
    case "faturamento_visao":
      return <RelFaturamentoVisao />;
    case "faturamento_detalhes":
      return <RelFaturamentoDetalhes />;
    case "historico_agendamentos":
      return <RelHistoricoAgendamentos />;
    case "servicos_vendidos":
      return <RelServicosVendidos />;
    case "frequencia_cliente":
      return <RelFrequenciaCliente />;
    case "frequencia_kpis":
      return <RelFrequenciaKPIs />;
    case "cliente_periodo_servico":
      return <RelClientesPorServico />;
    case "estoque_atual":
      return <RelEstoqueAtual />;
    case "tm_atendimento":
    case "tm_agendamento":
      return <RelTicketMedioAtendimento />;
    case "tm_clientes_distintos":
    case "tm_cliente":
      return <RelTicketMedioCliente />;
    case "novos_clientes":
      return <RelNovosClientes />;
    case "ausentes":
      return <RelAusentes />;
    case "sem_preferencia":
      return <RelSemPreferencia />;
    default:
      return null;
  }
}

// ─── Página ──────────────────────────────────────────────────────────────────

export default function RelatoriosPage() {
  const [activeGroupKey, setActiveGroupKey] = useState<string | null>(null);
  const [activeItemKey, setActiveItemKey] = useState<string | null>(null);

  const activeGroup = useMemo(
    () => REPORT_GROUPS.find((g) => g.key === activeGroupKey),
    [activeGroupKey],
  );
  const activeItem = useMemo(
    () => activeGroup?.items.find((i) => i.key === activeItemKey),
    [activeGroup, activeItemKey],
  );

  function openItem(groupKey: string, itemKey: string) {
    setActiveGroupKey(groupKey);
    setActiveItemKey(itemKey);
  }

  function back() {
    setActiveGroupKey(null);
    setActiveItemKey(null);
  }

  if (activeGroup && activeItem) {
    return (
      <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
        <PageHeader
          title={activeItem.label}
          subtitle={`Relatórios → ${activeGroup.label}`}
          actions={
            <button
              type="button"
              onClick={back}
              className="h-9 px-4 rounded-md border border-border bg-surface-raised text-sm text-foreground flex items-center gap-2 hover:border-brand/40 transition-colors"
            >
              <ArrowLeft className="size-3.5 text-muted-foreground" />
              Voltar
            </button>
          }
        />

        {activeItem.description && (
          <p className="text-sm text-muted-foreground -mt-2">
            {activeItem.description}
          </p>
        )}

        <Card className="bg-surface-raised border-border">
          <CardContent className="p-4">
            {activeItem.source === "missing" ? (
              <SemDados motivo="Este relatório depende de uma entidade que ainda não existe no backend (vendas, comissões, formas de pagamento, assinaturas, etc.)." />
            ) : (
              renderSubReport(activeItem.key)
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Relatórios"
        subtitle="7 categorias de análise do seu negócio"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {REPORT_GROUPS.map((group) => {
          const available = group.items.filter(
            (i) => i.source === "api",
          ).length;
          return (
            <Card key={group.key} className="bg-surface-raised border-border">
              <CardContent className="p-0">
                <div className="px-4 py-3 border-b border-border-subtle flex items-center gap-2">
                  <div className="size-7 rounded-md bg-brand/15 border border-brand/30 flex items-center justify-center text-brand">
                    {group.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">
                      {group.label}
                    </p>
                    <p className="text-[10px] text-text-faint">
                      {available} de {group.items.length} com dados
                    </p>
                  </div>
                </div>
                <ul className="divide-y divide-border-subtle">
                  {group.items.map((item) => (
                    <li key={item.key}>
                      <button
                        type="button"
                        onClick={() => openItem(group.key, item.key)}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-surface-elevated/50 transition-colors group"
                      >
                        <span
                          className={cn(
                            "text-foreground",
                            item.source === "missing" &&
                              "text-muted-foreground",
                          )}
                        >
                          {item.label}
                        </span>
                        <div className="flex items-center gap-2">
                          {item.source === "missing" && (
                            <span className="text-[9px] uppercase tracking-widest text-text-faint">
                              em breve
                            </span>
                          )}
                          <ChevronRight
                            className={cn(
                              "size-3.5 text-text-faint group-hover:text-brand transition-colors",
                              item.source === "missing" && "opacity-50",
                            )}
                          />
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-[10px] text-text-faint pt-2">
        Os relatórios marcados como &quot;em breve&quot; dependem de entidades
        que ainda não existem no backend (comissões, vendas de produtos, formas
        de pagamento, assinaturas, avaliações). Quando o backend evoluir, eles
        passarão a exibir dados automaticamente.
      </p>
    </div>
  );
}
