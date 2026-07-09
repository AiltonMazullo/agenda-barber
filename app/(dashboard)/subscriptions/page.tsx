"use client";

import { useMemo, useState } from "react";
import {
  CreditCard,
  Plus,
  Pencil,
  PowerOff,
  Power,
  Users,
  TrendingUp,
  UserMinus,
  Search,
  Mail,
  Phone,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PageHeader,
  SummaryCard,
  EmptyState,
  DataTablePagination,
  ConfirmDialog,
  Loading,
} from "@/components/shared";
import { DialogNovoPlano } from "@/components/plans/DialogNovoPlano";
import { formatBRL, formatDate } from "@/utils/format";
import { useAuth } from "@/hooks/useAuth";
import { usePlans } from "@/hooks/usePlans";
import { useServices } from "@/hooks/useServices";
import { useProducts } from "@/hooks/useProducts";
import { useEmployees } from "@/hooks/useEmployees";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { usePagination } from "@/hooks/usePagination";
import type { CreatePlanPayload, Plan } from "@/types/plan.types";
import type { Subscription } from "@/types/subscription.types";

type Tab = "assinantes" | "planos";

function AssinantesTab() {
  const { barbershop } = useAuth();
  const { activeSubscriptions, summary, isLoading, cancel } = useSubscriptions(
    barbershop?.id,
  );

  const [search, setSearch] = useState("");
  const [toCancel, setToCancel] = useState<Subscription | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return activeSubscriptions;
    return activeSubscriptions.filter(
      (s) =>
        s.client.name.toLowerCase().includes(q) ||
        s.client.email.toLowerCase().includes(q),
    );
  }, [activeSubscriptions, search]);

  const pag = usePagination(filtered, 10);

  function doCancel() {
    if (!toCancel) return;
    void cancel(toCancel.id);
    setToCancel(null);
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard
          label="Assinantes ativos"
          value={isLoading ? "—" : String(summary.activeCount)}
          icon={<Users className="size-3.5" />}
          tone="brand"
          emphasized
        />
        <SummaryCard
          label="Receita recorrente"
          value={isLoading ? "—" : formatBRL(summary.mrrInCents / 100)}
          icon={<TrendingUp className="size-3.5" />}
          tone="success"
        />
        <SummaryCard
          label="Novos no mês"
          value={isLoading ? "—" : String(summary.newThisMonth)}
          icon={<Plus className="size-3.5" />}
          tone="info"
        />
        <SummaryCard
          label="Cancelados"
          value={isLoading ? "—" : String(summary.cancelledCount)}
          icon={<UserMinus className="size-3.5" />}
          tone="danger"
        />
      </div>

      {summary.byPlan.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {summary.byPlan.map((p) => (
            <Card key={p.planId} className="bg-surface-raised border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <div
                  className="size-9 rounded-lg grid place-items-center shrink-0"
                  style={{ backgroundColor: `${p.labelColor}26`, color: p.labelColor }}
                >
                  <CreditCard className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{p.planName}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.count} {p.count === 1 ? "assinante" : "assinantes"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="bg-surface-raised border-border">
        <CardContent className="p-0">
          <div className="px-4 py-4 border-b border-border-subtle">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou e-mail..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-surface-base border-border text-foreground placeholder:text-muted-foreground h-9 text-sm focus-visible:ring-brand/40"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-t border-border">
                <TableRow className="border-border hover:bg-transparent">
                  {["Cliente", "Contato", "Plano", "Assinante desde", ""].map((col) => (
                    <TableHead
                      key={col}
                      className="text-muted-foreground text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto"
                    >
                      {col}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow className="border-border hover:bg-transparent">
                    <TableCell colSpan={5} className="py-4">
                      <Loading />
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow className="border-border hover:bg-transparent">
                    <TableCell colSpan={5} className="py-4">
                      <EmptyState
                        message={
                          activeSubscriptions.length === 0
                            ? "Nenhum assinante ativo ainda."
                            : "Nenhum assinante corresponde à busca."
                        }
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  pag.pageItems.map((s) => (
                    <TableRow
                      key={s.id}
                      className="border-border hover:bg-surface-elevated/50 transition-colors"
                    >
                      <TableCell className="px-4 py-4 font-semibold text-sm text-foreground">
                        {s.client.name}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Mail className="size-3" />
                          {s.client.email}
                        </div>
                        {s.client.phone && (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Phone className="size-3" />
                            {s.client.phone}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-sm">
                        <span
                          className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
                          style={{
                            backgroundColor: `${s.plan.labelColor}26`,
                            color: s.plan.labelColor,
                          }}
                        >
                          {s.plan.name}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                        {formatDate(s.startedAt)}
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => setToCancel(s)}
                          title="Cancelar assinatura"
                          className="size-7 rounded-md border border-danger/30 bg-transparent text-danger-foreground flex items-center justify-center hover:bg-danger/10 transition-colors"
                        >
                          <UserMinus className="size-3" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {pag.total > 0 && (
            <DataTablePagination
              page={pag.page}
              pageSize={pag.pageSize}
              totalPages={pag.totalPages}
              total={pag.total}
              from={pag.from}
              to={pag.to}
              onPageChange={pag.setPage}
              onPageSizeChange={pag.setPageSize}
            />
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={toCancel !== null}
        onOpenChange={(v) => !v && setToCancel(null)}
        title="Cancelar assinatura?"
        description={
          toCancel
            ? `A assinatura de "${toCancel.client.name}" ao plano "${toCancel.plan.name}" será cancelada.`
            : undefined
        }
        confirmLabel="Cancelar assinatura"
        tone="danger"
        onConfirm={doCancel}
      />
    </div>
  );
}

function PlanosTab() {
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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 flex-1">
          <SummaryCard
            label="Planos ativos"
            value={isLoading ? "—" : String(activePlans.length)}
            icon={<CreditCard className="size-3.5" />}
            tone="brand"
            emphasized
          />
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="h-9 px-4 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors flex items-center gap-1.5 shrink-0 ml-3"
        >
          <Plus className="size-3.5" />
          Novo plano
        </button>
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

export default function SubscriptionsPage() {
  const [tab, setTab] = useState<Tab>("assinantes");

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Assinaturas"
        subtitle="Assinantes ativos e planos oferecidos pela barbearia"
      />

      <div className="flex items-center gap-1 border-b border-border-subtle">
        {(
          [
            { id: "assinantes", label: "Assinantes" },
            { id: "planos", label: "Planos" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              tab === t.id
                ? "border-brand text-brand"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "assinantes" ? <AssinantesTab /> : <PlanosTab />}
    </div>
  );
}
