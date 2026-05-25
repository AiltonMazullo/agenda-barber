"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Users,
  Calendar,
  Package,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader, SummaryCard, StatusBadge } from "@/components/shared";
import { useAuth } from "@/hooks/useAuth";
import { useAppointments } from "@/hooks/useAppointments";
import { useEmployees } from "@/hooks/useEmployees";
import { useProducts, type ProductWithStock } from "@/hooks/useProducts";
import { useReports } from "@/hooks/useReports";
import type { AppointmentStatus } from "@/types/appointment.types";
import type { Tone } from "@/types/common.types";
import { formatBRL } from "@/utils/format";

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

function isLowStock(p: ProductWithStock): boolean {
  if (p.totalMin === 0) return false;
  return p.totalCurrent < p.totalMin;
}

export default function DashboardPage() {
  const { barbershop } = useAuth();
  const { appointments, isLoading: loadingAppts } = useAppointments(
    barbershop?.id,
  );
  const { employees, isLoading: loadingEmployees } = useEmployees(
    barbershop?.id,
  );
  const { products, isLoading: loadingProducts } = useProducts(barbershop?.id);
  const {
    faturamentoMensal,
    faturamentoTotal,
    isLoading: loadingReports,
  } = useReports(barbershop?.id);

  const today = new Date();

  const stats = useMemo(() => {
    const todayAppts = appointments.filter((a) =>
      isSameDay(new Date(a.scheduledAt), today),
    );
    const future = appointments.filter(
      (a) =>
        new Date(a.scheduledAt) >= today && a.status !== "CANCELLED",
    );
    return {
      todayCount: todayAppts.length,
      futureCount: future.length,
      totalCount: appointments.length,
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

  const lowStockProducts = useMemo(
    () => products.filter(isLowStock).slice(0, 5),
    [products],
  );
  const lowStockCount = useMemo(
    () => products.filter(isLowStock).length,
    [products],
  );

  const faturamentoMesAtual =
    faturamentoMensal[faturamentoMensal.length - 1]?.total ?? 0;

  return (
    <div className="space-y-6 p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral do seu negócio"
      />

      {/* Cards principais — só com dados reais */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <SummaryCard
          label="Profissionais"
          value={loadingEmployees ? "…" : String(employees.length)}
          icon={<Users className="size-4" />}
          tone="brand"
        />
        <SummaryCard
          label="Agenda Hoje"
          value={loadingAppts ? "…" : String(stats.todayCount)}
          icon={<Calendar className="size-4" />}
          tone="brand"
        />
        <SummaryCard
          label="Agendamentos"
          value={loadingAppts ? "…" : String(stats.totalCount)}
          subtitle={`${stats.futureCount} futuros`}
          subtitleTone="success"
          icon={<Calendar className="size-4" />}
          tone="info"
        />
        <SummaryCard
          label="Estoque Baixo"
          value={loadingProducts ? "…" : String(lowStockCount)}
          icon={<AlertTriangle className="size-4" />}
          tone={lowStockCount > 0 ? "danger" : "brand"}
        />
        <SummaryCard
          label="Faturado no mês"
          value={loadingReports ? "…" : formatBRL(faturamentoMesAtual)}
          icon={<DollarSign className="size-4" />}
          tone="success"
          emphasized
        />
      </div>

      {/* Resumo financeiro do período */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <TrendingUp className="size-4 text-brand" />
            Faturamento (últimos 6 meses)
          </h2>
          <Link
            href="/reports"
            className="text-brand text-xs flex items-center gap-1 hover:underline"
          >
            Ver relatórios <ArrowUpRight className="size-3" />
          </Link>
        </div>

        <Card className="bg-surface-raised border-border">
          <CardContent className="p-5">
            {loadingReports ? (
              <p className="text-sm text-text-faint text-center py-4">
                Carregando…
              </p>
            ) : (
              <div className="grid grid-cols-6 gap-3 items-end h-32">
                {faturamentoMensal.map((m) => {
                  const max = Math.max(
                    ...faturamentoMensal.map((d) => d.total),
                    1,
                  );
                  const altura = (m.total / max) * 100;
                  return (
                    <div
                      key={m.mes}
                      className="flex flex-col items-center gap-1.5 h-full"
                    >
                      <div className="text-[10px] font-bold text-foreground">
                        {m.total > 0
                          ? formatBRL(m.total).replace("R$ ", "")
                          : "—"}
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
            )}
            <p className="text-[10px] text-text-faint pt-3 border-t border-border-subtle mt-3">
              Total acumulado:{" "}
              <span className="text-brand font-bold">
                {formatBRL(faturamentoTotal)}
              </span>{" "}
              · baseado em atendimentos concluídos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Agenda do dia + Estoque crítico */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard
          icon={<Calendar className="size-4" />}
          title="Agenda do Dia"
          actionLabel="Ver agenda"
          actionHref="/schedule"
        >
          {loadingAppts ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <p className="text-sm">Carregando…</p>
            </div>
          ) : stats.todayList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
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
          icon={<Package className="size-4" />}
          title="Estoque Crítico"
          actionLabel="Ver estoque"
          actionHref="/inventory"
        >
          {loadingProducts ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <p className="text-sm">Carregando…</p>
            </div>
          ) : lowStockProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2">
              <CheckCircle2 className="size-5 text-success-foreground/80" />
              <p className="text-sm text-success-foreground/80">
                Nenhum alerta de estoque.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-md bg-surface-base border border-danger/30"
                >
                  <AlertTriangle className="size-3.5 text-danger-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {p.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {p.totalCurrent} de {p.totalMin} (mínimo)
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-danger-foreground bg-danger/10 px-2 py-0.5 rounded">
                    Baixo
                  </span>
                </div>
              ))}
            </div>
          )}
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
  actionHref: string;
  children: React.ReactNode;
}

function SectionCard({
  icon,
  title,
  actionLabel,
  actionHref,
  children,
}: SectionCardProps) {
  return (
    <Card className="bg-surface-raised border-border">
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <div className="flex items-center gap-2 text-brand">
          {icon}
          <CardTitle className="text-sm font-bold text-foreground uppercase">
            {title}
          </CardTitle>
        </div>
        <Link href={actionHref}>
          <Button
            variant="link"
            className="text-brand text-xs gap-1 p-0 h-auto"
          >
            {actionLabel} <ArrowUpRight className="size-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
