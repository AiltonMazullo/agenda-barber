"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import type { PixQrCode } from "@/types/platform-subscription.types";

interface PixQrCodePanelProps {
  qrCode: PixQrCode;
}

/**
 * QR Code + copia-e-cola do Pix retornado pela ASAAS (`payload`/`encodedImage`
 * em base64). Não há componente equivalente reaproveitável em outro checkout
 * do sistema hoje, então este é intencionalmente simples.
 */
export function PixQrCodePanel({ qrCode }: PixQrCodePanelProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(qrCode.payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard indisponível (ex.: contexto não seguro) — ignora
    }
  }

  return (
    <div className="rounded-lg border border-border bg-surface-elevated p-4 space-y-3">
      <p className="text-sm text-muted-foreground">
        Escaneie o QR Code ou copie o código Pix para pagar a assinatura.
      </p>

      {qrCode.encodedImage && (
        <img
          src={`data:image/png;base64,${qrCode.encodedImage}`}
          alt="QR Code Pix"
          className="size-48 rounded-md border border-border bg-white p-2 mx-auto"
        />
      )}

      <div className="flex items-center gap-2">
        <input
          readOnly
          value={qrCode.payload}
          onFocus={(e) => e.currentTarget.select()}
          className="flex-1 h-10 px-3 rounded-md border border-border bg-surface-base text-xs text-foreground truncate"
        />
        <button
          type="button"
          onClick={handleCopy}
          className="h-10 px-3 rounded-md text-sm font-medium border border-border hover:bg-surface-raised transition-colors flex items-center gap-1.5 shrink-0"
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? "Copiado" : "Copiar"}
        </button>
      </div>

      {qrCode.expirationDate && (
        <p className="text-xs text-muted-foreground">
          Código válido até {new Date(qrCode.expirationDate).toLocaleString("pt-BR")}.
        </p>
      )}
    </div>
  );
}
