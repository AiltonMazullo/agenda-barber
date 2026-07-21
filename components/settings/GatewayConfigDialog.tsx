/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { Copy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { gatewayWebhookUrl } from "@/lib/api";
import type {
  CreatePaymentGatewayPayload,
  GatewayProvider,
  PaymentGatewayConfig,
  UpdatePaymentGatewayPayload,
} from "@/types/payment-gateways.types";

const PROVIDER_LABELS: Record<GatewayProvider, string> = {
  CELCOIN: "CelCoin",
  ASAAS: "ASAAS",
};

function FormLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-xs font-medium text-muted-foreground">
      {children}
    </label>
  );
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: GatewayProvider;
  existing: PaymentGatewayConfig | null;
  barbershopId: string;
  saving: boolean;
  onSave: (
    provider: GatewayProvider,
    payload: CreatePaymentGatewayPayload | UpdatePaymentGatewayPayload,
    existing: boolean,
  ) => Promise<boolean>;
}

/** Formulário dinâmico de credenciais — os campos variam por provider (spec-gateways-pagamento.md §6). */
export function GatewayConfigDialog({
  open,
  onOpenChange,
  provider,
  existing,
  barbershopId,
  saving,
  onSave,
}: Props) {
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [environment, setEnvironment] = useState<"sandbox" | "production">(
    "sandbox",
  );
  const [externalAccountId, setExternalAccountId] = useState("");
  const [webhookToken, setWebhookToken] = useState("");
  const [copied, setCopied] = useState(false);

  const webhookUrl = existing?.webhookUrl ?? gatewayWebhookUrl(provider, barbershopId);

  useEffect(() => {
    if (!open) return;
    // Credenciais nunca voltam completas do backend (só mascaradas) — o
    // formulário de edição sempre parte vazio, exceto `environment`, que não
    // é sensível. `externalAccountId`/`webhookToken` não são mascarados pelo
    // backend, então esses dois podem ser pré-preenchidos ao editar.
    setClientId("");
    setClientSecret("");
    setApiKey("");
    setEnvironment(
      (existing?.credentials.environment as "sandbox" | "production") ??
        "sandbox",
    );
    setExternalAccountId(existing?.externalAccountId ?? "");
    setWebhookToken(existing?.webhookToken ?? "");
  }, [open, existing]);

  async function handleCopyWebhook() {
    await navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSubmit() {
    let payload: CreatePaymentGatewayPayload | UpdatePaymentGatewayPayload;

    if (provider === "CELCOIN") {
      if (!existing && (!clientId.trim() || !clientSecret.trim())) return;
      payload = existing
        ? {
            credentials: {
              ...(clientId.trim() && { clientId: clientId.trim() }),
              ...(clientSecret.trim() && { clientSecret: clientSecret.trim() }),
              environment,
            },
          }
        : {
            provider,
            credentials: {
              clientId: clientId.trim(),
              clientSecret: clientSecret.trim(),
              environment,
            },
          };
    } else {
      if (!existing && !apiKey.trim()) return;
      payload = existing
        ? {
            credentials: {
              ...(apiKey.trim() && { apiKey: apiKey.trim() }),
              environment,
            },
          }
        : {
            provider,
            credentials: { apiKey: apiKey.trim(), environment },
          };
    }

    payload = {
      ...payload,
      externalAccountId: externalAccountId.trim() || undefined,
      webhookToken: webhookToken.trim() || undefined,
    };

    const ok = await onSave(provider, payload, !!existing);
    if (ok) onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {existing ? "Atualizar" : "Configurar"} {PROVIDER_LABELS[provider]}
          </DialogTitle>
        </DialogHeader>

        <div className="min-w-0 space-y-4 pt-2">
          {existing && (
            <p className="text-xs text-muted-foreground">
              Deixe um campo em branco para manter o valor salvo atualmente.
            </p>
          )}

          {provider === "CELCOIN" && (
            <>
              <div className="space-y-1.5">
                <FormLabel>Client ID</FormLabel>
                <Input
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <FormLabel>Client Secret</FormLabel>
                <Input
                  type="password"
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  className="font-mono"
                />
              </div>
              <EnvironmentField value={environment} onChange={setEnvironment} />
            </>
          )}

          {provider === "ASAAS" && (
            <>
              <div className="space-y-1.5">
                <FormLabel>API Key</FormLabel>
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="font-mono"
                />
              </div>
              <EnvironmentField value={environment} onChange={setEnvironment} />
            </>
          )}

          <div className="space-y-1.5">
            <FormLabel>ID da conta externa (opcional)</FormLabel>
            <Input
              value={externalAccountId}
              onChange={(e) => setExternalAccountId(e.target.value)}
              className="font-mono"
              placeholder="Identificador da conta no painel do gateway"
            />
          </div>

          <div className="space-y-1.5">
            <FormLabel>Token do webhook</FormLabel>
            <Input
              type="password"
              value={webhookToken}
              onChange={(e) => setWebhookToken(e.target.value)}
              className="font-mono"
              placeholder="Mesmo token cadastrado no painel do gateway"
            />
            <p className="text-[11px] text-muted-foreground">
              Cadastre este mesmo token no painel do{" "}
              {PROVIDER_LABELS[provider]} ao configurar o webhook — é ele que
              valida que a notificação recebida realmente veio do gateway.
            </p>
          </div>

          <div className="space-y-1.5">
            <FormLabel>URL do webhook</FormLabel>
            <div className="flex min-w-0 items-center gap-1.5">
              <code className="min-w-0 flex-1 truncate rounded-md border border-border bg-muted/50 px-2 py-1.5 text-[11px] text-white">
                {webhookUrl}
              </code>
              <button
                type="button"
                onClick={handleCopyWebhook}
                className="h-8 px-2 rounded-md border border-border bg-transparent text-[11px] text-white hover:bg-muted transition-colors flex items-center gap-1 shrink-0"
              >
                <Copy className="size-3" />
                {copied ? "Copiado!" : "Copiar"}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Cadastre esta URL como destino do webhook no painel do{" "}
              {PROVIDER_LABELS[provider]}.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              disabled={saving}
              onClick={handleSubmit}
              className="h-9 px-5 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-all disabled:opacity-60"
            >
              {saving ? "Salvando…" : "Salvar"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EnvironmentField({
  value,
  onChange,
}: {
  value: "sandbox" | "production";
  onChange: (v: "sandbox" | "production") => void;
}) {
  return (
    <div className="space-y-1.5">
      <FormLabel>Ambiente</FormLabel>
      <div className="flex gap-2">
        {(["sandbox", "production"] as const).map((env) => (
          <button
            key={env}
            type="button"
            onClick={() => onChange(env)}
            className={`h-9 flex-1 rounded-md border text-sm transition-colors ${
              value === env
                ? "border-brand bg-brand/10 text-brand"
                : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {env === "sandbox" ? "Sandbox" : "Produção"}
          </button>
        ))}
      </div>
    </div>
  );
}
