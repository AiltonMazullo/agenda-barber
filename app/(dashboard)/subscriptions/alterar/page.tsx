"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Loading, EmptyState, SelectField } from "@/components/shared";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { usePlans } from "@/hooks/usePlans";
import { subscriptionsService } from "@/services/subscriptions.service";
import { formatBRL, formatDate } from "@/utils/format";
import type { SubscriptionBillingType } from "@/types/subscription.types";

const TYPE_OPTIONS: { value: SubscriptionBillingType | "TODOS"; label: string }[] = [
  { value: "TODOS", label: "Todos" },
  { value: "GATEWAY", label: "Cel Cash" },
  { value: "MANUAL", label: "Manual" },
];

export default function AlterarAssinaturasPage() {
  const { barbershop } = useAuth();
  const { activeSubscriptions, isLoading } = useSubscriptions(barbershop?.id);
  const { plans } = usePlans(barbershop?.id);

  const [billingType, setBillingType] = useState<SubscriptionBillingType | "TODOS">("TODOS");
  const [planId, setPlanId] = useState("TODOS");
  const [billingDayFilter, setBillingDayFilter] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({
    billingType: "TODOS" as SubscriptionBillingType | "TODOS",
    planId: "TODOS",
    billingDayFilter: "",
  });

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [newValue, setNewValue] = useState("");
  const [applyOnlyNextInvoice, setApplyOnlyNextInvoice] = useState(false);
  const [newBillingDay, setNewBillingDay] = useState("");
  const [saving, setSaving] = useState(false);

  const planOptions = useMemo(
    () => [{ value: "TODOS", label: "Todos" }, ...plans.map((p) => ({ value: p.id, label: p.name }))],
    [plans],
  );

  const filtered = useMemo(() => {
    return activeSubscriptions.filter((s) => {
      if (appliedFilters.billingType !== "TODOS" && s.billingType !== appliedFilters.billingType) {
        return false;
      }
      if (appliedFilters.planId !== "TODOS" && s.planId !== appliedFilters.planId) {
        return false;
      }
      if (
        appliedFilters.billingDayFilter &&
        String(s.billingDay ?? "") !== appliedFilters.billingDayFilter
      ) {
        return false;
      }
      return true;
    });
  }, [activeSubscriptions, appliedFilters]);

  const selectedIds = useMemo(() => Array.from(selected), [selected]);

  function applyFilters() {
    setAppliedFilters({ billingType, planId, billingDayFilter });
    setSelected(new Set());
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((s) => s.id)));
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
        <p className="text-sm font-bold text-foreground">Filtros</p>
        <div className="flex flex-wrap items-end gap-3">
          <SelectField
            id="billingType"
            label="Tipo de assinatura"
            value={billingType}
            onChange={setBillingType}
            options={TYPE_OPTIONS}
          />
          <SelectField
            id="planId"
            label="Plano"
            value={planId}
            onChange={setPlanId}
            options={planOptions}
          />
          <Field className="w-48">
            <FieldLabel className="text-[10px] font-bold uppercase tracking-widest text-brand">
              Dia de cobrança atual
            </FieldLabel>
            <Input
              value={billingDayFilter}
              onChange={(e) => setBillingDayFilter(e.target.value.replace(/\D/g, ""))}
              placeholder="Ex.: 15"
              className="bg-surface-base border-border text-foreground"
            />
          </Field>
          <button
            type="button"
            onClick={applyFilters}
            className="h-10 px-4 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors"
          >
            Filtrar
          </button>
        </div>
      </div>

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
        </div>
        {isLoading ? (
          <Loading />
        ) : filtered.length === 0 ? (
          <div className="py-6">
            <EmptyState message="Nenhuma assinatura encontrada." />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="px-4 py-3">
                  <Checkbox
                    checked={filtered.length > 0 && selected.size === filtered.length}
                    onCheckedChange={toggleAll}
                    aria-label="Selecionar todas"
                    className="cursor-pointer"
                  />
                </TableHead>
                {["ID", "Cliente", "Plano", "Valor", "Data de início", "Dia de cobrança"].map(
                  (col) => (
                    <TableHead
                      key={col}
                      className="text-muted-foreground text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto"
                    >
                      {col}
                    </TableHead>
                  ),
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow
                  key={s.id}
                  className="border-border hover:bg-surface-elevated/50 transition-colors cursor-pointer"
                  onClick={() => toggle(s.id)}
                >
                  <TableCell className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selected.has(s.id)}
                      onCheckedChange={() => toggle(s.id)}
                      aria-label={`Selecionar ${s.client.name}`}
                      className="cursor-pointer"
                    />
                  </TableCell>
                  <TableCell className="px-4 py-3 text-xs text-muted-foreground font-mono">
                    {s.id.slice(-8)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm font-semibold text-foreground">
                    {s.client.name}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                    {s.plan.name}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-foreground">
                    {formatBRL((s.priceOverrideInCents ?? s.plan.priceInCents) / 100)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(s.startedAt)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                    {s.billingDay ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
