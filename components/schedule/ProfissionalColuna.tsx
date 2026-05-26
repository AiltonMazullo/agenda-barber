"use client";

import { useDroppable } from "@dnd-kit/core";
import { AppointmentCard } from "@/components/schedule/AppointmentCard";
import { cn } from "@/lib/utils";
import type { Appointment } from "@/types/appointment.types";
import type { Employee } from "@/types/employee.types";

interface ProfissionalColunaProps {
  /** Quando null, representa a coluna "Sem profissional". */
  employee: Employee | null;
  appointments: Appointment[];
  onCardClick: (a: Appointment) => void;
}

export function ProfissionalColuna({
  employee,
  appointments,
  onCardClick,
}: ProfissionalColunaProps) {
  const dropId = employee ? `emp-${employee.id}` : "emp-unassigned";
  const { setNodeRef, isOver } = useDroppable({ id: dropId });

  const ordered = [...appointments].sort(
    (a, b) =>
      new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
  );

  const initials = employee
    ? (employee.appName || employee.name)
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase() ?? "")
        .join("") || "??"
    : "—";

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col min-w-65 flex-1 bg-surface-raised rounded-lg border transition-colors overflow-hidden",
        isOver
          ? "border-brand/60 ring-2 ring-brand/20"
          : "border-border-subtle",
      )}
    >
      <div className="px-3 py-3 border-b border-border-subtle flex items-center gap-2">
        <div className="size-9 rounded-full bg-brand/15 border border-brand/30 flex items-center justify-center shrink-0">
          <span className="text-xs font-bold text-brand">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground truncate">
            {employee ? employee.appName || employee.name : "Sem profissional"}
          </p>
          {employee?.group && (
            <p className="text-[10px] text-muted-foreground truncate">
              {employee.group}
            </p>
          )}
        </div>
        <span className="text-[10px] font-bold bg-surface-elevated text-muted-foreground px-2 py-0.5 rounded-md shrink-0">
          {appointments.length}
        </span>
      </div>

      <div className="flex-1 p-2 space-y-2 overflow-y-auto schedule-scroll min-h-32">
        {ordered.length === 0 ? (
          <p className="text-xs text-text-faint text-center py-8">
            Sem agendamentos
          </p>
        ) : (
          ordered.map((a) => (
            <AppointmentCard
              key={a.id}
              appointment={a}
              onClick={() => onCardClick(a)}
              draggableId={a.id}
            />
          ))
        )}
      </div>
    </div>
  );
}
