"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
  GripVertical,
  Save,
} from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
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
import { useCategories } from "@/hooks/useCategories";
import { usePagination } from "@/hooks/usePagination";
import { plansService } from "@/services/plans.service";
import type { CreatePlanPayload, Plan } from "@/types/plan.types";
import type { Subscription } from "@/types/subscription.types";

type Tab = "assinantes" | "planos";

const QUICK_LINKS = [
  { href: "/subscriptions/pre-aprovados", label: "Pré-aprovados" },
  { href: "/subscriptions/pre-cancelados", label: "Pré-cancelados" },
  { href: "/subscriptions/calendario", label: "Calendário" },
  { href: "/subscriptions/alterar", label: "Alterar assinaturas" },
  { href: "/subscriptions/contratos", label: "Contratos ativos" },
  { href: "/subscriptions/comissao", label: "Comissão de assinaturas" },
] as const;

function QuickLinksBar() {
  return (
    <div className="flex flex-wrap gap-2">
      {QUICK_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="h-8 px-3 rounded-md border border-border bg-surface-raised text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-brand/40 transition-colors flex items-center"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}

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

function SortablePlanRow({
  plan,
  onToggleHighlight,
  onEdit,
  onToggleActive,
}: {
  plan: Plan;
  onToggleHighlight: (id: string) => void;
  onEdit: (plan: Plan) => void;
  onToggleActive: (plan: Plan) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: plan.id,
  });

  return (
    <TableRow
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      className={`border-border hover:bg-surface-elevated/50 transition-colors ${plan.status === "INACTIVE" ? "opacity-50" : ""}`}
    >
      <TableCell className="px-4 py-3 w-10">
        <button
          type="button"
          {...listeners}
          {...attributes}
          className="cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground transition-colors touch-none"
          aria-label="Arrastar para reordenar"
        >
          <GripVertical className="size-4" />
        </button>
      </TableCell>
      <TableCell className="px-4 py-3">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground">{plan.name}</p>
          {plan.status === "INACTIVE" && (
            <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground border border-border rounded px-1.5 py-0.5 shrink-0">
              Inativo
            </span>
          )}
          {plan.hidden && (
            <span className="text-[10px] font-bold uppercase tracking-wide text-text-faint border border-border rounded px-1.5 py-0.5 shrink-0">
              Oculto
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatBRL(plan.priceInCents / 100)}
          {plan.availableQuantity != null
            ? ` · ${plan.availableQuantity} vagas`
            : " · Vagas ilimitadas"}
        </p>
      </TableCell>
      <TableCell className="px-4 py-3">
        <Checkbox
          checked={plan.highlighted}
          onCheckedChange={() => onToggleHighlight(plan.id)}
          aria-label={`Marcar "${plan.name}" como mais vendido`}
          className="cursor-pointer"
        />
      </TableCell>
      <TableCell className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(plan)}
            className="size-7 rounded-md border border-border bg-surface-base text-muted-foreground flex items-center justify-center hover:border-brand/40 hover:text-brand transition-colors"
          >
            <Pencil className="size-3" />
          </button>
          {plan.status === "ACTIVE" ? (
            <button
              type="button"
              onClick={() => onToggleActive(plan)}
              title="Desativar plano"
              className="size-7 rounded-md border border-danger/30 bg-transparent text-danger-foreground flex items-center justify-center hover:bg-danger/10 transition-colors"
            >
              <PowerOff className="size-3" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onToggleActive(plan)}
              title="Ativar plano"
              className="size-7 rounded-md border border-border bg-transparent text-muted-foreground flex items-center justify-center hover:border-brand/40 hover:text-brand transition-colors"
            >
              <Power className="size-3" />
            </button>
          )}
        </div>
      </TableCell>
    </TableRow>
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
  const { categories } = useCategories(barbershop?.id, "PRODUTO");
  const { categories: serviceCategories } = useCategories(barbershop?.id, "SERVICO");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [ordered, setOrdered] = useState<Plan[]>([]);
  const [savingOrder, setSavingOrder] = useState(false);

  useEffect(() => {
    setOrdered(plans);
  }, [plans]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setOrdered((prev) => {
      const ids = prev.map((p) => p.id);
      const oldIndex = ids.indexOf(active.id as string);
      const newIndex = ids.indexOf(over.id as string);
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  function toggleHighlight(id: string) {
    setOrdered((prev) =>
      prev.map((p) => (p.id === id ? { ...p, highlighted: !p.highlighted } : p)),
    );
  }

  async function saveOrder() {
    if (!barbershop) return;
    setSavingOrder(true);
    try {
      await plansService.reorder(
        barbershop.id,
        ordered.map((p, index) => ({ id: p.id, order: index, highlighted: p.highlighted })),
      );
      toast.success("Ordenação salva.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao salvar ordenação.");
    } finally {
      setSavingOrder(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(plan: Plan) {
    setEditing(plan);
    setDialogOpen(true);
  }

  function toggleActive(plan: Plan) {
    if (plan.status === "ACTIVE") {
      deactivate(plan.id);
    } else {
      activate(plan.id);
    }
  }

  async function handleSave(payload: CreatePlanPayload) {
    if (editing) {
      return update(editing.id, payload);
    }
    return create(payload);
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

      <div className="rounded-xl border border-border bg-surface-raised overflow-hidden">
        <div className="px-4 py-3 border-b border-border-subtle">
          <p className="text-sm font-bold text-foreground">Registros Ativos</p>
          <p className="text-xs text-muted-foreground">Planos do sistema</p>
        </div>
        {isLoading ? (
          <Loading />
        ) : ordered.length === 0 ? (
          <div className="py-6">
            <EmptyState message="Nenhum plano cadastrado. Crie um plano para oferecer aos seus clientes." />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="px-4 py-3 w-10" />
                <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto">
                  Nome
                </TableHead>
                <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto">
                  Mais vendido
                </TableHead>
                <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={ordered.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                <TableBody>
                  {ordered.map((p) => (
                    <SortablePlanRow
                      key={p.id}
                      plan={p}
                      onToggleHighlight={toggleHighlight}
                      onEdit={openEdit}
                      onToggleActive={toggleActive}
                    />
                  ))}
                </TableBody>
              </SortableContext>
            </DndContext>
          </Table>
        )}
      </div>

      {ordered.length > 0 && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={saveOrder}
            disabled={savingOrder}
            className="h-10 px-5 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save className="size-3.5" />
            Salvar
          </button>
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
        categories={categories}
        serviceCategories={serviceCategories}
        barbershopId={barbershop?.id}
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

      <QuickLinksBar />

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
