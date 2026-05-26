"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  LayoutGrid,
  LayoutList,
  Calendar as CalendarIcon,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/shared";
import {
  DialogDetalhe,
  DialogNovoAgendamento,
  ModoLista,
  ProfissionalColuna,
  ResumoDia,
} from "@/components/schedule";
import { useAuth } from "@/hooks/useAuth";
import { useAppointments } from "@/hooks/useAppointments";
import { useEmployees } from "@/hooks/useEmployees";
import { useServices } from "@/hooks/useServices";
import { useAppointmentEmployeeMap } from "@/hooks/useAppointmentEmployeeMap";
import type {
  Appointment,
  CreateAppointmentPayload,
} from "@/types/appointment.types";
import type { ScheduleViewMode } from "@/types/schedule.types";

const UNASSIGNED = "__unassigned__";

export default function SchedulePage() {
  const { barbershop } = useAuth();
  const {
    appointments,
    isLoading: loadingAppts,
    create,
    updateStatus,
    cancel,
  } = useAppointments(barbershop?.id);
  const { employees, isLoading: loadingEmployees } = useEmployees(
    barbershop?.id,
  );
  const { services, isLoading: loadingServices } = useServices(barbershop?.id);
  const { map: employeeMap, setEmployee, removeEmployee } =
    useAppointmentEmployeeMap();

  const [viewMode, setViewMode] = useState<ScheduleViewMode>("kanban");
  const [novoDialog, setNovoDialog] = useState(false);
  const [prefilledEmployeeId, setPrefilledEmployeeId] = useState<
    string | undefined
  >(undefined);
  const [detalheDialog, setDetalheDialog] = useState(false);
  const [selected, setSelected] = useState<Appointment | null>(null);

  // Mapeia appointments para colunas: { [employeeId | __unassigned__]: Appointment[] }
  const apptsByEmployee = useMemo(() => {
    const result = new Map<string, Appointment[]>();
    for (const e of employees) result.set(e.id, []);
    result.set(UNASSIGNED, []);
    for (const a of appointments) {
      const empId = employeeMap[a.id];
      const target = empId && result.has(empId) ? empId : UNASSIGNED;
      result.get(target)?.push(a);
    }
    return result;
  }, [appointments, employees, employeeMap]);

  function handleCardClick(a: Appointment) {
    setSelected(a);
    setDetalheDialog(true);
  }

  async function handleCreate(
    payload: CreateAppointmentPayload,
    employeeId: string,
  ) {
    const created = await create(payload);
    if (created) {
      setEmployee(created.id, employeeId);
    }
    return created;
  }

  async function handleUpdateStatus(
    id: string,
    status: "CONFIRMED" | "CANCELLED" | "COMPLETED",
  ) {
    await updateStatus(id, status);
  }

  async function handleDelete(id: string) {
    await cancel(id);
    removeEmployee(id);
  }

  // ─── Drag-and-drop entre colunas ────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const data = active.data.current as
      | { appointmentId: string }
      | undefined;
    if (!data?.appointmentId) return;

    const overId = String(over.id);
    if (overId === "emp-unassigned") {
      removeEmployee(data.appointmentId);
      toast("Agendamento movido para 'Sem profissional'.");
      return;
    }
    if (overId.startsWith("emp-")) {
      const employeeId = overId.slice("emp-".length);
      setEmployee(data.appointmentId, employeeId);
      const emp = employees.find((e) => e.id === employeeId);
      toast.success(
        `Movido para ${emp ? emp.appName || emp.name : "profissional"}.`,
      );
    }
  }

  const dataFormatada = format(new Date(), "EEEE, dd MMM yyyy", {
    locale: ptBR,
  });
  const dataCapitalizada =
    dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1);

  const isLoading = loadingAppts || loadingEmployees || loadingServices;

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
                  onClick={() => {
                    setPrefilledEmployeeId(undefined);
                    setNovoDialog(true);
                  }}
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
              {isLoading ? (
                <div className="text-center py-20 text-text-faint text-sm">
                  Carregando…
                </div>
              ) : employees.length === 0 ? (
                <div className="max-w-md mx-auto text-center py-20">
                  <Users className="size-12 text-text-faint mx-auto mb-4" />
                  <p className="text-sm text-foreground font-semibold">
                    Cadastre profissionais primeiro
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    O kanban organiza os agendamentos por profissional. Vá em
                    Configurações → Profissionais para adicionar.
                  </p>
                </div>
              ) : services.length === 0 ? (
                <div className="max-w-md mx-auto text-center py-20">
                  <CalendarIcon className="size-12 text-text-faint mx-auto mb-4" />
                  <p className="text-sm text-foreground font-semibold">
                    Cadastre serviços primeiro
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Para criar agendamentos, você precisa ter ao menos um
                    serviço cadastrado. Vá em Configurações → Serviços.
                  </p>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <div className="flex gap-3 h-full">
                    {employees.map((emp) => (
                      <ProfissionalColuna
                        key={emp.id}
                        employee={emp}
                        appointments={apptsByEmployee.get(emp.id) ?? []}
                        onCardClick={handleCardClick}
                      />
                    ))}
                    {/* Coluna "Sem profissional" — só aparece se houver appointments lá */}
                    {(apptsByEmployee.get(UNASSIGNED)?.length ?? 0) > 0 && (
                      <ProfissionalColuna
                        employee={null}
                        appointments={apptsByEmployee.get(UNASSIGNED) ?? []}
                        onCardClick={handleCardClick}
                      />
                    )}
                  </div>
                </DndContext>
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
          services={services}
          employees={employees}
          prefilledEmployeeId={prefilledEmployeeId}
          onCreate={handleCreate}
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
