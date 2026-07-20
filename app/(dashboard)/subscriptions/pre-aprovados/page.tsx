"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Plus, Send, Trash2, UserCheck } from "lucide-react";
import { toast } from "sonner";
import {
  PageHeader,
  EmptyState,
  ConfirmDialog,
  Loading,
  StatusBadge,
} from "@/components/shared";
import { useAuth } from "@/hooks/useAuth";
import { usePreApprovedClients } from "@/hooks/usePreApprovedClients";
import { formatBRL, formatDate } from "@/utils/format";
import type { PreApprovedClient } from "@/types/pre-approved-client.types";

const STATUS_TONE: Record<PreApprovedClient["status"], "success" | "danger" | "warning"> = {
  SUCESSO: "success",
  ERRO: "danger",
  AGUARDANDO: "warning",
};

const STATUS_LABEL: Record<PreApprovedClient["status"], string> = {
  SUCESSO: "Sucesso",
  ERRO: "Erro",
  AGUARDANDO: "Aguardando",
};

export default function PreAprovadosPage() {
  const { barbershop } = useAuth();
  const { items, isLoading, resendLink, remove } = usePreApprovedClients(barbershop?.id);
  const [toDelete, setToDelete] = useState<PreApprovedClient | null>(null);

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Clientes pré-aprovados"
        subtitle="Pipeline de clientes quase convertidos em assinatura"
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/subscriptions"
              className="h-9 px-4 rounded-md border border-border bg-surface-raised text-sm text-foreground hover:bg-surface-elevated transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="size-3.5" />
              Voltar
            </Link>
            <Link
              href="/subscriptions/pre-aprovados/novo"
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
        ) : items.length === 0 ? (
          <div className="py-6">
            <EmptyState icon={<UserCheck className="size-10" />} message="Nenhum cliente pré-aprovado." />
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">{item.client.name}</p>
                  <StatusBadge tone={STATUS_TONE[item.status]}>
                    {STATUS_LABEL[item.status]}
                  </StatusBadge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {item.plan.name} · {formatBRL(item.plan.priceInCents / 100)} · início em{" "}
                  {formatDate(item.startDate)}
                  {item.cardLast4 && ` · cartão final ${item.cardLast4}`}
                </p>
                {item.errorMessage && (
                  <p className="text-xs text-danger-foreground mt-0.5">{item.errorMessage}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {item.checkoutUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(item.checkoutUrl!);
                      toast.success("Link de checkout copiado.");
                    }}
                    className="h-9 px-3 rounded-md border border-border bg-transparent text-xs font-semibold text-foreground hover:bg-surface-elevated transition-colors flex items-center gap-1.5"
                  >
                    <Copy className="size-3.5" />
                    Copiar link
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => resendLink(item.id)}
                  className="h-9 px-3 rounded-md border border-border bg-transparent text-xs font-semibold text-foreground hover:bg-surface-elevated transition-colors flex items-center gap-1.5"
                >
                  <Send className="size-3.5" />
                  {item.checkoutUrl ? "Gerar novo link" : "Enviar link"}
                </button>
                <button
                  type="button"
                  onClick={() => setToDelete(item)}
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
        title="Remover pré-aprovado?"
        description={
          toDelete ? `O registro de "${toDelete.client.name}" será removido.` : undefined
        }
        confirmLabel="Remover"
        tone="danger"
        onConfirm={() => toDelete && remove(toDelete.id)}
      />
    </div>
  );
}
