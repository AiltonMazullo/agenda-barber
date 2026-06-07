import { SelectField } from "@/components/shared";
import type { Branch } from "@/types/branch.types";

const PERIOD_OPTIONS = [
  { value: "7", label: "7 dias" },
  { value: "30", label: "30 dias" },
  { value: "90", label: "90 dias" },
];

export function DashboardFilters({
  branches,
  branchValue,
  onBranchChange,
  periodValue,
  onPeriodChange,
}: {
  branches: Branch[];
  branchValue: string;
  onBranchChange: (value: string) => void;
  periodValue: string;
  onPeriodChange: (value: string) => void;
}) {
  const branchOptions = [
    { value: "todas", label: "Todas as filiais" },
    ...branches.map((b) => ({ value: b.id, label: b.name })),
  ];

  return (
    <div className="flex items-center gap-2">
      <SelectField
        id="dashboard-filial"
        value={branchValue}
        options={branchOptions}
        onChange={onBranchChange}
        className="flex-none w-44 min-w-0"
      />
      <SelectField
        id="dashboard-periodo"
        value={periodValue}
        options={PERIOD_OPTIONS}
        onChange={onPeriodChange}
        className="flex-none w-32 min-w-0"
      />
    </div>
  );
}
