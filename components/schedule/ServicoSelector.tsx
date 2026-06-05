"use client";

import { Plus, Trash2, Timer, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/shared";
import { maskBRLInput, parseBRL } from "@/utils/format";
import type {
  ProfissionalVM,
  ServicoSelecionado,
  ServicoVM,
} from "./types";

function formatBRL(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function ServicoSelector({
  value,
  onChange,
  servicos,
  profissionais,
}: {
  value: ServicoSelecionado[];
  onChange: (rows: ServicoSelecionado[]) => void;
  servicos: ServicoVM[];
  profissionais: ProfissionalVM[];
}) {
  const servicoOptions = servicos.map((s) => ({ value: s.id, label: s.nome }));
  const profOptions = [
    { value: "", label: "Sem preferência" },
    ...profissionais.map((p) => ({ value: p.id, label: p.nome })),
  ];

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
    onChange([
      ...value,
      {
        servicoId: s?.id ?? "",
        profissionalId: undefined,
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
        {value.map((row, i) => (
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
              <SelectField
                id={`prof-${i}`}
                label="Profissional"
                value={row.profissionalId ?? ""}
                options={profOptions}
                onChange={(v) =>
                  updateRow(i, { profissionalId: v || undefined })
                }
              />
            </div>

            <div className="grid grid-cols-[1fr_1fr_auto] gap-2.5 items-end">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                  <Timer className="size-3" />
                  Duração (min)
                </label>
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
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                  <DollarSign className="size-3" />
                  Valor
                </label>
                <Input
                  value={
                    row.valor
                      ? maskBRLInput(String(Math.round(row.valor * 100)))
                      : ""
                  }
                  onChange={(e) =>
                    updateRow(i, { valor: parseBRL(maskBRLInput(e.target.value)) })
                  }
                  placeholder="R$ 0,00"
                  inputMode="numeric"
                  className="bg-surface-raised border-border text-foreground h-9"
                />
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
          </div>
        ))}
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
