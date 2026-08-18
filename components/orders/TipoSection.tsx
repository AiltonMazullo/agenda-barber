"use client";

import { Receipt } from "lucide-react";
import { FormSection } from "./FormSection";
import { LabeledSelect } from "./FormField";
import { ClienteSearchField } from "./ClienteSearchField";
import type { SelectOption } from "@/types/common.types";
import type { ComandaTipo } from "@/types/orders.types";
import type { Client } from "@/types/client.types";

const TIPO_OPTIONS: SelectOption<string>[] = [
  { value: "AGENDAMENTO", label: "Agendamento" },
  { value: "AVULSA", label: "Consumo" },
];

interface TipoSectionProps {
  tipo: ComandaTipo;
  /** Troca o tipo (a confirmação de perda dos itens fica no ComandaForm). */
  onTipoChange: (tipo: ComandaTipo) => void;
  branchId: string;
  onBranchIdChange: (value: string) => void;
  branchOptions: SelectOption<string>[];
  clienteId: string;
  onClienteIdChange: (value: string) => void;
  /** Lista crua de clientes, usada pela busca com autocomplete (spec-revisao-cliente-4.md §4.4). */
  clients: Client[];
  employeeId: string;
  onEmployeeIdChange: (value: string) => void;
  employeeOptions: SelectOption<string>[];
}

/**
 * Define se a comanda é de agendamento (agendamentos reais vinculados numa
 * seção própria) ou de consumo (sem agendamento, com cliente e profissional
 * reais escolhidos em selects). A filial é sempre coletada — necessária para
 * a baixa de estoque e para vincular o fechamento a um caixa aberto.
 */
export function TipoSection({
  tipo,
  onTipoChange,
  branchId,
  onBranchIdChange,
  branchOptions,
  clienteId,
  onClienteIdChange,
  clients,
  employeeId,
  onEmployeeIdChange,
  employeeOptions,
}: TipoSectionProps) {
  const isAvulsa = tipo === "AVULSA";

  return (
    <FormSection
      icon={<Receipt />}
      title="Tipo da comanda"
      subtitle="Defina se é para um agendamento ou consumo"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <LabeledSelect
          label="Tipo de comanda"
          required
          value={tipo}
          onValueChange={(v) => onTipoChange(v as ComandaTipo)}
          options={TIPO_OPTIONS}
        />

        <LabeledSelect
          label="Filial"
          required
          placeholder={
            branchOptions.length === 0
              ? "Nenhuma filial cadastrada"
              : "Selecionar filial"
          }
          value={branchId}
          onValueChange={onBranchIdChange}
          options={branchOptions}
        />

        {isAvulsa && (
          <>
            <ClienteSearchField
              required
              clients={clients}
              value={clienteId}
              onValueChange={onClienteIdChange}
            />

            <LabeledSelect
              label="Profissional"
              placeholder="Selecionar (opcional)"
              value={employeeId}
              onValueChange={onEmployeeIdChange}
              options={employeeOptions}
            />
          </>
        )}
      </div>
    </FormSection>
  );
}
