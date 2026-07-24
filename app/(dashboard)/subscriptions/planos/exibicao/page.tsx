"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, GripVertical, Save } from "lucide-react";
import { toast } from "sonner";
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
import { PageHeader, Loading, EmptyState } from "@/components/shared";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { usePlans } from "@/hooks/usePlans";
import { plansService } from "@/services/plans.service";
import type { Plan } from "@/types/plan.types";

function SortablePlanRow({
  plan,
  onToggleHighlight,
}: {
  plan: Plan;
  onToggleHighlight: (id: string) => void;
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
      className="border-border hover:bg-surface-elevated/50 transition-colors"
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
      <TableCell className="px-4 py-3 text-sm font-semibold text-foreground">{plan.name}</TableCell>
      <TableCell className="px-4 py-3">
        <Checkbox
          checked={plan.highlighted}
          onCheckedChange={() => onToggleHighlight(plan.id)}
          aria-label={`Marcar "${plan.name}" como mais vendido`}
          className="cursor-pointer"
        />
      </TableCell>
    </TableRow>
  );
}

export default function ExibicaoPlanosPage() {
  const { barbershop } = useAuth();
  const { plans, isLoading } = usePlans(barbershop?.id);
  const [ordered, setOrdered] = useState<Plan[]>([]);
  const [saving, setSaving] = useState(false);

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
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground max-w-3xl">
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

      <div className="rounded-xl border border-border bg-surface-raised overflow-hidden">
        <div className="px-4 py-3 border-b border-border-subtle">
          <p className="text-sm font-bold text-foreground">Registros Ativos</p>
          <p className="text-xs text-muted-foreground">Planos do sistema</p>
        </div>
        {isLoading ? (
          <Loading />
        ) : ordered.length === 0 ? (
          <div className="py-6">
            <EmptyState message="Nenhum plano cadastrado." />
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
              </TableRow>
            </TableHeader>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={ordered.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                <TableBody>
                  {ordered.map((p) => (
                    <SortablePlanRow key={p.id} plan={p} onToggleHighlight={toggleHighlight} />
                  ))}
                </TableBody>
              </SortableContext>
            </DndContext>
          </Table>
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
