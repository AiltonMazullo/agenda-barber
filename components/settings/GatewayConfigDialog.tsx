/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type {
  CreatePaymentGatewayPayload,
  GatewayProvider,
  PaymentGatewayConfig,
  UpdatePaymentGatewayPayload,
} from "@/types/payment-gateways.types";

const PROVIDER_LABELS: Record<GatewayProvider, string> = {
  GALAXPAY: "GalaxPay",
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
  saving,
  onSave,
}: Props) {
  const [galaxPayId, setGalaxPayId] = useState("");
  const [galaxPayHash, setGalaxPayHash] = useState("");
  const [galaxPaySecurityToken, setGalaxPaySecurityToken] = useState("");
  const [galaxPayPublicToken, setGalaxPayPublicToken] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [environment, setEnvironment] = useState<"sandbox" | "production">(
    "sandbox",
  );

  useEffect(() => {
    if (!open) return;
    // Credenciais nunca voltam completas do backend (só mascaradas) — o
    // formulário de edição sempre parte vazio, exceto `environment`, que não
    // é sensível.
    setGalaxPayId("");
    setGalaxPayHash("");
    setGalaxPaySecurityToken("");
    setGalaxPayPublicToken("");
    setClientId("");
    setClientSecret("");
    setApiKey("");
    setEnvironment(
      (existing?.credentials.environment as "sandbox" | "production") ??
        "sandbox",
    );
  }, [open, existing]);

  async function handleSubmit() {
    let payload: CreatePaymentGatewayPayload | UpdatePaymentGatewayPayload;

    if (provider === "GALAXPAY") {
      if (
        !existing &&
        (!galaxPayId.trim() ||
          !galaxPayHash.trim() ||
          !galaxPaySecurityToken.trim() ||
          !galaxPayPublicToken.trim())
      ) {
        return;
      }
      payload = existing
        ? {
            credentials: {
              ...(galaxPayId.trim() && { galaxPayId: galaxPayId.trim() }),
              ...(galaxPayHash.trim() && { galaxPayHash: galaxPayHash.trim() }),
              ...(galaxPaySecurityToken.trim() && {
                galaxPaySecurityToken: galaxPaySecurityToken.trim(),
              }),
              ...(galaxPayPublicToken.trim() && {
                galaxPayPublicToken: galaxPayPublicToken.trim(),
              }),
            },
          }
        : {
            provider,
            credentials: {
              galaxPayId: galaxPayId.trim(),
              galaxPayHash: galaxPayHash.trim(),
              galaxPaySecurityToken: galaxPaySecurityToken.trim(),
              galaxPayPublicToken: galaxPayPublicToken.trim(),
            },
          };
    } else if (provider === "CELCOIN") {
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

        <div className="space-y-4 pt-2">
          {existing && (
            <p className="text-xs text-muted-foreground">
              Deixe um campo em branco para manter o valor salvo atualmente.
            </p>
          )}

          {provider === "GALAXPAY" && (
            <>
              <div className="space-y-1.5">
                <FormLabel>GalaxPay ID</FormLabel>
                <Input
                  value={galaxPayId}
                  onChange={(e) => setGalaxPayId(e.target.value)}
                  className="font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <FormLabel>Hash</FormLabel>
                <Input
                  type="password"
                  value={galaxPayHash}
                  onChange={(e) => setGalaxPayHash(e.target.value)}
                  className="font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <FormLabel>Security Token</FormLabel>
                <Input
                  type="password"
                  value={galaxPaySecurityToken}
                  onChange={(e) => setGalaxPaySecurityToken(e.target.value)}
                  className="font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <FormLabel>Public Token</FormLabel>
                <Input
                  type="password"
                  value={galaxPayPublicToken}
                  onChange={(e) => setGalaxPayPublicToken(e.target.value)}
                  className="font-mono"
                />
              </div>
            </>
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
