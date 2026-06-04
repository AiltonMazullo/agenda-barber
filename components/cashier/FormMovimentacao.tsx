"use client";

import { useState } from "react";
import { Plus, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/shared";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { maskBRLInput, parseBRL } from "@/utils/format";
import {
  PAYMENT_METHOD_LABELS,
  type NewTransactionInput,
  type PaymentMethod,
  type TransactionType,
} from "@/types/cash-register.types";

const PAYMENT_OPTIONS = (
  Object.entries(PAYMENT_METHOD_LABELS) as [PaymentMethod, string][]
).map(([value, label]) => ({ value, label }));

export function FormMovimentacao({
  onAdd,
  submitting,
}: {
  onAdd: (input: NewTransactionInput) => void;
  submitting?: boolean;
}) {
  const [name, setName] = useState("");
  const [valor, setValor] = useState("");
  const [type, setType] = useState<TransactionType>("ENTRY");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("DINHEIRO");
  const [description, setDescription] = useState("");

  function handleAdd() {
    if (!name.trim()) {
      toast.error("Informe o nome da movimentação.");
      return;
    }
    const valueInCents = Math.round(parseBRL(valor) * 100);
    if (valueInCents <= 0) {
      toast.error("Informe um valor válido.");
      return;
    }
    onAdd({
      name: name.trim(),
      valueInCents,
      type,
      paymentMethod,
      description: description.trim() || undefined,
    });
    setName("");
    setValor("");
    setDescription("");
  }

  return (
    <div className="rounded-lg border border-border-subtle bg-surface-base p-4 space-y-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-brand">
        Nova movimentação
      </p>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setType("ENTRY")}
          className={cn(
            "h-9 rounded-md border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors",
            type === "ENTRY"
              ? "bg-success-bg border-success-foreground/40 text-success-foreground"
              : "border-border bg-surface-raised text-muted-foreground hover:border-success-foreground/30",
          )}
        >
          <ArrowDownCircle className="size-3.5" />
          Entrada
        </button>
        <button
          type="button"
          onClick={() => setType("EXIT")}
          className={cn(
            "h-9 rounded-md border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors",
            type === "EXIT"
              ? "bg-danger-bg border-danger-foreground/40 text-danger-foreground"
              : "border-border bg-surface-raised text-muted-foreground hover:border-danger-foreground/30",
          )}
        >
          <ArrowUpCircle className="size-3.5" />
          Saída
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex.: Corte de cabelo"
          className="bg-surface-raised border-border text-foreground placeholder:text-text-faint h-9"
        />
        <Input
          value={valor}
          onChange={(e) => setValor(maskBRLInput(e.target.value))}
          placeholder="R$ 0,00"
          inputMode="numeric"
          className="bg-surface-raised border-border text-foreground placeholder:text-text-faint h-9"
        />
      </div>

      <SelectField
        id="paymentMethod"
        label="Meio de pagamento"
        value={paymentMethod}
        options={PAYMENT_OPTIONS}
        onChange={(v) => setPaymentMethod(v as PaymentMethod)}
      />

      <Input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descrição (opcional)"
        className="bg-surface-raised border-border text-foreground placeholder:text-text-faint h-9"
      />

      <button
        type="button"
        onClick={handleAdd}
        disabled={submitting}
        className="w-full h-9 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
      >
        <Plus className="size-3.5" />
        Adicionar movimentação
      </button>
    </div>
  );
}
