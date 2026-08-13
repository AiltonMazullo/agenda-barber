"use client";

import { useMemo, useState } from "react";
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
  AlertTriangle,
} from "lucide-react";
import { PageHeader, SummaryCard, StatusBadge, Loading } from "@/components/shared";
import { useAuth } from "@/hooks/useAuth";
import { useAppointments } from "@/hooks/useAppointments";
import { useClients } from "@/hooks/useClients";
import { useEmployees } from "@/hooks/useEmployees";
import { useBranches } from "@/hooks/useBranches";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { useComandas } from "@/hooks/useComandas";
import { useFinancialBalance } from "@/hooks/useFinancialBalance";
import { useProducts } from "@/hooks/useProducts";
import { deriveStockStatus } from "@/components/inventory";
import { isBirthdayInCurrentWeek } from "@/utils/birthday";
import { toWallClockDate, formatBRL } from "@/utils/format";
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
  const {
    subscriptions,
    summary: subscriptionsSummary,
    isLoading: loadingSubscriptions,
  } = useSubscriptions(barbershop?.id);
  const { comandas, isLoading: loadingComandas } = useComandas(barbershop?.id);
  const { products, isLoading: loadingProducts } = useProducts(barbershop?.id, {
    withStock: true,
  });

  // Estável durante o ciclo de vida do componente — usado como filtro
  // (dueDateTo/janela de período) em vários hooks abaixo. Se fosse recriado a
  // cada render, o `dueDateTo` mudaria por milissegundos a cada render e
  // entraria em loop de refetch no useFinancialBalance (a chave de filtros
  // nunca fica estável).
  const today = useMemo(() => new Date(), []);

  // ─── Filtro de filiais: inicia em "todas" e só muda por ação do usuário ────
  const [branchFilter, setBranchFilter] = useState("todas");
  const [period, setPeriod] = useState("30");

  /**
   * Janela do filtro de período (7/30/90 dias), retroativa a partir de hoje.
   * Só se aplica a métricas de janela histórica (financeiro, ranking,
   * assinantes novos) — cards de estado atual (Comandas Abertas, Estoque
   * Crítico, Profissionais) e cards já datados por natureza (Agenda Hoje,
   * Aniversariantes da Semana) não fazem sentido filtrados por período.
   */
  const periodStart = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - Number(period));
    d.setHours(0, 0, 0, 0);
    return d;
  }, [today, period]);

  const { balance: financialBalance, isLoading: loadingFinancial } = useFinancialBalance(
    barbershop?.id,
    {
      branchId: branchFilter === "todas" ? undefined : branchFilter,
      dueDateFrom: periodStart.toISOString(),
      dueDateTo: today.toISOString(),
    },
  );

  // ─── Filtro de filial aplicado a cada fonte de dado que carrega branchId ───
  // Client e Subscription não têm `branchId` no modelo do backend (só o dono
  // pertence a uma filial indiretamente via Employee) — por isso Clientes
  // Totais, Aniversariantes e o card de Assinaturas continuam sempre
  // considerando a barbearia inteira, filial nenhuma isola esses dados.
  const filteredAppointments = useMemo(
    () =>
      branchFilter === "todas"
        ? appointments
        : appointments.filter((a) => a.branchId === branchFilter),
    [appointments, branchFilter],
  );

  const filteredEmployees = useMemo(
    () =>
      branchFilter === "todas"
        ? employees
        : employees.filter((e) => e.branchId === branchFilter),
    [employees, branchFilter],
  );

  const filteredComandas = useMemo(
    () =>
      branchFilter === "todas"
        ? comandas
        : comandas.filter((c) => c.branchId === branchFilter),
    [comandas, branchFilter],
  );

  const stats = useMemo(() => {
    const todayAppts = filteredAppointments.filter((a) =>
      isSameDay(toWallClockDate(a.scheduledAt), today),
    );
    const future = filteredAppointments.filter(
      (a) => toWallClockDate(a.scheduledAt) >= today && a.status !== "CANCELLED",
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
  }, [filteredAppointments, today]);

  /** Aniversariantes da semana vigente (segunda a domingo). */
  const birthdaysThisWeek = useMemo(
    () => clients.filter((c) => isBirthdayInCurrentWeek(c.birthDate)).length,
    [clients],
  );

  const openComandasCount = useMemo(
    () => filteredComandas.filter((c) => c.status === "ABERTA").length,
    [filteredComandas],
  );

  /**
   * Top 3 profissionais por volume de agendamentos no período selecionado
   * (mesma lógica de agrupamento de /reports/taxa-ocupacao, com a janela de
   * período do dashboard aplicada por cima).
   */
  const professionalRanking = useMemo(() => {
    const map = new Map<string, { nome: string; total: number }>();
    for (const a of filteredAppointments) {
      if (!a.employee) continue;
      const scheduledAt = toWallClockDate(a.scheduledAt);
      if (scheduledAt < periodStart || scheduledAt > today) continue;
      const entry = map.get(a.employee.id) ?? { nome: a.employee.name, total: 0 };
      entry.total += 1;
      map.set(a.employee.id, entry);
    }
    return Array.from(map.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);
  }, [filteredAppointments, periodStart, today]);

  /** Assinaturas criadas dentro da janela de período selecionada. */
  const newSubscriptionsInPeriod = useMemo(
    () => subscriptions.filter((s) => new Date(s.createdAt) >= periodStart).length,
    [subscriptions, periodStart],
  );

  /**
   * Produtos com estoque baixo ou crítico (mesma regra de /inventory), usando
   * o estoque agregado de todas as filiais quando "todas" está selecionado, ou
   * só o estoque da filial escolhida (via `stockPerBranch`) caso contrário —
   * um produto sem registro de estoque na filial conta como 0/0 ("vazio"),
   * não entra na lista.
   */
  const criticalStockProducts = useMemo(
    () =>
      products
        .map((p) => {
          if (branchFilter === "todas") {
            return { id: p.id, name: p.name, current: p.totalCurrent, min: p.totalMin };
          }
          const branchStock = p.stockPerBranch.find((s) => s.branchId === branchFilter);
          return {
            id: p.id,
            name: p.name,
            current: branchStock?.currentStock ?? 0,
            min: branchStock?.minStock ?? 0,
          };
        })
        .filter((p) => {
          const status = deriveStockStatus(p.current, p.min);
          return status === "baixo" || status === "critico";
        }),
    [products, branchFilter],
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
          value={loadingEmployees ? "…" : String(filteredEmployees.length)}
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
          value={loadingComandas ? "…" : String(openComandasCount)}
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
            // O backend não expõe capacidade/carga horária por profissional,
            // então o percentual não pode ser calculado (mesma limitação
            // documentada em /reports/taxa-ocupacao). "0%" era enganoso.
            value="—"
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

        {/*
          Mesmos campos de `useFinancialBalance` usados em /financial
          (payable/receivable/balance calculados em
          financial-entries.service.ts#getBalance), só que consolidados em
          um único card por lado em vez de detalhar vencido/a vencer/pago:
          - Faturado      = receivable.total (tudo que foi lançado a receber)
          - Recebido      = receivable.received (idêntico ao card "Recebido" de /financial)
          - A Receber     = receivable.total - receivable.received (= notReceived + upcoming)
          - Contas a Pagar= payable.total - payable.paid (= overdue + upcoming, ainda não pago)
          - Saldo Atual   = balance.balance (idêntico ao card "Balanço" de /financial)
        */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <SummaryCard
            label="Faturado"
            value={
              loadingFinancial
                ? "…"
                : formatBRL(financialBalance.receivable.total / 100)
            }
          />
          <SummaryCard
            label="Recebido"
            value={
              loadingFinancial
                ? "…"
                : formatBRL(financialBalance.receivable.received / 100)
            }
            tone="success"
            emphasized
          />
          <SummaryCard
            label="A Receber"
            value={
              loadingFinancial
                ? "…"
                : formatBRL(
                    (financialBalance.receivable.total -
                      financialBalance.receivable.received) /
                      100,
                  )
            }
            tone="warning"
            emphasized
          />
          <SummaryCard
            label="Contas a Pagar"
            value={
              loadingFinancial
                ? "…"
                : formatBRL(
                    (financialBalance.payable.total -
                      financialBalance.payable.paid) /
                      100,
                  )
            }
            tone="danger"
            emphasized
          />
          <SummaryCard
            label="Saldo Atual"
            value={
              loadingFinancial
                ? "…"
                : formatBRL(financialBalance.balance / 100)
            }
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
            <MiniStat
              label="Inadimplentes"
              value={loadingSubscriptions ? "…" : String(subscriptionsSummary.overdueCount)}
              tone="danger"
            />
            <MiniStat
              label="Novos no período"
              value={loadingSubscriptions ? "…" : String(newSubscriptionsInPeriod)}
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
                const time = toWallClockDate(a.scheduledAt).toLocaleTimeString(
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
          {isLoading ? (
            <Loading />
          ) : professionalRanking.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-25 text-muted-foreground">
              <p className="text-sm">Sem dados no período.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {professionalRanking.map((p, i) => (
                <div
                  key={p.nome}
                  className="flex items-center gap-3 px-3 py-2 rounded-md bg-surface-base border border-border-subtle"
                >
                  <span className="size-6 rounded-full bg-brand/10 text-brand text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <p className="flex-1 min-w-0 text-sm font-semibold text-foreground truncate">
                    {p.nome}
                  </p>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {p.total} agend.
                  </span>
                </div>
              ))}
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
            <Loading />
          ) : criticalStockProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-25 text-muted-foreground">
              <div className="flex items-center gap-2 text-success-foreground/80">
                <CheckCircle2 className="size-4" />
                <p className="text-sm">Nenhum alerta de estoque.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {criticalStockProducts.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-md bg-surface-base border border-border-subtle"
                >
                  <AlertTriangle className="size-3.5 text-danger-foreground shrink-0" />
                  <p className="flex-1 min-w-0 text-sm font-semibold text-foreground truncate">
                    {p.name}
                  </p>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {p.current} / min. {p.min}
                  </span>
                </div>
              ))}
              {criticalStockProducts.length > 5 && (
                <p className="text-xs text-muted-foreground text-center pt-1">
                  +{criticalStockProducts.length - 5} outro(s) com estoque baixo.
                </p>
              )}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
