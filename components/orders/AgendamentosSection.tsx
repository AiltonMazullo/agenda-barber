"use client";

import { useState } from "react";
import { CalendarCheck, Plus, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared";
import { FormSection } from "./FormSection";
import { LabeledInput, LabeledSelect } from "./FormField";
import { formatDate, formatTime } from "@/utils/format";
import type { SelectOption } from "@/types/common.types";
import type { ComandaAgendamento, ComandaTipo } from "@/types/orders.types";

const TIPO_OPTIONS: SelectOption<string>[] = [
  { value: "AGENDAMENTO", label: "Agendamento" },
  { value: "AVULSA", label: "Consumo avulso" },
];

interface AgendamentosSectionProps {
  tipo: ComandaTipo;
  /** Troca o tipo (a confirmação de perda de composição fica no ComandaForm). */
  onTipoChange: (tipo: ComandaTipo) => void;
  clienteAvulso: string;
  onClienteAvulsoChange: (value: string) => void;
  options: SelectOption<string>[];
  agendamentos: ComandaAgendamento[];
  onAdd: (appointmentId: string) => void;
  onRemove: (appointmentId: string) => void;
  /** Itens atrelados ao agendamento — remoção em cascata pede confirmação. */
  linkedItemCount: (appointmentId: string) => number;
}

export function AgendamentosSection({
  tipo,
  onTipoChange,
  clienteAvulso,
  onClienteAvulsoChange,
  options,
  agendamentos,
  onAdd,
  onRemove,
  linkedItemCount,
}: AgendamentosSectionProps) {
  const [selecionado, setSelecionado] = useState("");
  const [removendo, setRemovendo] = useState<ComandaAgendamento | null>(null);

  const isAgendamento = tipo === "AGENDAMENTO";

  function handleAdd() {
    if (!selecionado) return;
    onAdd(selecionado);
    setSelecionado("");
  }

  function handleRemove(agendamento: ComandaAgendamento) {
    if (linkedItemCount(agendamento.appointmentId) > 0) {
      setRemovendo(agendamento);
      return;
    }
    onRemove(agendamento.appointmentId);
  }

  return (
    <FormSection
      icon={<CalendarCheck />}
      title="Agendamentos"
      subtitle="Vincule os agendamentos atendidos nesta comanda"
      aside={
        isAgendamento && agendamentos.length > 0 ? (
          <span className="text-xs font-semibold text-brand whitespace-nowrap">
            {agendamentos.length}{" "}
            {agendamentos.length === 1 ? "vinculado" : "vinculados"}
          </span>
        ) : undefined
      }
    >
      <div
        className={`grid grid-cols-1 gap-4 ${
          isAgendamento
            ? "md:grid-cols-[220px_1fr_auto]"
            : "md:grid-cols-[220px_1fr]"
        }`}
      >
        <LabeledSelect
          label="Tipo de comanda"
          required
          value={tipo}
          onValueChange={(v) => onTipoChange(v as ComandaTipo)}
          options={TIPO_OPTIONS}
        />

        {isAgendamento ? (
          <>
            <LabeledSelect
              label="Agendamento"
              required
              placeholder={
                options.length === 0
                  ? "Nenhum agendamento disponível"
                  : "Selecione o agendamento..."
              }
              value={selecionado}
              onValueChange={setSelecionado}
              options={options}
            />
            <div className="flex items-end">
              <Button
                type="button"
                onClick={handleAdd}
                disabled={!selecionado}
                aria-label="Adicionar agendamento"
                className="h-10 w-full md:w-10 cursor-pointer bg-brand text-brand-foreground hover:bg-brand-hover disabled:cursor-not-allowed"
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </>
        ) : (
          <LabeledInput
            label="Cliente (opcional)"
            placeholder="Cliente avulso"
            value={clienteAvulso}
            onChange={(e) => onClienteAvulsoChange(e.target.value)}
          />
        )}
      </div>

      {isAgendamento && (
        <div className="mt-4">
          {agendamentos.length === 0 ? (
            <div className="rounded-md border border-dashed border-border py-6 text-center">
              <p className="text-sm font-medium text-muted-foreground">
                Nenhum agendamento adicionado.
              </p>
              <p className="mt-0.5 text-xs text-text-faint">
                Selecione um agendamento acima e clique em + para vincular.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {agendamentos.map((a) => (
                <li
                  key={a.appointmentId}
                  className="flex items-center gap-3 rounded-md border border-border border-l-2 border-l-brand bg-surface-base px-3 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {a.clienteNome}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {a.servicoNome} ·{" "}
                      {formatDate(a.scheduledAt, {
                        day: "2-digit",
                        month: "2-digit",
                      })}{" "}
                      às {formatTime(a.scheduledAt)}
                    </p>
                  </div>
                  <span className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
                    <User className="size-3.5" />
                    {a.profissionalNome ?? "Sem profissional"}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(a)}
                    aria-label={`Remover agendamento de ${a.clienteNome}`}
                    className="cursor-pointer text-muted-foreground hover:bg-danger/10 hover:text-danger-foreground"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <ConfirmDialog
        open={removendo !== null}
        onOpenChange={(v) => !v && setRemovendo(null)}
        title="Remover agendamento?"
        description={
          removendo
            ? `O agendamento de ${removendo.clienteNome} tem ${linkedItemCount(
                removendo.appointmentId,
              )} item(ns) vinculado(s), que também serão removidos da comanda.`
            : undefined
        }
        confirmLabel="Remover"
        tone="danger"
        onConfirm={() => {
          if (removendo) onRemove(removendo.appointmentId);
          setRemovendo(null);
        }}
      />
    </FormSection>
  );
}
