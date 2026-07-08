"use client";

import { Receipt } from "lucide-react";
import { FormSection } from "./FormSection";
import { LabeledInput, LabeledSelect } from "./FormField";
import type { SelectOption } from "@/types/common.types";
import type { ComandaTipo } from "@/types/orders.types";

const TIPO_OPTIONS: SelectOption<string>[] = [
  { value: "AGENDAMENTO", label: "Agendamento" },
  { value: "AVULSA", label: "Consumo avulso" },
];

interface TipoSectionProps {
  tipo: ComandaTipo;
  /** Troca o tipo (a confirmação de perda dos itens fica no ComandaForm). */
  onTipoChange: (tipo: ComandaTipo) => void;
  clienteAvulso: string;
  onClienteAvulsoChange: (value: string) => void;
}

/**
 * Define se a comanda é de agendamento (itens apontam para agendamentos
 * reais, escolhidos direto em cada item) ou de consumo avulso (sem
 * agendamento, com nome de cliente livre e opcional).
 */
export function TipoSection({
  tipo,
  onTipoChange,
  clienteAvulso,
  onClienteAvulsoChange,
}: TipoSectionProps) {
  const isAvulsa = tipo === "AVULSA";

  return (
    <FormSection
      icon={<Receipt />}
      title="Tipo da comanda"
      subtitle="Defina se é para um agendamento ou consumo avulso"
    >
      <div
        className={`grid grid-cols-1 gap-4 ${isAvulsa ? "md:grid-cols-2" : "md:max-w-xs"}`}
      >
        <LabeledSelect
          label="Tipo de comanda"
          required
          value={tipo}
          onValueChange={(v) => onTipoChange(v as ComandaTipo)}
          options={TIPO_OPTIONS}
        />

        {isAvulsa && (
          <LabeledInput
            label="Cliente (opcional)"
            placeholder="Cliente avulso"
            value={clienteAvulso}
            onChange={(e) => onClienteAvulsoChange(e.target.value)}
          />
        )}
      </div>
    </FormSection>
  );
}
