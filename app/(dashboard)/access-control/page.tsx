"use client";

import { useMemo, useState } from "react";
import {
  Shield,
  Users,
  Building2,
  CheckCircle2,
  XCircle,
  Info,
  Search,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader, SummaryCard, EmptyState } from "@/components/shared";
import { useAuth } from "@/hooks/useAuth";
import { useBranches } from "@/hooks/useBranches";
import { useEmployees } from "@/hooks/useEmployees";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Employee } from "@/types/employee.types";

export default function ControleAcessoPage() {
  const { barbershop } = useAuth();
  const { employees, isLoading, update } = useEmployees(barbershop?.id);
  const { branches } = useBranches(barbershop?.id);

  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState<string>("todos");
  const [branchFilter, setBranchFilter] = useState<string>("todas");
  const [busyId, setBusyId] = useState<string | null>(null);

  const branchById = useMemo(
    () => new Map(branches.map((b) => [b.id, b.name])),
    [branches],
  );

  const groups = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((e) => set.add(e.group));
    return Array.from(set).sort();
  }, [employees]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return employees.filter((e) => {
      if (groupFilter !== "todos" && e.group !== groupFilter) return false;
      if (branchFilter !== "todas" && e.branchId !== branchFilter) return false;
      if (q) {
        const match =
          e.name.toLowerCase().includes(q) ||
          e.appName.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.group.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [employees, search, groupFilter, branchFilter]);

  const summary = useMemo(() => {
    const withAccess = employees.filter((e) => e.hasBranchAccess).length;
    return {
      total: employees.length,
      withAccess,
      withoutAccess: employees.length - withAccess,
      groups: groups.length,
    };
  }, [employees, groups.length]);

  async function toggleAccess(e: Employee) {
    if (busyId) return;
    setBusyId(e.id);
    try {
      const updated = await update(e.id, {
        hasBranchAccess: !e.hasBranchAccess,
      });
      if (updated) {
        toast.success(
          updated.hasBranchAccess
            ? `Acesso liberado para ${updated.name}.`
            : `Acesso removido de ${updated.name}.`,
        );
      }
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Controle de Acesso"
        subtitle="Permissões dos profissionais por filial e função"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard
          label="Profissionais"
          value={isLoading ? "…" : String(summary.total)}
          icon={<Users className="size-3.5" />}
          tone="brand"
          emphasized
        />
        <SummaryCard
          label="Com Acesso"
          value={String(summary.withAccess)}
          icon={<CheckCircle2 className="size-3.5" />}
          tone="success"
        />
        <SummaryCard
          label="Sem Acesso"
          value={String(summary.withoutAccess)}
          icon={<XCircle className="size-3.5" />}
          tone="neutral"
        />
        <SummaryCard
          label="Funções"
          value={String(summary.groups)}
          icon={<Shield className="size-3.5" />}
          tone="info"
        />
      </div>

      <div className="flex items-start gap-2 px-3 py-2.5 rounded-md bg-info-bg border border-info/30 text-xs text-info-foreground">
        <Info className="size-3.5 shrink-0 mt-0.5" />
        <p>
          O backend hoje suporta apenas o flag <code className="font-mono">hasBranchAccess</code>{" "}
          por funcionário. Quando houver model de roles e permissões granulares,
          esta página passará a ter mais controles.
        </p>
      </div>

      <Card className="bg-surface-raised border-border">
        <CardContent className="p-0">
          <div className="px-4 py-4 border-b border-border-subtle flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-50">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, função ou e-mail..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-surface-base border-border text-foreground placeholder:text-muted-foreground h-9 text-sm focus-visible:ring-brand/40"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger>
                <button
                  type="button"
                  className="h-9 px-3 rounded-md border border-border bg-surface-base text-sm text-foreground flex items-center gap-2 hover:border-brand/40 transition-colors"
                >
                  <Shield className="size-3.5 text-muted-foreground" />
                  {groupFilter === "todos" ? "Todas funções" : groupFilter}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-surface-raised border-border text-foreground">
                <DropdownMenuItem
                  onClick={() => setGroupFilter("todos")}
                  className={cn(
                    "text-xs hover:bg-surface-elevated cursor-pointer",
                    groupFilter === "todos" && "text-brand",
                  )}
                >
                  Todas funções
                </DropdownMenuItem>
                {groups.map((g) => (
                  <DropdownMenuItem
                    key={g}
                    onClick={() => setGroupFilter(g)}
                    className={cn(
                      "text-xs hover:bg-surface-elevated cursor-pointer",
                      groupFilter === g && "text-brand",
                    )}
                  >
                    {g}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger>
                <button
                  type="button"
                  className="h-9 px-3 rounded-md border border-border bg-surface-base text-sm text-foreground flex items-center gap-2 hover:border-brand/40 transition-colors"
                >
                  <Building2 className="size-3.5 text-muted-foreground" />
                  {branchFilter === "todas"
                    ? "Todas filiais"
                    : branchById.get(branchFilter) ?? "Filial"}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-surface-raised border-border text-foreground">
                <DropdownMenuItem
                  onClick={() => setBranchFilter("todas")}
                  className={cn(
                    "text-xs hover:bg-surface-elevated cursor-pointer",
                    branchFilter === "todas" && "text-brand",
                  )}
                >
                  Todas filiais
                </DropdownMenuItem>
                {branches.map((b) => (
                  <DropdownMenuItem
                    key={b.id}
                    onClick={() => setBranchFilter(b.id)}
                    className={cn(
                      "text-xs hover:bg-surface-elevated cursor-pointer",
                      branchFilter === b.id && "text-brand",
                    )}
                  >
                    {b.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="divide-y divide-border-subtle">
            {isLoading ? (
              <div className="px-5 py-12 text-center text-sm text-text-faint">
                Carregando…
              </div>
            ) : filtered.length === 0 ? (
              <div className="px-5 py-12">
                <EmptyState
                  message={
                    employees.length === 0
                      ? "Nenhum profissional cadastrado. Adicione em Configurações."
                      : "Nenhum profissional corresponde aos filtros."
                  }
                />
              </div>
            ) : (
              filtered.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between px-5 py-4 hover:bg-surface-elevated/40 transition-colors gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">
                        {e.name}
                      </p>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-surface-elevated text-muted-foreground px-2 py-0.5 rounded">
                        {e.group}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      @{e.appName} · {e.email}
                    </p>
                    <p className="text-xs text-text-faint mt-0.5 flex items-center gap-1.5">
                      <Building2 className="size-3" />
                      {branchById.get(e.branchId) ?? "Sem filial"}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <button
                      type="button"
                      disabled={busyId === e.id}
                      onClick={() => toggleAccess(e)}
                      className={cn(
                        "h-8 px-3 rounded-md border text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50",
                        e.hasBranchAccess
                          ? "border-success/40 bg-success/10 text-success-foreground hover:bg-success/20"
                          : "border-border bg-surface-base text-muted-foreground hover:border-brand/40",
                      )}
                    >
                      {e.hasBranchAccess ? (
                        <>
                          <CheckCircle2 className="size-3" />
                          Acesso liberado
                        </>
                      ) : (
                        <>
                          <XCircle className="size-3" />
                          Sem acesso
                        </>
                      )}
                    </button>
                    <span className="text-[10px] text-text-faint">
                      Clique para alternar
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
