"use client";

import { useState } from "react";
import { CreditCard, Plus, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader, SummaryCard, EmptyState } from "@/components/shared";
import { DialogNovoPlano } from "@/components/plans/DialogNovoPlano";
import { toast } from "sonner";
import { formatBRL } from "@/utils/format";
import type { Plan, CreatePlanPayload } from "@/types/plan.types";

const INTERVAL_LABEL: Record<string, string> = {
  MONTHLY: "Mensal",
  QUARTERLY: "Trimestral",
  YEARLY: "Anual",
};

export default function PlanosPage() {
  // ⚠️ Placeholder: lista local até as rotas de planos existirem no backend.
  const [plans, setPlans] = useState<Plan[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(plan: Plan) {
    setEditing(plan);
    setDialogOpen(true);
  }

  // TODO(backend): trocar por plansService.create/update quando as rotas existirem.
  async function handleSave(payload: CreatePlanPayload) {
    const now = new Date().toISOString();
    if (editing) {
      setPlans((prev) =>
        prev.map((p) =>
          p.id === editing.id ? { ...p, ...payload, updatedAt: now } : p,
        ),
      );
    } else {
      setPlans((prev) => [
        ...prev,
        {
          id: `tmp_${Date.now()}`,
          name: payload.name,
          description: payload.description ?? null,
          priceInCents: payload.priceInCents,
          interval: payload.interval,
          barbershopId: "",
          createdAt: now,
          updatedAt: now,
        },
      ]);
    }
    toast.success(
      "Plano salvo localmente. A persistência será ativada quando o backend liberar as rotas.",
    );
    return true;
  }

  function handleDelete(plan: Plan) {
    setPlans((prev) => prev.filter((p) => p.id !== plan.id));
  }

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Planos"
        subtitle="Planos e pacotes que a barbearia oferece aos clientes"
        actions={
          <button
            type="button"
            onClick={openCreate}
            className="h-9 px-4 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors flex items-center gap-1.5"
          >
            <Plus className="size-3.5" />
            Novo plano
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <SummaryCard
          label="Planos"
          value={String(plans.length)}
          icon={<CreditCard className="size-3.5" />}
          tone="brand"
          emphasized
        />
      </div>

      {plans.length === 0 ? (
        <EmptyState message="Nenhum plano cadastrado. Crie um plano para oferecer aos seus clientes." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {plans.map((p) => (
            <Card key={p.id} className="bg-surface-raised border-border">
              <CardContent className="p-4 flex items-start gap-3">
                <div className="size-10 rounded-lg bg-brand/15 text-brand grid place-items-center shrink-0">
                  <CreditCard className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">
                    {p.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatBRL(p.priceInCents / 100)} ·{" "}
                    {INTERVAL_LABEL[p.interval] ?? p.interval}
                  </p>
                  {p.description && (
                    <p className="text-xs text-text-faint mt-1 line-clamp-2">
                      {p.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEdit(p)}
                    className="size-7 rounded-md border border-border bg-surface-base text-muted-foreground flex items-center justify-center hover:border-brand/40 hover:text-brand transition-colors"
                  >
                    <Pencil className="size-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(p)}
                    className="size-7 rounded-md border border-danger/30 bg-transparent text-danger-foreground flex items-center justify-center hover:bg-danger/10 transition-colors"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <DialogNovoPlano
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        plan={editing}
        onSave={handleSave}
      />
    </div>
  );
}
