/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePickerField, SelectField } from "@/components/shared";
import { parseBRL } from "@/utils/format";
import type {
  CategoriaFinanceira,
  Conta,
  ContaTipo,
  FormaPagamento,
} from "@/types/financial.types";

const FORMAS_PAGAMENTO: { value: FormaPagamento; label: string }[] = [
  { value: "pix", label: "Pix" },
  { value: "boleto", label: "Boleto" },
  { value: "cartao_credito", label: "Cartão de crédito" },
  { value: "cartao_debito", label: "Cartão de débito" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "debito_auto", label: "Débito automático" },
];

interface ContaDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  tipo: ContaTipo;
  categorias: CategoriaFinanceira[];
  contaEdicao?: Conta | null;
  onSave: (dados: Omit<Conta, "id">, id?: string) => void;
}

interface FormState {
  descricao: string;
  categoria: string;
  vencimento: Date | undefined;
  forma: FormaPagamento;
  valor: string;
  status: Conta["status"];
  observacao: string;
}

const EMPTY_FORM: FormState = {
  descricao: "",
  categoria: "",
  vencimento: undefined,
  forma: "pix",
  valor: "",
  status: "pendente",
  observacao: "",
};

export function ContaDialog({
  open,
  onOpenChange,
  tipo,
  categorias,
  contaEdicao,
  onSave,
}: ContaDialogProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const isEditing = !!contaEdicao;
  const titulo = isEditing
    ? tipo === "pagar"
      ? "Editar despesa"
      : "Editar receita"
    : tipo === "pagar"
      ? "Nova despesa"
      : "Nova receita";

  const categoriasDoTipo = categorias.filter((c) => c.tipo === tipo);

  useEffect(() => {
    if (!open) return;
    if (contaEdicao) {
      setForm({
        descricao: contaEdicao.descricao,
        categoria: contaEdicao.categoria,
        vencimento: new Date(contaEdicao.vencimento),
        forma: contaEdicao.forma,
        valor: contaEdicao.valor.toString().replace(".", ","),
        status: contaEdicao.status,
        observacao: contaEdicao.observacao ?? "",
      });
    } else {
      setForm({
        ...EMPTY_FORM,
        categoria: categoriasDoTipo[0]?.nome ?? "",
      });
    }
  }, [open, contaEdicao, categoriasDoTipo]);

  function handleSave() {
    if (!form.descricao.trim()) {
      toast.error("Descrição é obrigatória.");
      return;
    }
    if (!form.categoria) {
      toast.error("Selecione uma categoria.");
      return;
    }
    if (!form.vencimento) {
      toast.error("Informe a data de vencimento.");
      return;
    }
    const valor = parseBRL(form.valor);
    if (valor <= 0) {
      toast.error("Informe um valor válido.");
      return;
    }

    const dados: Omit<Conta, "id"> = {
      tipo,
      descricao: form.descricao.trim(),
      categoria: form.categoria,
      vencimento: form.vencimento.toISOString().slice(0, 10),
      forma: form.forma,
      valor,
      status: form.status,
      observacao: form.observacao.trim() || undefined,
    };
    onSave(dados, contaEdicao?.id);
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
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-brand">
              Descrição
            </label>
            <Input
              value={form.descricao}
              onChange={(e) =>
                setForm((s) => ({ ...s, descricao: e.target.value }))
              }
              placeholder={
                tipo === "pagar"
                  ? "Ex: Aluguel março"
                  : "Ex: Pacote mensal Ana Lima"
              }
              className="bg-surface-base border-border text-foreground placeholder:text-text-faint focus-visible:ring-brand/30 h-10"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <SelectField
              id="categoria"
              label="Categoria"
              value={form.categoria}
              options={categoriasDoTipo.map((c) => c.nome)}
              onChange={(v) => setForm((s) => ({ ...s, categoria: v }))}
              placeholder="Selecionar"
            />
            <SelectField<FormaPagamento>
              id="forma"
              label="Forma"
              value={form.forma}
              options={FORMAS_PAGAMENTO}
              onChange={(v) => setForm((s) => ({ ...s, forma: v }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <DatePickerField
              id="vencimento"
              label="Vencimento"
              date={form.vencimento}
              onChange={(d) => setForm((s) => ({ ...s, vencimento: d }))}
            />
            <div className="space-y-1.5 flex-1 min-w-35">
              <label className="text-[10px] font-bold uppercase tracking-widest text-brand">
                Valor (R$)
              </label>
              <Input
                value={form.valor}
                onChange={(e) =>
                  setForm((s) => ({ ...s, valor: e.target.value }))
                }
                placeholder="0,00"
                inputMode="decimal"
                className="bg-surface-base border-border text-foreground placeholder:text-text-faint focus-visible:ring-brand/30 h-10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { value: "pendente", label: "Pendente", tone: "warning" },
                  { value: "pago", label: tipo === "pagar" ? "Pago" : "Recebido", tone: "success" },
                  { value: "atrasado", label: "Atrasado", tone: "danger" },
                ] as const
              ).map((opt) => {
                const active = form.status === opt.value;
                const toneClass =
                  opt.tone === "success"
                    ? "bg-success/15 border-success/50 text-success-foreground"
                    : opt.tone === "danger"
                      ? "bg-danger/15 border-danger/50 text-danger-foreground"
                      : "bg-warning/15 border-warning/50 text-warning-foreground";
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      setForm((s) => ({ ...s, status: opt.value }))
                    }
                    className={`h-9 rounded-md border text-xs font-semibold transition-colors ${
                      active
                        ? toneClass
                        : "border-border bg-surface-base text-muted-foreground hover:border-brand/40"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Observação
            </label>
            <Textarea
              value={form.observacao}
              onChange={(e) =>
                setForm((s) => ({ ...s, observacao: e.target.value }))
              }
              placeholder="Opcional"
              className="bg-surface-base border-border text-foreground placeholder:text-text-faint focus-visible:ring-brand/30 resize-none min-h-20"
            />
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
            {isEditing ? "Salvar" : "Criar"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
