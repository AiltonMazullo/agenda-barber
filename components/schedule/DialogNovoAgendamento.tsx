"use client";

import { useEffect, useState } from "react";
import { X, ChevronDown, Timer } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type {
  Appointment,
  CreateAppointmentPayload,
} from "@/types/appointment.types";
import type { Service } from "@/types/service.types";

function toLocalDateInput(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

interface FormState {
  serviceId: string;
  scheduledDate: string;
  scheduledTime: string;
  clientId: string;
}

interface DialogNovoAgendamentoProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  services: Service[];
  prefilledServiceId?: string;
  onCreate: (payload: CreateAppointmentPayload) => Promise<Appointment | null>;
}

export function DialogNovoAgendamento({
  open,
  onOpenChange,
  services,
  prefilledServiceId,
  onCreate,
}: DialogNovoAgendamentoProps) {
  const [form, setForm] = useState<FormState>({
    serviceId: "",
    scheduledDate: toLocalDateInput(new Date()),
    scheduledTime: "09:00",
    clientId: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({
      serviceId: prefilledServiceId ?? services[0]?.id ?? "",
      scheduledDate: toLocalDateInput(new Date()),
      scheduledTime: "09:00",
      clientId: "",
    });
  }, [open, services, prefilledServiceId]);

  const selectedService = services.find((s) => s.id === form.serviceId);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    if (!form.serviceId) {
      toast.error("Selecione um serviço.");
      return;
    }
    if (!form.scheduledDate || !form.scheduledTime) {
      toast.error("Informe data e hora.");
      return;
    }

    const [hh, mm] = form.scheduledTime.split(":").map(Number);
    const [yyyy, MM, dd] = form.scheduledDate.split("-").map(Number);
    const scheduledAt = new Date(yyyy, MM - 1, dd, hh, mm).toISOString();

    const payload: CreateAppointmentPayload = {
      serviceId: form.serviceId,
      scheduledAt,
    };
    if (form.clientId.trim()) {
      payload.clientId = form.clientId.trim();
    }

    setSaving(true);
    try {
      const created = await onCreate(payload);
      if (created) {
        onOpenChange(false);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-raised border border-border text-foreground max-w-md p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold">
              Novo Agendamento
            </DialogTitle>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-brand">
              Serviço
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger className="w-full">
                <div className="w-full h-10 px-3 rounded-md border border-border bg-surface-base text-sm text-foreground flex items-center justify-between gap-2 hover:border-brand/40 transition-colors cursor-pointer">
                  {selectedService ? (
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="size-2 rounded-full shrink-0"
                        style={{
                          backgroundColor: selectedService.hex ?? "#f5b82e",
                        }}
                      />
                      <span className="truncate text-sm">
                        {selectedService.name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-text-faint">
                      Selecione um serviço
                    </span>
                  )}
                  <ChevronDown className="size-3.5 text-muted-foreground shrink-0" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-surface-raised border-border text-foreground max-h-60 overflow-y-auto">
                {services.length === 0 ? (
                  <DropdownMenuItem disabled className="text-xs text-text-faint">
                    Cadastre serviços em Configurações primeiro
                  </DropdownMenuItem>
                ) : (
                  services.map((s) => (
                    <DropdownMenuItem
                      key={s.id}
                      onClick={() => update("serviceId", s.id)}
                      className={cn(
                        "text-xs hover:bg-surface-elevated cursor-pointer",
                        form.serviceId === s.id && "text-brand",
                      )}
                    >
                      <span
                        className="size-2 rounded-full mr-2 shrink-0"
                        style={{ backgroundColor: s.hex ?? "#f5b82e" }}
                      />
                      {s.name}
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-brand">
                Data
              </label>
              <Input
                type="date"
                value={form.scheduledDate}
                onChange={(e) => update("scheduledDate", e.target.value)}
                className="bg-surface-base border-border text-foreground focus-visible:ring-brand/30 h-10"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-brand">
                Hora
              </label>
              <Input
                type="time"
                value={form.scheduledTime}
                onChange={(e) => update("scheduledTime", e.target.value)}
                className="bg-surface-base border-border text-foreground focus-visible:ring-brand/30 h-10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              ID do Cliente (opcional)
            </label>
            <Input
              value={form.clientId}
              onChange={(e) => update("clientId", e.target.value)}
              placeholder="Deixe em branco se a API não exigir"
              className="bg-surface-base border-border text-foreground placeholder:text-text-faint focus-visible:ring-brand/30 h-10 font-mono text-xs"
            />
            <p className="text-[10px] text-text-faint">
              O backend ainda não expõe cadastro de clientes. Cole o CUID de um
              cliente existente se necessário.
            </p>
          </div>

          {selectedService && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-surface-base border border-border-subtle">
              <Timer className="size-3.5 text-brand" />
              <span className="text-xs text-muted-foreground">Duração:</span>
              <span className="text-xs font-bold text-foreground">
                {selectedService.durationMin} min
              </span>
              <span className="text-xs text-text-subtle ml-auto">
                {(selectedService.priceInCents / 100).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
            </div>
          )}
        </div>

        <div className="px-6 pb-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 px-5 rounded-md border border-border bg-transparent text-sm text-foreground hover:bg-surface-elevated transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="h-9 px-5 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors disabled:opacity-60"
          >
            {saving ? "Criando…" : "Agendar"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
