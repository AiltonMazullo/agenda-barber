"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader, Loading } from "@/components/shared";
import { useAuth } from "@/hooks/useAuth";
import { useFinancialCategories } from "@/hooks/useFinancialCategories";
import { FinancialCategoryForm } from "@/components/financial/FinancialCategoryForm";
import type { FinancialCategory } from "@/types/financial-category.types";

export default function EditarCategoriaFinanceiraPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const isView = searchParams.get("mode") === "view";

  const { barbershop } = useAuth();
  const { categories, isLoading, update } = useFinancialCategories(barbershop?.id);
  const [saving, setSaving] = useState(false);
  const [category, setCategory] = useState<FinancialCategory | null>(null);

  useEffect(() => {
    const found = categories.find((c) => c.id === params.id);
    if (found) setCategory(found);
  }, [categories, params.id]);

  async function handleSubmit(values: { name: string; parentCategoryId: string; status: "ACTIVE" | "INACTIVE" }) {
    setSaving(true);
    const updated = await update(params.id, {
      name: values.name,
      parentCategoryId: values.parentCategoryId || null,
      status: values.status,
    });
    setSaving(false);
    if (updated) router.push("/financial/categorias");
  }

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title={isView ? "Visualizar categoria financeira" : "Editar categoria financeira"}
        subtitle={category?.name}
        actions={
          <Link
            href="/financial/categorias"
            className="h-9 px-4 rounded-md border border-border bg-surface-raised text-sm text-foreground hover:bg-surface-elevated transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="size-3.5" />
            Voltar
          </Link>
        }
      />

      {isLoading && !category ? (
        <Loading />
      ) : (
        <FinancialCategoryForm
          mode={isView ? "view" : "edit"}
          category={category}
          categories={categories}
          saving={saving}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
