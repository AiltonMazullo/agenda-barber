"use client";

import { useEffect, useState } from "react";
import {
  CreditCard,
  Eye,
  EyeOff,
  Trash2,
  Info,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared";
import { useAuth } from "@/hooks/useAuth";
import { usePaymentData } from "@/hooks/usePaymentData";

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

export default function PagamentosPage() {
  const { barbershop } = useAuth();
  const { data, isLoading, save, remove } = usePaymentData(barbershop?.id);

  const [galaxPayId, setGalaxPayId] = useState("");
  const [galaxPayHash, setGalaxPayHash] = useState("");
  const [galaxPaySecurityToken, setGalaxPaySecurityToken] = useState("");
  const [galaxPayPublicToken, setGalaxPayPublicToken] = useState("");
  const [showSecrets, setShowSecrets] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setGalaxPayId(data?.galaxPayId ?? "");
    setGalaxPayHash(data?.galaxPayHash ?? "");
    setGalaxPaySecurityToken(data?.galaxPaySecurityToken ?? "");
    setGalaxPayPublicToken(data?.galaxPayPublicToken ?? "");
  }, [data]);

  async function handleSave() {
    if (
      !galaxPayId.trim() ||
      !galaxPayHash.trim() ||
      !galaxPaySecurityToken.trim() ||
      !galaxPayPublicToken.trim()
    ) {
      toast.error("Preencha todas as credenciais.");
      return;
    }
    setSaving(true);
    try {
      await save({
        galaxPayId: galaxPayId.trim(),
        galaxPayHash: galaxPayHash.trim(),
        galaxPaySecurityToken: galaxPaySecurityToken.trim(),
        galaxPayPublicToken: galaxPayPublicToken.trim(),
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    if (!confirm("Remover as credenciais de pagamento?")) return;
    await remove();
  }

  const inputType = showSecrets ? "text" : "password";
  const isConfigured = !!data;

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Pagamentos"
        subtitle="Integração com gateway GalaxPay para cobranças recorrentes"
      />

      {/* Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-surface-raised border-border">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div
                className={`size-10 rounded-md flex items-center justify-center shrink-0 ${
                  isConfigured
                    ? "bg-success/15 border border-success/30 text-success-foreground"
                    : "bg-warning/15 border border-warning/30 text-warning-foreground"
                }`}
              >
                {isConfigured ? (
                  <CheckCircle2 className="size-5" />
                ) : (
                  <AlertCircle className="size-5" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-foreground">
                  Status da integração
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isLoading
                    ? "Carregando…"
                    : isConfigured
                      ? "Conectado com a GalaxPay"
                      : "Não configurado"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface-raised border-border">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-md bg-brand/15 border border-brand/30 text-brand flex items-center justify-center shrink-0">
                <CreditCard className="size-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-foreground">
                  Gateway atual
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  GalaxPay — único provedor suportado pelo backend
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-start gap-2 px-3 py-2.5 rounded-md bg-info-bg border border-info/30 text-xs text-info-foreground">
        <Info className="size-3.5 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p>
            As credenciais GalaxPay são usadas para processar cobranças
            recorrentes de planos e mensalidades. Quando o backend expor
            entidades de Assinatura, esta página será expandida.
          </p>
          <a
            href="https://developers.galaxpay.com.br/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-brand hover:underline mt-1"
          >
            <ExternalLink className="size-3" />
            Documentação GalaxPay
          </a>
        </div>
      </div>

      {/* Form de credenciais */}
      <Card className="bg-surface-raised border-border">
        <CardContent className="p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-foreground">
                Credenciais GalaxPay
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Obtenha em sua conta GalaxPay → Configurações → API.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowSecrets((v) => !v)}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              {showSecrets ? (
                <>
                  <EyeOff className="size-3" />
                  Ocultar
                </>
              ) : (
                <>
                  <Eye className="size-3" />
                  Mostrar
                </>
              )}
            </button>
          </div>

          {isLoading ? (
            <p className="text-sm text-text-faint">Carregando…</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <FormLabel required>GalaxPay ID</FormLabel>
                  <Input
                    value={galaxPayId}
                    onChange={(e) => setGalaxPayId(e.target.value)}
                    className="bg-surface-base border-border text-foreground focus-visible:ring-brand/30 h-10 font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <FormLabel required>Hash</FormLabel>
                  <Input
                    type={inputType}
                    value={galaxPayHash}
                    onChange={(e) => setGalaxPayHash(e.target.value)}
                    className="bg-surface-base border-border text-foreground focus-visible:ring-brand/30 h-10 font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <FormLabel required>Security Token</FormLabel>
                  <Input
                    type={inputType}
                    value={galaxPaySecurityToken}
                    onChange={(e) => setGalaxPaySecurityToken(e.target.value)}
                    className="bg-surface-base border-border text-foreground focus-visible:ring-brand/30 h-10 font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <FormLabel required>Public Token</FormLabel>
                  <Input
                    type={inputType}
                    value={galaxPayPublicToken}
                    onChange={(e) => setGalaxPayPublicToken(e.target.value)}
                    className="bg-surface-base border-border text-foreground focus-visible:ring-brand/30 h-10 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2 border-t border-border-subtle">
                {isConfigured ? (
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="h-9 px-4 rounded-md border border-danger/30 bg-transparent text-sm text-danger-foreground hover:bg-danger/10 transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="size-3.5" />
                    Remover credenciais
                  </button>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSave}
                  className="h-9 px-5 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-all disabled:opacity-60"
                >
                  {saving
                    ? "Salvando…"
                    : isConfigured
                      ? "Atualizar credenciais"
                      : "Salvar credenciais"}
                </button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
