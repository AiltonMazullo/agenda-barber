"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SelectField, DatePickerField } from "@/components/shared";
import { maskCpf } from "@/utils/format";
import { PAYMENT_METHOD_LABELS } from "@/types/cash-register.types";
import type { PaymentMethod } from "@/types/cash-register.types";

const FORMA_OPTIONS = (
  Object.entries(PAYMENT_METHOD_LABELS) as [PaymentMethod, string][]
).map(([value, label]) => ({ value, label }));

export function PlanoAtivacao({
  ativar,
  onAtivarChange,
  dataInicio,
  onDataInicioChange,
  formaPagamento,
  onFormaPagamentoChange,
  vencimento,
  onVencimentoChange,
  cpf,
  onCpfChange,
}: {
  ativar: boolean;
  onAtivarChange: (b: boolean) => void;
  dataInicio: Date | undefined;
  onDataInicioChange: (d: Date | undefined) => void;
  formaPagamento: string;
  onFormaPagamentoChange: (v: string) => void;
  vencimento: string;
  onVencimentoChange: (v: string) => void;
  cpf: string;
  onCpfChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2.5">
      {/* Aviso: sem plano ativo */}
      <div className="flex items-center gap-2.5 rounded-lg border border-warning/30 bg-warning/5 p-3">
        <AlertCircle className="size-4 text-warning-foreground shrink-0" />
        <p className="text-xs text-muted-foreground flex-1">
          Este cliente não possui plano ativo.
        </p>
        {!ativar && (
          <button
            type="button"
            onClick={() => onAtivarChange(true)}
            className="h-7 px-3 rounded-md text-xs font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors flex items-center gap-1.5 shrink-0"
          >
            <CreditCard className="size-3" />
            Ativar plano
          </button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {ativar && (
          <motion.div
            key="plano-form"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="rounded-lg border border-border-subtle bg-surface-base p-3 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand">
                  Ativação de plano
                </p>
                <button
                  type="button"
                  onClick={() => onAtivarChange(false)}
                  className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <DatePickerField
                  id="plano-data-inicio"
                  label="Data de início"
                  date={dataInicio}
                  onChange={onDataInicioChange}
                />
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-brand">
                    Vencimento (dia)
                  </label>
                  <Input
                    value={vencimento}
                    onChange={(e) =>
                      onVencimentoChange(
                        e.target.value.replace(/\D/g, "").slice(0, 2),
                      )
                    }
                    placeholder="Ex.: 10"
                    inputMode="numeric"
                    className="bg-surface-raised border-border text-foreground placeholder:text-text-faint h-10"
                  />
                </div>
              </div>

              <SelectField
                id="plano-forma"
                label="Forma de pagamento"
                value={formaPagamento}
                options={FORMA_OPTIONS}
                onChange={onFormaPagamentoChange}
              />

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand">
                  CPF do cliente *
                </label>
                <Input
                  value={cpf}
                  onChange={(e) => onCpfChange(maskCpf(e.target.value))}
                  placeholder="000.000.000-00"
                  inputMode="numeric"
                  className="bg-surface-raised border-border text-foreground placeholder:text-text-faint h-10"
                />
              </div>

              <div className="flex items-center gap-2 rounded-md border border-warning/30 bg-warning/5 px-3 py-2">
                <AlertCircle className="size-3.5 text-warning-foreground shrink-0" />
                <p className="text-[11px] text-muted-foreground">
                  O plano será ativado após a confirmação do agendamento.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
