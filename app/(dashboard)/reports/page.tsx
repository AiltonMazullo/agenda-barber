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
import { ReportFiltersBar, type ReportFilterField } from "@/components/reports/ReportFiltersBar";
import { useAuth } from "@/hooks/useAuth";
import { useReportFilters } from "@/hooks/useReportFilters";
import { useReportData } from "@/hooks/useReportData";
import { useReportPage } from "@/hooks/useReportPage";
import { useProducts } from "@/hooks/useProducts";
import { reportsService } from "@/services/reports.service";
import { stockMovementsService } from "@/services/stock-movements.service";
import { formatBRL, formatDate } from "@/utils/format";
import type { Tone } from "@/types/common.types";
import type { AgendamentoReportRow } from "@/types/report.types";

// ─── Helpers ────────────────────────────────────────────────────────────────

const brl = (cents: number) => formatBRL(cents / 100);
const dt = (d: string | Date | null) =>
  d
    ? new Date(d).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

function LoadingState() {
  return <Loading />;
}

function ReportTable<T>({
  columns,
  rows,
  keyFn,
  renderRow,
  emptyMessage,
}: {
  columns: string[];
  rows: T[];
  keyFn: (row: T, index: number) => string;
  renderRow: (row: T) => React.ReactNode[];
  emptyMessage: string;
}) {
  if (rows.length === 0) return <EmptyState message={emptyMessage} />;
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-border hover:bg-transparent">
          {columns.map((c) => (
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
        {rows.map((row, index) => (
          <TableRow key={keyFn(row, index)} className="border-border hover:bg-surface-elevated/50">
            {renderRow(row).map((cell, i) => (
              <TableCell key={i} className="px-4 py-3 text-sm">
                {cell}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function KpiCards({ items }: { items: { label: string; value: string | number; tone?: Tone }[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {items.map((c) => (
        <div key={c.label} className="rounded-lg bg-surface-base border border-border-subtle p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {c.label}
          </p>
          <p
            className={
              c.tone === "success"
                ? "text-2xl font-bold mt-1 text-success-foreground"
                : c.tone === "warning"
                  ? "text-2xl font-bold mt-1 text-warning-foreground"
                  : "text-2xl font-bold mt-1 text-foreground"
            }
          >
            {c.value}
          </p>
        </div>
      ))}
    </div>
  );
}

/** Barra de filtros vinculada a um `useReportFilters` já existente no chamador. */
function Filters({
  barbershopId,
  fields,
  rf,
}: {
  barbershopId: string | undefined;
  fields: ReportFilterField[];
  rf: ReturnType<typeof useReportFilters>;
}) {
  if (fields.length === 0) return null;
  return (
    <ReportFiltersBar
      barbershopId={barbershopId}
      fields={fields}
      state={rf.state}
      onChange={(patch) => rf.setState((prev) => ({ ...prev, ...patch }))}
    />
  );
}

// ─── Vendas ───────────────────────────────────────────────────────────────

function RelVendasPorItem() {
  const { barbershopId, rf, data, isLoading } = useReportPage(reportsService.vendasPorItem);
  return (
    <div className="space-y-4">
      <Filters
        barbershopId={barbershopId}
        fields={["period", "branch", "employee", "category", "service", "product"]}
        rf={rf}
      />
      {isLoading ? (
        <LoadingState />
      ) : (
        <ReportTable
          columns={["Data", "Tipo", "Item", "Categoria", "Filial", "Profissional", "Qtd", "Total"]}
          rows={data ?? []}
          keyFn={(r) => r.itemId}
          emptyMessage="Sem vendas no período selecionado."
          renderRow={(r) => [
            dt(r.data),
            r.tipo === "PRODUTO" ? "Produto" : "Serviço",
            r.nome,
            r.categoriaNome ?? "—",
            r.filial?.name ?? "—",
            r.profissional?.name ?? "—",
            r.quantidade,
            <span key="v" className="text-brand font-semibold">
              {brl(r.totalInCents)}
            </span>,
          ]}
        />
      )}
    </div>
  );
}

// ─── Financeiro ─────────────────────────────────────────────────────────────

function RelFormasPagamento() {
  const { barbershopId, rf, data, isLoading } = useReportPage(reportsService.formasPagamento);
  return (
    <div className="space-y-4">
      <Filters barbershopId={barbershopId} fields={["period", "branch"]} rf={rf} />
      {isLoading ? (
        <LoadingState />
      ) : (
        <ReportTable
          columns={["Forma de pagamento", "Quantidade", "Total"]}
          rows={data ?? []}
          keyFn={(r) => r.formaPagamento}
          emptyMessage="Sem vendas fechadas no período."
          renderRow={(r) => [
            r.formaPagamento,
            r.quantidade,
            <span key="v" className="text-brand font-semibold">
              {brl(r.totalInCents)}
            </span>,
          ]}
        />
      )}
    </div>
  );
}

function RelFaturamentoVisao() {
  const { barbershopId, rf, data, isLoading } = useReportPage(reportsService.faturamentoVisaoGeral);
  const max = data ? Math.max(...data.porMes.map((m) => m.comandasInCents + m.assinaturasInCents), 1) : 1;
  return (
    <div className="space-y-4">
      <Filters barbershopId={barbershopId} fields={["period", "branch"]} rf={rf} />
      {isLoading ? (
        <LoadingState />
      ) : !data ? (
        <EmptyState message="Sem dados." />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-lg bg-surface-base border border-border-subtle p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Comandas
              </p>
              <p className="text-xl font-bold text-foreground mt-1">{brl(data.totalComandasInCents)}</p>
            </div>
            <div className="rounded-lg bg-surface-base border border-border-subtle p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Totalizado assinatura gateway
              </p>
              <p className="text-xl font-bold text-foreground mt-1">
                {brl(data.totalAssinaturaGatewayInCents)}
              </p>
            </div>
            <div className="rounded-lg bg-surface-base border border-border-subtle p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Totalizado assinatura manual
              </p>
              <p className="text-xl font-bold text-foreground mt-1">
                {brl(data.totalAssinaturaManualInCents)}
              </p>
            </div>
            <div className="rounded-lg bg-surface-base border border-border-subtle p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Total geral
              </p>
              <p className="text-xl font-bold text-brand mt-1">{brl(data.totalGeralInCents)}</p>
            </div>
            <div className="rounded-lg bg-surface-base border border-border-subtle p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Comandas fechadas
              </p>
              <p className="text-xl font-bold text-foreground mt-1">{data.quantidadeComandas}</p>
            </div>
          </div>
          {data.porMes.length > 0 && (
            <div
              className="grid gap-3 items-end h-40"
              style={{ gridTemplateColumns: `repeat(${data.porMes.length}, minmax(0, 1fr))` }}
            >
              {data.porMes.map((m) => {
                const total = m.comandasInCents + m.assinaturasInCents;
                const altura = (total / max) * 100;
                return (
                  <div key={m.mes} className="flex flex-col items-center gap-1.5 h-full">
                    <div className="text-[10px] font-bold text-foreground">
                      {total > 0 ? brl(total).replace("R$ ", "") : "—"}
                    </div>
                    <div className="w-full flex-1 flex items-end">
                      <div
                        className="w-full bg-brand/80 hover:bg-brand transition-colors rounded-t-md min-h-1"
                        style={{ height: `${altura}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-muted-foreground">{m.mes}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RelFaturamentoDetalhes() {
  const { barbershopId, rf, data, isLoading } = useReportPage(reportsService.faturamentoDetalhes);
  return (
    <div className="space-y-4">
      <Filters barbershopId={barbershopId} fields={["period", "branch", "employee"]} rf={rf} />
      {isLoading ? (
        <LoadingState />
      ) : (
        <ReportTable
          columns={["Data", "Cliente", "Profissional", "Tipo", "Forma pgto.", "Valor"]}
          rows={data ?? []}
          keyFn={(r) => r.comandaId}
          emptyMessage="Sem faturamento no período."
          renderRow={(r) => [
            dt(r.data),
            r.cliente,
            r.profissional ?? "—",
            r.tipo === "AGENDAMENTO" ? "Agendamento" : "Avulsa",
            r.formaPagamento ?? "—",
            <span key="v" className="text-brand font-semibold">
              {brl(r.valorInCents)}
            </span>,
          ]}
        />
      )}
    </div>
  );
}

function RelHistoricoMovimentacoes() {
  const { barbershopId, rf, data, isLoading } = useReportPage(reportsService.historicoMovimentacoes);
  return (
    <div className="space-y-4">
      <Filters barbershopId={barbershopId} fields={["period", "branch", "employee"]} rf={rf} />
      {isLoading ? (
        <LoadingState />
      ) : (
        <ReportTable
          columns={["Data", "Cliente", "Profissional", "Operação", "Forma pgto.", "Valor"]}
          rows={data ?? []}
          keyFn={(r, i) => `${r.data ?? ""}-${r.operacao}-${i}`}
          emptyMessage="Sem movimentações no período."
          renderRow={(r) => [
            dt(r.data),
            r.cliente,
            r.profissional ?? "—",
            r.operacao,
            r.formaPagamento ?? "—",
            <span key="v" className="text-brand font-semibold">
              {brl(r.valorInCents)}
            </span>,
          ]}
        />
      )}
    </div>
  );
}

// ─── Gestão ───────────────────────────────────────────────────────────────

function RelFrequenciaCliente() {
  const { barbershopId, rf, data, isLoading } = useReportPage(reportsService.frequenciaCliente);
  return (
    <div className="space-y-4">
      <Filters barbershopId={barbershopId} fields={["period"]} rf={rf} />
      {isLoading ? (
        <LoadingState />
      ) : (
        <ReportTable
          columns={["Cliente", "Visitas", "Última visita", "Próxima"]}
          rows={data ?? []}
          keyFn={(r) => r.clientId}
          emptyMessage="Sem clientes no período."
          renderRow={(r) => [
            r.name,
            r.visitas,
            r.ultimaVisita ? formatDate(r.ultimaVisita) : "—",
            r.proximaVisita ? formatDate(r.proximaVisita) : "—",
          ]}
        />
      )}
    </div>
  );
}

function RelFrequenciaKpis() {
  const { barbershopId, rf, data, isLoading } = useReportPage(reportsService.frequenciaClienteKpis);
  return (
    <div className="space-y-4">
      <Filters barbershopId={barbershopId} fields={["period"]} rf={rf} />
      {isLoading ? (
        <LoadingState />
      ) : !data ? (
        <EmptyState message="Sem dados." />
      ) : (
        <KpiCards
          items={[
            { label: "Total de clientes", value: data.totalClientes },
            { label: "Visitas", value: data.totalVisitas },
            { label: "Com agenda futura", value: data.comAgendaFutura, tone: "success" },
            { label: "Sem agenda futura", value: data.semAgendaFutura, tone: "warning" },
            { label: "Recorrentes (≥2 visitas)", value: data.recorrentes },
            { label: "Taxa média de visitas/cliente", value: data.taxaMedia },
          ]}
        />
      )}
    </div>
  );
}

function RelClientesPorServico() {
  const { barbershopId, rf, data, isLoading } = useReportPage(reportsService.clientePorPeriodoServico);
  return (
    <div className="space-y-4">
      <Filters barbershopId={barbershopId} fields={["period", "service"]} rf={rf} />
      {isLoading ? (
        <LoadingState />
      ) : (
        <ReportTable
          columns={["Serviço", "Com clube", "Sem clube"]}
          rows={data ?? []}
          keyFn={(r) => r.serviceId}
          emptyMessage="Sem dados no período."
          renderRow={(r) => [
            r.nome,
            <span key="c" className="text-info-foreground font-semibold">
              {r.clientesComClube}
            </span>,
            r.clientesSemClube,
          ]}
        />
      )}
    </div>
  );
}

function RelServicosVendidos() {
  const { barbershopId, rf, data, isLoading } = useReportPage(reportsService.servicosVendidos);
  return (
    <div className="space-y-4">
      <Filters barbershopId={barbershopId} fields={["period"]} rf={rf} />
      {isLoading ? (
        <LoadingState />
      ) : (
        <ReportTable
          columns={["Serviço", "Valor unit.", "Quantidade", "Faturamento"]}
          rows={data ?? []}
          keyFn={(r) => r.serviceId}
          emptyMessage="Sem serviços vendidos no período."
          renderRow={(r) => [
            <span key="n" className="flex items-center gap-2">
              <span className="size-2 rounded-full" style={{ backgroundColor: r.hex ?? "#f5b82e" }} />
              {r.nome}
            </span>,
            brl(r.priceInCents),
            <span key="q" className="text-info-foreground font-semibold">
              {r.quantidade}
            </span>,
            <span key="f" className="text-brand font-bold">
              {brl(r.faturamentoInCents)}
            </span>,
          ]}
        />
      )}
    </div>
  );
}

const STATUS_LABEL: Record<AgendamentoReportRow["status"], string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
};

const STATUS_TONE: Record<AgendamentoReportRow["status"], Tone> = {
  PENDING: "warning",
  CONFIRMED: "info",
  COMPLETED: "success",
  CANCELLED: "danger",
};

function RelHistoricoAgendamentos() {
  const { barbershopId, rf, data, isLoading } = useReportPage(reportsService.historicoAgendamentos);
  return (
    <div className="space-y-4">
      <Filters
        barbershopId={barbershopId}
        fields={["period", "branch", "employee", "category", "service"]}
        rf={rf}
      />
      {isLoading ? (
        <LoadingState />
      ) : (
        <ReportTable
          columns={["Data", "Cliente", "Serviço", "Profissional", "Valor", "Status"]}
          rows={data ?? []}
          keyFn={(r) => r.id}
          emptyMessage="Sem agendamentos no período."
          renderRow={(r) => [
            dt(r.scheduledAt),
            r.client.name,
            <span key="s" className="flex items-center gap-1.5">
              <span className="size-2 rounded-full" style={{ backgroundColor: r.service.hex ?? "#f5b82e" }} />
              {r.service.name}
            </span>,
            r.employee?.name ?? "—",
            <span key="v" className="text-brand font-semibold">
              {brl(r.service.priceInCents)}
            </span>,
            <StatusBadge key="st" tone={STATUS_TONE[r.status]}>
              {STATUS_LABEL[r.status]}
            </StatusBadge>,
          ]}
        />
      )}
    </div>
  );
}

function RelHistoricoVendaProdutos() {
  const { barbershopId, rf, data, isLoading } = useReportPage(reportsService.historicoVendaProdutos);
  return (
    <div className="space-y-4">
      <Filters barbershopId={barbershopId} fields={["period", "branch", "employee", "product"]} rf={rf} />
      {isLoading ? (
        <LoadingState />
      ) : (
        <ReportTable
          columns={["Data", "Cliente", "Profissional", "Produto", "Qtd", "Total"]}
          rows={data ?? []}
          keyFn={(r) => r.itemId}
          emptyMessage="Sem vendas de produto no período."
          renderRow={(r) => [
            dt(r.data),
            r.cliente,
            r.profissional ?? "—",
            r.produto,
            r.quantidade,
            <span key="v" className="text-brand font-semibold">
              {brl(r.totalInCents)}
            </span>,
          ]}
        />
      )}
    </div>
  );
}

// ─── Estoque ────────────────────────────────────────────────────────────────

function RelEntradaSaidaEstoque() {
  const { barbershop } = useAuth();
  const rf = useReportFilters();

  const { data, isLoading } = useReportData(
    () =>
      barbershop?.id
        ? stockMovementsService.list(barbershop.id)
        : Promise.resolve([]),
    [barbershop?.id],
  );

  if (!barbershop?.id) return <LoadingState />;

  const filtered = (data ?? []).filter((m) => {
    if (rf.state.branchId && m.branchId !== rf.state.branchId) return false;
    if (rf.state.productId && m.productId !== rf.state.productId) return false;
    if (rf.state.startDate && new Date(m.createdAt) < rf.state.startDate) return false;
    if (rf.state.endDate && new Date(m.createdAt) > rf.state.endDate) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <ReportFiltersBar
        barbershopId={barbershop.id}
        fields={["period", "branch", "product"]}
        state={rf.state}
        onChange={(patch) => rf.setState((prev) => ({ ...prev, ...patch }))}
      />
      {isLoading ? (
        <LoadingState />
      ) : (
        <ReportTable
          columns={["Data", "Produto", "Filial", "Tipo", "Qtd", "Valor unit.", "Observação"]}
          rows={filtered}
          keyFn={(r) => r.id}
          emptyMessage="Sem movimentações de estoque."
          renderRow={(r) => [
            formatDate(r.createdAt),
            r.productName,
            r.branchName,
            r.type === "ENTRADA" ? "Entrada" : r.type === "SAIDA" ? "Saída" : "Venda",
            r.quantity,
            r.unitCostInCents !== undefined ? brl(r.unitCostInCents) : "—",
            r.note ?? "—",
          ]}
        />
      )}
    </div>
  );
}

function RelEstoqueAtual() {
  const { barbershop } = useAuth();
  const { products, isLoading } = useProducts(barbershop?.id, { withStock: true });

  if (isLoading) return <LoadingState />;

  return (
    <ReportTable
      columns={["Produto", "Qtd atual", "Mínimo", "Preço unit.", "Valor estoque"]}
      rows={products}
      keyFn={(p) => p.id}
      emptyMessage="Sem produtos cadastrados."
      renderRow={(p) => [
        p.name,
        p.totalCurrent,
        p.totalMin,
        brl(p.priceInCents),
        <span key="v" className="text-brand font-semibold">
          {brl(p.totalCurrent * p.priceInCents)}
        </span>,
      ]}
    />
  );
}

// ─── Profissionais / Ticket Médio ──────────────────────────────────────────

function RelTicketMedioProfissional() {
  const { barbershopId, rf, data, isLoading } = useReportPage(reportsService.ticketMedioPorProfissional);
  return (
    <div className="space-y-4">
      <Filters barbershopId={barbershopId} fields={["period", "branch", "employee"]} rf={rf} />
      {isLoading ? (
        <LoadingState />
      ) : (
        <ReportTable
          columns={["Profissional", "Atendimentos", "Faturamento", "Ticket médio"]}
          rows={data ?? []}
          keyFn={(r) => r.employeeId ?? "sem_profissional"}
          emptyMessage="Sem atendimentos concluídos no período."
          renderRow={(r) => [
            r.nome,
            r.atendimentos,
            brl(r.totalInCents),
            <span key="tm" className="text-brand font-bold">
              {brl(r.ticketMedioInCents)}
            </span>,
          ]}
        />
      )}
    </div>
  );
}

function RelTicketMedioAgendamento() {
  const { barbershopId, rf, data, isLoading } = useReportPage(
    reportsService.ticketMedioPorAgendamento,
  );
  return (
    <div className="space-y-4">
      <Filters barbershopId={barbershopId} fields={["period", "branch", "employee"]} rf={rf} />
      {isLoading ? (
        <LoadingState />
      ) : !data ? (
        <EmptyState message="Sem dados." />
      ) : (
        <KpiCards
          items={[
            { label: "Faturamento da empresa", value: brl(data.faturamentoInCents) },
            { label: "Qtde. de atendimentos", value: data.quantidadeAtendimentos },
            {
              label: "Ticket médio",
              value: brl(data.ticketMedioInCents),
              tone: "success",
            },
          ]}
        />
      )}
    </div>
  );
}

function RelTicketMedioClientesDistintos() {
  const { barbershopId, rf, data, isLoading } = useReportPage(
    reportsService.ticketMedioClientesDistintos,
  );
  return (
    <div className="space-y-4">
      <Filters barbershopId={barbershopId} fields={["period", "branch", "employee"]} rf={rf} />
      {isLoading ? (
        <LoadingState />
      ) : (
        <ReportTable
          columns={["Cliente", "Atendimentos", "Total gasto", "Ticket médio"]}
          rows={data ?? []}
          keyFn={(r) => r.clientId}
          emptyMessage="Sem clientes com atendimento concluído."
          renderRow={(r) => [
            r.nome,
            r.atendimentos,
            brl(r.totalInCents),
            <span key="tm" className="text-brand font-bold">
              {brl(r.ticketMedioInCents)}
            </span>,
          ]}
        />
      )}
    </div>
  );
}

function RelComissoesServicos() {
  const { barbershopId, rf, data, isLoading } = useReportPage(reportsService.comissoesServicos);
  return (
    <div className="space-y-4">
      <Filters barbershopId={barbershopId} fields={["period", "employee"]} rf={rf} />
      {isLoading ? (
        <LoadingState />
      ) : (
        <ReportTable
          columns={["Data", "Profissional", "Serviço", "Clube?", "Valor", "Comissão %", "Comissão"]}
          rows={data ?? []}
          keyFn={(r, i) => `${r.employeeId}-${r.servico}-${i}`}
          emptyMessage="Sem atendimentos concluídos no período."
          renderRow={(r) => [
            formatDate(r.data),
            r.profissional ?? "—",
            r.servico,
            r.comClube ? "Sim" : "Não",
            brl(r.valorInCents),
            `${r.commissionPercent}%`,
            <span key="c" className="text-brand font-semibold">
              {brl(r.comissaoInCents)}
            </span>,
          ]}
        />
      )}
    </div>
  );
}

function RelComissoesProdutos() {
  const { barbershopId, rf, data, isLoading } = useReportPage(reportsService.comissoesProdutos);
  return (
    <div className="space-y-4">
      <Filters barbershopId={barbershopId} fields={["period", "employee"]} rf={rf} />
      {isLoading ? (
        <LoadingState />
      ) : (
        <ReportTable
          columns={["Data", "Profissional", "Produto", "Categoria", "Qtd", "Total", "Comissão"]}
          rows={data ?? []}
          keyFn={(r) => r.itemId}
          emptyMessage="Sem vendas de produto no período."
          renderRow={(r) => [
            dt(r.data),
            r.profissional ?? "—",
            r.produto,
            r.categoria ?? "—",
            r.quantidade,
            brl(r.totalInCents),
            r.commissionPercent === null ? (
              "Não configurada"
            ) : (
              <span key="c" className="text-brand font-semibold">
                {brl(r.comissaoInCents)}
              </span>
            ),
          ]}
        />
      )}
    </div>
  );
}

// ─── Marketing de Experiência ───────────────────────────────────────────────

function RelCaptacaoClientes() {
  const { barbershop } = useAuth();
  const { data, isLoading } = useReportData(
    () => (barbershop?.id ? reportsService.captacaoClientes(barbershop.id) : Promise.resolve([])),
    [barbershop?.id],
  );
  if (isLoading) return <LoadingState />;
  return (
    <ReportTable
      columns={["Origem", "Total de clientes"]}
      rows={data ?? []}
      keyFn={(r) => r.origem}
      emptyMessage="Sem clientes cadastrados."
      renderRow={(r) => [
        r.origem,
        <span key="t" className="text-info-foreground font-semibold">
          {r.total}
        </span>,
      ]}
    />
  );
}

function RelNovosClientes() {
  const { barbershopId, rf, data, isLoading } = useReportPage(reportsService.novosClientes);
  return (
    <div className="space-y-4">
      <Filters barbershopId={barbershopId} fields={["period", "employee"]} rf={rf} />
      {isLoading ? (
        <LoadingState />
      ) : (
        <ReportTable
          columns={["Cliente", "E-mail", "Profissional", "Primeira visita"]}
          rows={data ?? []}
          keyFn={(r) => r.clientId}
          emptyMessage="Sem novos clientes no período."
          renderRow={(r) => [r.nome, r.email, r.profissional ?? "—", formatDate(r.primeiraVisita)]}
        />
      )}
    </div>
  );
}

function RelAusentes() {
  const { barbershop } = useAuth();
  const [dias, setDias] = useState(30);
  const { data, isLoading } = useReportData(
    () =>
      barbershop?.id
        ? reportsService.clientesAusentes(barbershop.id, { diasSemVisita: dias })
        : Promise.resolve([]),
    [barbershop?.id, dias],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-lg bg-surface-base border border-border-subtle p-3 max-w-xs">
        <label htmlFor="dias-ausente" className="text-[10px] font-bold uppercase tracking-widest text-brand">
          Dias sem visita
        </label>
        <input
          id="dias-ausente"
          type="number"
          min={1}
          value={dias}
          onChange={(e) => setDias(Math.max(1, Number(e.target.value) || 1))}
          className="h-9 w-20 px-2 rounded-md border border-border bg-surface-raised text-sm text-foreground"
        />
      </div>
      {isLoading ? (
        <LoadingState />
      ) : (
        <ReportTable
          columns={["Cliente", "Última visita"]}
          rows={data ?? []}
          keyFn={(r) => r.id}
          emptyMessage="Nenhum cliente ausente."
          renderRow={(r) => [r.nome, r.ultimaVisita ? formatDate(r.ultimaVisita) : "—"]}
        />
      )}
    </div>
  );
}

function RelAvaliacoes() {
  const { barbershopId, rf, data, isLoading } = useReportPage(reportsService.avaliacoes);
  const rows = data ?? [];
  const media =
    rows.length > 0 ? Math.round((rows.reduce((acc, r) => acc + r.rating, 0) / rows.length) * 10) / 10 : 0;
  return (
    <div className="space-y-4">
      <Filters barbershopId={barbershopId} fields={["period", "employee"]} rf={rf} />
      {isLoading ? (
        <LoadingState />
      ) : (
        <div className="space-y-4">
          <KpiCards
            items={[
              { label: "Total de avaliações", value: rows.length },
              { label: "Média", value: media },
            ]}
          />
          <ReportTable
            columns={["Data", "Cliente", "Profissional", "Nota", "Comentário"]}
            rows={rows}
            keyFn={(r) => r.id}
            emptyMessage="Sem avaliações no período."
            renderRow={(r) => [
              formatDate(r.createdAt),
              r.client.name,
              r.employee?.name ?? "—",
              `${r.rating}/5`,
              r.comment ?? "—",
            ]}
          />
        </div>
      )}
    </div>
  );
}

function RelAniversariantes() {
  const { barbershopId, rf, data, isLoading } = useReportPage(reportsService.aniversariantes);
  return (
    <div className="space-y-4">
      <Filters barbershopId={barbershopId} fields={["period"]} rf={rf} />
      {isLoading ? (
        <LoadingState />
      ) : (
        <ReportTable
          columns={["Cliente", "Data de nascimento", "Telefone", "E-mail"]}
          rows={data ?? []}
          keyFn={(r) => r.id}
          emptyMessage="Sem aniversariantes no período selecionado."
          renderRow={(r) => [r.nome, formatDate(r.dataNascimento), r.telefone ?? "—", r.email]}
        />
      )}
    </div>
  );
}

function RelSemPreferencia() {
  const { barbershop } = useAuth();
  const { data, isLoading } = useReportData(
    () => (barbershop?.id ? reportsService.clientesSemPreferencia(barbershop.id) : Promise.resolve([])),
    [barbershop?.id],
  );
  if (isLoading) return <LoadingState />;
  return (
    <ReportTable
      columns={["Cliente", "E-mail", "Atendimentos"]}
      rows={data ?? []}
      keyFn={(r) => r.id}
      emptyMessage="Todos os clientes têm profissional preferido."
      renderRow={(r) => [
        r.nome,
        r.email,
        <span key="a" className="text-info-foreground font-semibold">
          {r.atendimentos}
        </span>,
      ]}
    />
  );
}

// ─── Assinaturas ────────────────────────────────────────────────────────────

function RelAssinantes() {
  const { barbershopId, rf, data, isLoading } = useReportPage(reportsService.assinantes);
  return (
    <div className="space-y-4">
      <Filters barbershopId={barbershopId} fields={["period"]} rf={rf} />
      {isLoading ? (
        <LoadingState />
      ) : (
        <ReportTable
          columns={["Cliente", "Plano", "Status", "Início"]}
          rows={data ?? []}
          keyFn={(r) => r.id}
          emptyMessage="Sem assinaturas cadastradas."
          renderRow={(r) => [
            r.client.name,
            r.plan.name,
            <StatusBadge key="st" tone={r.status === "ACTIVE" ? "success" : "danger"}>
              {r.status === "ACTIVE" ? "Ativa" : "Cancelada"}
            </StatusBadge>,
            formatDate(r.startedAt),
          ]}
        />
      )}
    </div>
  );
}

function RelAssinaturasCanceladas() {
  const { barbershopId, rf, data, isLoading } = useReportPage(reportsService.assinaturasCanceladas);
  return (
    <div className="space-y-4">
      <Filters barbershopId={barbershopId} fields={["period"]} rf={rf} />
      {isLoading ? (
        <LoadingState />
      ) : (
        <ReportTable
          columns={["Cliente", "Plano", "Início", "Cancelada em", "Motivo"]}
          rows={data ?? []}
          keyFn={(r) => r.id}
          emptyMessage="Sem cancelamentos no período."
          renderRow={(r) => [
            r.client.name,
            r.plan.name,
            formatDate(r.startedAt),
            r.cancelledAt ? formatDate(r.cancelledAt) : "—",
            r.cancelReason ?? "—",
          ]}
        />
      )}
    </div>
  );
}

function RelAssinaturasNovas() {
  const { barbershopId, rf, data, isLoading } = useReportPage(reportsService.assinaturasNovas);
  return (
    <div className="space-y-4">
      <Filters barbershopId={barbershopId} fields={["period"]} rf={rf} />
      {isLoading ? (
        <LoadingState />
      ) : (
        <ReportTable
          columns={["Cliente", "Plano", "Início", "Valor"]}
          rows={data ?? []}
          keyFn={(r) => r.id}
          emptyMessage="Sem novas assinaturas no período."
          renderRow={(r) => [r.client.name, r.plan.name, formatDate(r.startedAt), brl(r.plan.priceInCents)]}
        />
      )}
    </div>
  );
}

function RelAssinaturasPorOrigem() {
  const { barbershop } = useAuth();
  const rf = useReportFilters();
  const [groupBy, setGroupBy] = useState<"origin" | "vendedor">("origin");
  const barbershopId = barbershop?.id;
  const filtersKey = JSON.stringify(rf.filters);
  const { data, isLoading } = useReportData(
    barbershopId
      ? () => reportsService.assinaturasPorOrigem(barbershopId, { ...rf.filters, groupBy })
      : null,
    [barbershopId, filtersKey, groupBy],
  );
  return (
    <div className="space-y-4">
      <Filters barbershopId={barbershopId} fields={["period"]} rf={rf} />
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Agrupar por
        </span>
        <div className="flex rounded-md border border-border-subtle overflow-hidden">
          {(
            [
              { key: "origin" as const, label: "Canal" },
              { key: "vendedor" as const, label: "Vendedor" },
            ]
          ).map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setGroupBy(opt.key)}
              className={
                groupBy === opt.key
                  ? "px-3 py-1.5 text-xs font-semibold bg-brand text-brand-foreground"
                  : "px-3 py-1.5 text-xs font-semibold bg-surface-base text-muted-foreground hover:text-foreground"
              }
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      {isLoading ? (
        <LoadingState />
      ) : (
        <ReportTable
          columns={[groupBy === "vendedor" ? "Vendedor" : "Origem", "Quantidade", "Total"]}
          rows={data ?? []}
          keyFn={(r) => r.origem}
          emptyMessage="Sem assinaturas no período."
          renderRow={(r) => [
            r.origem,
            r.quantidade,
            <span key="v" className="text-brand font-semibold">
              {brl(r.totalInCents)}
            </span>,
          ]}
        />
      )}
    </div>
  );
}

function RelAlteracoesAssinaturas() {
  const { barbershopId, rf, data, isLoading } = useReportPage(
    reportsService.alteracoesAssinaturas,
  );
  return (
    <div className="space-y-4">
      <Filters barbershopId={barbershopId} fields={["period"]} rf={rf} />
      {isLoading ? (
        <LoadingState />
      ) : (
        <ReportTable
          columns={["Data", "Cliente", "Ação", "Campo", "De", "Para", "Responsável"]}
          rows={data ?? []}
          keyFn={(r) => r.id}
          emptyMessage="Sem alterações de assinatura registradas no período."
          renderRow={(r) => [
            dt(r.data),
            r.cliente?.name ?? "—",
            r.acao,
            r.campoAlterado,
            r.valorAnterior ?? "—",
            r.valorNovo ?? "—",
            r.responsavel,
          ]}
        />
      )}
    </div>
  );
}

function RelHistoricoTransacoesAssinaturas() {
  const { barbershopId, rf, data, isLoading } = useReportPage(
    reportsService.historicoTransacoesAssinaturas,
  );
  const statusLabel: Record<string, string> = {
    PENDING: "Pendente",
    PAID: "Paga",
    OVERDUE: "Atrasada",
    FAILED: "Falhou",
  };
  const statusTone: Record<string, Tone> = {
    PENDING: "warning",
    PAID: "success",
    OVERDUE: "danger",
    FAILED: "danger",
  };
  return (
    <div className="space-y-4">
      <Filters barbershopId={barbershopId} fields={["period"]} rf={rf} />
      {isLoading ? (
        <LoadingState />
      ) : (
        <ReportTable
          columns={["Vencimento", "Pagamento", "Cliente", "Plano", "Status", "Valor"]}
          rows={data ?? []}
          keyFn={(r) => r.id}
          emptyMessage="Sem transações de assinatura no período."
          renderRow={(r) => [
            dt(r.dataVencimento),
            r.dataPagamento ? dt(r.dataPagamento) : "—",
            r.cliente.name,
            r.plano.name,
            <StatusBadge key="st" tone={statusTone[r.status] ?? "neutral"}>
              {statusLabel[r.status] ?? r.status}
            </StatusBadge>,
            <span key="v" className="text-brand font-semibold">
              {brl(r.valorInCents)}
            </span>,
          ]}
        />
      )}
    </div>
  );
}

// ─── Marketing de Experiência ───────────────────────────────────────────────

function RelListaEsperaPlano() {
  const { barbershopId, rf, data, isLoading } = useReportPage(reportsService.listaEsperaPlano);
  return (
    <div className="space-y-4">
      <Filters barbershopId={barbershopId} fields={["period"]} rf={rf} />
      {isLoading ? (
        <LoadingState />
      ) : (
        <ReportTable
          columns={["Data", "Cliente", "E-mail", "Plano"]}
          rows={data ?? []}
          keyFn={(r) => r.id}
          emptyMessage="Sem clientes na lista de espera no período."
          renderRow={(r) => [
            dt(r.data),
            r.cliente?.name ?? "—",
            r.cliente?.email ?? "—",
            r.plano?.name ?? "—",
          ]}
        />
      )}
    </div>
  );
}

// ─── Profissionais ────────────────────────────────────────────────────────

function RelDocumentosProfissional() {
  const { barbershopId, rf, data, isLoading } = useReportPage(
    reportsService.documentosProfissional,
  );
  return (
    <div className="space-y-4">
      <Filters barbershopId={barbershopId} fields={["period", "employee"]} rf={rf} />
      {isLoading ? (
        <LoadingState />
      ) : (
        <ReportTable
          columns={["Data", "Profissional", "Documento", "Arquivo"]}
          rows={data ?? []}
          keyFn={(r) => r.id}
          emptyMessage="Sem documentos cadastrados no período."
          renderRow={(r) => [
            dt(r.data),
            r.profissional?.name ?? "—",
            r.nome,
            <a
              key="f"
              href={r.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="text-brand font-semibold underline"
            >
              Abrir
            </a>,
          ]}
        />
      )}
    </div>
  );
}

// ─── Configuração dos grupos ──────────────────────────────────────────────

interface ReportItem {
  key: string;
  label: string;
  description: string;
}

interface ReportGroup {
  key: string;
  label: string;
  icon: React.ReactNode;
  items: ReportItem[];
}

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
      },
      {
        key: "formas_pagamento",
        label: "Formas de pagamento",
        description:
          "Distribui o faturamento por meio de pagamento, indicando quantidade e valor por método.",
      },
      {
        key: "faturamento_visao",
        label: "Faturamento - visão geral",
        description:
          "Consolidação macro que separa assinaturas (gateway/manuais) e comandas.",
      },
      {
        key: "faturamento_detalhes",
        label: "Faturamento - detalhes",
        description:
          "Tabela detalhada com cliente, profissional, tipo de receita, valor e data/hora.",
      },
      {
        key: "historico_movimentacoes",
        label: "Histórico de movimentações",
        description:
          "Extrato financeiro detalhado com cliente, profissional, operação, forma de pagamento, valor e data.",
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
      },
      {
        key: "frequencia_kpis",
        label: "Frequência do cliente - KPIs",
        description: "Blocos de indicadores (visitas, clientes distintos, taxa média).",
      },
      {
        key: "cliente_periodo_servico",
        label: "Cliente por período e serviço",
        description: "Segmentação de clientes conforme o serviço e período (clube vs. sem clube).",
      },
      {
        key: "servicos_vendidos",
        label: "Serviços vendidos",
        description: "Relatório por serviço, mostrando valor unitário, faturado e quantidade realizada.",
      },
      {
        key: "historico_agendamentos",
        label: "Histórico de agendamentos",
        description: "Base analítica com origem, status e auditoria.",
      },
      {
        key: "historico_venda_produtos",
        label: "Histórico de venda de produtos",
        description: "Listagem de compras de produtos por cliente, profissional e data.",
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
        description: "Histórico de movimentações com quantidade, valor unitário, tipo e observação.",
      },
      {
        key: "estoque_atual",
        label: "Estoque atual",
        description: "Snapshot com quantidade atual e mínima por produto e filial.",
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
        description: "Faturamento e ticket médio total por profissional.",
      },
      {
        key: "tm_clientes_distintos",
        label: "Ticket médio de clientes distintos",
        description: "Ticket calculado por cliente único, em vez de por número de comandas.",
      },
      {
        key: "comissoes_servicos",
        label: "Comissões de serviços",
        description: "Produção e comissão por serviço, diferenciando clube e sem clube.",
      },
      {
        key: "comissoes_produtos",
        label: "Comissões de produtos",
        description: "Venda de produtos por profissional e categoria.",
      },
      {
        key: "documentos_profissional",
        label: "Documentos",
        description: "Documentos anexados ao cadastro de cada profissional, com data de upload.",
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
        description: "Painel de origem de aquisição com total por canal.",
      },
      {
        key: "novos_clientes",
        label: "Novos clientes",
        description: "Relatório de primeira visita agrupado por profissional, com dados de contato.",
      },
      {
        key: "ausentes",
        label: "Clientes ausentes",
        description: "Lista de clientes que não retornaram dentro de uma janela de tempo específica.",
      },
      {
        key: "avaliacoes",
        label: "Avaliações",
        description: "Total de avaliações, média e comentários vinculados a profissionais e clientes.",
      },
      {
        key: "aniversariantes",
        label: "Aniversariantes por período",
        description: "Lista de aniversariantes com telefone, e-mail e data de nascimento.",
      },
      {
        key: "sem_preferencia",
        label: "Clientes sem preferência",
        description: "Clientes sem vínculo com um profissional específico.",
      },
      {
        key: "lista_espera_plano",
        label: "Lista de espera de plano",
        description: "Clientes interessados em assinar um plano à espera de vaga disponível.",
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
      },
      {
        key: "cancelados",
        label: "Cancelados por período",
        description: "Relatório de churn com plano, cliente, datas e motivo.",
      },
      {
        key: "vendas_novas",
        label: "Vendas novas por período",
        description: "Novas assinaturas vendidas no período.",
      },
      {
        key: "vendas_por_origem",
        label: "Vendas por origem",
        description: "Agrupa vendas de plano por origem.",
      },
      {
        key: "alteracoes_assinaturas",
        label: "Alterações nas assinaturas",
        description: "Histórico de mudanças de plano e status registradas em cada assinatura.",
      },
      {
        key: "historico_transacoes_assinaturas",
        label: "Histórico de Transações",
        description: "Cobranças de assinatura no período, com status e valor.",
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
      },
      {
        key: "tm_cliente",
        label: "Por cliente",
        description: "Faturamento total, clientes distintos e ticket médio por cliente.",
      },
      {
        key: "tm_agendamento",
        label: "Por agendamento",
        description: "Faturamento total, número de atendimentos e ticket médio por agendamento.",
      },
    ],
  },
];

function renderSubReport(key: string): React.ReactNode {
  switch (key) {
    case "vendas":
      return <RelVendasPorItem />;
    case "formas_pagamento":
      return <RelFormasPagamento />;
    case "faturamento_visao":
      return <RelFaturamentoVisao />;
    case "faturamento_detalhes":
      return <RelFaturamentoDetalhes />;
    case "historico_movimentacoes":
      return <RelHistoricoMovimentacoes />;
    case "frequencia_cliente":
      return <RelFrequenciaCliente />;
    case "frequencia_kpis":
      return <RelFrequenciaKpis />;
    case "cliente_periodo_servico":
      return <RelClientesPorServico />;
    case "servicos_vendidos":
      return <RelServicosVendidos />;
    case "historico_agendamentos":
      return <RelHistoricoAgendamentos />;
    case "historico_venda_produtos":
      return <RelHistoricoVendaProdutos />;
    case "entrada_saida":
      return <RelEntradaSaidaEstoque />;
    case "estoque_atual":
      return <RelEstoqueAtual />;
    case "tm_atendimento":
    case "tm_profissional":
      return <RelTicketMedioProfissional />;
    case "tm_agendamento":
      return <RelTicketMedioAgendamento />;
    case "tm_clientes_distintos":
    case "tm_cliente":
      return <RelTicketMedioClientesDistintos />;
    case "comissoes_servicos":
      return <RelComissoesServicos />;
    case "comissoes_produtos":
      return <RelComissoesProdutos />;
    case "captacao":
      return <RelCaptacaoClientes />;
    case "novos_clientes":
      return <RelNovosClientes />;
    case "ausentes":
      return <RelAusentes />;
    case "avaliacoes":
      return <RelAvaliacoes />;
    case "aniversariantes":
      return <RelAniversariantes />;
    case "sem_preferencia":
      return <RelSemPreferencia />;
    case "qtd_assinantes":
      return <RelAssinantes />;
    case "cancelados":
      return <RelAssinaturasCanceladas />;
    case "vendas_novas":
      return <RelAssinaturasNovas />;
    case "vendas_por_origem":
      return <RelAssinaturasPorOrigem />;
    case "alteracoes_assinaturas":
      return <RelAlteracoesAssinaturas />;
    case "historico_transacoes_assinaturas":
      return <RelHistoricoTransacoesAssinaturas />;
    case "lista_espera_plano":
      return <RelListaEsperaPlano />;
    case "documentos_profissional":
      return <RelDocumentosProfissional />;
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
          <p className="text-sm text-muted-foreground -mt-2">{activeItem.description}</p>
        )}

        <Card className="bg-surface-raised border-border">
          <CardContent className="p-4">{renderSubReport(activeItem.key)}</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader title="Relatórios" subtitle="7 categorias de análise do seu negócio" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {REPORT_GROUPS.map((group) => (
          <Card key={group.key} className="bg-surface-raised border-border">
            <CardContent className="p-0">
              <div className="px-4 py-3 border-b border-border-subtle flex items-center gap-2">
                <div className="size-7 rounded-md bg-brand/15 border border-brand/30 flex items-center justify-center text-brand">
                  {group.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-foreground">{group.label}</p>
                  <p className="text-[10px] text-text-faint">{group.items.length} relatórios</p>
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
                      <span className="text-foreground">{item.label}</span>
                      <ChevronRight className="size-3.5 text-text-faint group-hover:text-brand transition-colors" />
                    </button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
