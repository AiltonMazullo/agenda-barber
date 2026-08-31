"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader, EmptyState, ConfirmDialog, Loading, StatusBadge } from "@/components/shared";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useFinancialCategories } from "@/hooks/useFinancialCategories";
import type { FinancialCategory } from "@/types/financial-category.types";

/**
 * Lista de categorias (ou subcategorias) — extraído pra ser reaproveitado
 * nas duas abas (§6.3: antes era uma lista única sem separação).
 */
function CategoriasLista({
  categories,
  isLoading,
  emptyMessage,
  onDelete,
}: {
  categories: FinancialCategory[];
  isLoading: boolean;
  emptyMessage: string;
  onDelete: (cat: FinancialCategory) => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface-raised divide-y divide-border-subtle">
      {isLoading ? (
        <Loading />
      ) : categories.length === 0 ? (
        <div className="py-6">
          <EmptyState message={emptyMessage} />
        </div>
      ) : (
        categories.map((cat) => (
          <div
            key={cat.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-foreground">{cat.name}</p>
                <StatusBadge tone={cat.type === "RECEIVABLE" ? "success" : "danger"}>
                  {cat.type === "RECEIVABLE" ? "Contas a receber" : "Contas a pagar"}
                </StatusBadge>
                <StatusBadge tone={cat.status === "ACTIVE" ? "success" : "neutral"}>
                  {cat.status === "ACTIVE" ? "Ativo" : "Inativo"}
                </StatusBadge>
                {cat.requiresEmployee && (
                  <StatusBadge tone="brand">Vinculada a profissional</StatusBadge>
                )}
              </div>
              {cat.parentCategory && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Categoria primária: {cat.parentCategory.name}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/financial/categorias/${cat.id}`}
                title="Editar"
                className="size-9 rounded-md border border-border bg-surface-base text-muted-foreground flex items-center justify-center hover:border-brand/40 hover:text-brand transition-colors"
              >
                <Pencil className="size-3.5" />
              </Link>
              <Link
                href={`/financial/categorias/${cat.id}?mode=view`}
                title="Visualizar"
                className="size-9 rounded-md border border-info/30 bg-transparent text-info-foreground flex items-center justify-center hover:bg-info/10 transition-colors"
              >
                <Eye className="size-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => onDelete(cat)}
                className="size-9 rounded-md border border-danger/30 bg-transparent text-danger-foreground flex items-center justify-center hover:bg-danger/10 transition-colors"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default function CategoriasFinanceirasPage() {
  const { barbershop } = useAuth();
  const { categories, isLoading, remove } = useFinancialCategories(barbershop?.id);
  const [toDelete, setToDelete] = useState<FinancialCategory | null>(null);

  const parentCategories = categories.filter((c) => !c.parentCategoryId);
  const subCategories = categories.filter((c) => c.parentCategoryId);

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Categorias financeiras"
        subtitle="Categorias financeiras do sistema"
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/financial"
              className="h-9 px-4 rounded-md border border-border bg-surface-raised text-sm text-foreground hover:bg-surface-elevated transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="size-3.5" />
              Voltar
            </Link>
            <Link
              href="/financial/categorias/novo"
              className="h-9 px-4 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors flex items-center gap-1.5"
            >
              <Plus className="size-3.5" />
              Novo
            </Link>
          </div>
        }
      />

      {/* spec-ajustes-escopo-2 §6.3: separa Categorias/Subcategorias em
          abas, em vez da lista única de antes. */}
      <Tabs defaultValue="categorias">
        <TabsList>
          <TabsTrigger value="categorias">Categorias</TabsTrigger>
          <TabsTrigger value="subcategorias">Subcategorias</TabsTrigger>
        </TabsList>
        <TabsContent value="categorias">
          <CategoriasLista
            categories={parentCategories}
            isLoading={isLoading}
            emptyMessage="Nenhuma categoria financeira cadastrada."
            onDelete={setToDelete}
          />
        </TabsContent>
        <TabsContent value="subcategorias">
          <CategoriasLista
            categories={subCategories}
            isLoading={isLoading}
            emptyMessage="Nenhuma subcategoria financeira cadastrada."
            onDelete={setToDelete}
          />
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Remover categoria?"
        description={
          toDelete ? `"${toDelete.name}" será removida (ou inativada, se estiver em uso).` : undefined
        }
        confirmLabel="Remover"
        tone="danger"
        onConfirm={() => toDelete && remove(toDelete.id)}
      />
    </div>
  );
}
