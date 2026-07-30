"use client";

import { useEffect, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type {
  AccessGroup,
  CreateAccessGroupPayload,
  PermissionCatalogModule,
} from "@/types/access-group.types";

function fromGroup(group: AccessGroup | null): Set<string> {
  return new Set(group?.permissions ?? []);
}

/**
 * Subconjunto de permissões para um profissional com agenda (ver
 * spec-revisao-cliente-1.md §7.3) — o profissional deve ter acesso restrito
 * apenas à área exclusiva de profissional, não ao catálogo completo. Mapeado
 * para os itens mais próximos já existentes no catálogo (nomes exatos do
 * PDF do cliente entre colchetes onde diferem do rótulo atual):
 *   • Agendamento: Cadastrar [Cadastro de agendamento], Atualizar [Edição de
 *     agendamento], Alterar data e hora do agendamento, Cancelar intervalo
 *     [Cadastrar horário bloqueado], Cancelar folga [Remoção de folgas].
 *   • Comanda: Adicionar/Remover produtos [Gerenciar produtos na comanda],
 *     Adicionar/Remover/Editar serviços [Gerenciar serviços na comanda].
 *   • Cliente: Editar notas [Edição de notas].
 */
const PROFISSIONAL_COM_AGENDA_PRESET: { module: string; name: string }[] = [
  { module: "Agendamento", name: "Cadastrar" },
  { module: "Agendamento", name: "Atualizar" },
  { module: "Agendamento", name: "Alterar data e hora do agendamento." },
  { module: "Agendamento", name: "Cancelar intervalo" },
  { module: "Agendamento", name: "Cancelar folga" },
  { module: "Comanda", name: "Adicionar produtos" },
  { module: "Comanda", name: "Remover produtos" },
  { module: "Comanda", name: "Adicionar serviços" },
  { module: "Comanda", name: "Remover serviços" },
  { module: "Comanda", name: "Editar serviço" },
  { module: "Cliente", name: "Editar notas" },
];

export function DialogGrupoAcesso({
  open,
  onOpenChange,
  group,
  catalog,
  catalogLoading,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  group: AccessGroup | null;
  catalog: PermissionCatalogModule[];
  catalogLoading: boolean;
  onSave: (payload: CreateAccessGroupPayload) => Promise<unknown>;
}) {
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openModules, setOpenModules] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(group?.name ?? "");
    setSelected(fromGroup(group));
    setOpenModules(new Set(catalog.length > 0 ? [catalog[0].module] : []));
  }, [open, group, catalog]);

  function toggle(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleModule(mod: PermissionCatalogModule, value: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const item of mod.items) {
        if (value) next.add(item.key);
        else next.delete(item.key);
      }
      return next;
    });
  }

  function toggleModuleOpen(moduleName: string) {
    setOpenModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleName)) next.delete(moduleName);
      else next.add(moduleName);
      return next;
    });
  }

  function applyProfissionalComAgendaPreset() {
    const keys = new Set<string>();
    for (const target of PROFISSIONAL_COM_AGENDA_PRESET) {
      const mod = catalog.find((m) => m.module === target.module);
      const item = mod?.items.find((i) => i.name === target.name);
      if (item) keys.add(item.key);
    }
    setSelected(keys);
    setOpenModules(new Set(PROFISSIONAL_COM_AGENDA_PRESET.map((t) => t.module)));
  }

  function toggleAll(value: boolean) {
    setSelected(() => {
      if (!value) return new Set();
      const next = new Set<string>();
      for (const mod of catalog) {
        for (const item of mod.items) next.add(item.key);
      }
      return next;
    });
  }

  const totalItems = catalog.reduce((acc, m) => acc + m.items.length, 0);
  const allSelected = totalItems > 0 && selected.size === totalItems;

  async function handleSave() {
    if (name.trim().length < 2) {
      toast.error("Informe o nome do grupo.");
      return;
    }
    if (selected.size === 0) {
      toast.error("Selecione ao menos uma permissão.");
      return;
    }
    setSaving(true);
    try {
      const result = await onSave({
        name: name.trim(),
        permissions: Array.from(selected),
      });
      if (result) onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-raised border border-border text-foreground max-w-2xl p-0 gap-0">
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
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-widest text-brand">
                Permissões ({selected.size}/{totalItems})
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={applyProfissionalComAgendaPreset}
                  className="text-[11px] font-semibold text-brand hover:underline"
                >
                  Predefinição: Profissional com agenda
                </button>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <span className="text-[11px] text-muted-foreground">
                    Selecionar tudo
                  </span>
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={(c) => toggleAll(c === true)}
                  />
                </label>
              </div>
            </div>

            {catalogLoading ? (
              <p className="text-xs text-muted-foreground py-6 text-center">
                Carregando permissões…
              </p>
            ) : (
              <div className="space-y-2">
                {catalog.map((mod) => {
                  const moduleKeys = mod.items.map((i) => i.key);
                  const moduleSelectedCount = moduleKeys.filter((k) =>
                    selected.has(k),
                  ).length;
                  const moduleAllOn = moduleSelectedCount === moduleKeys.length;
                  const isOpen = openModules.has(mod.module);
                  return (
                    <div
                      key={mod.module}
                      className="rounded-lg border border-border-subtle overflow-hidden"
                    >
                      <div className="flex items-center gap-2 px-3 py-2 bg-surface-base">
                        <button
                          type="button"
                          onClick={() => toggleModuleOpen(mod.module)}
                          className="flex-1 flex items-center gap-2 text-left"
                        >
                          <ChevronDown
                            className={cn(
                              "size-3.5 text-muted-foreground transition-transform",
                              !isOpen && "-rotate-90",
                            )}
                          />
                          <span className="text-xs font-bold text-foreground">
                            {mod.module}
                          </span>
                          <span className="text-[10px] text-text-faint">
                            {moduleSelectedCount}/{moduleKeys.length}
                          </span>
                        </button>
                        <Checkbox
                          checked={moduleAllOn}
                          onCheckedChange={(c) => toggleModule(mod, c === true)}
                        />
                      </div>
                      {isOpen && (
                        <div className="divide-y divide-border-subtle">
                          {mod.items.map((item) => (
                            <label
                              key={item.key}
                              className="flex items-start gap-2.5 px-3 py-2 cursor-pointer hover:bg-surface-base/50"
                            >
                              <Checkbox
                                className="mt-0.5"
                                checked={selected.has(item.key)}
                                onCheckedChange={() => toggle(item.key)}
                              />
                              <span className="flex-1 min-w-0">
                                <span className="block text-xs font-medium text-foreground">
                                  {item.name}
                                </span>
                                <span className="block text-[11px] text-muted-foreground">
                                  {item.description}
                                </span>
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
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
