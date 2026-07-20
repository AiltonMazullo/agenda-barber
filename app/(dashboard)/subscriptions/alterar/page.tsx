"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Loading, EmptyState } from "@/components/shared";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { subscriptionsService } from "@/services/subscriptions.service";
import { formatBRL } from "@/utils/format";

export default function AlterarAssinaturasPage() {
  const { barbershop } = useAuth();
  const { activeSubscriptions, isLoading } = useSubscriptions(barbershop?.id);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [newValue, setNewValue] = useState("");
  const [applyOnlyNextInvoice, setApplyOnlyNextInvoice] = useState(false);
  const [newBillingDay, setNewBillingDay] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedIds = useMemo(() => Array.from(selected), [selected]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === activeSubscriptions.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(activeSubscriptions.map((s) => s.id)));
    }
  }

  async function applyValue() {
    if (selectedIds.length === 0 || !newValue) return;
    setSaving(true);
    try {
      await subscriptionsService.bulkUpdate(barbershop!.id, {
        subscriptionIds: selectedIds,
        newValueInCents: Math.round(Number(newValue.replace(",", ".")) * 100),
        applyOnlyNextInvoice,
      });
      toast.success("Valor atualizado.");
      setNewValue("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao alterar valor.");
    } finally {
      setSaving(false);
    }
  }

  async function applyBillingDay() {
    if (selectedIds.length === 0 || !newBillingDay) return;
    setSaving(true);
    try {
      await subscriptionsService.bulkUpdate(barbershop!.id, {
        subscriptionIds: selectedIds,
        newBillingDay: Number(newBillingDay),
      });
      toast.success("Dia de cobrança atualizado.");
      setNewBillingDay("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao alterar dia de cobrança.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Alterar assinaturas"
        subtitle="Atualização em massa de valor ou dia de cobrança"
        actions={
          <Link
            href="/subscriptions"
            className="h-9 px-4 rounded-md border border-border bg-surface-raised text-sm text-foreground hover:bg-surface-elevated transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="size-3.5" />
            Voltar
          </Link>
        }
      />

      <div className="rounded-xl border border-border bg-surface-raised p-5 space-y-4">
        <p className="text-sm font-bold text-foreground">Alterar valor</p>
        <div className="flex flex-wrap items-end gap-3">
          <Field className="w-40">
            <FieldLabel className="text-[10px] font-bold uppercase tracking-widest text-brand">
              Valor *
            </FieldLabel>
            <Input
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="R$ 0,00"
              className="bg-surface-base border-border text-foreground"
            />
          </Field>
          <label className="flex items-center gap-2 text-xs text-muted-foreground h-10">
            <input
              type="checkbox"
              checked={applyOnlyNextInvoice}
              onChange={(e) => setApplyOnlyNextInvoice(e.target.checked)}
            />
            Apenas a próxima fatura
          </label>
          <button
            type="button"
            onClick={applyValue}
            disabled={selectedIds.length === 0 || !newValue || saving}
            className="h-10 px-4 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors disabled:opacity-50"
          >
            Alterar valor das assinaturas
          </button>
        </div>

        <p className="text-sm font-bold text-foreground pt-2">Alterar data</p>
        <div className="flex flex-wrap items-end gap-3">
          <Field className="w-40">
            <FieldLabel className="text-[10px] font-bold uppercase tracking-widest text-brand">
              Dia de cobrança *
            </FieldLabel>
            <Input
              value={newBillingDay}
              onChange={(e) => setNewBillingDay(e.target.value.replace(/\D/g, ""))}
              placeholder="Insira um número entre 1 e 28"
              className="bg-surface-base border-border text-foreground"
            />
          </Field>
          <button
            type="button"
            onClick={applyBillingDay}
            disabled={selectedIds.length === 0 || !newBillingDay || saving}
            className="h-10 px-4 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors disabled:opacity-50"
          >
            Alterar dia de cobrança
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface-raised overflow-hidden">
        <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between">
          <p className="text-sm font-bold text-foreground">
            Resultados {selectedIds.length > 0 && `(${selectedIds.length} selecionadas)`}
          </p>
          <button
            type="button"
            onClick={toggleAll}
            className="text-xs font-semibold text-brand hover:underline"
          >
            {selected.size === activeSubscriptions.length ? "Limpar seleção" : "Selecionar todas"}
          </button>
        </div>
        {isLoading ? (
          <Loading />
        ) : activeSubscriptions.length === 0 ? (
          <div className="py-6">
            <EmptyState message="Nenhuma assinatura ativa." />
          </div>
        ) : (
          <div className="divide-y divide-border-subtle">
            {activeSubscriptions.map((s) => (
              <label
                key={s.id}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-surface-elevated/50"
              >
                <input
                  type="checkbox"
                  checked={selected.has(s.id)}
                  onChange={() => toggle(s.id)}
                />
                {selected.has(s.id) && <Check className="size-3 text-brand" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {s.client.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {s.plan.name} · {formatBRL((s.priceOverrideInCents ?? s.plan.priceInCents) / 100)}
                    {s.billingDay != null && ` · dia ${s.billingDay}`}
                  </p>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
