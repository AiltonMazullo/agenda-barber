"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/shared";
import { maskBRLInput, parseBRL, formatBRL } from "@/utils/format";
import type { Category } from "@/types/category.types";
import type { Product } from "@/types/product.types";
import type {
  DifferentiatedCommission,
  ProductCommissionRule,
} from "@/types/professional-config.types";
import { SectionShell, FieldLabel, INPUT_CLS } from "./Primitives";

function money(v: number): string {
  return maskBRLInput(String(Math.round(v * 100)));
}
function clampPct(raw: string): number {
  return Math.min(100, Number(raw.replace(/\D/g, "")) || 0);
}

export function RegrasComissao({
  productCommission,
  differentiated,
  categories,
  products,
  onChange,
}: {
  productCommission: ProductCommissionRule;
  differentiated: DifferentiatedCommission;
  categories: Category[];
  products: Product[];
  onChange: (patch: {
    productCommission?: ProductCommissionRule;
    differentiated?: DifferentiatedCommission;
  }) => void;
}) {
  // "categoria" = regra por categoria (ou coringa, todas); "produto" = regra
  // por um produto específico — mutuamente exclusivos numa mesma linha.
  const [draftMode, setDraftMode] = useState<"categoria" | "produto">("categoria");
  const [draftCategory, setDraftCategory] = useState("");
  const [draftProduct, setDraftProduct] = useState("");
  const [draftMinSaleValue, setDraftMinSaleValue] = useState(0);
  const [draftPercent, setDraftPercent] = useState(0);

  function setDiff(patch: Partial<DifferentiatedCommission>) {
    onChange({ differentiated: { ...differentiated, ...patch } });
  }

  function addRule() {
    if (draftMode === "produto" && !draftProduct) return;
    onChange({
      productCommission: [
        ...productCommission,
        {
          id: crypto.randomUUID(),
          category: draftMode === "categoria" ? draftCategory : "",
          product: draftMode === "produto" ? draftProduct : "",
          minSaleValue: draftMinSaleValue,
          percent: draftPercent,
        },
      ],
    });
    setDraftCategory("");
    setDraftProduct("");
    setDraftMinSaleValue(0);
    setDraftPercent(0);
  }

  function removeRule(id: string) {
    onChange({
      productCommission: productCommission.filter((r) => r.id !== id),
    });
  }

  function categoryLabel(categoryId: string): string {
    if (!categoryId) return "Todas as categorias";
    // Categoria pode ter sido excluída depois que a regra foi criada — nesse
    // caso não faz sentido mostrar o id interno (cuid) pro usuário.
    return categories.find((c) => c.id === categoryId)?.name ?? "Categoria removida";
  }

  function ruleLabel(r: { category: string; product: string }): string {
    if (r.product) {
      return products.find((p) => p.id === r.product)?.name ?? "Produto removido";
    }
    return categoryLabel(r.category);
  }

  return (
    <SectionShell title="Regras de comissão">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* A) Comissões sobre produtos */}
        <div className="space-y-4">
          <p className="text-xs font-bold text-foreground">
            A) Comissões sobre produtos
          </p>
          <p className="text-[11px] text-muted-foreground -mt-2">
            Defina faixas de comissão por categoria ou por produto específico,
            além do valor mínimo de venda.
          </p>

          <div className="flex gap-1 rounded-md border border-border p-0.5 w-fit">
            <button
              type="button"
              onClick={() => setDraftMode("categoria")}
              className={`px-3 h-7 rounded text-xs font-semibold transition-colors ${
                draftMode === "categoria"
                  ? "bg-brand text-brand-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Por categoria
            </button>
            <button
              type="button"
              onClick={() => setDraftMode("produto")}
              className={`px-3 h-7 rounded text-xs font-semibold transition-colors ${
                draftMode === "produto"
                  ? "bg-brand text-brand-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Por produto
            </button>
          </div>

          <div className="flex flex-wrap items-end gap-2">
            {draftMode === "categoria" ? (
              <div className="space-y-1.5 flex-1 min-w-[160px]">
                <FieldLabel>Categoria</FieldLabel>
                <SelectField
                  id="rc-categoria"
                  value={draftCategory}
                  options={[
                    { value: "", label: "Todas as categorias" },
                    ...categories.map((c) => ({ value: c.id, label: c.name })),
                  ]}
                  onChange={setDraftCategory}
                  className="min-w-0"
                />
              </div>
            ) : (
              <div className="space-y-1.5 flex-1 min-w-[160px]">
                <FieldLabel>Produto</FieldLabel>
                <SelectField
                  id="rc-produto"
                  value={draftProduct}
                  options={products.map((p) => ({ value: p.id, label: p.name }))}
                  onChange={setDraftProduct}
                  placeholder="Selecione o produto"
                  className="min-w-0"
                />
              </div>
            )}
            <div className="space-y-1.5 w-32">
              <FieldLabel>Valor mínimo de venda</FieldLabel>
              <Input
                value={money(draftMinSaleValue)}
                onChange={(e) =>
                  setDraftMinSaleValue(parseBRL(maskBRLInput(e.target.value)))
                }
                inputMode="numeric"
                className={INPUT_CLS}
              />
            </div>
            <div className="space-y-1.5 w-24">
              <FieldLabel>Comissão (%)</FieldLabel>
              <Input
                value={String(draftPercent)}
                onChange={(e) => setDraftPercent(clampPct(e.target.value))}
                inputMode="numeric"
                className={INPUT_CLS}
              />
            </div>
            <button
              type="button"
              onClick={addRule}
              disabled={draftMode === "produto" && !draftProduct}
              className="size-9 rounded-md bg-brand text-brand-foreground grid place-items-center hover:bg-brand-hover transition-colors shrink-0 disabled:opacity-50"
              aria-label="Adicionar regra"
            >
              <Plus className="size-4" />
            </button>
          </div>

          <div className="rounded-lg border border-border overflow-hidden">
            <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 px-3 py-2 bg-surface-base text-[10px] font-bold uppercase tracking-widest text-text-faint">
              <span>Categoria / Produto</span>
              <span>Valor mínimo de venda</span>
              <span className="w-14 text-right">Comissão</span>
              <span className="w-8" />
            </div>
            {productCommission.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                Nenhuma regra cadastrada.
              </p>
            ) : (
              productCommission.map((r) => (
                <div
                  key={r.id}
                  className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 items-center px-3 py-2 border-t border-border-subtle"
                >
                  <span className="text-sm text-foreground truncate">
                    {ruleLabel(r)}
                  </span>
                  <span className="text-sm text-foreground">
                    {formatBRL(r.minSaleValue)}
                  </span>
                  <span className="w-14 text-right text-sm font-semibold text-foreground">
                    {r.percent}%
                  </span>
                  <button
                    type="button"
                    onClick={() => removeRule(r.id)}
                    className="size-8 rounded-md border border-border bg-surface-base text-text-faint hover:text-danger-foreground hover:border-danger/40 transition-colors grid place-items-center"
                    aria-label="Remover regra"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* B) Adicional de comissão diferenciada */}
        <div className="space-y-4">
          <p className="text-xs font-bold text-foreground">
            B) Adicional de comissão diferenciada
          </p>
          <p className="text-[11px] text-muted-foreground -mt-2">
            Percentual adicional que o profissional recebe nos atendimentos de
            assinantes, além da comissão padrão.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <FieldLabel>% adicional de comissão</FieldLabel>
              <div className="relative">
                <Input
                  value={String(differentiated.additionalPercent)}
                  onChange={(e) =>
                    setDiff({ additionalPercent: clampPct(e.target.value) })
                  }
                  inputMode="numeric"
                  className="h-10 pr-7 bg-surface-base border-border text-foreground focus-visible:ring-brand/30"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-text-faint">
                  %
                </span>
              </div>
              <p className="text-[10px] text-text-faint leading-relaxed">
                Percentual adicional aplicado sobre a comissão padrão nos
                atendimentos de clientes.
              </p>
            </div>
            <div className="space-y-1.5">
              <FieldLabel>% adicional diferenciada</FieldLabel>
              <div className="relative">
                <Input
                  value={String(differentiated.subscriberPercent)}
                  onChange={(e) =>
                    setDiff({ subscriberPercent: clampPct(e.target.value) })
                  }
                  inputMode="numeric"
                  className="h-10 pr-7 bg-surface-base border-border text-foreground focus-visible:ring-brand/30"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-text-faint">
                  %
                </span>
              </div>
              <p className="text-[10px] text-text-faint leading-relaxed">
                Percentual específico aplicado apenas em atendimentos de clientes
                assinantes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
