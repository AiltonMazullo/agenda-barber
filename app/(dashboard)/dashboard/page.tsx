"use client";

import { useMemo } from "react";
import {
  Users,
  UserPlus,
  ClipboardList,
  Calendar,
  Target,
  Monitor,
  Cake,
  AlertTriangle,
  Wallet,
  ArrowUpRight,
  ChevronDown,
  Package,
  TrendingUp,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader, SummaryCard, StatusBadge } from "@/components/shared";
import { useAuth } from "@/hooks/useAuth";
import { useAppointments } from "@/hooks/useAppointments";
import { useClients } from "@/hooks/useClients";
import { useEmployees } from "@/hooks/useEmployees";
import type { AppointmentStatus } from "@/types/appointment.types";
import type { Tone } from "@/types/common.types";

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

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function DashboardPage() {
  const { barbershop } = useAuth();
  const { appointments, isLoading } = useAppointments(barbershop?.id);
  const { clients, isLoading: loadingClients } = useClients(barbershop?.id);
  const { employees, isLoading: loadingEmployees } = useEmployees(barbershop?.id);

  const today = new Date();

  const stats = useMemo(() => {
    const todayAppts = appointments.filter((a) =>
      isSameDay(new Date(a.scheduledAt), today),
    );
    const future = appointments.filter(
      (a) => new Date(a.scheduledAt) >= today && a.status !== "CANCELLED",
    );
    return {
      todayCount: todayAppts.length,
      totalCount: appointments.length,
      futureCount: future.length,
      todayList: todayAppts
        .sort(
          (a, b) =>
            new Date(a.scheduledAt).getTime() -
            new Date(b.scheduledAt).getTime(),
        )
        .slice(0, 6),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointments]);

  /** Aniversariantes do mês atual (a partir do birthDate dos clientes). */
  const birthdaysThisMonth = useMemo(() => {
    const m = today.getMonth();
    return clients.filter((c) => {
      if (!c.birthDate) return false;
      return new Date(c.birthDate).getMonth() === m;
    }).length;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clients]);
  return (
    <div className="space-y-6 p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral do seu negócio"
        actions={
          <>
            <Button
              variant="outline"
              className="bg-surface-raised border-border text-foreground hover:bg-surface-elevated h-9"
            >
              Todas filiais{" "}
              <ChevronDown className="ml-2 size-4 text-muted-foreground" />
            </Button>
            <Button
              variant="outline"
              className="bg-surface-raised border-border text-foreground hover:bg-surface-elevated h-9"
            >
              30 dias{" "}
              <ChevronDown className="ml-2 size-4 text-muted-foreground" />
            </Button>
          </>
        }
      />

      {/* Grid de Cards Principais — 5 colunas */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <SummaryCard
          label="Profissionais"
          value={loadingEmployees ? "…" : String(employees.length)}
          icon={<Users className="size-4" />}
          tone="brand"
        />
        <SummaryCard
          label="Clientes Totais"
          value={loadingClients ? "…" : String(clients.length)}
          icon={<UserPlus className="size-4" />}
          tone="brand"
        />
        <SummaryCard
          label="Comandas Abertas"
          value="0"
          icon={<ClipboardList className="size-4" />}
          tone="brand"
        />
        <SummaryCard
          label="Agenda Hoje"
          value={isLoading ? "…" : String(stats.todayCount)}
          icon={<Calendar className="size-4" />}
          tone="brand"
        />
        <SummaryCard
          label="Taxa Ocupação"
          value="0%"
          icon={<Target className="size-4" />}
          tone="brand"
        />
        <SummaryCard
          label="Agendamentos"
          value={isLoading ? "…" : String(stats.totalCount)}
          subtitle={`${stats.futureCount} futuros`}
          subtitleTone="success"
          icon={<Calendar className="size-4" />}
          tone="brand"
        />
        <SummaryCard
          label="Via Recepção"
          value="0"
          icon={<Users className="size-4" />}
          tone="brand"
        />
        <SummaryCard
          label="Via Online"
          value="0"
          icon={<Monitor className="size-4" />}
          tone="brand"
        />
        <SummaryCard
          label="Aniversariantes"
          value={loadingClients ? "…" : String(birthdaysThisMonth)}
          icon={<Cake className="size-4" />}
          tone="brand"
        />
        <SummaryCard
          label="Estoque Baixo"
          value="0"
          icon={<AlertTriangle className="size-4" />}
          tone="brand"
        />
        <SummaryCard
          label="Vendas (Mês)"
          value="0"
          subtitle="R$ 0,00"
          subtitleTone="danger"
          icon={<Wallet className="size-4" />}
          tone="brand"
        />
      </div>

      {/* Resumo Financeiro */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-brand text-xl font-bold">$</span>
            <h2 className="text-xs font-bold uppercase tracking-widest">
              Resumo Financeiro
            </h2>
          </div>
          <Button
            variant="link"
            className="text-brand text-xs gap-1 p-0 h-auto font-medium"
          >
            Ver tudo <ArrowUpRight className="size-3" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <SummaryCard label="Faturado" value="R$ 0,00" />
          <SummaryCard
            label="Recebido"
            value="R$ 0,00"
            tone="success"
            emphasized
          />
          <SummaryCard
            label="A Receber"
            value="R$ 0,00"
            tone="warning"
            emphasized
          />
          <SummaryCard
            label="Contas a Pagar"
            value="R$ 0,00"
            tone="danger"
            emphasized
          />
          <SummaryCard
            label="Saldo Atual"
            value="R$ 0,00"
            tone="warning"
            emphasized
          />
        </div>
      </div>

      {/* Seção Inferior: Assinaturas, Agenda, Ranking, Estoque */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard
          icon={<ClipboardList className="size-4" />}
          title="Assinaturas"
          actionLabel="Ver tudo"
        >
          <div className="grid grid-cols-2 gap-4">
            <MiniStat
              label="Ativos"
              value="0"
              tone="success"
            />
            <MiniStat
              label="Inadimplentes"
              value="0"
              tone="danger"
            />
            <MiniStat
              label="Novos no período"
              value="0"
              tone="warning"
            />
            <MiniStat label="Cancelados" value="0" tone="neutral" />
          </div>
        </SectionCard>

        <SectionCard
          icon={<Calendar className="size-4" />}
          title="Agenda do Dia"
          actionLabel="Ver agenda"
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-35 text-muted-foreground">
              <p className="text-sm">Carregando…</p>
            </div>
          ) : stats.todayList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-35 text-muted-foreground">
              <p className="text-sm">Nenhum agendamento para hoje.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {stats.todayList.map((a) => {
                const time = new Date(a.scheduledAt).toLocaleTimeString(
                  "pt-BR",
                  { hour: "2-digit", minute: "2-digit" },
                );
                return (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 px-3 py-2 rounded-md bg-surface-base border border-border-subtle"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-mono text-foreground min-w-12">
                      <Clock className="size-3 text-muted-foreground" />
                      {time}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {a.client.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {a.service.name}
                      </p>
                    </div>
                    <StatusBadge tone={STATUS_TONE[a.status]}>
                      {STATUS_LABEL[a.status]}
                    </StatusBadge>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        <SectionCard
          icon={<TrendingUp className="size-4" />}
          title="Ranking de Profissionais"
          actionLabel="Ver comissões"
        >
          <div className="flex flex-col items-center justify-center h-25 text-muted-foreground">
            <p className="text-sm">Sem dados no período.</p>
          </div>
        </SectionCard>

        <SectionCard
          icon={<Package className="size-4" />}
          title="Estoque Crítico"
          actionLabel="Ver estoque"
        >
          <div className="flex flex-col items-center justify-center h-25 text-muted-foreground">
            <div className="flex items-center gap-2 text-success-foreground/80">
              <CheckCircle2 className="size-4" />
              <p className="text-sm">Nenhum alerta de estoque.</p>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

// ─── Sub-componentes locais ──────────────────────────────────────────────────

interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  actionLabel: string;
  children: React.ReactNode;
}

function SectionCard({ icon, title, actionLabel, children }: SectionCardProps) {
  return (
    <Card className="bg-surface-raised border-border">
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <div className="flex items-center gap-2 text-brand">
          {icon}
          <CardTitle className="text-sm font-bold text-foreground uppercase">
            {title}
          </CardTitle>
        </div>
        <Button
          variant="link"
          className="text-brand text-xs gap-1 p-0 h-auto"
        >
          {actionLabel} <ArrowUpRight className="size-3" />
        </Button>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

interface MiniStatProps {
  label: string;
  value: string;
  tone: "success" | "danger" | "warning" | "neutral";
}

const MINI_STAT_BG: Record<MiniStatProps["tone"], string> = {
  success: "bg-success-bg",
  danger: "bg-danger-bg",
  warning: "bg-warning-bg",
  neutral: "bg-surface-elevated",
};

const MINI_STAT_TEXT: Record<MiniStatProps["tone"], string> = {
  success: "text-success-foreground",
  danger: "text-danger-foreground",
  warning: "text-warning-foreground",
  neutral: "text-muted-foreground",
};

function MiniStat({ label, value, tone }: MiniStatProps) {
  return (
    <div
      className={`${MINI_STAT_BG[tone]} rounded-md p-4 flex flex-col items-center justify-center text-center`}
    >
      <span className={`text-2xl font-bold ${MINI_STAT_TEXT[tone]}`}>
        {value}
      </span>
      <span className="text-[10px] text-muted-foreground font-medium uppercase mt-1">
        {label}
      </span>
    </div>
  );
}
