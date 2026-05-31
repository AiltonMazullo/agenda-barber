"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ACCESS_MODULES } from "@/utils/constants";
import type {
  AccessGroup,
  AccessModulePermission,
  CreateAccessGroupPayload,
} from "@/types/access-group.types";

type Action = "create" | "read" | "update" | "delete";
const ACTIONS: { key: Action; label: string }[] = [
  { key: "read", label: "Ver" },
  { key: "create", label: "Criar" },
  { key: "update", label: "Editar" },
  { key: "delete", label: "Excluir" },
];

type PermMap = Record<string, AccessModulePermission>;

function emptyPermMap(): PermMap {
  const map: PermMap = {};
  for (const m of ACCESS_MODULES) {
    map[m.key] = {
      module: m.key,
      create: false,
      read: false,
      update: false,
      delete: false,
    };
  }
  return map;
}

function fromGroup(group: AccessGroup): PermMap {
  const map = emptyPermMap();
  for (const mod of group.modules) {
    map[mod.module] = { ...mod };
  }
  return map;
}

export function DialogGrupoAcesso({
  open,
  onOpenChange,
  group,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  group: AccessGroup | null;
  onSave: (payload: CreateAccessGroupPayload) => Promise<unknown>;
}) {
  const [name, setName] = useState("");
  const [perms, setPerms] = useState<PermMap>(emptyPermMap());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(group?.name ?? "");
    setPerms(group ? fromGroup(group) : emptyPermMap());
  }, [open, group]);

  function toggle(moduleKey: string, action: Action) {
    setPerms((prev) => ({
      ...prev,
      [moduleKey]: { ...prev[moduleKey], [action]: !prev[moduleKey][action] },
    }));
  }

  function toggleRow(moduleKey: string, value: boolean) {
    setPerms((prev) => ({
      ...prev,
      [moduleKey]: {
        module: moduleKey,
        create: value,
        read: value,
        update: value,
        delete: value,
      },
    }));
  }

  async function handleSave() {
    if (name.trim().length < 2) {
      toast.error("Informe o nome do grupo.");
      return;
    }
    // Envia só os módulos com ao menos uma permissão marcada.
    const modules = Object.values(perms).filter(
      (m) => m.create || m.read || m.update || m.delete,
    );
    setSaving(true);
    try {
      const result = await onSave({ name: name.trim(), modules });
      if (result) onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-raised border border-border text-foreground max-w-lg p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold">
              {group ? "Editar grupo de acesso" : "Novo grupo de acesso"}
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

        <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Nome do grupo
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Recepção, Gerente, Barbeiro"
              className="bg-surface-base border-border text-foreground placeholder:text-text-faint focus-visible:ring-brand/30 h-10"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-brand">
              Permissões por módulo
            </label>
            <div className="rounded-lg border border-border-subtle overflow-hidden">
              {/* Cabeçalho */}
              <div className="grid grid-cols-[1.4fr_repeat(4,minmax(0,1fr))] gap-1 px-3 py-2 bg-surface-base border-b border-border-subtle">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Módulo
                </span>
                {ACTIONS.map((a) => (
                  <span
                    key={a.key}
                    className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center"
                  >
                    {a.label}
                  </span>
                ))}
              </div>
              {/* Linhas */}
              {ACCESS_MODULES.map((m) => {
                const row = perms[m.key];
                const allOn =
                  row.create && row.read && row.update && row.delete;
                return (
                  <div
                    key={m.key}
                    className="grid grid-cols-[1.4fr_repeat(4,minmax(0,1fr))] gap-1 px-3 py-2 items-center border-b border-border-subtle last:border-b-0 hover:bg-surface-base/50"
                  >
                    <button
                      type="button"
                      onClick={() => toggleRow(m.key, !allOn)}
                      className="text-left text-xs font-medium text-foreground hover:text-brand transition-colors truncate"
                      title="Alternar todas"
                    >
                      {m.label}
                    </button>
                    {ACTIONS.map((a) => (
                      <div key={a.key} className="flex justify-center">
                        <Checkbox
                          checked={row[a.key]}
                          onCheckedChange={() => toggle(m.key, a.key)}
                        />
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-text-faint">
              Clique no nome do módulo para marcar/desmarcar a linha inteira.
            </p>
          </div>
        </div>

        <div className="px-6 pb-6 pt-4 border-t border-border-subtle flex justify-end gap-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 px-5 rounded-md border border-border bg-transparent text-sm text-foreground hover:bg-surface-elevated transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="h-9 px-5 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors disabled:opacity-60"
          >
            {saving ? "Salvando…" : group ? "Salvar" : "Criar grupo"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
