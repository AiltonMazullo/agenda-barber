"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { SelectField } from "@/components/shared";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useBranches } from "@/hooks/useBranches";
import { useBankAccounts } from "@/hooks/useBankAccounts";
import type {
  BranchConfigInput,
  PaymentMethodConfig,
  PaymentMethodStatus,
  PaymentMethodTiming,
} from "@/types/payment-method.types";

const TIMING_OPTIONS: { value: PaymentMethodTiming; label: string }[] = [
  { value: "AVISTA", label: "À vista" },
  { value: "APRAZO", label: "A prazo" },
];

const STATUS_OPTIONS: { value: PaymentMethodStatus; label: string }[] = [
  { value: "ACTIVE", label: "Ativo" },
  { value: "INACTIVE", label: "Inativo" },
];

export type PaymentMethodFormMode = "create" | "edit" | "view";

type BranchConfigState = {
  bankAccountId: string;
  feePercent: string;
  receiptDeadlineDays: string;
  autoMarkAsReceived: boolean;
};

export function PaymentMethodComandaForm({
  mode,
  method,
  saving,
  onSubmit,
}: {
  mode: PaymentMethodFormMode;
  method?: PaymentMethodConfig | null;
  saving: boolean;
  onSubmit: (values: {
    name: string;
    timing: PaymentMethodTiming;
    status: PaymentMethodStatus;
    branchConfigs: BranchConfigInput[];
  }) => void;
}) {
  const readOnly = mode === "view";
  const { barbershop } = useAuth();
  const { branches } = useBranches(barbershop?.id);
  const { accounts } = useBankAccounts(barbershop?.id);

  const [name, setName] = useState("");
  const [timing, setTiming] = useState<PaymentMethodTiming>("AVISTA");
  const [status, setStatus] = useState<PaymentMethodStatus>("ACTIVE");
  const [branchConfigs, setBranchConfigs] = useState<Record<string, BranchConfigState>>({});

  useEffect(() => {
    if (method) {
      setName(method.name);
      setTiming(method.timing);
      setStatus(method.status);
      const map: Record<string, BranchConfigState> = {};
      for (const bc of method.branchConfigs) {
        map[bc.branchId] = {
          bankAccountId: bc.bankAccountId ?? "",
          feePercent: String(bc.feePercent),
          receiptDeadlineDays: String(bc.receiptDeadlineDays),
          autoMarkAsReceived: bc.autoMarkAsReceived,
        };
      }
      setBranchConfigs(map);
    }
  }, [method]);

  function updateBranchConfig(branchId: string, patch: Partial<BranchConfigState>) {
    setBranchConfigs((prev) => ({
      ...prev,
      [branchId]: {
        bankAccountId: prev[branchId]?.bankAccountId ?? "",
        feePercent: prev[branchId]?.feePercent ?? "0",
        receiptDeadlineDays: prev[branchId]?.receiptDeadlineDays ?? "0",
        autoMarkAsReceived: prev[branchId]?.autoMarkAsReceived ?? false,
        ...patch,
      },
    }));
  }

  function handleSubmit() {
    const configs: BranchConfigInput[] = branches.map((b) => ({
      branchId: b.id,
      bankAccountId: branchConfigs[b.id]?.bankAccountId || null,
      feePercent: Number(branchConfigs[b.id]?.feePercent ?? 0) || 0,
      receiptDeadlineDays:
        timing === "APRAZO" ? Number(branchConfigs[b.id]?.receiptDeadlineDays ?? 0) || 0 : 0,
      autoMarkAsReceived: branchConfigs[b.id]?.autoMarkAsReceived ?? false,
    }));
    onSubmit({ name, timing, status, branchConfigs: configs });
  }

  return (
    <div className="rounded-xl border border-border bg-surface-raised p-5 space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Field className="flex-1">
          <FieldLabel className="text-[10px] font-bold uppercase tracking-widest text-brand">
            Nome *
          </FieldLabel>
          <Input
            value={name}
            disabled={readOnly}
            onChange={(e) => setName(e.target.value)}
            className="bg-surface-base border-border text-foreground"
          />
        </Field>
        <SelectField
          id="timing"
          label="Tipo *"
          value={timing}
          onChange={setTiming}
          options={TIMING_OPTIONS}
          disabled={readOnly}
        />
        {mode !== "create" && (
          <SelectField
            id="status"
            label="Status *"
            value={status}
            onChange={setStatus}
            options={STATUS_OPTIONS}
            disabled={readOnly}
          />
        )}
      </div>

      {branches.length > 0 && (
        <div className="space-y-3 pt-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Filiais — adicione as configurações da forma de pagamento às filiais
          </p>
          {branches.map((b) => (
            <div key={b.id} className="rounded-md border border-border p-3 space-y-2">
              <p className="text-sm font-semibold text-foreground">{b.name}</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <SelectField
                  id={`bank-${b.id}`}
                  label="Conta bancária"
                  value={branchConfigs[b.id]?.bankAccountId ?? ""}
                  onChange={(v) => updateBranchConfig(b.id, { bankAccountId: v })}
                  placeholder="Nenhuma"
                  options={accounts.map((a) => ({ value: a.id, label: a.name }))}
                  disabled={readOnly}
                />
                <Field className="w-28">
                  <FieldLabel className="text-[10px] font-bold uppercase tracking-widest text-brand">
                    Taxa (%)
                  </FieldLabel>
                  <Input
                    value={branchConfigs[b.id]?.feePercent ?? "0"}
                    disabled={readOnly}
                    onChange={(e) => updateBranchConfig(b.id, { feePercent: e.target.value })}
                    className="bg-surface-base border-border text-foreground"
                  />
                </Field>
                {timing === "APRAZO" && (
                  <Field className="w-36">
                    <FieldLabel className="text-[10px] font-bold uppercase tracking-widest text-brand">
                      Prazo p/ recebimento (dias)
                    </FieldLabel>
                    <Input
                      type="number"
                      min={0}
                      disabled={readOnly}
                      value={branchConfigs[b.id]?.receiptDeadlineDays ?? "0"}
                      onChange={(e) =>
                        updateBranchConfig(b.id, { receiptDeadlineDays: e.target.value })
                      }
                      className="bg-surface-base border-border text-foreground"
                    />
                  </Field>
                )}
                <label className="flex items-center gap-2 text-xs text-muted-foreground h-10">
                  <input
                    type="checkbox"
                    disabled={readOnly}
                    checked={branchConfigs[b.id]?.autoMarkAsReceived ?? false}
                    onChange={(e) =>
                      updateBranchConfig(b.id, { autoMarkAsReceived: e.target.checked })
                    }
                  />
                  Marcar como recebido automaticamente
                </label>
              </div>
            </div>
          ))}
        </div>
      )}

      {!readOnly && (
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!name || saving}
            className="h-10 px-5 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save className="size-3.5" />
            {mode === "edit" ? "Salvar" : "Enviar"}
          </button>
        </div>
      )}
    </div>
  );
}
