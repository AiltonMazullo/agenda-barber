"use client";

import { DatePickerField, SelectField, MultiSelectField } from "@/components/shared";
import { useBranches } from "@/hooks/useBranches";
import { useEmployees } from "@/hooks/useEmployees";
import { useCategories } from "@/hooks/useCategories";
import { useServices } from "@/hooks/useServices";
import { useProducts } from "@/hooks/useProducts";
import { usePlans } from "@/hooks/usePlans";
import type { ReportFiltersState } from "@/hooks/useReportFilters";

export type ReportFilterField =
  | "period"
  | "branch"
  | "employee"
  | "category"
  | "service"
  | "product"
  // spec-ajustes-escopo-5.md §8: filtros Assinante/Não assinante + Plano, hoje só usados pelo relatório de frequência.
  | "subscriberStatus"
  | "plan"
  // spec-ajustes-escopo-5.md §9.2: variantes de múltipla seleção dos campos acima — hoje só usadas pelo relatório de Vendas.
  | "employeeMulti"
  | "categoryMulti"
  | "serviceMulti"
  | "productMulti";

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
    fields.includes("employee") || fields.includes("employeeMulti") ? barbershopId : undefined,
  );

  // Uma categoria é sempre de produto OU de serviço — quando o relatório
  // filtra por ambos os itens ("vendas por item"), mostramos as duas listas
  // juntas com o tipo prefixado no label; quando filtra só um dos dois (ex.:
  // agendamentos = só serviço), mostramos só as categorias daquele tipo.
  const wantsCategory = fields.includes("category") || fields.includes("categoryMulti");
  const wantsProduct = fields.includes("product") || fields.includes("productMulti");
  const wantsService = fields.includes("service") || fields.includes("serviceMulti");
  const showProductCategories = wantsCategory && wantsProduct;
  const showServiceCategories = wantsCategory && wantsService;
  const showBothCategoryTypes = wantsCategory && !wantsProduct && !wantsService;

  const { categories: productCategories } = useCategories(
    showProductCategories || showBothCategoryTypes ? barbershopId : undefined,
    "PRODUTO",
  );
  const { categories: serviceCategories } = useCategories(
    showServiceCategories || showBothCategoryTypes ? barbershopId : undefined,
    "SERVICO",
  );
  const categories =
    showProductCategories && showServiceCategories
      ? [
          ...productCategories.map((c) => ({ ...c, name: `Produto: ${c.name}` })),
          ...serviceCategories.map((c) => ({ ...c, name: `Serviço: ${c.name}` })),
        ]
      : showProductCategories
        ? productCategories
        : [...serviceCategories, ...productCategories];

  const { services } = useServices(wantsService ? barbershopId : undefined);
  const { products } = useProducts(wantsProduct ? barbershopId : undefined);
  const { plans } = usePlans(
    fields.includes("plan") ? barbershopId : undefined,
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
      {fields.includes("subscriberStatus") && (
        <SelectField
          id="report-subscriber-status"
          label="Assinante"
          value={state.subscriberStatus}
          onChange={(value) =>
            onChange({ subscriberStatus: value as ReportFiltersState["subscriberStatus"] })
          }
          placeholder="Todos"
          options={[
            { value: "", label: "Todos" },
            { value: "ASSINANTE", label: "Assinante" },
            { value: "NAO_ASSINANTE", label: "Não assinante" },
          ]}
        />
      )}
      {fields.includes("employeeMulti") && (
        <MultiSelectField
          id="report-employee-multi"
          label="Profissional"
          values={state.employeeIds}
          onChange={(values) => onChange({ employeeIds: values })}
          placeholder="Todos os profissionais"
          options={employees.map((e) => ({ value: e.id, label: e.name }))}
        />
      )}
      {fields.includes("categoryMulti") && (
        <MultiSelectField
          id="report-category-multi"
          label="Categoria"
          values={state.categoryIds}
          onChange={(values) => onChange({ categoryIds: values })}
          placeholder="Todas as categorias"
          options={categories.map((c) => ({ value: c.id, label: c.name }))}
        />
      )}
      {fields.includes("serviceMulti") && (
        <MultiSelectField
          id="report-service-multi"
          label="Serviço"
          values={state.serviceIds}
          onChange={(values) => onChange({ serviceIds: values })}
          placeholder="Todos os serviços"
          options={services.map((s) => ({ value: s.id, label: s.name }))}
        />
      )}
      {fields.includes("productMulti") && (
        <MultiSelectField
          id="report-product-multi"
          label="Produto"
          values={state.productIds}
          onChange={(values) => onChange({ productIds: values })}
          placeholder="Todos os produtos"
          options={products.map((p) => ({ value: p.id, label: p.name }))}
        />
      )}
      {fields.includes("plan") && (
        <SelectField
          id="report-plan"
          label="Plano"
          value={state.planId}
          onChange={(value) => onChange({ planId: value })}
          placeholder="Todos os planos"
          options={[
            { value: "", label: "Todos os planos" },
            ...plans.map((p) => ({ value: p.id, label: p.name })),
          ]}
        />
      )}
    </div>
  );
}
