"use client";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Branch } from "@/types/branch.types";

interface BranchSelectProps {
  value: string;
  onChange: (value: string) => void;
  branches: Branch[];
  /** Inclui a opção "Todas as filiais" (value = "all"). */
  includeAll?: boolean;
  className?: string;
}

export function BranchSelect({
  value,
  onChange,
  branches,
  includeAll = true,
  className,
}: BranchSelectProps) {
  function labelFor(v: string): string {
    if (v === "all") return "Todas as filiais";
    return branches.find((b) => b.id === v)?.name ?? "Selecione a filial";
  }

  return (
    <Select value={value} onValueChange={(v) => onChange(v as string)}>
      <SelectTrigger
        className={cn(
          "h-9 min-w-44 bg-surface-raised border-border text-foreground",
          className,
        )}
      >
        <SelectValue>{() => labelFor(value)}</SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-surface-raised border border-border text-foreground">
        {includeAll && <SelectItem value="all">Todas as filiais</SelectItem>}
        {branches.map((b) => (
          <SelectItem key={b.id} value={b.id}>
            {b.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
