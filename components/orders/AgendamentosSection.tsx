"use client";

import { useState } from "react";
import { CalendarClock, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormSection } from "./FormSection";
import { LabeledSelect } from "./FormField";
import type { SelectOption } from "@/types/common.types";

interface AgendamentosSectionProps {
  /** Agendamentos já vinculados a esta comanda. */
  linkedOptions: SelectOption<string>[];
  /** Agendamentos ainda não vinculados, disponíveis para adicionar. */
  availableToLinkOptions: SelectOption<string>[];
  onAdd: (appointmentId: string) => void;
  onRemove: (appointmentId: string) => void;
}

/**
 * Seção "Agendamentos": permite atrelar a comanda a um ou mais agendamentos
 * já existentes (ver ajustes/Módulo Caixa.md). Os itens de Produtos/Serviços
 * só podem apontar para agendamentos vinculados aqui.
 */
export function AgendamentosSection({
  linkedOptions,
  availableToLinkOptions,
  onAdd,
  onRemove,
}: AgendamentosSectionProps) {
  const [addId, setAddId] = useState("");

  function handleAdd() {
    if (!addId) return;
    onAdd(addId);
    setAddId("");
  }

  return (
    <FormSection
      icon={<CalendarClock />}
      title="Agendamentos"
      subtitle="Agendamentos vinculados a esta comanda"
    >
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <LabeledSelect
            label="Agendamento"
            placeholder={
              availableToLinkOptions.length === 0
                ? "Nenhum outro agendamento disponível"
                : "Selecione..."
            }
            value={addId}
            onValueChange={setAddId}
            options={availableToLinkOptions}
          />
        </div>
        <Button
          type="button"
          onClick={handleAdd}
          disabled={!addId}
          className="h-10 cursor-pointer bg-brand text-brand-foreground hover:bg-brand-hover disabled:cursor-not-allowed"
        >
          <Plus className="size-4" />
        </Button>
      </div>

      {linkedOptions.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {linkedOptions.map((o) => (
            <li
              key={o.value}
              className="flex items-center justify-between gap-2 rounded-md border border-border bg-surface-base px-3 py-2"
            >
              <span className="truncate text-sm text-foreground">
                {o.label}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onRemove(o.value)}
                aria-label={`Remover ${o.label}`}
                className="cursor-pointer text-muted-foreground hover:bg-danger/10 hover:text-danger-foreground shrink-0"
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-center text-sm text-muted-foreground">
          Nenhum agendamento adicionado!
        </p>
      )}
    </FormSection>
  );
}
