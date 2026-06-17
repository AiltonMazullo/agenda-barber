"use client";

import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/shared";
import { maskBRLInput, parseBRL } from "@/utils/format";
import type { Category } from "@/types/category.types";
import type {
  CommissionTier,
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
  onChange,
}: {
  productCommission: ProductCommissionRule;
  differentiated: DifferentiatedCommission;
  categories: Category[];
  onChange: (patch: {
    productCommission?: ProductCommissionRule;
    differentiated?: DifferentiatedCommission;
  }) => void;
}) {
  function setProduct(patch: Partial<ProductCommissionRule>) {
    onChange({ productCommission: { ...productCommission, ...patch } });
  }
  function setDiff(patch: Partial<DifferentiatedCommission>) {
    onChange({ differentiated: { ...differentiated, ...patch } });
  }

  function addTier() {
    setProduct({
      tiers: [
        ...productCommission.tiers,
        { id: crypto.randomUUID(), from: 0, to: null, percent: 0 },
      ],
    });
  }
  function patchTier(id: string, p: Partial<CommissionTier>) {
    setProduct({
      tiers: productCommission.tiers.map((t) =>
        t.id === id ? { ...t, ...p } : t,
      ),
    });
  }
  function removeTier(id: string) {
    setProduct({
      tiers: productCommission.tiers.filter((t) => t.id !== id),
    });
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
            Defina faixas de comissão por categoria e valor mínimo de venda.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <FieldLabel>Categoria</FieldLabel>
              <SelectField
                id="rc-categoria"
                value={productCommission.category}
                options={[
                  { value: "", label: "Todas as categorias" },
                  ...categories.map((c) => ({ value: c.id, label: c.name })),
                ]}
                onChange={(v) => setProduct({ category: v })}
                className="min-w-0"
              />
            </div>
            <div className="space-y-1.5">
              <FieldLabel>Valor mínimo da venda</FieldLabel>
              <Input
                value={money(productCommission.minSaleValue)}
                onChange={(e) =>
                  setProduct({
                    minSaleValue: parseBRL(maskBRLInput(e.target.value)),
                  })
                }
                inputMode="numeric"
                className={INPUT_CLS}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 px-1 text-[10px] font-bold uppercase tracking-widest text-text-faint">
              <span>De (R$)</span>
              <span>Até (R$)</span>
              <span className="w-20 text-right">Comissão</span>
              <span className="w-8" />
            </div>
            {productCommission.tiers.map((t) => (
              <div
                key={t.id}
                className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 items-center"
              >
                <Input
                  value={money(t.from)}
                  onChange={(e) =>
                    patchTier(t.id, {
                      from: parseBRL(maskBRLInput(e.target.value)),
                    })
                  }
                  inputMode="numeric"
                  className="h-9 bg-surface-base border-border text-foreground focus-visible:ring-brand/30"
                />
                <Input
                  value={t.to === null ? "" : money(t.to)}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "");
                    patchTier(t.id, {
                      to: digits ? parseBRL(maskBRLInput(e.target.value)) : null,
                    });
                  }}
                  inputMode="numeric"
                  placeholder="em diante"
                  className="h-9 bg-surface-base border-border text-foreground placeholder:text-text-faint focus-visible:ring-brand/30"
                />
                <div className="relative w-20">
                  <Input
                    value={String(t.percent)}
                    onChange={(e) =>
                      patchTier(t.id, { percent: clampPct(e.target.value) })
                    }
                    inputMode="numeric"
                    className="h-9 pr-6 bg-surface-base border-border text-foreground text-right focus-visible:ring-brand/30"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-text-faint">
                    %
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeTier(t.id)}
                  className="size-8 rounded-md border border-border bg-surface-base text-text-faint hover:text-danger-foreground hover:border-danger/40 transition-colors grid place-items-center"
                  aria-label="Remover faixa"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addTier}
              className="flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline pt-1"
            >
              <Plus className="size-3.5" />
              Adicionar faixa
            </button>
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
