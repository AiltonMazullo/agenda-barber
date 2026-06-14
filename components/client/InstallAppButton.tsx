"use client";

import { useEffect, useState } from "react";
import { Smartphone, Share, Plus, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

/** Evento não-padrão do Chrome para instalação de PWA. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallAppButton() {
  const [open, setOpen] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );

  useEffect(() => {
    function onPrompt(e: Event) {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  async function handleInstall() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setOpen(false);
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="cursor-pointer"
      >
        <Smartphone className="size-4 mr-1.5" />
        Adicione esse app no seu celular
      </Button>

      <Dialog open={open} onOpenChange={(o) => setOpen(o)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicione o app no seu celular</DialogTitle>
            <DialogDescription>
              Instale um atalho na tela inicial e acesse seus agendamentos com um
              toque, como um aplicativo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-border-subtle bg-surface-raised p-3 space-y-1.5">
              <p className="font-bold text-foreground flex items-center gap-1.5">
                <Smartphone className="size-4 text-brand" />
                Android (Chrome)
              </p>
              <p className="text-muted-foreground flex items-center gap-1.5">
                Toque em <MoreVertical className="size-3.5 inline" /> e escolha
                <span className="font-semibold text-foreground">
                  &nbsp;“Adicionar à tela inicial”
                </span>
                .
              </p>
            </div>

            <div className="rounded-lg border border-border-subtle bg-surface-raised p-3 space-y-1.5">
              <p className="font-bold text-foreground flex items-center gap-1.5">
                <Share className="size-4 text-brand" />
                iPhone (Safari)
              </p>
              <p className="text-muted-foreground flex items-center gap-1.5">
                Toque em <Share className="size-3.5 inline" /> e escolha
                <span className="font-semibold text-foreground">
                  &nbsp;“Adicionar à Tela de Início”
                </span>{" "}
                <Plus className="size-3.5 inline" />.
              </p>
            </div>
          </div>

          {deferred && (
            <Button
              type="button"
              onClick={handleInstall}
              className="bg-brand hover:bg-brand-hover text-brand-foreground font-bold cursor-pointer"
            >
              <Smartphone className="size-4 mr-1.5" />
              Instalar agora
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
