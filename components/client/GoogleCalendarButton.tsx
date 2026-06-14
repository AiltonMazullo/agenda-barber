/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { CalendarDays, ExternalLink, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { clientAppointmentsService } from "@/services/client-appointments.service";
import type { ClientAppointment } from "@/types/appointment.types";

/** Data no formato do Google Calendar (UTC): YYYYMMDDTHHMMSSZ. */
function gcalDate(d: Date): string {
  return d.toISOString().replace(/[-:]|\.\d{3}/g, "");
}

function googleCalendarUrl(appt: ClientAppointment): string {
  const start = new Date(appt.scheduledAt);
  const end = new Date(start.getTime() + appt.service.durationMin * 60000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${appt.service.name} — ${appt.barbershop.name}`,
    dates: `${gcalDate(start)}/${gcalDate(end)}`,
    details: `Agendamento em ${appt.barbershop.name}.`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function GoogleCalendarButton() {
  const [open, setOpen] = useState(false);
  const [appointments, setAppointments] = useState<ClientAppointment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);
    clientAppointmentsService
      .listMine()
      .then((data) => {
        if (!active) return;
        const now = new Date();
        const upcoming = data
          .filter(
            (a) =>
              new Date(a.scheduledAt) >= now &&
              (a.status === "PENDING" || a.status === "CONFIRMED"),
          )
          .sort(
            (a, b) =>
              new Date(a.scheduledAt).getTime() -
              new Date(b.scheduledAt).getTime(),
          );
        setAppointments(upcoming);
      })
      .catch(() => {
        if (active) setAppointments([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [open]);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="cursor-pointer"
      >
        <CalendarDays className="size-4 mr-1.5" />
        Integrar com Google Agenda
      </Button>

      <Dialog open={open} onOpenChange={(o) => setOpen(o)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Integrar com o Google Agenda</DialogTitle>
            <DialogDescription>
              Adicione seus agendamentos ao Google Agenda e acompanhe os horários
              no seu calendário.
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Carregando agendamentos…
            </p>
          ) : appointments.length === 0 ? (
            <div className="rounded-lg border border-border-subtle bg-surface-raised p-6 text-center space-y-2">
              <CalendarClock className="size-7 text-text-faint mx-auto" />
              <p className="text-sm text-muted-foreground">
                Você não tem agendamentos futuros para adicionar.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {appointments.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border-subtle bg-surface-raised px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {a.service.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatWhen(a.scheduledAt)}
                    </p>
                  </div>
                  <a
                    href={googleCalendarUrl(a)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-8 px-3 rounded-md bg-brand text-brand-foreground hover:bg-brand-hover transition-colors flex items-center gap-1.5 text-xs font-bold whitespace-nowrap shrink-0"
                  >
                    <ExternalLink className="size-3.5" />
                    Adicionar
                  </a>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
