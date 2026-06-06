"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw, Trash2, Mail, Phone, UserX } from "lucide-react";
import { PageHeader, EmptyState, ConfirmDialog, Loading } from "@/components/shared";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useClients } from "@/hooks/useClients";
import { useDeactivatedClients } from "@/hooks/useDeactivatedClients";
import type { Client } from "@/types/client.types";

export default function ClientesDesativadosPage() {
  const { barbershop } = useAuth();
  const { clients, isLoading, remove } = useClients(barbershop?.id);
  const { ids, reactivate } = useDeactivatedClients(barbershop?.id);

  const [toDelete, setToDelete] = useState<Client | null>(null);

  const desativados = useMemo(
    () => clients.filter((c) => ids.includes(c.id)),
    [clients, ids],
  );

  function handleReativar(id: string, name: string) {
    reactivate(id);
    toast.success(`"${name}" reativado.`);
  }

  async function doExcluir() {
    if (!toDelete) return;
    const ok = await remove(toDelete.id);
    if (ok) reactivate(toDelete.id); // limpa do store local
  }

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Clientes Desativados"
        subtitle="Reative ou exclua permanentemente"
        actions={
          <Link
            href="/clients"
            className="h-9 px-4 rounded-md border border-border bg-surface-raised text-sm text-foreground hover:bg-surface-elevated transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="size-3.5" />
            Voltar aos clientes
          </Link>
        }
      />

      <div className="rounded-xl border border-border bg-surface-raised divide-y divide-border-subtle">
        {isLoading ? (
          <Loading />
        ) : desativados.length === 0 ? (
          <div className="py-6">
            <EmptyState
              icon={<UserX className="size-10" />}
              message="Nenhum cliente desativado."
            />
          </div>
        ) : (
          desativados.map((c) => (
            <div
              key={c.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  {c.name}
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-0.5">
                  <span className="flex items-center gap-1">
                    <Mail className="size-3" />
                    {c.email}
                  </span>
                  {c.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="size-3" />
                      {c.phone}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleReativar(c.id, c.name)}
                  className="h-9 px-3 rounded-md border border-success-foreground/40 bg-transparent text-xs font-semibold text-success-foreground hover:bg-success/10 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="size-3.5" />
                  Reativar
                </button>
                <button
                  type="button"
                  onClick={() => setToDelete(c)}
                  className="h-9 px-3 rounded-md border border-danger/30 bg-transparent text-xs font-semibold text-danger-foreground hover:bg-danger/10 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="size-3.5" />
                  Excluir
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Excluir permanentemente?"
        description={
          toDelete
            ? `"${toDelete.name}" será excluído definitivamente. Esta ação não pode ser desfeita.`
            : undefined
        }
        confirmLabel="Excluir"
        tone="danger"
        onConfirm={doExcluir}
      />
    </div>
  );
}
