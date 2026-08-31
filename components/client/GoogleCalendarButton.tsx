"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, CalendarCheck2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/shared";
import { googleCalendarService } from "@/services/google-calendar.service";
import type { GoogleCalendarStatus } from "@/types/google-calendar.types";

function ToggleRow({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
          checked ? "bg-brand" : "bg-surface-base border border-border"
        }`}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-0.5 left-0.5 size-5 rounded-full bg-white transition-transform duration-150"
          style={{ transform: checked ? "translateX(22px)" : "translateX(0)" }}
        />
      </button>
    </div>
  );
}

export function GoogleCalendarButton() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<GoogleCalendarStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);

  function loadStatus() {
    setLoading(true);
    googleCalendarService
      .status()
      .then(setStatus)
      .catch(() => setStatus({ connected: false, enabled: false, googleEmail: null }))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadStatus();
  }, []);

  // Volta do redirect OAuth (`/perfil?googleCalendar=connected`) — recarrega
  // o status e limpa o parâmetro da URL.
  useEffect(() => {
    if (searchParams.get("googleCalendar") !== "connected") return;
    toast.success("Google Agenda conectado.");
    loadStatus();
    router.replace(window.location.pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  async function handleConnect() {
    setConnecting(true);
    try {
      const url = await googleCalendarService.getAuthUrl();
      window.location.href = url;
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Não foi possível iniciar a conexão.",
      );
      setConnecting(false);
    }
  }

  async function handleToggle(enabled: boolean) {
    setToggling(true);
    try {
      const next = await googleCalendarService.setEnabled(enabled);
      setStatus(next);
      toast.success(
        enabled
          ? "Sincronização automática ativada."
          : "Sincronização automática desativada.",
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao atualizar.");
    } finally {
      setToggling(false);
    }
  }

  async function handleDisconnect() {
    try {
      await googleCalendarService.disconnect();
      setStatus({ connected: false, enabled: false, googleEmail: null });
      toast.success("Google Agenda desconectado.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao desconectar.");
    } finally {
      setConfirmDisconnect(false);
    }
  }

  const connected = status?.connected ?? false;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="cursor-pointer"
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="size-4 mr-1.5 animate-spin" />
        ) : connected ? (
          <CalendarCheck2 className="size-4 mr-1.5 text-success-foreground" />
        ) : (
          <CalendarDays className="size-4 mr-1.5" />
        )}
        Google Agenda
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Google Agenda</DialogTitle>
            <DialogDescription>
              Conecte sua conta uma vez e mantenha ligado: enquanto estiver
              ativo, todo agendamento seu é sincronizado automaticamente com o
              Google Agenda — sem precisar adicionar manualmente.
            </DialogDescription>
          </DialogHeader>

          {!connected ? (
            <div className="rounded-lg border border-border-subtle bg-surface-raised p-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                Sua conta ainda não está conectada.
              </p>
              <Button
                type="button"
                onClick={handleConnect}
                disabled={connecting}
                className="bg-brand hover:bg-brand-hover text-brand-foreground font-bold cursor-pointer w-full"
              >
                {connecting ? (
                  <Loader2 className="size-4 mr-1.5 animate-spin" />
                ) : (
                  <CalendarDays className="size-4 mr-1.5" />
                )}
                Conectar Google Agenda
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border border-border-subtle bg-surface-raised p-4 space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <CalendarCheck2 className="size-4 text-success-foreground shrink-0" />
                  <span className="text-foreground font-medium truncate">
                    {status?.googleEmail ?? "Conta conectada"}
                  </span>
                </div>
                <ToggleRow
                  label="Sincronização automática"
                  description="Cria, atualiza e remove os eventos na sua agenda a cada agendamento."
                  checked={status?.enabled ?? false}
                  disabled={toggling}
                  onChange={handleToggle}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirmDisconnect(true)}
                className="cursor-pointer w-full text-danger-foreground"
              >
                Desconectar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={confirmDisconnect}
        onOpenChange={setConfirmDisconnect}
        title="Desconectar o Google Agenda?"
        description="Seus agendamentos deixarão de ser sincronizados automaticamente."
        confirmLabel="Desconectar"
        tone="danger"
        onConfirm={() => void handleDisconnect()}
      />
    </>
  );
}
