"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowDown, ArrowUp, Save, Star } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Loading, EmptyState } from "@/components/shared";
import { useAuth } from "@/hooks/useAuth";
import { usePlans } from "@/hooks/usePlans";
import { plansService } from "@/services/plans.service";
import type { Plan } from "@/types/plan.types";

export default function ExibicaoPlanosPage() {
  const { barbershop } = useAuth();
  const { plans, isLoading } = usePlans(barbershop?.id);
  const [ordered, setOrdered] = useState<Plan[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setOrdered(plans);
  }, [plans]);

  function move(index: number, delta: number) {
    setOrdered((prev) => {
      const next = [...prev];
      const target = index + delta;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function toggleHighlight(id: string) {
    setOrdered((prev) =>
      prev.map((p) => (p.id === id ? { ...p, highlighted: !p.highlighted } : p)),
    );
  }

  async function save() {
    if (!barbershop) return;
    setSaving(true);
    try {
      await plansService.reorder(
        barbershop.id,
        ordered.map((p, index) => ({ id: p.id, order: index, highlighted: p.highlighted })),
      );
      toast.success("Ordenação salva.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao salvar ordenação.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground max-w-2xl">
      <PageHeader
        title="Exibição de planos"
        subtitle="Ordenar e destacar planos"
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

      <div className="rounded-xl border border-border bg-surface-raised divide-y divide-border-subtle">
        {isLoading ? (
          <Loading />
        ) : ordered.length === 0 ? (
          <div className="py-6">
            <EmptyState message="Nenhum plano cadastrado." />
          </div>
        ) : (
          ordered.map((p, index) => (
            <div key={p.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  className="size-6 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  <ArrowUp className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === ordered.length - 1}
                  className="size-6 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  <ArrowDown className="size-3.5" />
                </button>
              </div>
              <p className="flex-1 text-sm font-semibold text-foreground">{p.name}</p>
              <button
                type="button"
                onClick={() => toggleHighlight(p.id)}
                className={`h-8 px-3 rounded-md border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  p.highlighted
                    ? "border-brand/40 bg-brand/15 text-brand"
                    : "border-border text-muted-foreground hover:bg-surface-elevated"
                }`}
              >
                <Star className="size-3" />
                Mais vendido
              </button>
            </div>
          ))
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={save}
          disabled={saving || ordered.length === 0}
          className="h-10 px-5 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors flex items-center gap-1.5 disabled:opacity-50"
        >
          <Save className="size-3.5" />
          Salvar
        </button>
      </div>
    </div>
  );
}
