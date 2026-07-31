"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader, EmptyState, ConfirmDialog, Loading, StatusBadge } from "@/components/shared";
import { useAuth } from "@/hooks/useAuth";
import { useBankAccounts } from "@/hooks/useBankAccounts";
import type { BankAccount } from "@/types/bank-account.types";

export default function ContasBancariasPage() {
  const { barbershop } = useAuth();
  const { accounts, isLoading, remove } = useBankAccounts(barbershop?.id);
  const [toDelete, setToDelete] = useState<BankAccount | null>(null);

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Contas bancárias"
        subtitle="Contas financeiras do sistema"
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/financial"
              className="h-9 px-4 rounded-md border border-border bg-surface-raised text-sm text-foreground hover:bg-surface-elevated transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="size-3.5" />
              Voltar
            </Link>
            <Link
              href="/financial/contas-bancarias/novo"
              className="h-9 px-4 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors flex items-center gap-1.5"
            >
              <Plus className="size-3.5" />
              Novo
            </Link>
          </div>
        }
      />

      <div className="rounded-xl border border-border bg-surface-raised divide-y divide-border-subtle">
        {isLoading ? (
          <Loading />
        ) : accounts.length === 0 ? (
          <div className="py-6">
            <EmptyState message="Nenhuma conta bancária cadastrada." />
          </div>
        ) : (
          accounts.map((acc) => (
            <div
              key={acc.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">{acc.name}</p>
                  <StatusBadge tone={acc.status === "ACTIVE" ? "success" : "neutral"}>
                    {acc.status === "ACTIVE" ? "Ativo" : "Inativo"}
                  </StatusBadge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {acc.bankCode} - {acc.bankName} · Ag. {acc.agency} · Conta {acc.accountNumber}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/financial/contas-bancarias/${acc.id}`}
                  title="Editar"
                  className="size-9 rounded-md border border-border bg-surface-base text-muted-foreground flex items-center justify-center hover:border-brand/40 hover:text-brand transition-colors"
                >
                  <Pencil className="size-3.5" />
                </Link>
                <Link
                  href={`/financial/contas-bancarias/${acc.id}?mode=view`}
                  title="Visualizar"
                  className="size-9 rounded-md border border-info/30 bg-transparent text-info-foreground flex items-center justify-center hover:bg-info/10 transition-colors"
                >
                  <Eye className="size-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => setToDelete(acc)}
                  className="size-9 rounded-md border border-danger/30 bg-transparent text-danger-foreground flex items-center justify-center hover:bg-danger/10 transition-colors"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Remover conta bancária?"
        description={
          toDelete
            ? `"${toDelete.name}" será removida (ou inativada, se estiver em uso).`
            : undefined
        }
        confirmLabel="Remover"
        tone="danger"
        onConfirm={() => toDelete && remove(toDelete.id)}
      />
    </div>
  );
}
