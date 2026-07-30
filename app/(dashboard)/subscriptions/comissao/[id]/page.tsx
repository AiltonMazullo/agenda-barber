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
              {formatDate(report.run.periodStart)} — {formatDate(report.run.periodEnd)}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface-raised p-5">
            <p className="text-sm font-bold text-foreground mb-3">Por filial</p>
            <div className="space-y-1">
              {Object.entries(report.totalServicesByCategory).map(([category, qty]) => (
                <div key={category} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{category}</span>
                  <span className="font-semibold text-foreground">{qty}</span>
                </div>
              ))}
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
              {report.shares.map((share) => (
                <div
                  key={share.employeeId}
                  className="flex items-center justify-between py-2 text-sm"
                >
                  <span className="text-foreground">{employeeName(share.employeeId)}</span>
                  <span className="text-muted-foreground">
                    {share.fichas}{" "}
                    {barbershop?.commissionUnitType === "MINUTO"
                      ? "minutos"
                      : "fichas"}
                  </span>
                  <span className="font-bold text-foreground">
                    {formatBRL(share.shareInCents / 100)}
                  </span>
                </div>
              ))}
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
