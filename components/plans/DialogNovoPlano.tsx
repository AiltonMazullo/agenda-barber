"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { maskBRLInput, parseBRL } from "@/utils/format";
import type { CreatePlanPayload, Plan } from "@/types/plan.types";

const PRESET_COLORS = [
  "#F5A623",
  "#4A90D9",
  "#7B68EE",
  "#50C878",
  "#E74C3C",
  "#1ABC9C",
  "#F39C12",
  "#8E44AD",
];

export function DialogNovoPlano({
  open,
  onOpenChange,
  plan,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  plan: Plan | null;
  onSave: (payload: CreatePlanPayload) => Promise<unknown>;
}) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [labelColor, setLabelColor] = useState(PRESET_COLORS[0]);
  const [galaxId, setGalaxId] = useState("");
  const [availableQuantity, setAvailableQuantity] = useState("");
  const [hidden, setHidden] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(plan?.name ?? "");
    setPrice(plan ? maskBRLInput(String(plan.priceInCents)) : "");
    setLabelColor(plan?.labelColor ?? PRESET_COLORS[0]);
    setGalaxId(plan?.galaxId ?? "");
    setAvailableQuantity(plan?.availableQuantity != null ? String(plan.availableQuantity) : "");
    setHidden(plan?.hidden ?? false);
  }, [open, plan]);

  async function handleSave() {
    if (name.trim().length < 2) {
      toast.error("Informe o nome do plano.");
      return;
    }
    const priceInCents = Math.round(parseBRL(price) * 100);
    if (priceInCents <= 0) {
      toast.error("Informe um valor válido.");
      return;
    }
    if (!labelColor) {
      toast.error("Selecione uma cor para o plano.");
      return;
    }

    const qty = availableQuantity.trim() ? parseInt(availableQuantity, 10) : undefined;
    if (qty !== undefined && (Number.isNaN(qty) || qty <= 0)) {
      toast.error("Quantidade disponível deve ser um número positivo.");
      return;
    }

    setSaving(true);
    try {
      const result = await onSave({
        name: name.trim(),
        priceInCents,
        labelColor,
        galaxId: galaxId.trim() || undefined,
        availableQuantity: qty ?? null,
        hidden,
      });
      if (result) onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-raised border border-border text-foreground max-w-md p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold">
              {plan ? "Editar plano" : "Novo plano"}
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

        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Nome
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Plano Mensal Corte"
              className="bg-surface-base border-border text-foreground placeholder:text-text-faint focus-visible:ring-brand/30 h-10"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Valor
            </label>
            <Input
              value={price}
              onChange={(e) => setPrice(maskBRLInput(e.target.value))}
              placeholder="R$ 0,00"
              inputMode="numeric"
              className="bg-surface-base border-border text-foreground placeholder:text-text-faint focus-visible:ring-brand/30 h-10"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Cor do plano
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setLabelColor(color)}
                  className="size-7 rounded-full border-2 transition-all"
                  style={{
                    backgroundColor: color,
                    borderColor: labelColor === color ? "white" : "transparent",
                    boxShadow: labelColor === color ? `0 0 0 2px ${color}` : "none",
                  }}
                />
              ))}
              <input
                type="color"
                value={labelColor}
                onChange={(e) => setLabelColor(e.target.value)}
                className="size-7 rounded-full cursor-pointer border border-border bg-transparent p-0"
                title="Cor personalizada"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                ID GalaxPay
              </label>
              <Input
                value={galaxId}
                onChange={(e) => setGalaxId(e.target.value)}
                placeholder="plan_abc123"
                className="bg-surface-base border-border text-foreground placeholder:text-text-faint focus-visible:ring-brand/30 h-10"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Qtd. disponível
              </label>
              <Input
                value={availableQuantity}
                onChange={(e) => setAvailableQuantity(e.target.value)}
                placeholder="Ilimitado"
                inputMode="numeric"
                className="bg-surface-base border-border text-foreground placeholder:text-text-faint focus-visible:ring-brand/30 h-10"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hidden}
              onChange={(e) => setHidden(e.target.checked)}
              className="size-4 rounded border-border accent-brand"
            />
            <span className="text-sm text-muted-foreground">
              Ocultar no app do cliente
            </span>
          </label>
        </div>

        <div className="px-6 pb-6 pt-4 border-t border-border-subtle flex justify-end gap-3">
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
            disabled={saving}
            className="h-9 px-5 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors disabled:opacity-60"
          >
            {saving ? "Salvando…" : plan ? "Salvar" : "Criar plano"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
