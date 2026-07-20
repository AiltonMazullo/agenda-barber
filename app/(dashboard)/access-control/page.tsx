"use client";

import { useState } from "react";
import { Shield, Plus, Pencil, Trash2, Users, X, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader, SummaryCard, EmptyState, Loading, Can } from "@/components/shared";
import { DialogGrupoAcesso } from "@/components/access-control/DialogGrupoAcesso";
import { useAuth } from "@/hooks/useAuth";
import { useAccessGroups } from "@/hooks/useAccessGroups";
import { usePermissionsCatalog } from "@/hooks/usePermissionsCatalog";
import type {
  AccessGroup,
  CreateAccessGroupPayload,
} from "@/types/access-group.types";

function permissionsSummary(group: AccessGroup): string {
  const count = group.permissions.length;
  if (count === 0) return "Sem permissões";
  return count === 1 ? "1 permissão selecionada" : `${count} permissões selecionadas`;
}

export default function ControleAcessoPage() {
  const { barbershop } = useAuth();
  const { groups, isLoading, create, update, remove } = useAccessGroups(
    barbershop?.id,
  );
  const { catalog, isLoading: catalogLoading } = usePermissionsCatalog(
    barbershop?.id,
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AccessGroup | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AccessGroup | null>(null);
  const [deleting, setDeleting] = useState(false);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(group: AccessGroup) {
    setEditing(group);
    setDialogOpen(true);
  }

  async function handleSave(payload: CreateAccessGroupPayload) {
    if (editing) {
      return update(editing.id, payload);
    }
    return create(payload);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const ok = await remove(deleteTarget.id);
      if (ok) setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Controle de Acesso"
        subtitle="Grupos de acesso e permissões por módulo"
        actions={
          <Can permission="grupo_de_permissoes.cadastrar">
            <button
              type="button"
              onClick={openCreate}
              className="h-9 px-4 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors flex items-center gap-1.5"
            >
              <Plus className="size-3.5" />
              Novo grupo
            </button>
          </Can>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <SummaryCard
          label="Grupos"
          value={isLoading ? "…" : String(groups.length)}
          icon={<Shield className="size-3.5" />}
          tone="brand"
          emphasized
        />
      </div>

      {isLoading ? (
        <Loading label="Carregando grupos" />
      ) : groups.length === 0 ? (
        <EmptyState message="Nenhum grupo de acesso. Crie um para definir permissões dos profissionais." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {groups.map((g) => (
            <Card key={g.id} className="bg-surface-raised border-border">
              <CardContent className="p-4 flex items-start gap-3">
                <div className="size-10 rounded-lg bg-brand/15 text-brand grid place-items-center shrink-0">
                  <Users className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">
                    {g.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {permissionsSummary(g)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Can permission="grupo_de_permissoes.atualizar">
                    <button
                      type="button"
                      onClick={() => openEdit(g)}
                      className="size-7 rounded-md border border-border bg-surface-base text-muted-foreground flex items-center justify-center hover:border-brand/40 hover:text-brand transition-colors"
                    >
                      <Pencil className="size-3" />
                    </button>
                  </Can>
                  <Can permission="grupo_de_permissoes.apagar">
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(g)}
                      className="size-7 rounded-md border border-danger/30 bg-transparent text-danger-foreground flex items-center justify-center hover:bg-danger/10 transition-colors"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </Can>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <DialogGrupoAcesso
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        group={editing}
        catalog={catalog}
        catalogLoading={catalogLoading}
        onSave={handleSave}
      />

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
      >
        <DialogContent className="bg-surface-raised border border-danger/40 text-foreground max-w-md p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border-subtle">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-4 text-danger-foreground" />
                <DialogTitle className="text-base font-bold">
                  Remover grupo
                </DialogTitle>
              </div>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>
          </DialogHeader>

          <div className="px-6 py-5">
            <p className="text-sm text-muted-foreground">
              Remover o grupo{" "}
              <span className="text-foreground font-bold">
                {deleteTarget?.name}
              </span>
              ? Funcionários vinculados ficarão sem grupo. Essa ação não pode ser
              desfeita.
            </p>
          </div>

          <div className="px-6 pb-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="h-9 px-5 rounded-md border border-border bg-transparent text-sm text-foreground hover:bg-surface-elevated transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={() => void confirmDelete()}
              className="h-9 px-5 rounded-md text-sm font-bold bg-danger text-white hover:bg-danger/90 transition-colors disabled:opacity-60"
            >
              {deleting ? "Removendo…" : "Remover"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
