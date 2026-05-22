/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { SelectField } from "@/components/shared";
import { maskBRLInput, parseBRL } from "@/utils/format";
import type { Plano, PlanoCiclo } from "@/types/subscription.types";

const CICLOS: { value: PlanoCiclo; label: string }[] = [
  { value: "mensal", label: "Mensal" },
  { value: "trimestral", label: "Trimestral" },
  { value: "semestral", label: "Semestral" },
  { value: "anual", label: "Anual" },
];

interface PlanoDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  planoEdicao?: Plano | null;
  onSave: (dados: Omit<Plano, "id">, id?: string) => void;
}

interface FormState {
  nome: string;
  preco: string;
  ciclo: PlanoCiclo;
  beneficios: string[];
  ativo: boolean;
}

const EMPTY: FormState = {
  nome: "",
  preco: "",
  ciclo: "mensal",
  beneficios: [],
  ativo: true,
};

export function PlanoDialog({
  open,
  onOpenChange,
  planoEdicao,
  onSave,
}: PlanoDialogProps) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [novoBeneficio, setNovoBeneficio] = useState("");

  const isEditing = !!planoEdicao;

  useEffect(() => {
    if (!open) return;
    if (planoEdicao) {
      setForm({
        nome: planoEdicao.nome,
        preco: maskBRLInput(String(Math.round(planoEdicao.preco * 100))),
        ciclo: planoEdicao.ciclo,
        beneficios: [...planoEdicao.beneficios],
        ativo: planoEdicao.ativo,
      });
    } else {
      setForm(EMPTY);
    }
    setNovoBeneficio("");
  }, [open, planoEdicao]);

  function addBeneficio() {
    const limpo = novoBeneficio.trim();
    if (!limpo) return;
    setForm((s) => ({ ...s, beneficios: [...s.beneficios, limpo] }));
    setNovoBeneficio("");
  }

  function removeBeneficio(idx: number) {
    setForm((s) => ({
      ...s,
      beneficios: s.beneficios.filter((_, i) => i !== idx),
    }));
  }

  function handleSave() {
    if (!form.nome.trim()) {
      toast.error("Informe o nome do plano.");
      return;
    }
    const preco = parseBRL(form.preco);
    if (preco <= 0) {
      toast.error("Informe um preço válido.");
      return;
    }
    const dados: Omit<Plano, "id"> = {
      nome: form.nome.trim(),
      preco,
      ciclo: form.ciclo,
      beneficios: form.beneficios,
      ativo: form.ativo,
    };
    onSave(dados, planoEdicao?.id);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-raised border border-border text-foreground max-w-md p-0 gap-0 max-h-[90vh] flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border-subtle shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold">
              {isEditing ? "Editar Plano" : "Novo Plano"}
            </DialogTitle>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 scrollbar-thin">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-brand">
              Nome
            </label>
            <Input
              value={form.nome}
              onChange={(e) => setForm((s) => ({ ...s, nome: e.target.value }))}
              placeholder="Ex: Pro Cabelo"
              className="bg-surface-base border-border text-foreground placeholder:text-text-faint focus-visible:ring-brand/30 h-10"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-brand">
                Valor
              </label>
              <Input
                value={form.preco}
                onChange={(e) =>
                  setForm((s) => ({ ...s, preco: maskBRLInput(e.target.value) }))
                }
                placeholder="R$ 0,00"
                inputMode="numeric"
                className="bg-surface-base border-border text-foreground placeholder:text-text-faint focus-visible:ring-brand/30 h-10"
              />
            </div>
            <SelectField<PlanoCiclo>
              id="ciclo"
              label="Ciclo"
              value={form.ciclo}
              options={CICLOS}
              onChange={(v) => setForm((s) => ({ ...s, ciclo: v }))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Benefícios ({form.beneficios.length})
            </label>
            <div className="flex gap-2">
              <Input
                value={novoBeneficio}
                onChange={(e) => setNovoBeneficio(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addBeneficio();
                  }
                }}
                placeholder="Ex: 2 cortes/mês"
                className="bg-surface-base border-border text-foreground placeholder:text-text-faint focus-visible:ring-brand/30 h-9 text-sm"
              />
              <button
                type="button"
                onClick={addBeneficio}
                className="size-9 rounded-md bg-brand text-brand-foreground flex items-center justify-center hover:bg-brand-hover transition-colors shrink-0"
              >
                <Plus className="size-4" />
              </button>
            </div>
            {form.beneficios.length > 0 && (
              <div className="space-y-1">
                {form.beneficios.map((b, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-3 py-2 rounded-md bg-surface-base border border-border-subtle group"
                  >
                    <span className="text-sm text-foreground">{b}</span>
                    <button
                      type="button"
                      onClick={() => removeBeneficio(i)}
                      className="size-6 rounded flex items-center justify-center text-text-subtle hover:text-danger-foreground hover:bg-danger/10 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <label
            htmlFor="ativo"
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <Checkbox
              id="ativo"
              checked={form.ativo}
              onCheckedChange={(v) =>
                setForm((s) => ({ ...s, ativo: v === true }))
              }
              className="border-border data-[state=checked]:bg-brand data-[state=checked]:border-brand data-[state=checked]:text-brand-foreground"
            />
            <span className="text-sm text-foreground">
              Plano ativo (disponível para novas assinaturas)
            </span>
          </label>
        </div>

        <div className="px-6 py-4 border-t border-border-subtle flex justify-end gap-3 shrink-0 bg-surface-raised">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 px-5 rounded-md border border-border bg-transparent text-sm text-foreground hover:bg-surface-elevated transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="h-9 px-5 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors"
          >
            {isEditing ? "Salvar" : "Criar Plano"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
