"use client";

import { useEffect, useState } from "react";
import { X, Globe, Edit } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DatePickerField, SelectField } from "@/components/shared";
import { parseBRL } from "@/utils/format";
import { CLIENTES_MOCK } from "@/mock/clients";
import type {
  CobrancaOrigem,
  Contrato,
  Plano,
} from "@/types/subscription.types";

interface ContratoDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  planos: Plano[];
  contratoEdicao?: Contrato | null;
  onSave: (dados: Omit<Contrato, "id">, id?: string) => void;
}

interface FormState {
  clienteId: string;
  planoId: string;
  origem: CobrancaOrigem;
  inicio: Date | undefined;
  valor: string;
}

export function ContratoDialog({
  open,
  onOpenChange,
  planos,
  contratoEdicao,
  onSave,
}: ContratoDialogProps) {
  const planosAtivos = planos.filter((p) => p.ativo);

  const [form, setForm] = useState<FormState>({
    clienteId: "",
    planoId: planosAtivos[0]?.id ?? "",
    origem: "gateway",
    inicio: new Date(),
    valor: "",
  });

  const isEditing = !!contratoEdicao;
  const titulo = isEditing ? "Editar Assinatura" : "Nova Assinatura";

  useEffect(() => {
    if (!open) return;
    if (contratoEdicao) {
      setForm({
        clienteId: contratoEdicao.clienteId,
        planoId: contratoEdicao.planoId,
        origem: contratoEdicao.origem,
        inicio: new Date(contratoEdicao.inicio),
        valor: contratoEdicao.valor.toString().replace(".", ","),
      });
    } else {
      setForm({
        clienteId: "",
        planoId: planosAtivos[0]?.id ?? "",
        origem: "gateway",
        inicio: new Date(),
        valor: planosAtivos[0]?.preco.toString().replace(".", ",") ?? "",
      });
    }
  }, [open, contratoEdicao, planosAtivos]);

  // Auto-preencher valor ao trocar plano
  useEffect(() => {
    if (!open || isEditing) return;
    const plano = planos.find((p) => p.id === form.planoId);
    if (plano) {
      setForm((s) => ({ ...s, valor: plano.preco.toString().replace(".", ",") }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.planoId]);

  function handleSave() {
    if (!form.clienteId) {
      toast.error("Selecione um cliente.");
      return;
    }
    if (!form.planoId) {
      toast.error("Selecione um plano.");
      return;
    }
    if (!form.inicio) {
      toast.error("Informe a data de início.");
      return;
    }
    const valor = parseBRL(form.valor);
    if (valor <= 0) {
      toast.error("Informe um valor válido.");
      return;
    }
    const cliente = CLIENTES_MOCK.find((c) => c.id === form.clienteId);
    const plano = planos.find((p) => p.id === form.planoId);
    if (!cliente || !plano) return;

    const dados: Omit<Contrato, "id"> = {
      clienteId: cliente.id,
      clienteNome: cliente.nome,
      planoId: plano.id,
      planoNome: plano.nome,
      origem: form.origem,
      inicio: form.inicio.toISOString().slice(0, 10),
      valor,
      status: contratoEdicao?.status ?? "ativo",
    };
    onSave(dados, contratoEdicao?.id);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-raised border border-border text-foreground max-w-md p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold">{titulo}</DialogTitle>
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
          <SelectField
            id="cliente"
            label="Cliente"
            value={form.clienteId}
            options={CLIENTES_MOCK.filter((c) => c.status === "ativo").map(
              (c) => ({
                value: c.id,
                label: c.nome,
              }),
            )}
            onChange={(v) => setForm((s) => ({ ...s, clienteId: v }))}
            placeholder="Selecione um cliente"
          />

          <SelectField
            id="plano"
            label="Plano"
            value={form.planoId}
            options={planosAtivos.map((p) => ({
              value: p.id,
              label: `${p.nome} — R$ ${p.preco.toFixed(2).replace(".", ",")}`,
            }))}
            onChange={(v) => setForm((s) => ({ ...s, planoId: v }))}
          />

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Origem da cobrança
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setForm((s) => ({ ...s, origem: "gateway" }))}
                className={`h-10 rounded-md border text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                  form.origem === "gateway"
                    ? "bg-info/15 border-info/50 text-info-foreground"
                    : "border-border bg-surface-base text-muted-foreground hover:border-brand/40"
                }`}
              >
                <Globe className="size-3.5" />
                Gateway
              </button>
              <button
                type="button"
                onClick={() => setForm((s) => ({ ...s, origem: "manual" }))}
                className={`h-10 rounded-md border text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                  form.origem === "manual"
                    ? "bg-warning/15 border-warning/50 text-warning-foreground"
                    : "border-border bg-surface-base text-muted-foreground hover:border-brand/40"
                }`}
              >
                <Edit className="size-3.5" />
                Manual
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <DatePickerField
              id="inicio"
              label="Início"
              date={form.inicio}
              onChange={(d) => setForm((s) => ({ ...s, inicio: d }))}
            />
            <div className="space-y-1.5 flex-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-brand">
                Valor (R$)
              </label>
              <input
                value={form.valor}
                onChange={(e) =>
                  setForm((s) => ({ ...s, valor: e.target.value }))
                }
                placeholder="0,00"
                inputMode="decimal"
                className="w-full h-10 px-3 rounded-md border border-border bg-surface-base text-sm text-foreground placeholder:text-text-faint focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand/30"
              />
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 flex justify-end gap-3">
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
            {isEditing ? "Salvar" : "Criar Assinatura"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
