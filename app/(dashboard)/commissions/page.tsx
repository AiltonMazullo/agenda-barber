"use client";

import { useState } from "react";
import { Play, Send } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, DatePickerField, Loading, EmptyState } from "@/components/shared";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { financialEntriesService } from "@/services/financial-entries.service";
import { formatBRL, maskBRLInput, parseBRL } from "@/utils/format";
import type { CommissionResultRow } from "@/types/financial-entry.types";

export default function ComissoesPage() {
  const { barbershop } = useAuth();

  const now = new Date();
  const [periodStart, setPeriodStart] = useState<Date | undefined>(
    new Date(now.getFullYear(), now.getMonth(), 1),
  );
  const [periodEnd, setPeriodEnd] = useState<Date | undefined>(now);
  const [results, setResults] = useState<CommissionResultRow[] | null>(null);
  const [bonusInputs, setBonusInputs] = useState<Record<string, string>>({});
  const [valeInputs, setValeInputs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  function bonusMap(): Record<string, number> {
    return Object.fromEntries(
      Object.entries(bonusInputs).map(([id, v]) => [id, Math.round(parseBRL(v) * 100)]),
    );
  }

  function valeMap(): Record<string, number> {
    return Object.fromEntries(
      Object.entries(valeInputs).map(([id, v]) => [id, Math.round(parseBRL(v) * 100)]),
    );
  }

  async function calculate() {
    if (!barbershop?.id || !periodStart || !periodEnd) return;
    setLoading(true);
    try {
      const result = await financialEntriesService.generateCommissions(barbershop.id, {
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
        dryRun: true,
        bonusByEmployee: bonusMap(),
        valeByEmployee: valeMap(),
      });
      setResults(result.results);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao calcular comissões.");
    } finally {
      setLoading(false);
    }
  }

  async function confirm() {
    if (!barbershop?.id || !periodStart || !periodEnd) return;
    setConfirming(true);
    try {
      const result = await financialEntriesService.generateCommissions(barbershop.id, {
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
        dryRun: false,
        bonusByEmployee: bonusMap(),
        valeByEmployee: valeMap(),
      });
      toast.success(`${result.createdEntryIds.length} lançamento(s) gerado(s) em Contas a pagar.`);
      setResults(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao gerar movimentações.");
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader title="Gerar comissões" subtitle="Consolidação financeira por profissional" />

      <div className="flex flex-wrap items-end gap-3">
        <DatePickerField id="periodStart" label="Data inicial *" date={periodStart} onChange={setPeriodStart} />
        <DatePickerField id="periodEnd" label="Data final *" date={periodEnd} onChange={setPeriodEnd} />
        <button
          type="button"
          onClick={calculate}
          disabled={!periodStart || !periodEnd || loading}
          className="h-10 px-4 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors flex items-center gap-1.5 disabled:opacity-50"
        >
          <Play className="size-3.5" />
          Filtrar
        </button>
      </div>

      {loading ? (
        <Loading />
      ) : results === null ? (
        <EmptyState message="Escolha o período e clique em Filtrar para calcular as comissões." />
      ) : results.length === 0 ? (
        <EmptyState message="Nenhuma comissão a apurar neste período." />
      ) : (
        <div className="rounded-xl border border-border bg-surface-raised overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle text-left text-xs uppercase text-muted-foreground">
                <th className="px-4 py-3">Profissional</th>
                <th className="px-4 py-3">Serviços avulso</th>
                <th className="px-4 py-3">Produtos</th>
                <th className="px-4 py-3">Serviços assinatura</th>
                <th className="px-4 py-3">Bônus</th>
                <th className="px-4 py-3">Vales</th>
                <th className="px-4 py-3">Total bruto</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.employeeId} className="border-b border-border-subtle last:border-0">
                  <td className="px-4 py-3 font-semibold">{r.employeeName}</td>
                  <td className="px-4 py-3">{formatBRL(r.servicesAvulsoInCents / 100)}</td>
                  <td className="px-4 py-3">{formatBRL(r.servicesProdutoInCents / 100)}</td>
                  <td className="px-4 py-3">{formatBRL(r.servicesClubInCents / 100)}</td>
                  <td className="px-4 py-3">
                    <Input
                      value={bonusInputs[r.employeeId] ?? ""}
                      onChange={(e) =>
                        setBonusInputs((prev) => ({
                          ...prev,
                          [r.employeeId]: maskBRLInput(e.target.value),
                        }))
                      }
                      placeholder="R$ 0,00"
                      className="w-28 h-8 text-xs bg-surface-base border-border text-foreground"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      value={valeInputs[r.employeeId] ?? ""}
                      onChange={(e) =>
                        setValeInputs((prev) => ({
                          ...prev,
                          [r.employeeId]: maskBRLInput(e.target.value),
                        }))
                      }
                      placeholder="R$ 0,00"
                      className="w-28 h-8 text-xs bg-surface-base border-border text-foreground"
                    />
                  </td>
                  <td className="px-4 py-3 font-bold">
                    {formatBRL(
                      (r.servicesAvulsoInCents +
                        r.servicesProdutoInCents +
                        r.servicesClubInCents +
                        Math.round(parseBRL(bonusInputs[r.employeeId] ?? "0") * 100) +
                        Math.round(parseBRL(valeInputs[r.employeeId] ?? "0") * 100)) /
                        100,
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {results !== null && results.length > 0 && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={confirm}
            disabled={confirming}
            className="h-10 px-5 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <Send className="size-3.5" />
            Gerar movimentações
          </button>
        </div>
      )}
    </div>
  );
}
