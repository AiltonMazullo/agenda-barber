"use client";

import { useRef } from "react";
import { Camera, Paperclip, FileText, X } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { maskPhone } from "@/utils/format";
import { SectionShell, FieldLabel, INPUT_CLS } from "./Primitives";

interface MidiaPatch {
  photoDataUrl?: string | null;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  contractFileName?: string | null;
}

export function MidiaDocumentos({
  photoDataUrl,
  emergencyContactName,
  emergencyContactPhone,
  contractFileName,
  onChange,
  onUploadPhoto,
}: {
  photoDataUrl: string | null;
  emergencyContactName: string;
  emergencyContactPhone: string;
  contractFileName: string | null;
  onChange: (patch: MidiaPatch) => void;
  /**
   * Upload real da foto (rota de avatar do backend). Quando presente, o
   * arquivo é enviado pra API; sem ele, cai no preview local (data URL).
   */
  onUploadPhoto?: (file: File) => void | Promise<void>;
}) {
  const photoInput = useRef<HTMLInputElement>(null);
  const contractInput = useRef<HTMLInputElement>(null);

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Use uma imagem JPG, PNG ou WebP.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("A foto deve ter no máximo 2MB.");
      return;
    }
    if (onUploadPhoto) {
      void onUploadPhoto(file);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onChange({ photoDataUrl: String(reader.result) });
    reader.readAsDataURL(file);
  }

  function handleContract(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("O contrato deve ser um PDF.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("O contrato deve ter no máximo 10MB.");
      return;
    }
    onChange({ contractFileName: file.name });
  }

  return (
    <SectionShell title="Mídia e documentos">
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6">
        {/* Foto de perfil */}
        <div className="flex flex-col items-center gap-2">
          <FieldLabel>Foto de perfil</FieldLabel>
          <button
            type="button"
            onClick={() => photoInput.current?.click()}
            className="size-24 rounded-full border border-border bg-surface-base bg-cover bg-center grid place-items-center text-muted-foreground hover:border-brand/40 transition-colors overflow-hidden"
            style={
              photoDataUrl
                ? { backgroundImage: `url(${photoDataUrl})` }
                : undefined
            }
          >
            {!photoDataUrl && <Camera className="size-6" />}
          </button>
          <button
            type="button"
            onClick={() => photoInput.current?.click()}
            className="text-xs font-semibold text-brand hover:underline"
          >
            Alterar foto
          </button>
          <span className="text-[10px] text-text-faint">
            JPG/PNG/WebP até 2MB
          </span>
          <input
            ref={photoInput}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handlePhoto}
          />
        </div>

        {/* Contato de emergência + contrato */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <FieldLabel>Contato de emergência</FieldLabel>
            <Input
              value={emergencyContactName}
              onChange={(e) =>
                onChange({ emergencyContactName: e.target.value })
              }
              placeholder="Nome do contato"
              className={INPUT_CLS}
            />
            <Input
              value={emergencyContactPhone}
              onChange={(e) =>
                onChange({ emergencyContactPhone: maskPhone(e.target.value) })
              }
              inputMode="numeric"
              maxLength={15}
              placeholder="Telefone do contato"
              className={INPUT_CLS}
            />
          </div>

          <div className="space-y-1.5">
            <FieldLabel>Contrato de prestação de serviços</FieldLabel>
            {contractFileName ? (
              <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-base px-3 h-12">
                <FileText className="size-4 text-brand shrink-0" />
                <span className="text-sm text-foreground truncate flex-1">
                  {contractFileName}
                </span>
                <button
                  type="button"
                  onClick={() => onChange({ contractFileName: null })}
                  className="text-text-faint hover:text-danger-foreground transition-colors"
                  aria-label="Remover contrato"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => contractInput.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border bg-surface-base py-4 text-muted-foreground hover:border-brand/40 transition-colors"
              >
                <span className="flex items-center gap-1.5 text-sm font-medium">
                  <Paperclip className="size-3.5" />
                  Anexar contrato
                </span>
                <span className="text-[10px] text-text-faint">PDF até 10MB</span>
              </button>
            )}
            <input
              ref={contractInput}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleContract}
            />
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
