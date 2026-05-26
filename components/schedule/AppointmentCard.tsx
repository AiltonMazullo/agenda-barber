"use client";

import { Clock, User, GripVertical } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/shared";
import type {
  Appointment,
  AppointmentStatus,
} from "@/types/appointment.types";
import type { Tone } from "@/types/common.types";

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
};

const STATUS_TONE: Record<AppointmentStatus, Tone> = {
  PENDING: "warning",
  CONFIRMED: "info",
  COMPLETED: "success",
  CANCELLED: "danger",
};

interface AppointmentCardProps {
  appointment: Appointment;
  onClick?: () => void;
  /** Se informado, o card vira arrastável (kanban). */
  draggableId?: string;
}

export function AppointmentCard({
  appointment,
  onClick,
  draggableId,
}: AppointmentCardProps) {
  const draggable = useDraggable({
    id: draggableId ?? `appt-${appointment.id}`,
    data: { appointmentId: appointment.id },
    disabled: !draggableId,
  });

  const time = new Date(appointment.scheduledAt).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const isInactive =
    appointment.status === "CANCELLED" || appointment.status === "COMPLETED";

  const style = draggableId
    ? {
        transform: CSS.Translate.toString(draggable.transform),
        opacity: draggable.isDragging ? 0.4 : 1,
        cursor: draggable.isDragging ? "grabbing" : undefined,
      }
    : undefined;

  return (
    <div
      ref={draggableId ? draggable.setNodeRef : undefined}
      style={style}
      className={cn(
        "rounded-md border bg-surface-base p-3 transition-colors group relative",
        isInactive
          ? "border-border-subtle opacity-70"
          : "border-border hover:border-brand/40",
      )}
    >
      {draggableId && !isInactive && (
        <button
          type="button"
          {...draggable.listeners}
          {...draggable.attributes}
          className="absolute top-2 right-2 size-5 rounded flex items-center justify-center text-text-subtle hover:text-foreground hover:bg-surface-elevated transition-colors opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing"
          aria-label="Arrastar"
        >
          <GripVertical className="size-3" />
        </button>
      )}

      <button
        type="button"
        onClick={onClick}
        className="w-full text-left cursor-pointer"
      >
        <div className="flex items-center gap-2 mb-1.5">
          <Clock className="size-3 text-text-subtle" />
          <span className="text-xs font-mono text-foreground">{time}</span>
          <StatusBadge tone={STATUS_TONE[appointment.status]}>
            {STATUS_LABEL[appointment.status]}
          </StatusBadge>
        </div>
        <div className="flex items-center gap-1.5">
          <User className="size-3 text-text-subtle shrink-0" />
          <span className="text-sm font-semibold text-foreground truncate">
            {appointment.client.name}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <span
            className="size-1.5 rounded-full shrink-0"
            style={{ backgroundColor: appointment.service.hex ?? "#f5b82e" }}
          />
          <span className="text-xs text-muted-foreground truncate">
            {appointment.service.name}
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">
          {appointment.service.durationMin} min ·{" "}
          {(appointment.service.priceInCents / 100).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </p>
      </button>
    </div>
  );
}
