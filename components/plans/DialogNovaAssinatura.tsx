"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/shared";
import { clientsService } from "@/services/clients.service";
import { subscriptionsService } from "@/services/subscriptions.service";
import { formatBRL } from "@/utils/format";
import type { Client } from "@/types/client.types";
import type { Plan } from "@/types/plan.types";

interface DialogNovaAssinaturaProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  barbershopId: string;
  plans: Plan[];
  onCreated: () => void;
  /** Pré-seleciona o cliente (ex.: chamado a partir do dialog de agendamento — §5.1). */
  initialClientId?: string;
}

export function DialogNovaAssinatura({
  open,
  onOpenChange,
  barbershopId,
  plans,
  onCreated,
  initialClientId,
}: DialogNovaAssinaturaProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [planId, setPlanId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "CREDIT_CARD" | "PIX_AUTOMATICO" | "PIX_AVULSO"
  >("CREDIT_CARD");
  const [saving, setSaving] = useState(false);
  // Cartão de crédito não cria a Subscription na hora — só quando o gateway
  // confirmar o checkout (webhook). Enquanto isso, mostra o link pra copiar
  // e enviar manualmente (spec-revisao-cliente-4.md §5.1 — envio automático
  // por WhatsApp fica pra uma próxima etapa).
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setSearch("");
    setSelectedClientId(initialClientId ?? "");
    setPlanId("");
    setPaymentMethod("CREDIT_CARD");
    setCheckoutUrl(null);
    setLoadingClients(true);
    clientsService
      .list(barbershopId)
      .then(setClients)
      .catch(() => toast.error("Falha ao carregar clientes."))
      .finally(() => setLoadingClients(false));
  }, [open, barbershopId, initialClientId]);

  const filteredClients = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients.slice(0, 20);
    return clients
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q),
      )
      .slice(0, 20);
  }, [clients, search]);

  const selectedClient = clients.find((c) => c.id === selectedClientId) ?? null;
  const activePlans = plans.filter((p) => p.status === "ACTIVE" && !p.hidden);

  async function handleSave() {
    if (!selectedClientId) {
      toast.error("Selecione um cliente.");
      return;
    }
    if (!planId) {
      toast.error("Selecione um plano.");
      return;
    }
    setSaving(true);
    try {
      const result = await subscriptionsService.createManual(barbershopId, {
        clientId: selectedClientId,
        planId,
        paymentMethod,
      });
      if ("checkoutUrl" in result && result.checkoutUrl) {
        // Cartão de crédito: ainda não é uma assinatura ativa — mostra o
        // link de checkout pra copiar/enviar, sem fechar o dialog.
        setCheckoutUrl(result.checkoutUrl);
        onCreated();
        return;
      }
      toast.success("Assinatura criada.");
      onCreated();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao criar assinatura.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCopyCheckoutUrl() {
    if (!checkoutUrl) return;
    try {
      await navigator.clipboard.writeText(checkoutUrl);
      toast.success("Link copiado.");
    } catch {
      toast.error("Não foi possível copiar o link.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-raised border border-border text-foreground max-w-md p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold">Criar assinatura</DialogTitle>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </DialogHeader>

        {checkoutUrl ? (
          <div className="px-6 py-5 space-y-4">
            <p className="text-sm text-muted-foreground">
              A assinatura será ativada quando o cliente confirmar o pagamento no checkout.
              Por enquanto, copie o link abaixo e envie manualmente (envio automático por
              WhatsApp ainda não está disponível).
            </p>
            <div className="flex items-center gap-2 rounded-md border border-border bg-surface-base px-3 py-2">
              <span className="text-xs text-foreground truncate flex-1">{checkoutUrl}</span>
              <button
                type="button"
                onClick={handleCopyCheckoutUrl}
                className="shrink-0 h-8 px-3 rounded-md text-xs font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors"
              >
                Copiar link
              </button>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="h-10 px-4 rounded-md text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        ) : (
          <>
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-brand">
              Cliente
            </label>
            {selectedClient ? (
              <div className="flex items-center justify-between rounded-md border border-border bg-surface-base h-10 px-3">
                <span className="text-sm text-foreground truncate">
                  {selectedClient.name}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedClientId("")}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Trocar
                </button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou e-mail..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 bg-surface-base border-border text-foreground placeholder:text-text-faint h-10"
                  />
                </div>
                <div className="max-h-40 overflow-y-auto rounded-md border border-border-subtle divide-y divide-border-subtle">
                  {loadingClients ? (
                    <p className="text-xs text-muted-foreground p-3">Carregando…</p>
                  ) : filteredClients.length === 0 ? (
                    <p className="text-xs text-muted-foreground p-3">
                      Nenhum cliente encontrado.
                    </p>
                  ) : (
                    filteredClients.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedClientId(c.id)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-surface-elevated transition-colors"
                      >
                        <p className="text-foreground truncate">{c.name}</p>
                        {c.email && (
                          <p className="text-[11px] text-muted-foreground truncate">
                            {c.email}
                          </p>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </>
            )}
          </div>

          <SelectField
            id="planId"
            label="Plano"
            value={planId}
            onChange={setPlanId}
            options={activePlans.map((p) => ({
              value: p.id,
              label: `${p.name} — ${formatBRL(p.priceInCents / 100)}/mês`,
            }))}
            placeholder="Selecione um plano"
          />

          <SelectField
            id="paymentMethod"
            label="Forma de pagamento"
            value={paymentMethod}
            onChange={(v) =>
              setPaymentMethod(v as "CREDIT_CARD" | "PIX_AUTOMATICO" | "PIX_AVULSO")
            }
            options={[
              { value: "CREDIT_CARD", label: "Cartão de crédito" },
              { value: "PIX_AUTOMATICO", label: "Pix Automático" },
              { value: "PIX_AVULSO", label: "Pix avulso" },
            ]}
          />
          {paymentMethod === "PIX_AVULSO" && (
            <p className="text-xs text-muted-foreground -mt-2">
              Gera uma cobrança Pix sem débito automático — o QR Code de cada mês fica disponível
              na aba Financeiro do cliente.
            </p>
          )}
        </div>

        <div className="px-6 pb-6 pt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-10 px-4 rounded-md text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="h-10 px-4 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors disabled:opacity-60"
          >
            {saving ? "Criando…" : "Criar assinatura"}
          </button>
        </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
