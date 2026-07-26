"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useEmployees } from "@/hooks/useEmployees";
import { useBranches } from "@/hooks/useBranches";
import { useDragReorder } from "@/hooks/useDragReorder";
import type { Employee } from "@/types/employee.types";

export default function ProfissionalDestaquePage() {
  const { barbershop } = useAuth();
  const { employees, isLoading, reorder, setFeatured } = useEmployees(
    barbershop?.id,
  );
  const { branches, isLoading: branchesLoading } = useBranches(
    barbershop?.id,
  );

  const [branchId, setBranchId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  // Overrides locais de "destaque" (não persistidos até clicar em Salvar).
  const [featuredOverrides, setFeaturedOverrides] = useState<
    Record<string, boolean>
  >({});

  // Seleciona a primeira filial assim que a lista chega.
  useEffect(() => {
    if (!branchId && branches.length > 0) {
      setBranchId(branches[0].id);
    }
  }, [branches, branchId]);

  const branchEmployees = useMemo(
    () => employees.filter((e) => e.branchId === branchId),
    [employees, branchId],
  );

  const { sensors, handleDragEnd, localItems } = useDragReorder<Employee>(
    branchEmployees,
    () => {},
    { autoSave: false },
  );

  function isFeatured(e: Employee): boolean {
    return featuredOverrides[e.id] ?? e.featured;
  }

  function toggleFeatured(id: string, value: boolean) {
    setFeaturedOverrides((prev) => ({ ...prev, [id]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      // 1) Persiste a nova ordem dos profissionais desta filial.
      await reorder(localItems.map((e) => e.id));

      // 2) Persiste apenas os destaques que realmente mudaram.
      const changed = localItems.filter(
        (e) => e.id in featuredOverrides && featuredOverrides[e.id] !== e.featured,
      );
      await Promise.all(
        changed.map((e) => setFeatured(e.id, featuredOverrides[e.id])),
      );
      setFeaturedOverrides({});
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Profissional destaque"
        subtitle="Defina a ordem e os destaques por filial"
        actions={
          <Link
            href="/professionals"
            className="h-9 px-4 rounded-md border border-border bg-surface-raised text-sm text-foreground hover:bg-surface-elevated transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="size-3.5" />
            Voltar
          </Link>
        }
      />

      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Filial</span>
        <Select value={branchId} onValueChange={(v) => setBranchId(v as string)}>
          <SelectTrigger className="h-9 min-w-56 bg-surface-raised border-border text-foreground">
            <SelectValue placeholder="Selecione a filial" />
          </SelectTrigger>
          <SelectContent className="bg-surface-raised border border-border text-foreground">
            {branches.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-surface-raised border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-t border-border">
                <TableRow className="border-border hover:bg-transparent">
                  {["", "Nome", "E-mail", "Destaque"].map((col, i) => (
                    <TableHead
                      key={col || `c-${i}`}
                      className={`text-muted-foreground text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto ${
                        col === "Destaque" ? "text-center" : ""
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
                  items={localItems.map((e) => e.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <TableBody>
                    {isLoading || branchesLoading ? (
                      <TableRow className="border-border hover:bg-transparent">
                        <TableCell colSpan={4} className="py-4">
                          <Loading />
                        </TableCell>
                      </TableRow>
                    ) : !branchId ? (
                      <TableRow className="border-border hover:bg-transparent">
                        <TableCell colSpan={4} className="py-4">
                          <EmptyState message="Selecione uma filial para ver os profissionais." />
                        </TableCell>
                      </TableRow>
                    ) : localItems.length === 0 ? (
                      <TableRow className="border-border hover:bg-transparent">
                        <TableCell colSpan={4} className="py-4">
                          <EmptyState message="Nenhum profissional cadastrado nesta filial." />
                        </TableCell>
                      </TableRow>
                    ) : (
                      localItems.map((e) => (
                        <SortableRow key={e.id} id={e.id}>
                          <TableCell className="px-4 py-4 font-semibold text-foreground text-sm">
                            {e.name}
                          </TableCell>
                          <TableCell className="px-4 py-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Mail className="size-3" />
                              {e.email}
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-4">
                            <div className="flex justify-center">
                              <Checkbox
                                checked={isFeatured(e)}
                                onCheckedChange={(c) =>
                                  toggleFeatured(e.id, c === true)
                                }
                                aria-label="Marcar como destaque"
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
