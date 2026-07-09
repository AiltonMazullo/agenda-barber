"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  ClipboardList,
  Calendar,
  Target,
  Cake,
  ArrowUpRight,
  Package,
  TrendingUp,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { PageHeader, SummaryCard, StatusBadge, Loading } from "@/components/shared";
import { useAuth } from "@/hooks/useAuth";
import { useAppointments } from "@/hooks/useAppointments";
import { useClients } from "@/hooks/useClients";
import { useEmployees } from "@/hooks/useEmployees";
import { useBranches } from "@/hooks/useBranches";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { isBirthdayInCurrentWeek } from "@/utils/birthday";
import {
  SectionCard,
  MiniStat,
  DashboardFilters,
  STATUS_LABEL,
  STATUS_TONE,
  isSameDay,
} from "@/components/dashboard";

/** Card de métrica clicável (envolve o SummaryCard num link com hover). */
function ClickableCard({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="block rounded-xl transition hover:ring-2 hover:ring-brand/40 hover:-translate-y-0.5"
    >
      {children}
    </Link>
  );
}

export default function DashboardPage() {
  const { barbershop } = useAuth();
  const { appointments, isLoading } = useAppointments(barbershop?.id);
  const { clients, isLoading: loadingClients } = useClients(barbershop?.id);
  const { employees, isLoading: loadingEmployees } = useEmployees(
    barbershop?.id,
  );
  const { branches } = useBranches(barbershop?.id);
  const { summary: subscriptionsSummary, isLoading: loadingSubscriptions } = useSubscriptions(
    barbershop?.id,
  );

  const today = new Date();

  // ─── Filtro de filiais (#1): inicia na filial principal/matriz ──────────────
  // "Matriz" = filial de recebimentos (isReceivingBranch) ou a primeira filial.
  const principalBranchId = useMemo(() => {
    const receiving = branches.find((b) => b.isReceivingBranch);
    return receiving?.id ?? branches[0]?.id ?? "todas";
  }, [branches]);

  const [branchFilter, setBranchFilter] = useState("todas");
  const [period, setPeriod] = useState("30");
  const branchInited = useRef(false);

  useEffect(() => {
    if (branchInited.current || branches.length === 0) return;
    branchInited.current = true;
    setBranchFilter(principalBranchId);
  }, [branches, principalBranchId]);

  const stats = useMemo(() => {
    const todayAppts = appointments.filter((a) =>
      isSameDay(new Date(a.scheduledAt), today),
    );
    const future = appointments.filter(
      (a) => new Date(a.scheduledAt) >= today && a.status !== "CANCELLED",
    );
    // O backend não expõe a origem do agendamento (online x recepção); todo o
    // app trata como recepção, então o total via online fica em 0 até existir
    // esse campo. O indicador verde segue o padrão visual solicitado.
    const onlineToday = 0;
    const onlineFuture = 0;
    return {
      todayCount: todayAppts.length,
      futureCount: future.length,
      onlineToday,
      onlineFuture,
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

  /** Aniversariantes da semana vigente (segunda a domingo). */
  const birthdaysThisWeek = useMemo(
    () => clients.filter((c) => isBirthdayInCurrentWeek(c.birthDate)).length,
    [clients],
  );

  return (
    <div className="space-y-6 p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral do seu negócio"
        actions={
          <DashboardFilters
            branches={branches}
            branchValue={branchFilter}
            onBranchChange={setBranchFilter}
            periodValue={period}
            onPeriodChange={setPeriod}
          />
        }
      />

      {/* Cards principais */}
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
          subtitle={`${stats.onlineToday} via online`}
          subtitleTone="success"
          icon={<Calendar className="size-4" />}
          tone="brand"
        />
        <ClickableCard href="/reports/taxa-ocupacao">
          <SummaryCard
            label="Taxa Ocupação"
            value="0%"
            icon={<Target className="size-4" />}
            tone="brand"
          />
        </ClickableCard>
        <SummaryCard
          label="Agendamentos"
          value={isLoading ? "…" : String(stats.futureCount)}
          subtitle={`${stats.onlineFuture} via online`}
          subtitleTone="success"
          icon={<Calendar className="size-4" />}
          tone="brand"
        />
        <ClickableCard href="/clients?aniversariantes=semana">
          <SummaryCard
            label="Aniversariantes da Semana"
            value={loadingClients ? "…" : String(birthdaysThisWeek)}
            icon={<Cake className="size-4" />}
            tone="brand"
          />
        </ClickableCard>
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
          <Link
            href="/financial"
            className="text-brand text-xs gap-1 font-medium flex items-center hover:underline"
          >
            Ver tudo <ArrowUpRight className="size-3" />
          </Link>
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

      {/* Seção inferior */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard
          icon={<ClipboardList className="size-4" />}
          title="Assinaturas"
          actionLabel="Ver tudo"
          actionHref="/subscriptions"
        >
          <div className="grid grid-cols-2 gap-4">
            <MiniStat
              label="Ativos"
              value={loadingSubscriptions ? "…" : String(subscriptionsSummary.activeCount)}
              tone="success"
            />
            <MiniStat label="Inadimplentes" value="0" tone="danger" />
            <MiniStat
              label="Novos no período"
              value={loadingSubscriptions ? "…" : String(subscriptionsSummary.newThisMonth)}
              tone="warning"
            />
            <MiniStat
              label="Cancelados"
              value={loadingSubscriptions ? "…" : String(subscriptionsSummary.cancelledCount)}
              tone="neutral"
            />
          </div>
        </SectionCard>

        <SectionCard
          icon={<Calendar className="size-4" />}
          title="Agenda do Dia"
          actionLabel="Ver agenda"
          actionHref="/schedule"
        >
          {isLoading ? (
            <Loading />
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
          actionHref="/commissions"
        >
          <div className="flex flex-col items-center justify-center h-25 text-muted-foreground">
            <p className="text-sm">Sem dados no período.</p>
          </div>
        </SectionCard>

        <SectionCard
          icon={<Package className="size-4" />}
          title="Estoque Crítico"
          actionLabel="Ver estoque"
          actionHref="/inventory"
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
