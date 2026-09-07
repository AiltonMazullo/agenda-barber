/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Loading, StatusBadge } from "@/components/shared";
import { useAuth } from "@/hooks/useAuth";
import { useEmployees } from "@/hooks/useEmployees";
import { commissionClubService } from "@/services/commission-club.service";
import { useCommissionClub } from "@/hooks/useCommissionClub";
import { formatBRL, formatDate } from "@/utils/format";
import type { CommissionRunReport } from "@/types/commission-club.types";

export default function ComissaoClubeRelatorioPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { barbershop } = useAuth();
  const { employees } = useEmployees(barbershop?.id);
  const { distribute } = useCommissionClub(barbershop?.id);

  const [report, setReport] = useState<CommissionRunReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!barbershop?.id) return;
    setIsLoading(true);
    commissionClubService
      .getReport(barbershop.id, id)
      .then(setReport)
      .catch((err: unknown) =>
        toast.error(err instanceof Error ? err.message : "Falha ao carregar relatório."),
      )
      .finally(() => setIsLoading(false));
  }, [barbershop?.id, id]);

  function employeeName(employeeId: string): string {
    return employees.find((e) => e.id === employeeId)?.name ?? employeeId;
  }

  async function handleDistribute() {
    const result = await distribute(id);
    if (result) router.push("/subscriptions/comissao");
  }

  function formatPercent(value: number): string {
    return `${value.toFixed(2).replace(".", ",")}%`;
  }

  const unitLabel = barbershop?.commissionUnitType === "MINUTO" ? "minutos" : "fichas";

  const totalServicosRealizados = report
    ? Object.values(report.totalServicesByCategory).reduce((sum, qty) => sum + qty, 0)
    : 0;
  const totalFichas = report ? report.shares.reduce((sum, s) => sum + s.fichas, 0) : 0;
  const comissaoLiquidaEmpresaInCents = report
    ? report.run.subscriptionRevenueInCents - report.run.totalPoolInCents
    : 0;
  const percentLiquida = report ? 100 - report.run.commissionPercent : 0;

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Comissão de assinaturas — relatório"
        subtitle="Produção por filial e rateio por barbeiro"
        actions={
          <Link
            href="/subscriptions/comissao"
            className="h-9 px-4 rounded-md border border-border bg-surface-raised text-sm text-foreground hover:bg-surface-elevated transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="size-3.5" />
            Voltar
          </Link>
        }
      />

      {isLoading || !report ? (
        <Loading />
      ) : (
        <>
          <div className="flex items-center gap-2">
            <StatusBadge tone={report.run.distributedAt ? "success" : "warning"}>
              {report.run.distributedAt ? "Distribuído" : "Rascunho"}
            </StatusBadge>
            <p className="text-xs text-muted-foreground">
              {report.run.branch.name} · {formatDate(report.run.periodStart)} —{" "}
              {formatDate(report.run.periodEnd)}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface-raised p-5">
            <p className="text-sm font-bold text-foreground mb-3">Informações gerais</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Serviços realizados</span>
                <span className="font-semibold text-foreground">{totalServicosRealizados}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total de {unitLabel}</span>
                <span className="font-semibold text-foreground">{totalFichas}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Valor das assinaturas</span>
                <span className="font-semibold text-foreground">
                  {formatBRL(report.run.subscriptionRevenueInCents / 100)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">% do pote</span>
                <span className="font-semibold text-foreground">
                  {formatPercent(report.run.commissionPercent)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Valor do pote (comissão bruta)</span>
                <span className="font-semibold text-foreground">
                  {formatBRL(report.run.totalPoolInCents / 100)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Pago aos profissionais</span>
                <span className="font-semibold text-foreground">
                  {formatBRL(report.run.totalPoolInCents / 100)} (
                  {formatPercent(report.run.commissionPercent)})
                </span>
              </div>
              <div className="flex items-center justify-between sm:col-span-2">
                <span className="text-muted-foreground">Comissão líquida da empresa</span>
                <span className="font-semibold text-foreground">
                  {formatBRL(comissaoLiquidaEmpresaInCents / 100)} (
                  {formatPercent(percentLiquida)})
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface-raised p-5">
            <p className="text-sm font-bold text-foreground mb-3">
              Serviços do plano no período
            </p>
            <div className="divide-y divide-border-subtle">
              {Object.entries(report.totalServicesByCategory).map(([category, qty]) => (
                <div key={category} className="flex items-center justify-between text-sm py-1.5">
                  <span className="text-muted-foreground">{category}</span>
                  <span className="font-semibold text-foreground">{qty}</span>
                </div>
              ))}
              <div className="flex items-center justify-between text-sm py-1.5 font-bold text-foreground">
                <span>Total</span>
                <span>{totalServicosRealizados}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface-raised p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-foreground">Rateio por barbeiro</p>
              <p className="text-sm font-bold text-brand">
                Pote: {formatBRL(report.run.totalPoolInCents / 100)}
              </p>
            </div>
            <div className="divide-y divide-border-subtle">
              {report.shares.map((share) => {
                const byCategory = report.run.servicesByEmployee[share.employeeId] ?? {};
                const percentOfPool =
                  report.run.totalPoolInCents > 0
                    ? (share.shareInCents / report.run.totalPoolInCents) * 100
                    : 0;
                return (
                  <div key={share.employeeId} className="py-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-foreground">
                        {employeeName(share.employeeId)}
                      </span>
                      <span className="font-bold text-foreground">
                        {formatBRL(share.shareInCents / 100)}{" "}
                        <span className="text-muted-foreground font-normal">
                          ({formatPercent(percentOfPool)})
                        </span>
                      </span>
                    </div>
                    <div className="pl-3 space-y-0.5">
                      {Object.entries(byCategory).map(([category, qty]) => (
                        <div
                          key={category}
                          className="flex items-center justify-between text-xs text-muted-foreground"
                        >
                          <span>- {category}</span>
                          <span>{qty}</span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between text-xs font-semibold text-foreground pt-0.5">
                        <span>Total</span>
                        <span>
                          {share.fichas} {unitLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {!report.run.distributedAt && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleDistribute}
                className="h-10 px-5 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors flex items-center gap-1.5"
              >
                <Send className="size-3.5" />
                Distribuir rateio
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
