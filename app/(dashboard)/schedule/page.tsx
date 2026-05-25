"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  LayoutGrid,
  LayoutList,
  Calendar as CalendarIcon,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/shared";
import {
  DialogDetalhe,
  DialogNovoAgendamento,
  ModoLista,
  ResumoDia,
  ServicoColuna,
} from "@/components/schedule";
import { useAuth } from "@/hooks/useAuth";
import { useAppointments } from "@/hooks/useAppointments";
import { useServices } from "@/hooks/useServices";
import type { Appointment } from "@/types/appointment.types";
import type { ScheduleViewMode } from "@/types/schedule.types";

export default function SchedulePage() {
  const { barbershop } = useAuth();
  const {
    appointments,
    isLoading: loadingAppts,
    create,
    updateStatus,
    cancel,
  } = useAppointments(barbershop?.id);
  const { services, isLoading: loadingServices } = useServices(barbershop?.id);

  const [viewMode, setViewMode] = useState<ScheduleViewMode>("kanban");
  const [novoDialog, setNovoDialog] = useState(false);
  const [detalheDialog, setDetalheDialog] = useState(false);
  const [selected, setSelected] = useState<Appointment | null>(null);

  const activeServices = useMemo(
    () => services.filter((s) => s.barbershopId),
    [services],
  );

  const apptsByService = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const s of activeServices) map.set(s.id, []);
    for (const a of appointments) {
      const list = map.get(a.serviceId);
      if (list) list.push(a);
    }
    return map;
  }, [activeServices, appointments]);

  function handleCardClick(a: Appointment) {
    setSelected(a);
    setDetalheDialog(true);
  }

  async function handleUpdateStatus(
    id: string,
    status: "CONFIRMED" | "CANCELLED" | "COMPLETED",
  ) {
    await updateStatus(id, status);
  }

  async function handleDelete(id: string) {
    await cancel(id);
  }

  const dataFormatada = format(new Date(), "EEEE, dd MMM yyyy", {
    locale: ptBR,
  });
  const dataCapitalizada =
    dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1);

  return (
    <>
      <style>{`
        .schedule-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
        .schedule-scroll::-webkit-scrollbar-track { background: #0d1117; }
        .schedule-scroll::-webkit-scrollbar-thumb { background: #30363d; border-radius: 3px; }
        .schedule-scroll::-webkit-scrollbar-thumb:hover { background: #484f58; }
        .schedule-scroll { scrollbar-width: thin; scrollbar-color: #30363d #0d1117; }
      `}</style>

      <div className="flex flex-col min-h-screen bg-surface-base text-foreground">
        <div className="p-4 md:p-6 pb-0">
          <PageHeader
            title="Agendamentos"
            subtitle={dataCapitalizada}
            actions={
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-surface-raised border border-border rounded-md h-9 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setViewMode("kanban")}
                    className={cn(
                      "h-9 px-3 flex items-center gap-1.5 text-xs transition-colors",
                      viewMode === "kanban"
                        ? "bg-surface-elevated text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated",
                    )}
                  >
                    <LayoutGrid className="size-3.5" />
                    Kanban
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("lista")}
                    className={cn(
                      "h-9 px-3 flex items-center gap-1.5 text-xs transition-colors",
                      viewMode === "lista"
                        ? "bg-surface-elevated text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated",
                    )}
                  >
                    <LayoutList className="size-3.5" />
                    Lista
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setNovoDialog(true)}
                  className="h-9 px-4 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-all flex items-center gap-1.5"
                >
                  <Plus className="size-3.5" />
                  Novo
                </button>
              </div>
            }
          />
        </div>

        <ResumoDia appointments={appointments} />

        <div className="flex-1 overflow-hidden">
          {viewMode === "kanban" ? (
            <div className="h-full p-4 md:p-6 overflow-x-auto schedule-scroll">
              {loadingServices || loadingAppts ? (
                <div className="text-center py-20 text-text-faint text-sm">
                  Carregando…
                </div>
              ) : activeServices.length === 0 ? (
                <div className="max-w-md mx-auto text-center py-20">
                  <CalendarIcon className="size-12 text-text-faint mx-auto mb-4" />
                  <p className="text-sm text-foreground font-semibold">
                    Cadastre serviços primeiro
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    O kanban organiza os agendamentos por serviço. Vá em
                    Configurações → Serviços para adicionar.
                  </p>
                </div>
              ) : (
                <div className="flex gap-3 h-full">
                  {activeServices.map((service) => (
                    <ServicoColuna
                      key={service.id}
                      service={service}
                      appointments={apptsByService.get(service.id) ?? []}
                      onCardClick={handleCardClick}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <ModoLista
              appointments={appointments}
              isLoading={loadingAppts}
              onCardClick={handleCardClick}
            />
          )}
        </div>

        <DialogNovoAgendamento
          open={novoDialog}
          onOpenChange={setNovoDialog}
          services={activeServices}
          onCreate={create}
        />

        <DialogDetalhe
          open={detalheDialog}
          onOpenChange={setDetalheDialog}
          appointment={selected}
          onUpdateStatus={handleUpdateStatus}
          onDelete={handleDelete}
        />
      </div>
    </>
  );
}
