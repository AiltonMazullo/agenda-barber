"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, History, Search } from "lucide-react";
import {
  PageHeader,
  EmptyState,
  DatePickerField,
  Loading,
} from "@/components/shared";
import {
  CaixaCard,
  DialogDetalheCaixa,
  BranchSelect,
} from "@/components/cashier";
import { useAuth } from "@/hooks/useAuth";
import { useBranches } from "@/hooks/useBranches";
import { useCashRegisters } from "@/hooks/useCashRegisters";
import { useCaixaDetalhe } from "@/hooks/useCaixaDetalhe";

export default function CaixaHistoricoPage() {
  const { barbershop } = useAuth();
  const { branches } = useBranches(barbershop?.id);
  const crud = useCashRegisters(barbershop?.id);
  const { registers, isLoading } = crud;

  const detalhe = useCaixaDetalhe(crud);

  const [filterBranchId, setFilterBranchId] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);

  const historico = useMemo(() => {
    let hist = registers.filter((r) => r.closedAt !== null);

    if (filterBranchId !== "all") {
      hist = hist.filter((r) => r.branchId === filterBranchId);
    }
    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      hist = hist.filter((r) => new Date(r.createdAt) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      hist = hist.filter((r) => new Date(r.createdAt) <= to);
    }

    // Mais recentes primeiro (por fechamento).
    return hist.sort(
      (a, b) =>
        new Date(b.closedAt ?? b.createdAt).getTime() -
        new Date(a.closedAt ?? a.createdAt).getTime(),
    );
  }, [registers, filterBranchId, dateFrom, dateTo]);

  const hasDateFilter = Boolean(dateFrom || dateTo);

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Histórico de Caixa"
        subtitle="Consulte os caixas já fechados"
        actions={
          <Link
            href="/cashier"
            className="h-9 px-4 rounded-md text-sm font-medium border border-border bg-surface-raised text-foreground hover:bg-surface-elevated transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="size-3.5" />
            Voltar ao caixa
          </Link>
        }
      />

      {/* Filtros */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-brand">
            Filial
          </label>
          <BranchSelect
            value={filterBranchId}
            onChange={setFilterBranchId}
            branches={branches}
            className="h-10"
          />
        </div>

        <DatePickerField
          id="historico-de"
          label="De"
          date={dateFrom}
          onChange={setDateFrom}
          className="max-w-44"
        />
        <DatePickerField
          id="historico-ate"
          label="Até"
          date={dateTo}
          onChange={setDateTo}
          className="max-w-44"
        />

        {hasDateFilter && (
          <button
            type="button"
            onClick={() => {
              setDateFrom(undefined);
              setDateTo(undefined);
            }}
            className="h-10 px-3 rounded-md text-xs text-muted-foreground border border-border hover:bg-surface-elevated transition-colors"
          >
            Limpar datas
          </button>
        )}
      </div>

      {/* Lista */}
      <section className="space-y-2">
        <div className="flex items-center gap-2">
          <History className="size-4 text-brand" />
          <h2 className="text-sm font-bold uppercase tracking-widest">
            Caixas fechados
          </h2>
          <span className="text-xs text-muted-foreground">
            ({historico.length})
          </span>
        </div>

        {isLoading ? (
          <Loading label="Carregando histórico" />
        ) : historico.length === 0 ? (
          <EmptyState
            icon={<Search className="size-10" />}
            message={
              hasDateFilter || filterBranchId !== "all"
                ? "Nenhum caixa fechado para os filtros selecionados."
                : "Nenhum caixa fechado ainda."
            }
          />
        ) : (
          <div className="space-y-2">
            {historico.map((r) => (
              <CaixaCard
                key={r.id}
                register={r}
                onClick={() => void detalhe.openDetalhe(r.id)}
                onExpand={() => void crud.getById(r.id)}
                onReopen={() => void crud.reopen(r.id)}
              />
            ))}
          </div>
        )}
      </section>

      <DialogDetalheCaixa
        open={detalhe.open}
        onOpenChange={detalhe.setOpen}
        register={detalhe.detalhe}
        loading={detalhe.loading}
        busy={detalhe.busy}
        onAddTransaction={(input) => void detalhe.addTransaction(input)}
        onClose={(countedCashInCents, divergenceReasonNote) =>
          void detalhe.handleClose({ countedCashInCents, divergenceReasonNote })
        }
        onRemove={() => void detalhe.handleRemove()}
        fetchClosingSummary={detalhe.fetchClosingSummary}
      />
    </div>
  );
}
