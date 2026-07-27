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
import { useClubBanners } from "@/hooks/useClubBanners";
import { formatDate } from "@/utils/format";
import { apiAssetUrl } from "@/lib/api";
import type { ClubBanner } from "@/types/club-banner.types";

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

interface ClubBannerDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  banner: ClubBanner | null;
  onCreate: (payload: { fileName: string; file: File }) => Promise<unknown>;
  onUpdate: (
    id: string,
    payload: { fileName?: string; file?: File },
  ) => Promise<unknown>;
}

function ClubBannerDialog({
  open,
  onOpenChange,
  banner,
  onCreate,
  onUpdate,
}: ClubBannerDialogProps) {
  const [fileName, setFileName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFileName(banner?.fileName ?? "");
    setFile(null);
    setPreviewUrl(banner ? apiAssetUrl(banner.imageUrl) : null);
  }, [open, banner]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    if (selected && !fileName.trim()) setFileName(selected.name);
    setPreviewUrl(
      selected
        ? URL.createObjectURL(selected)
        : banner
          ? apiAssetUrl(banner.imageUrl)
          : null,
    );
  }

  async function handleSave() {
    if (!fileName.trim()) {
      toast.error("Informe o nome do arquivo.");
      return;
    }
    if (!file && !banner) {
      toast.error("Selecione o arquivo de imagem.");
      return;
    }
    setSaving(true);
    try {
      const result = banner
        ? await onUpdate(banner.id, {
            fileName: fileName.trim(),
            ...(file && { file }),
          })
        : await onCreate({ fileName: fileName.trim(), file: file as File });
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
            <FormLabel required>Arquivo</FormLabel>
            <Input
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Ex.: banner-verao.png"
              className="bg-surface-base border-border text-foreground placeholder:text-text-faint focus-visible:ring-brand/30 h-10"
            />
          </div>

          <div className="space-y-1.5">
            <FormLabel required={!banner}>Imagem</FormLabel>
            <Input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="bg-surface-base border-border text-foreground file:text-foreground focus-visible:ring-brand/30 h-10"
            />
            {previewUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
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

export default function ClubeBannersPage() {
  const { barbershop } = useAuth();
  const { banners, isLoading, refresh, create, update, remove } =
    useClubBanners(barbershop?.id);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ClubBanner | null>(null);
  const [toRemove, setToRemove] = useState<ClubBanner | null>(null);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(b: ClubBanner) {
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
        title={`${barbershop?.clubName || "Clube do Assinante"} — Banners`}
        subtitle={`Banners exibidos na área do ${barbershop?.clubName || "Clube do Assinante"}`}
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
          { key: "fileName", label: "Arquivo" },
          {
            key: "createdAt",
            label: "Criado em",
            render: (r) => formatDate(r.createdAt),
          },
          {
            key: "imageUrl",
            label: "Imagem",
            render: (r) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={apiAssetUrl(r.imageUrl) ?? ""}
                alt={r.fileName}
                className="size-10 object-cover rounded-md border border-border-subtle"
              />
            ),
          },
        ]}
        rows={banners}
        isLoading={isLoading}
        emptyLabel="Nenhum banner cadastrado."
        searchPlaceholder="Buscar por arquivo..."
        onRefresh={() => void refresh()}
        csvFilename="clube-banners"
        csvColumns={[
          { key: "id", label: "ID" },
          { key: "fileName", label: "Arquivo" },
          { key: "createdAt", label: "Criado em" },
          { key: "imageUrl", label: "URL da imagem" },
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

      <ClubBannerDialog
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
          toRemove
            ? `O banner "${toRemove.fileName}" será removido permanentemente.`
            : undefined
        }
        confirmLabel="Apagar"
        tone="danger"
        onConfirm={doRemove}
      />
    </div>
  );
}
