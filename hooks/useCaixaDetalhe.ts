"use client";

import { useState } from "react";
import type {
  AddTransactionsPayload,
  CashRegister,
  NewTransactionInput,
} from "@/types/cash-register.types";

interface CashRegisterCrud {
  getById: (id: string) => Promise<CashRegister | null>;
  addTransactions: (
    id: string,
    payload: AddTransactionsPayload,
  ) => Promise<{ count: number } | null>;
  close: (id: string) => Promise<{ closedAt: string | null } | null>;
  remove: (id: string) => Promise<boolean>;
}

/**
 * Orquestra o dialog de detalhe de um caixa (abrir, ver, movimentar, fechar,
 * excluir). Compartilhado entre a tela de Caixa e a de Histórico.
 */
export function useCaixaDetalhe(crud: CashRegisterCrud) {
  const [open, setOpen] = useState(false);
  const [detalhe, setDetalhe] = useState<CashRegister | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  async function openDetalhe(id: string) {
    setOpen(true);
    setLoading(true);
    setDetalhe(null);
    const full = await crud.getById(id);
    setDetalhe(full);
    setLoading(false);
  }

  async function refresh() {
    if (!detalhe) return;
    const full = await crud.getById(detalhe.id);
    if (full) setDetalhe(full);
  }

  async function addTransaction(input: NewTransactionInput) {
    if (!detalhe) return;
    setBusy(true);
    try {
      const res = await crud.addTransactions(detalhe.id, {
        transactions: [input],
      });
      if (res) await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleClose() {
    if (!detalhe) return;
    setBusy(true);
    try {
      const closed = await crud.close(detalhe.id);
      if (closed)
        setDetalhe((prev) =>
          prev ? { ...prev, closedAt: closed.closedAt } : prev,
        );
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
    )
      return;
    setBusy(true);
    try {
      const ok = await crud.remove(detalhe.id);
      if (ok) {
        setOpen(false);
        setDetalhe(null);
      }
    } finally {
      setBusy(false);
    }
  }

  return {
    open,
    setOpen,
    detalhe,
    loading,
    busy,
    openDetalhe,
    addTransaction,
    handleClose,
    handleRemove,
  };
}
