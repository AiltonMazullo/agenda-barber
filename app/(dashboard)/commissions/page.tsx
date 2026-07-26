"use client";

import { useEffect, useState } from "react";
import { Pencil, Play, Send, X } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, DatePickerField, Loading, EmptyState } from "@/components/shared";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { financialEntriesService } from "@/services/financial-entries.service";
import { formatBRL, maskBRLInput, parseBRL } from "@/utils/format";
import type { CommissionResultRow } from "@/types/financial-entry.types";

// ─── Dialog de edição rápida (Bônus/Vale) ─────────────────────────────────────

function DialogEditarLinha({
  open,
  onOpenChange,
  row,
  bonusValue,
  valeValue,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  row: CommissionResultRow | null;
  bonusValue: string;
  valeValue: string;
  onSave: (bonus: string, vale: string) => void;
}) {
  const [bonus, setBonus] = useState("");
  const [vale, setVale] = useState("");

  /* eslint-disable react-hooks/set-state-in-effect -- reinicializa o form ao abrir, mesmo padrão de DialogEditarCliente */
  useEffect(() => {
    if (!open) return;
    setBonus(bonusValue);
    setVale(valeValue);
  }, [open, bonusValue, valeValue]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!row) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-raised border border-border text-foreground max-w-sm p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold">
              Editar {row.employeeName}
            </DialogTitle>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </DialogHeader>
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Bônus
            </label>
            <Input
              value={bonus}
              onChange={(e) => setBonus(maskBRLInput(e.target.value))}
              placeholder="R$ 0,00"
              className="bg-surface-base border-border text-foreground h-10"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Vale
            </label>
            <Input
              value={vale}
              onChange={(e) => setVale(maskBRLInput(e.target.value))}
              placeholder="R$ 0,00"
              className="bg-surface-base border-border text-foreground h-10"
            />
          </div>
        </div>
        <div className="px-6 pb-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 px-5 rounded-md border border-border bg-transparent text-sm text-foreground hover:bg-surface-elevated transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              onSave(bonus, vale);
              onOpenChange(false);
            }}
            className="h-9 px-5 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors"
          >
            Salvar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Célula de categoria (valor bruto / vencimento / valor líquido) ───────────

function CategoryCell({ cents }: { cents: number }) {
  return (
    <div className="space-y-0.5 min-w-[110px]">
      <div className="font-semibold text-foreground">{formatBRL(cents / 100)}</div>
      <div className="text-[10px] text-muted-foreground">Venc.: N/A</div>
      <div className="text-[10px] text-muted-foreground">Líquido: N/A</div>
    </div>
  );
}

