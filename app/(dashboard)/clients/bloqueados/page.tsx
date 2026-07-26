"use client";

import { useMemo, useState } from "react";
import { Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RegistrosAtivosTable } from "@/components/shared/RegistrosAtivosTable";
import { ConfirmDialog, DatePickerField } from "@/components/shared";
import { useAuth } from "@/hooks/useAuth";
import { useClients } from "@/hooks/useClients";
import { useClientBlocks } from "@/hooks/useClientBlocks";
import { formatDate } from "@/utils/format";
import type { ClientBlock } from "@/types/client-block.types";
import type { Client } from "@/types/client.types";

function FormLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
      {children}
      {required && <span className="text-brand">*</span>}
    </label>
  );
}

interface NewBlockDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  clients: Client[];
  onCreate: (payload: {
    clientId: string;
    reason: string;
    blockedUntil: string;
  }) => Promise<unknown>;
}

function NewBlockDialog({
  open,
  onOpenChange,
  clients,
  onCreate,
}: NewBlockDialogProps) {
  const [clientSearch, setClientSearch] = useState("");
  const [clientId, setClientId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [blockedUntil, setBlockedUntil] = useState<Date | undefined>();
  const [saving, setSaving] = useState(false);

  const matches = useMemo(() => {
    const q = clientSearch.trim().toLowerCase();
    if (!q) return [];
    return clients
      .filter((c) => c.name.toLowerCase().includes(q))
      .slice(0, 8);
  }, [clientSearch, clients]);

  const selectedClient = clients.find((c) => c.id === clientId) ?? null;

  function reset() {
    setClientSearch("");
    setClientId(null);
    setReason("");
    setBlockedUntil(undefined);
  }

  async function handleSave() {
    if (!clientId) {
      toast.error("Selecione um cliente.");
      return;
    }
    if (!reason.trim()) {
      toast.error("Informe o motivo do bloqueio.");
      return;
    }
    if (!blockedUntil) {
      toast.error("Informe a data de fim do bloqueio.");
      return;
    }
    setSaving(true);
    try {
      const created = await onCreate({
        clientId,
        reason: reason.trim(),
        blockedUntil: blockedUntil.toISOString(),
      });
      if (created) {
        reset();
        onOpenChange(false);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="bg-surface-raised border border-border text-foreground max-w-md p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold">
              Bloquear Cliente
            </DialogTitle>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <FormLabel required>Cliente</FormLabel>
            {selectedClient ? (
              <div className="flex items-center justify-between h-10 px-3 rounded-md border border-border bg-surface-base text-sm">
                <span className="font-medium">{selectedClient.name}</span>
                <button
                  type="button"
                  onClick={() => setClientId(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  placeholder="Buscar cliente por nome..."
                  className="pl-9 bg-surface-base border-border text-foreground placeholder:text-muted-foreground h-10"
                />
                {matches.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-surface-raised shadow-lg max-h-48 overflow-y-auto">
                    {matches.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setClientId(c.id);
                          setClientSearch("");
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-surface-elevated transition-colors"
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <FormLabel required>Motivo</FormLabel>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Descreva o motivo do bloqueio..."
              className="bg-surface-base border-border text-foreground placeholder:text-text-faint focus-visible:ring-brand/30 resize-none min-h-[80px]"
            />
          </div>

          <DatePickerField
            id="blockedUntil"
            label="Fim do bloqueio *"
            date={blockedUntil}
            onChange={setBlockedUntil}
          />
        </div>

        <div className="px-6 pb-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 px-5 rounded-md border border-border bg-transparent text-sm text-foreground hover:bg-surface-elevated transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="h-9 px-5 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors disabled:opacity-60"
          >
            {saving ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ClientesBloqueadosPage() {
  const { barbershop } = useAuth();
  const { clients } = useClients(barbershop?.id);
  const { blocks, isLoading, refresh, create, remove } = useClientBlocks(
    barbershop?.id,
  );

  const [novoDialog, setNovoDialog] = useState(false);
  const [toRemove, setToRemove] = useState<ClientBlock | null>(null);

  const clientNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of clients) map.set(c.id, c.name);
    return map;
  }, [clients]);

  const rows = useMemo(
    () =>
      blocks.map((b) => ({
        ...b,
        clientName: clientNameMap.get(b.clientId) ?? b.clientId,
      })),
    [blocks, clientNameMap],
  );

  function doRemove() {
    if (!toRemove) return;
    void remove(toRemove.id);
    setToRemove(null);
  }

  return (
    <div className="p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <RegistrosAtivosTable
        title="Clientes Bloqueados"
        subtitle="Clientes com bloqueio ativo para novos agendamentos"
        columns={[
          {
            key: "id",
            label: "ID",
            render: (r) => (
              <span className="font-mono text-xs text-muted-foreground">
                {r.id.slice(0, 8)}…
              </span>
            ),
          },
          { key: "clientName", label: "Cliente" },
          {
            key: "blockedUntil",
            label: "Fim do bloqueio",
            render: (r) => formatDate(r.blockedUntil),
          },
          { key: "reason", label: "Motivo" },
        ]}
        rows={rows}
        isLoading={isLoading}
        emptyLabel="Nenhum cliente bloqueado."
        searchPlaceholder="Buscar por cliente ou motivo..."
        onRefresh={() => void refresh()}
        csvFilename="clientes-bloqueados"
        csvColumns={[
          { key: "id", label: "ID" },
          { key: "clientName", label: "Cliente" },
          { key: "blockedUntil", label: "Fim do bloqueio" },
          { key: "reason", label: "Motivo" },
        ]}
        onCreate={() => setNovoDialog(true)}
        createLabel="Novo"
        createTooltip="Bloqueia um cliente de realizar novos agendamentos até a data informada."
        renderActions={(r) => (
          <button
            type="button"
            onClick={() => setToRemove(r)}
            title="Remover bloqueio"
            className="size-7 rounded-md border border-danger/30 bg-transparent text-danger-foreground flex items-center justify-center hover:bg-danger/10 transition-colors"
          >
            <Trash2 className="size-3" />
          </button>
        )}
      />

      <NewBlockDialog
        open={novoDialog}
        onOpenChange={setNovoDialog}
        clients={clients}
        onCreate={create}
      />

      <ConfirmDialog
        open={toRemove !== null}
        onOpenChange={(v) => !v && setToRemove(null)}
        title="Remover bloqueio?"
        description={
          toRemove
            ? `O cliente "${clientNameMap.get(toRemove.clientId) ?? toRemove.clientId}" poderá voltar a agendar normalmente.`
            : undefined
        }
        confirmLabel="Remover"
        tone="danger"
        onConfirm={doRemove}
      />
    </div>
  );
}
