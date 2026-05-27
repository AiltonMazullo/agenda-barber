"use client";

import { useMemo, useState } from "react";
import { Wallet, Plus, DollarSign } from "lucide-react";
import { PageHeader, SummaryCard, EmptyState } from "@/components/shared";
import {
  DialogAbrirCaixa,
  CaixaCard,
  DialogDetalheCaixa,
} from "@/components/cashier";
import { useAuth } from "@/hooks/useAuth";
import { useBranches } from "@/hooks/useBranches";
import { useCashRegisters } from "@/hooks/useCashRegisters";
import type {
  CashRegister,
  NewTransactionInput,
} from "@/types/cash-register.types";

export default function CaixaPage() {
  const { barbershop } = useAuth();
  const { branches } = useBranches(barbershop?.id);
  const {
    registers,
    isLoading,
    create,
    getById,
    addTransactions,
    close,
    remove,
  } = useCashRegisters(barbershop?.id);

  const [dialogAbrir, setDialogAbrir] = useState(false);
  const [abrindo, setAbrindo] = useState(false);

  const [detalheOpen, setDetalheOpen] = useState(false);
  const [detalhe, setDetalhe] = useState<CashRegister | null>(null);
  const [loadingDetalhe, setLoadingDetalhe] = useState(false);
  const [busy, setBusy] = useState(false);

  const abertos = useMemo(
    () => registers.filter((r) => r.closedAt === null).length,
    [registers],
  );

  async function handleAbrir(branchId: string) {
    setAbrindo(true);
    try {
      const created = await create(branchId);
      if (created) {
        setDialogAbrir(false);
        await openDetalhe(created.id);
      }
    } finally {
      setAbrindo(false);
    }
  }

  async function openDetalhe(id: string) {
    setDetalheOpen(true);
    setLoadingDetalhe(true);
    setDetalhe(null);
    const full = await getById(id);
    setDetalhe(full);
    setLoadingDetalhe(false);
  }

  async function refreshDetalhe() {
    if (!detalhe) return;
    const full = await getById(detalhe.id);
    if (full) setDetalhe(full);
  }

  async function handleAddTransaction(input: NewTransactionInput) {
    if (!detalhe) return;
    setBusy(true);
    try {
      const res = await addTransactions(detalhe.id, {
        transactions: [input],
      });
      if (res) await refreshDetalhe();
    } finally {
      setBusy(false);
    }
  }

  async function handleClose() {
    if (!detalhe) return;
    setBusy(true);
    try {
      const closed = await close(detalhe.id);
      if (closed) setDetalhe((prev) => (prev ? { ...prev, closedAt: closed.closedAt } : prev));
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove() {
    if (!detalhe) return;
    if (
      !confirm(
        "Excluir este caixa? Todas as movimentações serão removidas permanentemente.",
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      const ok = await remove(detalhe.id);
      if (ok) {
        setDetalheOpen(false);
        setDetalhe(null);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Caixa"
        subtitle="Abertura, fechamento e movimentações financeiras"
        actions={
          <button
            type="button"
            onClick={() => setDialogAbrir(true)}
            className="h-9 px-4 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors flex items-center gap-1.5"
          >
            <Plus className="size-3.5" />
            Abrir caixa
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <SummaryCard
          label="Caixas"
          value={isLoading ? "…" : String(registers.length)}
          icon={<Wallet className="size-3.5" />}
          tone="brand"
          emphasized
        />
        <SummaryCard
          label="Abertos"
          value={isLoading ? "…" : String(abertos)}
          icon={<DollarSign className="size-3.5" />}
          tone="success"
        />
        <SummaryCard
          label="Fechados"
          value={isLoading ? "…" : String(registers.length - abertos)}
        />
      </div>

      <div className="space-y-2">
        {isLoading ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            Carregando caixas…
          </p>
        ) : registers.length === 0 ? (
          <EmptyState message="Nenhum caixa registrado. Abra um caixa para começar." />
        ) : (
          registers.map((r) => (
            <CaixaCard
              key={r.id}
              register={r}
              onClick={() => void openDetalhe(r.id)}
            />
          ))
        )}
      </div>

      <DialogAbrirCaixa
        open={dialogAbrir}
        onOpenChange={setDialogAbrir}
        branches={branches}
        onConfirm={(branchId) => void handleAbrir(branchId)}
        submitting={abrindo}
      />

      <DialogDetalheCaixa
        open={detalheOpen}
        onOpenChange={setDetalheOpen}
        register={detalhe}
        loading={loadingDetalhe}
        busy={busy}
        onAddTransaction={(input) => void handleAddTransaction(input)}
        onClose={() => void handleClose()}
        onRemove={() => void handleRemove()}
      />
    </div>
  );
}
