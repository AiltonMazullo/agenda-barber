"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Wallet, Plus, DollarSign, History, Layers } from "lucide-react";
import { PageHeader, SummaryCard, EmptyState } from "@/components/shared";
import {
  DialogAbrirCaixa,
  CaixaCard,
  DialogDetalheCaixa,
  BranchSelect,
} from "@/components/cashier";
import { useAuth } from "@/hooks/useAuth";
import { useBranches } from "@/hooks/useBranches";
import { useCashRegisters } from "@/hooks/useCashRegisters";
import { useCaixaDetalhe } from "@/hooks/useCaixaDetalhe";
import { OPENING_TRANSACTION_NAME } from "@/types/cash-register.types";

export default function CaixaPage() {
  const { barbershop } = useAuth();
  const { branches } = useBranches(barbershop?.id);
  const crud = useCashRegisters(barbershop?.id);
  const { registers, isLoading, create, addTransactions } = crud;

  const detalhe = useCaixaDetalhe(crud);

  // ─── Filtro por filial (inicia na filial principal — 1ª da lista) ──────────
  // Quando houver login de funcionário, trocar para a filial atribuída ao
  // usuário logado, respeitando as permissões de visualização.
  const [filterBranchId, setFilterBranchId] = useState<string>("all");
  const [touchedFilter, setTouchedFilter] = useState(false);

  useEffect(() => {
    if (!touchedFilter && branches.length > 0) {
      setFilterBranchId(branches[0].id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branches]);

  const [dialogAbrir, setDialogAbrir] = useState(false);
  const [abrindo, setAbrindo] = useState(false);

  // ─── Caixas abertos (filtrados por filial) ─────────────────────────────────
  const abertos = useMemo(() => {
    const open = registers.filter((r) => r.closedAt === null);
    return filterBranchId === "all"
      ? open
      : open.filter((r) => r.branchId === filterBranchId);
  }, [registers, filterBranchId]);

  /** Filiais com caixa aberto → não podem abrir outro. */
  const openBranchIds = useMemo(
    () => registers.filter((r) => r.closedAt === null).map((r) => r.branchId),
    [registers],
  );

  async function handleAbrir(branchId: string, openingCashInCents: number) {
    setAbrindo(true);
    try {
      const created = await create(branchId);
      if (created) {
        setDialogAbrir(false);
        if (openingCashInCents > 0) {
          await addTransactions(created.id, {
            transactions: [
              {
                name: OPENING_TRANSACTION_NAME,
                valueInCents: openingCashInCents,
                type: "ENTRY",
                description: "Saldo em espécie registrado na abertura.",
              },
            ],
          });
        }
        await detalhe.openDetalhe(created.id);
      }
    } finally {
      setAbrindo(false);
    }
  }

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Caixa"
        subtitle="Abertura, fechamento e movimentações financeiras"
        actions={
          <div className="flex items-center gap-2">
            <BranchSelect
              value={filterBranchId}
              onChange={(v) => {
                setTouchedFilter(true);
                setFilterBranchId(v);
              }}
              branches={branches}
            />
            <Link
              href="/cashier/historico"
              className="h-9 px-4 rounded-md text-sm font-medium border border-border bg-surface-raised text-foreground hover:bg-surface-elevated transition-colors flex items-center gap-1.5"
            >
              <History className="size-3.5" />
              Histórico
            </Link>
            <button
              type="button"
              onClick={() => setDialogAbrir(true)}
              className="h-9 px-4 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors flex items-center gap-1.5"
            >
              <Plus className="size-3.5" />
              Abrir caixa
            </button>
          </div>
        }
      />

      {/* Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <SummaryCard
          label="Total"
          value={isLoading ? "…" : String(registers.length)}
          icon={<Wallet className="size-3.5" />}
          tone="brand"
          emphasized
        />
        <SummaryCard
          label="Abertos"
          value={
            isLoading
              ? "…"
              : String(registers.filter((r) => r.closedAt === null).length)
          }
          icon={<DollarSign className="size-3.5" />}
          tone="success"
        />
        <SummaryCard
          label="Fechados"
          value={
            isLoading
              ? "…"
              : String(registers.filter((r) => r.closedAt !== null).length)
          }
        />
      </div>

      {/* ─── Caixas abertos ──────────────────────────────────────────────────── */}
      <section className="space-y-2">
        <div className="flex items-center gap-2">
          <Layers className="size-4 text-brand" />
          <h2 className="text-sm font-bold uppercase tracking-widest">
            Caixas abertos
          </h2>
          <span className="text-xs text-muted-foreground">
            ({abertos.length})
          </span>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            Carregando caixas…
          </p>
        ) : abertos.length === 0 ? (
          <EmptyState
            icon={<Wallet className="size-10" />}
            message="Nenhum caixa aberto. Clique em «Abrir caixa» para começar."
          />
        ) : (
          <div className="space-y-2">
            {abertos.map((r) => (
              <CaixaCard
                key={r.id}
                register={r}
                onClick={() => void detalhe.openDetalhe(r.id)}
                onExpand={() => void crud.getById(r.id)}
              />
            ))}
          </div>
        )}
      </section>

      <DialogAbrirCaixa
        open={dialogAbrir}
        onOpenChange={setDialogAbrir}
        branches={branches}
        openBranchIds={openBranchIds}
        onConfirm={(branchId, openingCash) =>
          void handleAbrir(branchId, openingCash)
        }
        submitting={abrindo}
      />

      <DialogDetalheCaixa
        open={detalhe.open}
        onOpenChange={detalhe.setOpen}
        register={detalhe.detalhe}
        loading={detalhe.loading}
        busy={detalhe.busy}
        onAddTransaction={(input) => void detalhe.addTransaction(input)}
        onClose={() => void detalhe.handleClose()}
        onRemove={() => void detalhe.handleRemove()}
      />
    </div>
  );
}
