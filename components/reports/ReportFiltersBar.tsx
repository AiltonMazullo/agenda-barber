"use client";

import { DatePickerField, SelectField } from "@/components/shared";
import { useBranches } from "@/hooks/useBranches";
import { useEmployees } from "@/hooks/useEmployees";
import { useCategories } from "@/hooks/useCategories";
import { useServices } from "@/hooks/useServices";
import { useProducts } from "@/hooks/useProducts";
import type { ReportFiltersState } from "@/hooks/useReportFilters";

export type ReportFilterField =
  | "period"
  | "branch"
  | "employee"
  | "category"
  | "service"
  | "product";

interface ReportFiltersBarProps {
  barbershopId: string | undefined;
  fields: ReportFilterField[];
  state: ReportFiltersState;
  onChange: (patch: Partial<ReportFiltersState>) => void;
}

export function ReportFiltersBar({
  barbershopId,
  fields,
  state,
  onChange,
}: ReportFiltersBarProps) {
  const { branches } = useBranches(
    fields.includes("branch") ? barbershopId : undefined,
  );
  const { employees } = useEmployees(
    fields.includes("employee") ? barbershopId : undefined,
  );
  const { categories } = useCategories(
    fields.includes("category") ? barbershopId : undefined,
  );
  const { services } = useServices(
    fields.includes("service") ? barbershopId : undefined,
  );
  const { products } = useProducts(
    fields.includes("product") ? barbershopId : undefined,
  );

  return (
    <div className="flex flex-wrap gap-3 rounded-lg bg-surface-base border border-border-subtle p-3">
      {fields.includes("period") && (
        <>
          <DatePickerField
            id="report-start-date"
            label="De"
            date={state.startDate}
            onChange={(date) => onChange({ startDate: date })}
          />
          <DatePickerField
            id="report-end-date"
            label="Até"
            date={state.endDate}
            onChange={(date) => onChange({ endDate: date })}
          />
        </>
      )}
      {fields.includes("branch") && (
        <SelectField
          id="report-branch"
          label="Filial"
          value={state.branchId}
          onChange={(value) => onChange({ branchId: value })}
          placeholder="Todas as filiais"
          options={[
            { value: "", label: "Todas as filiais" },
            ...branches.map((b) => ({ value: b.id, label: b.name })),
          ]}
        />
      )}
      {fields.includes("employee") && (
        <SelectField
          id="report-employee"
          label="Profissional"
          value={state.employeeId}
          onChange={(value) => onChange({ employeeId: value })}
          placeholder="Todos os profissionais"
          options={[
            { value: "", label: "Todos os profissionais" },
            ...employees.map((e) => ({ value: e.id, label: e.name })),
          ]}
        />
      )}
      {fields.includes("category") && (
        <SelectField
          id="report-category"
          label="Categoria"
          value={state.categoryId}
          onChange={(value) => onChange({ categoryId: value })}
          placeholder="Todas as categorias"
          options={[
            { value: "", label: "Todas as categorias" },
            ...categories.map((c) => ({ value: c.id, label: c.name })),
          ]}
        />
      )}
      {fields.includes("service") && (
        <SelectField
          id="report-service"
          label="Serviço"
          value={state.serviceId}
          onChange={(value) => onChange({ serviceId: value })}
          placeholder="Todos os serviços"
          options={[
            { value: "", label: "Todos os serviços" },
            ...services.map((s) => ({ value: s.id, label: s.name })),
          ]}
        />
      )}
      {fields.includes("product") && (
        <SelectField
          id="report-product"
          label="Produto"
          value={state.productId}
          onChange={(value) => onChange({ productId: value })}
          placeholder="Todos os produtos"
          options={[
            { value: "", label: "Todos os produtos" },
            ...products.map((p) => ({ value: p.id, label: p.name })),
          ]}
        />
      )}
    </div>
  );
}
