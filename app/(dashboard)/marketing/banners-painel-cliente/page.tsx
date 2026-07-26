"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RegistrosAtivosTable } from "@/components/shared/RegistrosAtivosTable";
import { ConfirmDialog } from "@/components/shared";
import { useAuth } from "@/hooks/useAuth";
import { useMarketingBanners } from "@/hooks/useMarketingBanners";
import { formatDate } from "@/utils/format";
import type { MarketingBanner } from "@/types/marketing-banner.types";

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

interface BannerDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  banner: MarketingBanner | null;
  onCreate: (payload: { name: string; imageUrl: string }) => Promise<unknown>;
  onUpdate: (
    id: string,
    payload: { name?: string; imageUrl?: string },
  ) => Promise<unknown>;
}

function BannerDialog({
  open,
  onOpenChange,
  banner,
  onCreate,
  onUpdate,
}: BannerDialogProps) {
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(banner?.name ?? "");
    setImageUrl(banner?.imageUrl ?? "");
  }, [open, banner]);

  async function handleSave() {
    if (!name.trim()) {
      toast.error("Informe o nome do banner.");
      return;
    }
    if (!imageUrl.trim()) {
      toast.error("Informe a URL da imagem.");
      return;
    }
    setSaving(true);
    try {
      const result = banner
        ? await onUpdate(banner.id, {
            name: name.trim(),
            imageUrl: imageUrl.trim(),
          })
        : await onCreate({ name: name.trim(), imageUrl: imageUrl.trim() });
      if (result) onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-raised border border-border text-foreground max-w-md p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold">
              {banner ? "Editar Banner" : "Novo Banner"}
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
            <FormLabel required>Nome</FormLabel>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-surface-base border-border text-foreground focus-visible:ring-brand/30 h-10"
            />
          </div>

          <div className="space-y-1.5">
            <FormLabel required>URL da imagem</FormLabel>
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="bg-surface-base border-border text-foreground placeholder:text-text-faint focus-visible:ring-brand/30 h-10"
            />
            {imageUrl.trim() && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt="Prévia do banner"
                className="mt-2 h-24 w-full object-cover rounded-md border border-border-subtle"
              />
            )}
          </div>
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

export default function BannersPainelClientePage() {
  const { barbershop } = useAuth();
  const { banners, isLoading, refresh, create, update, remove } =
    useMarketingBanners(barbershop?.id);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MarketingBanner | null>(null);
  const [toRemove, setToRemove] = useState<MarketingBanner | null>(null);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(b: MarketingBanner) {
    setEditing(b);
    setDialogOpen(true);
  }

  function doRemove() {
    if (!toRemove) return;
    void remove(toRemove.id);
    setToRemove(null);
  }

  return (
    <div className="p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <RegistrosAtivosTable
        title="Banners Painel Cliente"
        subtitle="Banners exibidos no painel do cliente final"
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
          { key: "name", label: "Nome" },
          {
            key: "createdAt",
            label: "Criado em",
            render: (r) => formatDate(r.createdAt),
          },
        ]}
        rows={banners}
        isLoading={isLoading}
        emptyLabel="Nenhum banner cadastrado."
        searchPlaceholder="Buscar por nome..."
        onRefresh={() => void refresh()}
        csvFilename="banners-painel-cliente"
        csvColumns={[
          { key: "id", label: "ID" },
          { key: "name", label: "Nome" },
          { key: "createdAt", label: "Criado em" },
        ]}
        onCreate={openCreate}
        createLabel="Novo"
        renderActions={(r) => (
          <>
            <button
              type="button"
              onClick={() => openEdit(r)}
              className="size-7 rounded-md border border-border bg-surface-base text-muted-foreground flex items-center justify-center hover:border-brand/40 hover:text-brand transition-colors"
            >
              <Pencil className="size-3" />
            </button>
            <button
              type="button"
              onClick={() => setToRemove(r)}
              title="Apagar"
              className="size-7 rounded-md border border-danger/30 bg-transparent text-danger-foreground flex items-center justify-center hover:bg-danger/10 transition-colors"
            >
              <Trash2 className="size-3" />
            </button>
          </>
        )}
      />

      <BannerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        banner={editing}
        onCreate={create}
        onUpdate={update}
      />

      <ConfirmDialog
        open={toRemove !== null}
        onOpenChange={(v) => !v && setToRemove(null)}
        title="Apagar banner?"
        description={
          toRemove ? `O banner "${toRemove.name}" será removido permanentemente.` : undefined
        }
        confirmLabel="Apagar"
        tone="danger"
        onConfirm={doRemove}
      />
    </div>
  );
}
