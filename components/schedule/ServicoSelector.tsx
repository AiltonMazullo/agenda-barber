"use client";

import { Plus, Trash2, Timer, DollarSign, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { SelectField } from "@/components/shared";
import { maskBRLInput, parseBRL } from "@/utils/format";
import type {
  ProfissionalVM,
  ServicoSelecionado,
  ServicoVM,
} from "./types";
import type { ServicePricing } from "@/types/subscription.types";

function formatBRL(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Rótulo curto do benefício de plano aplicado ao serviço, se houver. */
function pricingBadge(
  pricing: ServicePricing | undefined,
): { label: string } | null {
  if (!pricing || !pricing.covered) return null;
  if (pricing.free) return { label: "Incluso no plano" };
  return { label: `${pricing.discountPercent}% off (plano)` };
}

export function ServicoSelector({
  value,
  onChange,
  servicos,
  profissionais,
  editablePricing = true,
  pricingByService,
  editableDuration,
}: {
  value: ServicoSelecionado[];
  onChange: (rows: ServicoSelecionado[]) => void;
  servicos: ServicoVM[];
  profissionais: ProfissionalVM[];
  /**
   * Quando `false` (agendamento novo, criado pela recepção), Duração/Valor
   * deixam de ser campos editáveis: vêm sempre do cadastro do serviço,
   * aplicando automaticamente o desconto/gratuidade do plano ativo do
   * cliente (ver `getServicePricing` no backend). Default `true` preserva o
   * comportamento existente (edição manual) em outros usos do componente.
   */
  editablePricing?: boolean;
  /** Preço vigente por serviço (considerando plano do cliente), quando `editablePricing` é `false`. */
  pricingByService?: Map<string, ServicePricing>;
  /**
   * Independente de `editablePricing` — permite editar a duração mesmo
   * quando o valor continua travado no preço do plano/catálogo
   * (spec-revisao-cliente-4.md §2.1). Default segue `editablePricing`.
   */
  editableDuration?: boolean;
}) {
  const servicoOptions = servicos.map((s) => ({ value: s.id, label: s.nome }));
  // "Sem preferência" saiu do select — o select passa a listar só
  // profissionais de verdade, e a escolha "sem preferência" vira o checkbox
  // abaixo dele (mesmo dado: `profissionalId` vazio já significa isso pro
  // resto do fluxo, ver `useSchedule.createAgendamento`).
  const profOptions = profissionais.map((p) => ({ value: p.id, label: p.nome }));

  function updateRow(i: number, patch: Partial<ServicoSelecionado>) {
    onChange(value.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  function changeService(i: number, servicoId: string) {
    const s = servicos.find((x) => x.id === servicoId);
    updateRow(i, {
      servicoId,
      duracao: s?.tempoPadrao ?? 30,
      valor: s?.preco ?? 0,
    });
  }

  function addRow() {
    const s = servicos[0];
    // Novo serviço herda o profissional (ou o "sem preferência" marcado) já
    // escolhido na última linha — evita ter que escolher de novo quando o
    // atendimento inteiro é com a mesma pessoa (caso mais comum).
    const last = value[value.length - 1];
    onChange([
      ...value,
      {
        servicoId: s?.id ?? "",
        profissionalId: last?.profissionalId,
        semPreferencia: last?.semPreferencia ?? false,
        duracao: s?.tempoPadrao ?? 30,
        valor: s?.preco ?? 0,
      },
    ]);
  }

  function removeRow(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }

  const totalDur = value.reduce((a, r) => a + r.duracao, 0);
  const totalVal = value.reduce((a, r) => a + r.valor, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold uppercase tracking-widest text-brand">
          Serviços
        </label>
        <button
          type="button"
          onClick={addRow}
          className="text-[11px] font-bold text-brand hover:text-brand-hover transition-colors flex items-center gap-1"
        >
          <Plus className="size-3" />
          Adicionar serviço
        </button>
      </div>

      <div className="space-y-2.5">
        {value.map((row, i) => {
          const badge = !editablePricing
            ? pricingBadge(pricingByService?.get(row.servicoId))
            : null;
          return (
            <div
              key={i}
              className="rounded-lg border border-border-subtle bg-surface-base p-3 space-y-2.5"
            >
              <div className="grid grid-cols-2 gap-2.5">
                <SelectField
                  id={`servico-${i}`}
                  label="Serviço"
                  value={row.servicoId}
                  options={servicoOptions}
                  onChange={(v) => changeService(i, v)}
                  placeholder="Selecione"
                />
                <div className="space-y-1.5">
                  <SelectField
                    id={`prof-${i}`}
                    label="Profissional"
                    value={row.profissionalId ?? ""}
                    options={profOptions}
                    onChange={(v) =>
                      updateRow(i, {
                        profissionalId: v || undefined,
                        // Escolher alguém no select sai do modo "sem preferência".
                        semPreferencia: false,
                      })
                    }
                    placeholder="Selecione"
                  />
                  <label
                    htmlFor={`sem-pref-${i}`}
                    className="flex items-center gap-1.5 text-[11px] text-muted-foreground cursor-pointer"
                  >
                    <Checkbox
                      id={`sem-pref-${i}`}
                      checked={row.semPreferencia ?? false}
                      onCheckedChange={(checked) =>
                        updateRow(i, {
                          semPreferencia: checked,
                          profissionalId: checked ? undefined : row.profissionalId,
                        })
                      }
                    />
                    Sem preferência de profissional
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-[1fr_1fr_auto] gap-2.5 items-end">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                    <Timer className="size-3" />
                    Duração (min)
                  </label>
                  {(editableDuration ?? editablePricing) ? (
                    <Input
                      value={String(row.duracao)}
                      onChange={(e) =>
                        updateRow(i, {
                          duracao: parseInt(
                            e.target.value.replace(/\D/g, "") || "0",
                            10,
                          ),
                        })
                      }
                      inputMode="numeric"
                      className="bg-surface-raised border-border text-foreground h-9"
                    />
                  ) : (
                    <div className="h-9 px-3 rounded-md border border-border-subtle bg-surface-elevated/60 text-foreground text-sm flex items-center">
                      {row.duracao} min
                    </div>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                    <DollarSign className="size-3" />
                    Valor
                  </label>
                  {editablePricing ? (
                    <Input
                      value={
                        row.valor
                          ? maskBRLInput(String(Math.round(row.valor * 100)))
                          : ""
                      }
                      onChange={(e) =>
                        updateRow(i, {
                          valor: parseBRL(maskBRLInput(e.target.value)),
                        })
                      }
                      placeholder="R$ 0,00"
                      inputMode="numeric"
                      className="bg-surface-raised border-border text-foreground h-9"
                    />
                  ) : (
                    <div className="h-9 px-3 rounded-md border border-border-subtle bg-surface-elevated/60 text-foreground text-sm flex items-center">
                      {row.valor > 0 ? formatBRL(row.valor) : "Grátis"}
                    </div>
                  )}
                </div>
                {value.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRow(i)}
                    aria-label="Remover serviço"
                    className="size-9 rounded-md grid place-items-center text-danger-foreground border border-danger/30 bg-danger/10 hover:bg-danger/20 transition-colors"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                )}
              </div>

              {badge && (
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
                  <Sparkles className="size-3" />
                  {badge.label}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Totais */}
      <div className="flex items-center justify-between rounded-lg border border-brand/30 bg-brand/5 px-3 py-2.5">
        <div className="flex items-center gap-1.5 text-xs">
          <Timer className="size-3.5 text-brand" />
          <span className="text-muted-foreground">Duração total:</span>
          <span className="font-bold text-foreground">{totalDur} min</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-muted-foreground">Total:</span>
          <span className="font-bold text-brand">{formatBRL(totalVal)}</span>
        </div>
      </div>
    </div>
  );
}
