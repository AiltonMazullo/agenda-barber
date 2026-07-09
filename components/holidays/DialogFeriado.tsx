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
import { Field, FieldLabel } from "@/components/ui/field";
import { SelectField, DatePickerField } from "@/components/shared";
import { TIME_OPTIONS } from "@/components/professionals/helpers";
import { HOLIDAY_STATUS_LABEL } from "./status";
import { ALL_BRANCHES_VALUE, dateToIsoDate, isoDateToDate } from "./helpers";
import type { Holiday, HolidayPayload, HolidayStatus } from "@/types/holiday.types";
import type { Branch } from "@/types/branch.types";

const STATUS_OPTIONS: { value: HolidayStatus; label: string }[] = (
  Object.keys(HOLIDAY_STATUS_LABEL) as HolidayStatus[]
).map((value) => ({ value, label: HOLIDAY_STATUS_LABEL[value] }));

interface HolidayFormState {
  name: string;
  date: Date | undefined;
  status: HolidayStatus;
  startTime: string;
  endTime: string;
  branchId: string; // ALL_BRANCHES_VALUE ou id da filial
}

const EMPTY_FORM: HolidayFormState = {
  name: "",
  date: undefined,
  status: "CLOSED",
  startTime: "08:00",
  endTime: "18:00",
  branchId: ALL_BRANCHES_VALUE,
};

interface DialogFeriadoProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  holiday: Holiday | null;
  branches: Branch[];
  onSave: (payload: HolidayPayload) => Promise<void>;
}

export function DialogFeriado({
  open,
  onOpenChange,
  holiday,
  branches,
  onSave,
}: DialogFeriadoProps) {
  const [form, setForm] = useState<HolidayFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (holiday) {
      setForm({
        name: holiday.name,
        date: isoDateToDate(holiday.date),
        status: holiday.status,
        startTime: holiday.startTime ?? "08:00",
        endTime: holiday.endTime ?? "18:00",
        branchId: holiday.branchId ?? ALL_BRANCHES_VALUE,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [open, holiday]);

  function update<K extends keyof HolidayFormState>(
    key: K,
    value: HolidayFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const branchOptions = [
    { value: ALL_BRANCHES_VALUE, label: "Todas as filiais" },
    ...branches.map((b) => ({ value: b.id, label: b.name })),
  ];

  async function handleSave() {
    if (!form.name.trim()) return toast.error("Informe o nome do feriado.");
    if (!form.date) return toast.error("Informe a data do feriado.");
    if (form.status === "OPEN" && form.startTime >= form.endTime) {
      return toast.error("Hora Início deve ser antes da Hora Fim.");
    }

    setSaving(true);
    try {
      await onSave({
        name: form.name.trim(),
        date: dateToIsoDate(form.date),
        status: form.status,
        startTime: form.status === "OPEN" ? form.startTime : undefined,
        endTime: form.status === "OPEN" ? form.endTime : undefined,
        branchId:
          form.branchId === ALL_BRANCHES_VALUE ? null : form.branchId,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-raised border border-border text-white max-w-lg p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold">
              {holiday ? "Editar Feriado" : "Novo Feriado"}
            </DialogTitle>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-white hover:bg-surface-elevated transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <Field>
            <FieldLabel
              htmlFor="feriado-nome"
              className="text-[10px] font-bold uppercase tracking-widest text-brand"
            >
              Nome
            </FieldLabel>
            <Input
              id="feriado-nome"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Ex.: Natal, Carnaval"
              className="bg-surface-base border-border text-white placeholder:text-text-faint focus-visible:ring-[#f5b82e]/30 h-10"
            />
          </Field>

          <div className="flex flex-wrap gap-3">
            <DatePickerField
              id="feriado-data"
              label="Data"
              date={form.date}
              onChange={(d) => update("date", d)}
              className="flex-1 min-w-[160px]"
            />
            <SelectField
              id="feriado-status"
              label="Status"
              value={form.status}
              options={STATUS_OPTIONS}
              onChange={(v) => update("status", v)}
              className="flex-1 min-w-[140px]"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <SelectField
              id="feriado-hora-inicio"
              label="Hora Início"
              value={form.startTime}
              options={TIME_OPTIONS}
              onChange={(v) => update("startTime", v)}
              className={
                form.status === "CLOSED"
                  ? "flex-1 min-w-[140px] opacity-50 pointer-events-none"
                  : "flex-1 min-w-[140px]"
              }
            />
            <SelectField
              id="feriado-hora-fim"
              label="Hora Fim"
              value={form.endTime}
              options={TIME_OPTIONS}
              onChange={(v) => update("endTime", v)}
              className={
                form.status === "CLOSED"
                  ? "flex-1 min-w-[140px] opacity-50 pointer-events-none"
                  : "flex-1 min-w-[140px]"
              }
            />
          </div>
          {form.status === "CLOSED" && (
            <p className="text-xs text-text-faint -mt-2">
              Fechado o dia todo — Hora Início/Fim não se aplicam.
            </p>
          )}

          <SelectField
            id="feriado-filial"
            label="Filial"
            value={form.branchId}
            options={branchOptions}
            onChange={(v) => update("branchId", v)}
          />
        </div>

        <div className="px-6 py-4 border-t border-border-subtle flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 px-4 rounded-md text-xs font-bold text-muted-foreground hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="h-9 px-4 rounded-md text-xs font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-all disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
