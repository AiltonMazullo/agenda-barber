"use client";

import { useState } from "react";
import type {
  AddTransactionsPayload,
  CashRegister,
  CashRegisterClosingSummary,
  ClosePayload,
  NewTransactionInput,
  UpdateCashRegisterPayload,
} from "@/types/cash-register.types";

interface CashRegisterCrud {
  getById: (id: string) => Promise<CashRegister | null>;
  addTransactions: (
    id: string,
    payload: AddTransactionsPayload,
  ) => Promise<{ count: number } | null>;
  update: (
    id: string,
    payload: UpdateCashRegisterPayload,
  ) => Promise<CashRegister | null>;
  close: (
    id: string,
    payload?: ClosePayload,
  ) => Promise<{
    closedAt: string | null;
    countedCashInCents?: number | null;
    cashDifferenceInCents?: number | null;
  } | null>;
  reopen: (id: string) => Promise<{ closedAt: string | null } | null>;
  getClosingSummary: (
    id: string,
  ) => Promise<CashRegisterClosingSummary | null>;
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

  async function handleUpdate(payload: UpdateCashRegisterPayload) {
    if (!detalhe) return;
    setBusy(true);
    try {
      const updated = await crud.update(detalhe.id, payload);
      if (updated) setDetalhe((prev) => (prev ? { ...prev, ...updated } : prev));
    } finally {
      setBusy(false);
    }
  }

  async function handleClose(payload?: ClosePayload) {
    if (!detalhe) return;
    setBusy(true);
    try {
      const closed = await crud.close(detalhe.id, payload);
      if (closed)
        setDetalhe((prev) =>
          prev
            ? {
                ...prev,
                closedAt: closed.closedAt,
                countedCashInCents: closed.countedCashInCents,
                cashDifferenceInCents: closed.cashDifferenceInCents,
              }
            : prev,
        );
    } finally {
      setBusy(false);
    }
  }

  async function handleReopen() {
    if (!detalhe) return;
    setBusy(true);
    try {
      const reopened = await crud.reopen(detalhe.id);
      if (reopened)
        setDetalhe((prev) =>
          prev ? { ...prev, closedAt: reopened.closedAt } : prev,
        );
    } finally {
      setBusy(false);
    }
  }

  async function fetchClosingSummary() {
    if (!detalhe) return null;
    return crud.getClosingSummary(detalhe.id);
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
    handleUpdate,
    handleClose,
    handleReopen,
    fetchClosingSummary,
    handleRemove,
  };
}
