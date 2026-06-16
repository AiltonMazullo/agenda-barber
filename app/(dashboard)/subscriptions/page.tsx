"use client";

import { useState } from "react";
import { CreditCard, Plus, Pencil, PowerOff, Power } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader, SummaryCard, EmptyState } from "@/components/shared";
import { DialogNovoPlano } from "@/components/plans/DialogNovoPlano";
import { formatBRL } from "@/utils/format";
import { useAuth } from "@/hooks/useAuth";
import { usePlans } from "@/hooks/usePlans";
import { useServices } from "@/hooks/useServices";
import { useProducts } from "@/hooks/useProducts";
import { useEmployees } from "@/hooks/useEmployees";
import type { CreatePlanPayload, Plan } from "@/types/plan.types";

export default function PlanosPage() {
  const { barbershop } = useAuth();
  const { plans, isLoading, create, update, deactivate, activate } = usePlans(
    barbershop?.id,
  );
  const { services } = useServices(barbershop?.id);
  const { products } = useProducts(barbershop?.id);
  const { employees } = useEmployees(barbershop?.id);

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

  async function handleSave(payload: CreatePlanPayload) {
    if (editing) {
      const result = await update(editing.id, payload);
      return result !== null;
    }
    const result = await create(payload);
    return result !== null;
  }

  const activePlans = plans.filter((p) => p.status === "ACTIVE");

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
          label="Planos ativos"
          value={isLoading ? "—" : String(activePlans.length)}
          icon={<CreditCard className="size-3.5" />}
          tone="brand"
          emphasized
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card
              key={i}
              className="bg-surface-raised border-border animate-pulse"
            >
              <CardContent className="p-4 h-20" />
            </Card>
          ))}
        </div>
      ) : plans.length === 0 ? (
        <EmptyState message="Nenhum plano cadastrado. Crie um plano para oferecer aos seus clientes." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {plans.map((p) => (
            <Card
              key={p.id}
              className={`bg-surface-raised border-border ${p.status === "INACTIVE" ? "opacity-50" : ""}`}
            >
              <CardContent className="p-4 flex items-start gap-3">
                <div
                  className="size-10 rounded-lg grid place-items-center shrink-0"
                  style={{
                    backgroundColor: `${p.labelColor}26`,
                    color: p.labelColor,
                  }}
                >
                  <CreditCard className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-foreground truncate">
                      {p.name}
                    </p>
                    {p.status === "INACTIVE" && (
                      <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground border border-border rounded px-1.5 py-0.5 shrink-0">
                        Inativo
                      </span>
                    )}
                    {p.hidden && (
                      <span className="text-[10px] font-bold uppercase tracking-wide text-text-faint border border-border rounded px-1.5 py-0.5 shrink-0">
                        Oculto
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatBRL(p.priceInCents / 100)}
                    {p.availableQuantity != null
                      ? ` · ${p.availableQuantity} vagas`
                      : " · Vagas ilimitadas"}
                  </p>
                  {p.planServices?.length > 0 && (
                    <p className="text-xs text-text-faint mt-1 truncate">
                      {p.planServices?.map((ps) => ps.service.name).join(", ")}
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
                  {p.status === "ACTIVE" ? (
                    <button
                      type="button"
                      onClick={() => deactivate(p.id)}
                      title="Desativar plano"
                      className="size-7 rounded-md border border-danger/30 bg-transparent text-danger-foreground flex items-center justify-center hover:bg-danger/10 transition-colors"
                    >
                      <PowerOff className="size-3" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => activate(p.id)}
                      title="Ativar plano"
                      className="size-7 rounded-md border border-border bg-transparent text-muted-foreground flex items-center justify-center hover:border-brand/40 hover:text-brand transition-colors"
                    >
                      <Power className="size-3" />
                    </button>
                  )}
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
        services={services}
        products={products}
        employees={employees}
      />
    </div>
  );
}
