"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader, EmptyState, Loading } from "@/components/shared";
import { SortableRow } from "@/components/shared/SortableRow";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useAuth } from "@/hooks/useAuth";
import { useServices } from "@/hooks/useServices";
import { useDragReorder } from "@/hooks/useDragReorder";
import type { Service } from "@/types/service.types";

/**
 * Tela dedicada à exibição/ordenação de serviços na vitrine pública.
 * Reaproveita `reorder`/`setFeatured` de `useServices` — os mesmos usados
 * pela tabela de Serviços em Configurações. Aqui o campo `featured` é
 * apresentado como "Em alta" (rótulo específico desta tela).
 */
export default function ServicosExibicaoPage() {
  const { barbershop } = useAuth();
  const { services, isLoading, reorder, setFeatured } = useServices(
    barbershop?.id,
  );

  const [saving, setSaving] = useState(false);
  // Overrides locais de "Em alta" (não persistidos até clicar em Salvar).
  const [featuredOverrides, setFeaturedOverrides] = useState<
    Record<string, boolean>
  >({});

  const { sensors, handleDragEnd, localItems } = useDragReorder<Service>(
    services,
    () => {},
    { autoSave: false },
  );

  function isFeatured(s: Service): boolean {
    return featuredOverrides[s.id] ?? s.featured;
  }

  function toggleFeatured(id: string, value: boolean) {
    setFeaturedOverrides((prev) => ({ ...prev, [id]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      // 1) Persiste a nova ordem dos serviços.
      await reorder(localItems.map((s) => s.id));

      // 2) Persiste apenas os destaques que realmente mudaram.
      const changed = localItems.filter(
        (s) => s.id in featuredOverrides && featuredOverrides[s.id] !== s.featured,
      );
      await Promise.all(
        changed.map((s) => setFeatured(s.id, featuredOverrides[s.id])),
      );
      setFeaturedOverrides({});
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Exibição de serviços"
        subtitle="Defina a ordem e os serviços em alta na vitrine pública"
        actions={
          <Link
            href="/settings"
            className="h-9 px-4 rounded-md border border-border bg-surface-raised text-sm text-foreground hover:bg-surface-elevated transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="size-3.5" />
            Voltar
          </Link>
        }
      />

      <Card className="bg-surface-raised border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-t border-border">
                <TableRow className="border-border hover:bg-transparent">
                  {["", "Nome", "Em alta"].map((col, i) => (
                    <TableHead
                      key={col || `c-${i}`}
                      className={`text-muted-foreground text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto ${
                        col === "Em alta" ? "text-center" : ""
                      }`}
                    >
                      {col}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={localItems.map((s) => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <TableBody>
                    {isLoading ? (
                      <TableRow className="border-border hover:bg-transparent">
                        <TableCell colSpan={3} className="py-4">
                          <Loading />
                        </TableCell>
                      </TableRow>
                    ) : localItems.length === 0 ? (
                      <TableRow className="border-border hover:bg-transparent">
                        <TableCell colSpan={3} className="py-4">
                          <EmptyState message="Nenhum serviço cadastrado." />
                        </TableCell>
                      </TableRow>
                    ) : (
                      localItems.map((s) => (
                        <SortableRow key={s.id} id={s.id}>
                          <TableCell className="px-4 py-4 font-semibold text-foreground text-sm">
                            {s.name}
                          </TableCell>
                          <TableCell className="px-4 py-4">
                            <div className="flex justify-center">
                              <Checkbox
                                checked={isFeatured(s)}
                                onCheckedChange={(c) =>
                                  toggleFeatured(s.id, c === true)
                                }
                                aria-label="Marcar serviço como em alta"
                                className="cursor-pointer"
                              />
                            </div>
                          </TableCell>
                        </SortableRow>
                      ))
                    )}
                  </TableBody>
                </SortableContext>
              </DndContext>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving || localItems.length === 0}
          className="h-9 px-5 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors disabled:opacity-60"
        >
          {saving ? "Salvando…" : "Salvar"}
        </button>
      </div>
    </div>
  );
}