// ─── Página ────────────────────────────────────────────────────────────────

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
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [subscriptionRevenueBRL, setSubscriptionRevenueBRL] = useState("");
  const [commissionPercentInput, setCommissionPercentInput] = useState("");
  const [editingRow, setEditingRow] = useState<CommissionResultRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  function bonusMap(): Record<string, number> {
    return Object.fromEntries(
      Object.entries(bonusInputs)
        .filter(([id]) => selected[id] ?? true)
        .map(([id, v]) => [id, Math.round(parseBRL(v) * 100)]),
    );
  }

  function valeMap(): Record<string, number> {
    return Object.fromEntries(
      Object.entries(valeInputs)
        .filter(([id]) => selected[id] ?? true)
        .map(([id, v]) => [id, Math.round(parseBRL(v) * 100)]),
    );
  }

  // Total bruto = comissões (avulso + produto + clube) + bônus + vale, com os
  // valores de bônus/vale reavaliados a cada digitação (antes de confirmar).
  // Total líquido = bruto − vale (adiantamento já recebido pelo profissional),
  // mesma regra usada por `generateCommissions()` no backend (§4.6).
  function totalBrutoInCents(r: CommissionResultRow): number {
    return (
      r.servicesAvulsoInCents +
      r.servicesProdutoInCents +
      r.servicesClubInCents +
      Math.round(parseBRL(bonusInputs[r.employeeId] ?? "0") * 100) +
      Math.round(parseBRL(valeInputs[r.employeeId] ?? "0") * 100)
    );
  }

  function buildPayload(dryRun: boolean) {
    const payload: {
      periodStart: string;
      periodEnd: string;
      dryRun: boolean;
      bonusByEmployee: Record<string, number>;
      valeByEmployee: Record<string, number>;
      subscriptionRevenueInCents?: number;
      commissionPercent?: number;
    } = {
      periodStart: periodStart!.toISOString(),
      periodEnd: periodEnd!.toISOString(),
      dryRun,
      bonusByEmployee: bonusMap(),
      valeByEmployee: valeMap(),
    };

    if (subscriptionRevenueBRL.trim()) {
      payload.subscriptionRevenueInCents = Math.round(
        parseBRL(subscriptionRevenueBRL) * 100,
      );
    }
    if (commissionPercentInput.trim()) {
      const pct = Number(commissionPercentInput.replace(",", "."));
      if (Number.isFinite(pct)) payload.commissionPercent = pct;
    }
    return payload;
  }

  async function calculate() {
    if (!barbershop?.id || !periodStart || !periodEnd) return;
    setLoading(true);
    try {
      const result = await financialEntriesService.generateCommissions(
        barbershop.id,
        buildPayload(true),
      );
      setResults(result.results);
      setSelected(
        Object.fromEntries(result.results.map((r) => [r.employeeId, true])),
      );
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
      const result = await financialEntriesService.generateCommissions(
        barbershop.id,
        buildPayload(false),
      );
      toast.success(`${result.createdEntryIds.length} lançamento(s) gerado(s) em Contas a pagar.`);
      setResults(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao gerar movimentações.");
    } finally {
      setConfirming(false);
    }
  }

  const allSelected =
    (results?.length ?? 0) > 0 &&
    (results ?? []).every((r) => selected[r.employeeId] ?? true);

  function toggleAll(checked: boolean) {
    if (!results) return;
    setSelected(Object.fromEntries(results.map((r) => [r.employeeId, checked])));
  }

  function toggleOne(employeeId: string, checked: boolean) {
    setSelected((prev) => ({ ...prev, [employeeId]: checked }));
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

      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Valor recebido de assinatura
          </label>
          <Input
            value={subscriptionRevenueBRL}
            onChange={(e) => setSubscriptionRevenueBRL(maskBRLInput(e.target.value))}
            placeholder="R$ 0,00"
            className="w-48 h-10 bg-surface-raised border-border text-foreground"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Porcentagem do pote
          </label>
          <div className="relative w-32">
            <Input
              value={commissionPercentInput}
              onChange={(e) =>
                setCommissionPercentInput(e.target.value.replace(/[^\d.,]/g, ""))
              }
              placeholder="0"
              className="h-10 bg-surface-raised border-border text-foreground pr-7"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              %
            </span>
          </div>
        </div>
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
                <th className="px-4 py-3">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={(checked) => toggleAll(checked === true)}
                  />
                </th>
                <th className="px-4 py-3">Profissional</th>
                <th className="px-4 py-3">Serviços avulso</th>
                <th className="px-4 py-3">Produtos</th>
                <th className="px-4 py-3">Serviços assinatura</th>
                <th className="px-4 py-3">Bônus</th>
                <th className="px-4 py-3">Vales</th>
                <th className="px-4 py-3">Total bruto</th>
                <th className="px-4 py-3">Total líquido</th>
                <th className="px-4 py-3">Opções</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.employeeId} className="border-b border-border-subtle last:border-0">
                  <td className="px-4 py-3">
                    <Checkbox
                      checked={selected[r.employeeId] ?? true}
                      onCheckedChange={(checked) =>
                        toggleOne(r.employeeId, checked === true)
                      }
                    />
                  </td>
                  <td className="px-4 py-3 font-semibold">{r.employeeName}</td>
                  <td className="px-4 py-3">
                    <CategoryCell cents={r.servicesAvulsoInCents} />
                  </td>
                  <td className="px-4 py-3">
                    <CategoryCell cents={r.servicesProdutoInCents} />
                  </td>
                  <td className="px-4 py-3">
                    <CategoryCell cents={r.servicesClubInCents} />
                  </td>
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
                    {formatBRL(totalBrutoInCents(r) / 100)}
                  </td>
                  <td className="px-4 py-3 font-bold">
                    {formatBRL(
                      (totalBrutoInCents(r) -
                        Math.round(parseBRL(valeInputs[r.employeeId] ?? "0") * 100)) /
                        100,
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setEditingRow(r)}
                      title="Editar"
                      className="size-7 rounded-md border border-border bg-surface-base text-muted-foreground flex items-center justify-center hover:border-brand/40 hover:text-brand transition-colors"
                    >
                      <Pencil className="size-3" />
                    </button>
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

      <DialogEditarLinha
        open={editingRow !== null}
        onOpenChange={(v) => !v && setEditingRow(null)}
        row={editingRow}
        bonusValue={editingRow ? (bonusInputs[editingRow.employeeId] ?? "") : ""}
        valeValue={editingRow ? (valeInputs[editingRow.employeeId] ?? "") : ""}
        onSave={(bonus, vale) => {
          if (!editingRow) return;
          setBonusInputs((prev) => ({ ...prev, [editingRow.employeeId]: bonus }));
          setValeInputs((prev) => ({ ...prev, [editingRow.employeeId]: vale }));
        }}
      />
    </div>
  );
}
