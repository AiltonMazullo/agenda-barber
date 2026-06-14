"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, ShieldX, Info } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { client2faStore } from "@/lib/client-2fa-store";

interface TwoFactorButtonProps {
  clientId: string;
}

export function TwoFactorButton({ clientId }: TwoFactorButtonProps) {
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(client2faStore.get(clientId));
  }, [clientId]);

  function toggle() {
    const next = !enabled;
    client2faStore.set(clientId, next);
    setEnabled(next);
    toast.success(
      next
        ? "Autenticação em dois fatores ativada."
        : "Autenticação em dois fatores desativada.",
    );
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="cursor-pointer"
      >
        <ShieldCheck
          className={`size-4 mr-1.5 ${enabled ? "text-green-500" : ""}`}
        />
        Senha em 2FA
        {enabled && (
          <span className="ml-1.5 inline-flex items-center rounded-full border border-green-500/40 bg-green-500/10 px-1.5 text-[10px] font-semibold text-green-500">
            Ativo
          </span>
        )}
      </Button>

      <Dialog open={open} onOpenChange={(o) => setOpen(o)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Autenticação em dois fatores (2FA)</DialogTitle>
            <DialogDescription>
              Adicione uma camada extra de segurança: além da senha, será pedido
              um código de verificação ao entrar.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border border-border-subtle bg-surface-raised p-4 flex items-center gap-3">
            {enabled ? (
              <ShieldCheck className="size-6 text-green-500 shrink-0" />
            ) : (
              <ShieldX className="size-6 text-muted-foreground shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground">
                {enabled ? "2FA está ativo" : "2FA está desativado"}
              </p>
              <p className="text-xs text-muted-foreground">
                {enabled
                  ? "Sua conta está protegida com verificação em duas etapas."
                  : "Ative para proteger melhor o acesso à sua conta."}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-md bg-surface-base border border-border-subtle px-3 py-2">
            <Info className="size-3.5 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-[11px] text-muted-foreground">
              Demonstração local — a verificação real por código passa a valer
              quando o backend habilitar o 2FA.
            </p>
          </div>

          <Button
            type="button"
            onClick={toggle}
            className={
              enabled
                ? "cursor-pointer"
                : "bg-brand hover:bg-brand-hover text-brand-foreground font-bold cursor-pointer"
            }
            variant={enabled ? "outline" : "default"}
          >
            {enabled ? "Desativar 2FA" : "Ativar 2FA"}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
