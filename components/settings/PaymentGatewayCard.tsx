"use client";

import { useState } from "react";
import { CheckCircle2, Copy, Pencil, Trash2, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { gatewayWebhookUrl } from "@/lib/api";
import type {
  GatewayProvider,
  PaymentGatewayConfig,
} from "@/types/payment-gateways.types";

const PROVIDER_LABELS: Record<GatewayProvider, string> = {
  CELCOIN: "CelCoin",
  ASAAS: "ASAAS",
};

const PROVIDER_DESCRIPTIONS: Record<GatewayProvider, string> = {
  CELCOIN:
    "Gateway padrão (\"Cel Cash\"/antiga GalaxPay) para cobrança de assinaturas.",
  ASAAS: "Gateway alternativo para recebimento de assinaturas/planos.",
};

interface Props {
  provider: GatewayProvider;
  config: PaymentGatewayConfig | undefined;
  barbershopId: string;
  testing: boolean;
  onConfigure: () => void;
  onActivate: () => void;
  onTest: () => void;
  onRemove: () => void;
}

export function PaymentGatewayCard({
  provider,
  config,
  barbershopId,
  testing,
  onConfigure,
  onActivate,
  onTest,
  onRemove,
}: Props) {
  const configured = !!config;
  const [copied, setCopied] = useState(false);
  const webhookUrl = config?.webhookUrl ?? gatewayWebhookUrl(provider, barbershopId);

  async function handleCopyWebhook() {
    await navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card className="min-w-0 bg-surface-raised border-border">
      <CardContent className="min-w-0 p-5 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              {PROVIDER_LABELS[provider]}
              {config?.isDefault && (
                <Badge variant="default" className="bg-brand text-brand-foreground">
                  Ativo
                </Badge>
              )}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {PROVIDER_DESCRIPTIONS[provider]}
            </p>
          </div>
        </div>

        {configured ? (
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Status: {config.status === "ACTIVE" ? "Ativo" : "Inativo"}</p>
            {config.lastTestResult && (
              <p className="flex items-center gap-1">
                {config.lastTestResult === "success" ? (
                  <CheckCircle2 className="size-3 text-emerald-400" />
                ) : null}
                Último teste: {config.lastTestResult}
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Não configurado.</p>
        )}

        <div className="min-w-0 space-y-1">
          <p className="text-[11px] font-medium text-muted-foreground">
            URL do webhook (cadastre no painel do {PROVIDER_LABELS[provider]})
          </p>
          <div className="flex min-w-0 items-center gap-1.5">
            <code className="min-w-0 flex-1 truncate rounded-md border border-border bg-muted/50 px-2 py-1.5 text-[11px] text-white">
              {webhookUrl}
            </code>
            <button
              type="button"
              onClick={handleCopyWebhook}
              className="h-7 px-2 rounded-md border border-border bg-transparent text-[11px] text-white hover:bg-muted transition-colors flex items-center gap-1 shrink-0"
            >
              <Copy className="size-3" />
              {copied ? "Copiado!" : "Copiar"}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            onClick={onConfigure}
            className="h-8 px-3 rounded-md border border-border bg-transparent text-xs text-white hover:bg-muted transition-colors flex items-center gap-1.5"
          >
            <Pencil className="size-3" />
            {configured ? "Editar" : "Configurar"}
          </button>

          {configured && (
            <>
              <button
                type="button"
                disabled={testing}
                onClick={onTest}
                className="h-8 px-3 rounded-md border border-border bg-transparent text-xs text-white hover:bg-muted transition-colors flex items-center gap-1.5 disabled:opacity-60"
              >
                <Zap className="size-3" />
                {testing ? "Testando…" : "Testar conexão"}
              </button>

              {!config.isDefault && (
                <button
                  type="button"
                  onClick={onActivate}
                  className="h-8 px-3 rounded-md bg-brand text-brand-foreground text-xs font-bold hover:bg-brand-hover transition-colors"
                >
                  Ativar
                </button>
              )}

              <button
                type="button"
                onClick={onRemove}
                className="h-8 px-3 rounded-md border border-red-500/30 bg-transparent text-xs text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-1.5 ml-auto"
              >
                <Trash2 className="size-3" />
                Remover
              </button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
