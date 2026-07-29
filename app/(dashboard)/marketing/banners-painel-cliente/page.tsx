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
import { apiAssetUrl } from "@/lib/api";
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

/** Um slot de imagem por posição (1/2/3) — cada um com sua resolução recomendada (ver ajustes/Gestão.md §Banners). */
const IMAGE_SLOTS = [
  { key: "image1", removeKey: "removeImage1", label: "Recomendado 350 x 220 pixels" },
  { key: "image2", removeKey: "removeImage2", label: "Recomendado 640 x 250 pixels" },
  { key: "image3", removeKey: "removeImage3", label: "Recomendado 700 x 300 pixels" },
] as const;

interface BannerDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  banner: MarketingBanner | null;
  onCreate: (payload: {
    name: string;
    linkUrl?: string;
    image1?: File;
    image2?: File;
    image3?: File;
  }) => Promise<unknown>;
  onUpdate: (
    id: string,
    payload: {
      name?: string;
      linkUrl?: string;
      image1?: File;
      image2?: File;
      image3?: File;
      removeImage1?: boolean;
      removeImage2?: boolean;
      removeImage3?: boolean;
    },
  ) => Promise<unknown>;
}

function BannerImageSlot({
  label,
  previewUrl,
  onFileChange,
  onRemove,
}: {
  label: string;
  previewUrl: string | null;
  onFileChange: (file: File | null) => void;
  onRemove: () => void;
}) {
  return (
    <div className="space-y-1.5">
      {previewUrl ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Prévia do banner"
            className="h-28 w-full object-cover rounded-md border border-border-subtle"
          />
          <button
            type="button"
            onClick={onRemove}
            className="absolute inset-x-0 bottom-0 h-8 flex items-center justify-center gap-1.5 rounded-b-md bg-danger/90 text-xs font-bold text-white hover:bg-danger transition-colors"
          >
            <X className="size-3" />
            Remover
          </button>
        </div>
      ) : (
        <Input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
          className="bg-surface-base border-border text-foreground file:text-foreground focus-visible:ring-brand/30 h-10"
        />
      )}
      <p className="text-[11px] text-muted-foreground text-center">{label}</p>
    </div>
  );
}

function BannerDialog({
  open,
  onOpenChange,
  banner,
  onCreate,
  onUpdate,
}: BannerDialogProps) {
  const [name, setName] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [removedSlots, setRemovedSlots] = useState<Record<string, boolean>>({});
  const [previewUrls, setPreviewUrls] = useState<Record<string, string | null>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(banner?.name ?? "");
    setLinkUrl(banner?.linkUrl ?? "");
    setFiles({});
    setRemovedSlots({});
    setPreviewUrls({
      image1: banner?.imageUrl1 ? apiAssetUrl(banner.imageUrl1) : null,
      image2: banner?.imageUrl2 ? apiAssetUrl(banner.imageUrl2) : null,
      image3: banner?.imageUrl3 ? apiAssetUrl(banner.imageUrl3) : null,
    });
  }, [open, banner]);

  function handleFileChange(key: string, file: File | null) {
    setFiles((prev) => ({ ...prev, [key]: file }));
    setRemovedSlots((prev) => ({ ...prev, [key]: false }));
    setPreviewUrls((prev) => ({
      ...prev,
      [key]: file ? URL.createObjectURL(file) : null,
    }));
  }

  function handleRemoveSlot(key: string) {
    setFiles((prev) => ({ ...prev, [key]: null }));
    setRemovedSlots((prev) => ({ ...prev, [key]: true }));
    setPreviewUrls((prev) => ({ ...prev, [key]: null }));
  }

  async function handleSave() {
    if (!name.trim()) {
      toast.error("Informe o nome do banner.");
      return;
    }
    setSaving(true);
    try {
      const result = banner
        ? await onUpdate(banner.id, {
            name: name.trim(),
            linkUrl: linkUrl.trim(),
            image1: files.image1 ?? undefined,
            image2: files.image2 ?? undefined,
            image3: files.image3 ?? undefined,
            removeImage1: removedSlots.image1,
            removeImage2: removedSlots.image2,
            removeImage3: removedSlots.image3,
          })
        : await onCreate({
            name: name.trim(),
            linkUrl: linkUrl.trim(),
            image1: files.image1 ?? undefined,
            image2: files.image2 ?? undefined,
            image3: files.image3 ?? undefined,
          });
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

          <div className="grid grid-cols-3 gap-3">
            {IMAGE_SLOTS.map((slot) => (
              <BannerImageSlot
                key={slot.key}
                label={slot.label}
                previewUrl={previewUrls[slot.key] ?? null}
                onFileChange={(file) => handleFileChange(slot.key, file)}
                onRemove={() => handleRemoveSlot(slot.key)}
              />
            ))}
          </div>

          <div className="space-y-1.5">
            <FormLabel>Link</FormLabel>
            <Input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://wa.me/5511999999999?text=..."
              className="bg-surface-base border-border text-foreground focus-visible:ring-brand/30 h-10"
            />
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
